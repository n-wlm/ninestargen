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
    count: 9,
    mirror: false,
    opacity: LAYER_LIMITS.opacity.default,
  };
}
