import type { StarConfig } from './star';
import { DEFAULT_CONFIG } from './star';

// The per-star subset of StarConfig — everything a single layer owns.
// Canvas-level props (background, outer container, export size) live on the
// composition instead. `lib/star-geometry.ts` builds paths from exactly this.
export type StarShapeProps = Pick<
  StarConfig,
  | 'starType'
  | 'outerRadius'
  | 'innerRadiusRatio'
  | 'rotation'
  | 'curveIntensity'
  | 'cornerRounding'
  | 'fillType'
  | 'fillColor'
  | 'gradientColors'
  | 'gradientDirection'
  | 'fillOpacity'
  | 'strokeColor'
  | 'strokeWidth'
  | 'strokeDash'
  | 'showInnerPolygon'
  | 'innerPolygonColor'
  | 'glowColor'
  | 'glowRadius'
  | 'shadowBlur'
  | 'shadowColor'
  | 'petalWidth'
  | 'petalCurve'
>;

export interface GeometryLayer extends StarShapeProps {
  id: string;
  name: string; // "Star 1" … — display only, never URL-encoded
  visible: boolean;
  opacity: number; // 0–1, multiplies with fillOpacity on the layer group

  // No `scale`: outerRadius IS the size of a generated star. Offsets move the
  // star's center away from the viewBox center (viewBox units).
  offsetX: number; // -300–300
  offsetY: number; // -300–300
}

export interface GeometryComposition {
  layers: GeometryLayer[]; // back-to-front: index 0 renders at the bottom
  bgColor: string;
  outerContainer: StarConfig['outerContainer'];
  outerContainerPadding: number;
  outerContainerColor: string;
  outerContainerFill: string;
  exportWidth: number;
  exportHeight: number;
}

export const MAX_GEOMETRY_LAYERS = 15;

const STAR_SHAPE_KEYS = [
  'starType', 'outerRadius', 'innerRadiusRatio', 'rotation', 'curveIntensity',
  'cornerRounding', 'fillType', 'fillColor', 'gradientColors',
  'gradientDirection', 'fillOpacity', 'strokeColor', 'strokeWidth',
  'strokeDash', 'showInnerPolygon', 'innerPolygonColor', 'glowColor',
  'glowRadius', 'shadowBlur', 'shadowColor', 'petalWidth', 'petalCurve',
] as const satisfies readonly (keyof StarShapeProps)[];

export const GEOMETRY_CANVAS_KEYS = [
  'bgColor', 'outerContainer', 'outerContainerPadding', 'outerContainerColor',
  'outerContainerFill', 'exportWidth', 'exportHeight',
] as const;

type CanvasKey = (typeof GEOMETRY_CANVAS_KEYS)[number];

function shapeFromConfig(config: StarShapeProps): StarShapeProps {
  const shape = {} as Record<string, unknown>;
  for (const key of STAR_SHAPE_KEYS) shape[key] = config[key];
  return shape as StarShapeProps;
}

export const DEFAULT_GEOMETRY_LAYER: GeometryLayer = {
  ...shapeFromConfig(DEFAULT_CONFIG),
  id: '',
  name: '',
  visible: true,
  opacity: 1,
  offsetX: 0,
  offsetY: 0,
};

export function makeGeometryLayer(id: string, name: string, from?: Partial<GeometryLayer>): GeometryLayer {
  return { ...DEFAULT_GEOMETRY_LAYER, ...from, id, name };
}

// The initial layer id is static so server and client render the same SVG ids
// on first paint; runtime-added layers get crypto ids in event handlers.
export const DEFAULT_GEOMETRY_COMPOSITION: GeometryComposition = {
  layers: [makeGeometryLayer('star-1', 'Star 1')],
  bgColor: DEFAULT_CONFIG.bgColor,
  outerContainer: DEFAULT_CONFIG.outerContainer,
  outerContainerPadding: DEFAULT_CONFIG.outerContainerPadding,
  outerContainerColor: DEFAULT_CONFIG.outerContainerColor,
  outerContainerFill: DEFAULT_CONFIG.outerContainerFill,
  exportWidth: DEFAULT_CONFIG.exportWidth,
  exportHeight: DEFAULT_CONFIG.exportHeight,
};

