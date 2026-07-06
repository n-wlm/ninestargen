import type { OuterContainer } from './star';

// ── Image-mode (kaleidoscope) types ──────────────────────────────────────────
// A composition is a stack of image layers, each repeated in n-fold radial
// symmetry around the 600×600 viewBox center (300,300).

export type SymmetryCount = 9 | 3; // divisors of 9

export interface ImageLayer {
  id: string;
  name: string;
  src: string; // data URL (base64) — kept inline so SVG export stays self-contained
  naturalWidth: number;
  naturalHeight: number;
  visible: boolean;

  scale: number; // longest image side in viewBox units
  radius: number; // distance of the image center from the composition center
  spin: number; // own rotation of each copy, degrees (-180..180)
  angleOffset: number; // rotates the whole arrangement, degrees (0..360/count)
  offsetX: number; // shift the image within each copy, sector-X (tangential)
  offsetY: number; // shift the image within each copy, sector-Y (radial)
  count: SymmetryCount; // number of copies around the circle (9 or 3)
  mirror: boolean; // adds a reflected copy per sector (kaleidoscope), on top of rotation
  opacity: number; // 0..1
}

export interface CompositionConfig {
  layers: ImageLayer[];

  bgColor: string;

  // Reuses the geometry mode's outer-container vocabulary/rendering.
  outerContainer: OuterContainer;
  outerContainerPadding: number;
  outerContainerColor: string;
  outerContainerFill: string;

  exportWidth: number;
  exportHeight: number;
}

export const MAX_LAYERS = 15;

// Per-layer slider bounds (viewBox is 600 wide, center 300,300).
export const LAYER_LIMITS = {
  scale: { min: 20, max: 400, step: 1, default: 140 },
  radius: { min: 0, max: 300, step: 1, default: 150 },
  spin: { min: -180, max: 180, step: 1, default: 0 },
  angleOffset: { min: 0, max: 360, step: 1, default: 0 },
  offsetX: { min: -200, max: 200, step: 1, default: 0 },
  offsetY: { min: -200, max: 200, step: 1, default: 0 },
  opacity: { min: 0, max: 1, step: 0.01, default: 1 },
} as const;

export const DEFAULT_COMPOSITION: CompositionConfig = {
  layers: [],

  bgColor: 'transparent',

  outerContainer: 'none',
  outerContainerPadding: 20,
  outerContainerColor: '#5E6AD2',
  outerContainerFill: 'none',

  exportWidth: 1024,
  exportHeight: 1024,
};

// Build a fresh layer from an uploaded image's data URL + intrinsic size.
export function makeLayer(
  id: string,
  name: string,
  src: string,
  naturalWidth: number,
  naturalHeight: number,
): ImageLayer {
  return {
    id,
    name,
    src,
    naturalWidth,
    naturalHeight,
    visible: true,
    scale: LAYER_LIMITS.scale.default,
    radius: LAYER_LIMITS.radius.default,
    spin: LAYER_LIMITS.spin.default,
    angleOffset: LAYER_LIMITS.angleOffset.default,
    offsetX: LAYER_LIMITS.offsetX.default,
    offsetY: LAYER_LIMITS.offsetY.default,
    count: 9,
    mirror: false,
    opacity: LAYER_LIMITS.opacity.default,
  };
}

// True when the composition is still the untouched starting design (no image
// layers, default canvas) — used to skip the "replace current design?"
// confirmation when there's nothing of the user's to lose.
export function isDefaultComposition(comp: CompositionConfig): boolean {
  if (comp.layers.length !== 0) return false;
  return (
    comp.bgColor === DEFAULT_COMPOSITION.bgColor &&
    comp.outerContainer === DEFAULT_COMPOSITION.outerContainer &&
    comp.outerContainerPadding === DEFAULT_COMPOSITION.outerContainerPadding &&
    comp.outerContainerColor === DEFAULT_COMPOSITION.outerContainerColor &&
    comp.outerContainerFill === DEFAULT_COMPOSITION.outerContainerFill &&
    comp.exportWidth === DEFAULT_COMPOSITION.exportWidth &&
    comp.exportHeight === DEFAULT_COMPOSITION.exportHeight
  );
}

const numOr = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

// Coerce an arbitrary (e.g. older or partial) object into a valid ImageLayer,
// filling any missing fields with current defaults. Returns null if it has no
// usable image source. This keeps stored history usable across schema changes.
export function normalizeLayer(raw: unknown): ImageLayer | null {
  if (!raw || typeof raw !== 'object') return null;
  const l = raw as Record<string, unknown>;
  if (typeof l.src !== 'string' || !l.src) return null;
  const id =
    typeof l.id === 'string' && l.id
      ? l.id
      : typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `layer-${numOr(l.naturalWidth, 0)}-${Math.round(numOr(l.scale, 0))}`;
  return {
    id,
    name: typeof l.name === 'string' ? l.name : 'Image',
    src: l.src,
    naturalWidth: numOr(l.naturalWidth, 300),
    naturalHeight: numOr(l.naturalHeight, 300),
    visible: l.visible !== false,
    scale: numOr(l.scale, LAYER_LIMITS.scale.default),
    radius: numOr(l.radius, LAYER_LIMITS.radius.default),
    spin: numOr(l.spin, LAYER_LIMITS.spin.default),
    angleOffset: numOr(l.angleOffset, LAYER_LIMITS.angleOffset.default),
    offsetX: numOr(l.offsetX, LAYER_LIMITS.offsetX.default),
    offsetY: numOr(l.offsetY, LAYER_LIMITS.offsetY.default),
    count: l.count === 3 ? 3 : 9,
    mirror: l.mirror === true,
    opacity: numOr(l.opacity, LAYER_LIMITS.opacity.default),
  };
}
