export type StarType =
  // Group 1: Star Polygons
  | '9-2'
  | '9-4'
  // Group 2: Overlapping Shapes
  | '3-triangles'
  | '3-rhombuses'
  // Group 3: Radial Spike Stars
  | 'spike'
  | 'kite'
  | 'stellated'
  | 'explosion'
  // Group 4: Petal / Organic
  | 'petal'
  | 'curved-outline'
  // Group 5: Compound / Layered
  | 'compound'
  | 'concentric'
  // Group 6: Irregular / Artistic
  | 'alt-length'
  | 'spiral'
  | 'interlace'
  | 'fractal'
  | 'mandala';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'conic-gradient' | 'none';
export type StrokeDash = 'solid' | 'dashed' | 'dotted';
export type FillRule = 'evenodd' | 'nonzero';
export type AltLengthPattern = 'short-long' | 'short-mid-long';
export type GradientDirection = 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-top-right';

export interface StarConfig {
  // --- Basic ---
  starType: StarType;
  outerRadius: number;        // 50–250 (viewBox units, center is 250,250)
  innerRadiusRatio: number;   // 0.2–0.9
  rotation: number;           // 0–360 degrees

  // --- Fill ---
  fillType: FillType;
  fillColor: string;          // hex
  gradientColors: string[];   // 2–4 hex stops
  gradientDirection: GradientDirection;
  fillOpacity: number;        // 0–1

  // --- Stroke ---
  strokeColor: string;
  strokeWidth: number;        // 0–20
  strokeDash: StrokeDash;

  // --- Background ---
  bgColor: string;            // hex or 'transparent'

  // --- Curve / Shape modifiers ---
  curveIntensity: number;     // 0–1 (0 = straight, 1 = max bezier)
  cornerRadius: number;       // 0–50 (rounding at tips)
  fillRule: FillRule;         // for overlapping shapes

  // --- Inner polygon ---
  showInnerPolygon: boolean;
  innerPolygonColor: string;

  // --- Glow / Shadow ---
  glowColor: string;
  glowRadius: number;         // 0 = off
  shadowBlur: number;         // 0 = off
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;

  // --- Type-specific ---
  altLengthPattern: AltLengthPattern;
  altLengthRatio: number;     // 0.4–0.9
  spiralTwist: number;        // degrees per point
  petalWidth: number;         // 0–1
  petalCurve: number;         // 0–1
  fractalDepth: number;       // 1–3
  interlaceGap: number;       // px gap at crossings

  // --- Export ---
  exportWidth: number;
  exportHeight: number;
}

export const DEFAULT_CONFIG: StarConfig = {
  starType: '9-2',
  outerRadius: 220,
  innerRadiusRatio: 0.38,
  rotation: -90, // point up by default

  fillType: 'solid',
  fillColor: '#6366F1',
  gradientColors: ['#6366F1', '#8B5CF6', '#EC4899'],
  gradientDirection: 'to-bottom-right',
  fillOpacity: 1,

  strokeColor: '#4F46E5',
  strokeWidth: 0,
  strokeDash: 'solid',

  bgColor: 'transparent',

  curveIntensity: 0,
  cornerRadius: 0,
  fillRule: 'nonzero',

  showInnerPolygon: false,
  innerPolygonColor: '#FFFFFF',

  glowColor: '#6366F1',
  glowRadius: 0,
  shadowBlur: 0,
  shadowColor: '#00000066',
  shadowOffsetX: 0,
  shadowOffsetY: 4,

  altLengthPattern: 'short-long',
  altLengthRatio: 0.6,
  spiralTwist: 15,
  petalWidth: 0.4,
  petalCurve: 0.6,
  fractalDepth: 2,
  interlaceGap: 4,

  exportWidth: 1024,
  exportHeight: 1024,
};

export const STAR_TYPE_LABELS: Record<StarType, string> = {
  '9-2': '{9/2} Enneagram',
  '9-4': '{9/4} Enneagram',
  '3-triangles': 'Triple Triangle',
  '3-rhombuses': 'Triple Rhombus',
  spike: 'Spike Star',
  kite: 'Kite Star',
  stellated: 'Stellated 9-gon',
  explosion: 'Explosion Star',
  petal: 'Petal Rose',
  'curved-outline': 'Curved Outline',
  compound: '9-gon + Inner Star',
  concentric: 'Concentric Stars',
  'alt-length': 'Alternating Lengths',
  spiral: 'Spiral Star',
  interlace: 'Celtic Interlace',
  fractal: 'Fractal Star',
  mandala: 'Mandala Ring',
};

// Phase availability
export const PHASE_1_TYPES: StarType[] = ['9-2', '9-4', '3-triangles', 'spike', 'petal', 'curved-outline'];
export const PHASE_2_TYPES: StarType[] = ['3-rhombuses', 'kite', 'stellated', 'compound', 'alt-length'];
export const PHASE_3_TYPES: StarType[] = ['explosion', 'concentric', 'spiral', 'interlace', 'fractal', 'mandala'];
