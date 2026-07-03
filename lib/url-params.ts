import type { StarConfig, StarType, FillType, StrokeDash, GradientDirection, OuterContainer } from '@/types/star';
import {
  DEFAULT_GEOMETRY_COMPOSITION,
  DEFAULT_GEOMETRY_LAYER,
  MAX_GEOMETRY_LAYERS,
  compositionFromConfig,
  configFromLayer,
  makeGeometryLayer,
  type GeometryComposition,
  type GeometryLayer,
} from '@/types/geometry';

// Short keys keep URLs concise. Two groups:
//  - CANVAS keys are emitted bare (bg, oc, …) — one set per composition.
//  - LAYER keys describe one star; layer 0 is emitted bare (so a single-star
//    URL is byte-identical to the pre-layer scheme — old shared links still
//    parse), layers 1+ are prefixed with their index (1t, 1rot, 2x, …).
// No canvas key starts with a digit and no layer key collides with a canvas
// key, so parsing is unambiguous. `n=<count>` marks multi-layer compositions.
const LAYER_KEY_MAP = {
  starType: 't',
  outerRadius: 'r',
  innerRadiusRatio: 'ir',
  rotation: 'rot',
  fillType: 'ft',
  fillColor: 'fc',
  gradientColors: 'gc',
  gradientDirection: 'gd',
  fillOpacity: 'fo',
  strokeColor: 'sc',
  strokeWidth: 'sw',
  strokeDash: 'sd',
  curveIntensity: 'ci',
  cornerRounding: 'cr',
  showInnerPolygon: 'sip',
  innerPolygonColor: 'ipc',
  glowColor: 'glc',
  glowRadius: 'glr',
  shadowBlur: 'shb',
  shadowColor: 'shc',
  petalWidth: 'pw',
  petalCurve: 'pc',
  visible: 'v',
  opacity: 'o',
  offsetX: 'x',
  offsetY: 'y',
} as const satisfies Record<string, string>;

const CANVAS_KEY_MAP = {
  bgColor: 'bg',
  outerContainer: 'oc',
  outerContainerPadding: 'ocp',
  outerContainerColor: 'occ',
  outerContainerFill: 'ocf',
  exportWidth: 'ew',
  exportHeight: 'eh',
} as const satisfies Record<string, string>;

type LayerKey = keyof typeof LAYER_KEY_MAP;
type CanvasKey = keyof typeof CANVAS_KEY_MAP;

const LAYER_REVERSE = Object.fromEntries(
  Object.entries(LAYER_KEY_MAP).map(([k, v]) => [v, k]),
) as Record<string, LayerKey>;
const CANVAS_REVERSE = Object.fromEntries(
  Object.entries(CANVAS_KEY_MAP).map(([k, v]) => [v, k]),
) as Record<string, CanvasKey>;

const LAYER_COUNT_KEY = 'n';
const LEGACY_IGNORED_KEYS = new Set(['shx', 'shy']);

const NUMERIC_LAYER_KEYS = new Set<LayerKey>([
  'outerRadius', 'innerRadiusRatio', 'rotation', 'fillOpacity', 'strokeWidth',
  'curveIntensity', 'cornerRounding', 'glowRadius', 'shadowBlur', 'petalWidth',
  'petalCurve', 'opacity', 'offsetX', 'offsetY',
]);

// Append this layer's non-default fields to `params`, each short key optionally
// prefixed (layer 0 → '' → bare keys). Delta vs DEFAULT_GEOMETRY_LAYER.
function appendLayer(params: URLSearchParams, layer: GeometryLayer, prefix: string) {
  const def = DEFAULT_GEOMETRY_LAYER;
  for (const [longKey, shortKey] of Object.entries(LAYER_KEY_MAP) as [LayerKey, string][]) {
    const val = layer[longKey];
    const defVal = def[longKey];
    if (Array.isArray(val)) {
      const joined = val.join(',');
      if (joined !== (defVal as string[]).join(',')) params.set(prefix + shortKey, joined);
    } else if (val !== defVal) {
      params.set(prefix + shortKey, String(val));
    }
  }
}