// Field-by-field repair for persisted layers (history), mirroring
// normalizeLayer() in types/composition.ts: merge over current defaults so
// fields added later are filled in; reject only structurally unusable input.
export function normalizeGeometryLayer(raw: unknown): GeometryLayer | null {
  if (!raw || typeof raw !== 'object') return null;
  const l = { ...DEFAULT_GEOMETRY_LAYER, ...(raw as Partial<GeometryLayer>) };
  if (typeof l.id !== 'string' || !l.id) return null;
  if (typeof l.name !== 'string') l.name = 'Star';
  if (typeof l.visible !== 'boolean') l.visible = true;
  for (const key of ['opacity', 'offsetX', 'offsetY', 'outerRadius'] as const) {
    if (typeof l[key] !== 'number' || Number.isNaN(l[key])) l[key] = DEFAULT_GEOMETRY_LAYER[key];
  }
  if (!Array.isArray(l.gradientColors)) l.gradientColors = [...DEFAULT_GEOMETRY_LAYER.gradientColors];
  return l;
}

// The single backward-compat seam: legacy single-star configs (old URLs,
// history entries, presets) become one-layer compositions.
export function compositionFromConfig(config: StarConfig): GeometryComposition {
  return {
    layers: [makeGeometryLayer('star-1', 'Star 1', shapeFromConfig(config))],
    bgColor: config.bgColor,
    outerContainer: config.outerContainer,
    outerContainerPadding: config.outerContainerPadding,
    outerContainerColor: config.outerContainerColor,
    outerContainerFill: config.outerContainerFill,
    exportWidth: config.exportWidth,
    exportHeight: config.exportHeight,
  };
}

// Accepts either stored shape (pre-layer StarConfig or composition).
export function asComposition(config: StarConfig | GeometryComposition): GeometryComposition {
  return 'layers' in config ? config : compositionFromConfig(config);
}

// Legacy view of one layer + canvas as a flat StarConfig — used while parts of
// the UI still speak StarConfig (control panel until the layer UI lands,
// thumbnails, preset links).
export function configFromLayer(layer: GeometryLayer, comp: GeometryComposition): StarConfig {
  const config = { ...DEFAULT_CONFIG, ...shapeFromConfig(layer) };
  for (const key of GEOMETRY_CANVAS_KEYS) {
    (config as Record<CanvasKey, unknown>)[key] = comp[key];
  }
  return config;
}

export function isGeometryCanvasKey(key: string): key is CanvasKey {
  return (GEOMETRY_CANVAS_KEYS as readonly string[]).includes(key);
}

// True when the composition is still the untouched starting design (one
// default layer, default canvas) — used to skip the "replace current design?"
// confirmation when there's nothing of the user's to lose. Compares every
// field except `id`/`name` (internal identifiers, not user-visible design).
export function isDefaultGeometryComposition(comp: GeometryComposition): boolean {
  if (comp.layers.length !== 1) return false;
  const layer = comp.layers[0];
  const def = DEFAULT_GEOMETRY_LAYER;
  const shapeMatches = STAR_SHAPE_KEYS.every((key) => {
    const val = layer[key];
    const defVal = def[key];
    return Array.isArray(val) ? JSON.stringify(val) === JSON.stringify(defVal) : val === defVal;
  });
  if (!shapeMatches) return false;
  if (layer.visible !== def.visible || layer.opacity !== def.opacity) return false;
  if (layer.offsetX !== def.offsetX || layer.offsetY !== def.offsetY) return false;
  return GEOMETRY_CANVAS_KEYS.every((key) => comp[key] === DEFAULT_GEOMETRY_COMPOSITION[key]);
}