export function compositionToParams(comp: GeometryComposition): URLSearchParams {
  const params = new URLSearchParams();

  // Canvas (bare)
  const cdef = DEFAULT_GEOMETRY_COMPOSITION;
  for (const [longKey, shortKey] of Object.entries(CANVAS_KEY_MAP) as [CanvasKey, string][]) {
    if (comp[longKey] !== cdef[longKey]) params.set(shortKey, String(comp[longKey]));
  }

  comp.layers.forEach((layer, i) => appendLayer(params, layer, i === 0 ? '' : String(i)));

  if (comp.layers.length > 1) params.set(LAYER_COUNT_KEY, String(comp.layers.length));

  return params;
}

function coerceLayerValue(layer: GeometryLayer, key: LayerKey, value: string) {
  const l = layer as unknown as Record<string, unknown>;
  switch (key) {
    case 'starType':
      l.starType = value as StarType;
      break;
    case 'fillType':
      l.fillType = value as FillType;
      break;
    case 'strokeDash':
      l.strokeDash = value as StrokeDash;
      break;
    case 'gradientDirection':
      l.gradientDirection = value as GradientDirection;
      break;
    case 'gradientColors':
      l.gradientColors = value.split(',').filter(Boolean);
      break;
    case 'showInnerPolygon':
    case 'visible':
      l[key] = value === 'true';
      break;
    default:
      if (NUMERIC_LAYER_KEYS.has(key)) l[key] = parseFloat(value);
      else l[key] = value;
  }
}

export function paramsToComposition(params: URLSearchParams): GeometryComposition {
  // First pass: how many layers? (explicit `n`, else the highest prefixed index)
  let maxIndex = 0;
  const declared = parseInt(params.get(LAYER_COUNT_KEY) ?? '', 10);
  for (const key of params.keys()) {
    const m = /^([0-9])(.+)$/.exec(key);
    if (m && LAYER_REVERSE[m[2]]) maxIndex = Math.max(maxIndex, parseInt(m[1], 10));
  }
  const count = Math.min(
    MAX_GEOMETRY_LAYERS,
    Math.max(1, Number.isFinite(declared) ? declared : 0, maxIndex + 1),
  );

  const layers: GeometryLayer[] = Array.from({ length: count }, (_, i) =>
    makeGeometryLayer(i === 0 ? 'star-1' : `star-${i + 1}`, `Star ${i + 1}`),
  );
  const comp: GeometryComposition = {
    ...DEFAULT_GEOMETRY_COMPOSITION,
    layers,
  };

  for (const [key, value] of params.entries()) {
    if (key === LAYER_COUNT_KEY) continue;
    if (LEGACY_IGNORED_KEYS.has(key)) continue;

    // Canvas?
    const canvasKey = CANVAS_REVERSE[key];
    if (canvasKey) {
      if (canvasKey === 'outerContainer') comp.outerContainer = value as OuterContainer;
      else if (canvasKey === 'outerContainerPadding' || canvasKey === 'exportWidth' || canvasKey === 'exportHeight')
        comp[canvasKey] = parseFloat(value);
      else comp[canvasKey] = value;
      continue;
    }

    // Bare layer key → layer 0
    const bareLayerKey = LAYER_REVERSE[key];
    if (bareLayerKey) {
      coerceLayerValue(layers[0], bareLayerKey, value);
      continue;
    }

    // Prefixed layer key → layer[index]
    const m = /^([0-9])(.+)$/.exec(key);
    if (m) {
      const idx = parseInt(m[1], 10);
      const layerKey = LAYER_REVERSE[m[2]];
      if (layerKey && idx < layers.length) coerceLayerValue(layers[idx], layerKey, value);
    }
  }

  return comp;
}

// --- Single-config helpers (preset share links in AppHeader/PresetCard) ---
// A one-layer composition encodes to bare keys with no `n`, i.e. byte-identical
// to the pre-layer URL scheme.
export function configToParams(config: StarConfig): URLSearchParams {
  return compositionToParams(compositionFromConfig(config));
}

export function paramsToConfig(params: URLSearchParams): StarConfig {
  const comp = paramsToComposition(params);
  return configFromLayer(comp.layers[0], comp);
}
