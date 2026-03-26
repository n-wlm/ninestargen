export type StarType =
  | '9-2'
  | '9-4'
  | '3-triangles'
  | 'spike'
  | 'kite'
  | 'petal';

export type FillType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'none';
export type StrokeDash = 'solid' | 'dashed' | 'dotted';
export type GradientDirection = 'to-bottom' | 'to-right' | 'to-bottom-right' | 'to-top-right';
export type OuterContainer = 'none' | '9-gon' | 'circle' | 'square';

export interface StarConfig {
  // --- Basic ---
  starType: StarType;
  outerRadius: number;        // 50–270 (viewBox units, center 300,300)
  innerRadiusRatio: number;   // 0.1–0.9
  rotation: number;           // -180–180

  // --- Shape modifiers ---
  curveIntensity: number;     // -1–1
  cornerRounding: number;     // 0–1 (rounds sharp tips)

  // --- Fill ---
  fillType: FillType;
  fillColor: string;
  gradientColors: string[];
  gradientDirection: GradientDirection;
  fillOpacity: number;

  // --- Stroke ---
  strokeColor: string;
  strokeWidth: number;
  strokeDash: StrokeDash;

  // --- Background ---
  bgColor: string;

  // --- Outer container ---
  outerContainer: OuterContainer;
  outerContainerPadding: number; // 0–50
  outerContainerColor: string;   // stroke
  outerContainerFill: string;    // 'none' or hex

  // --- Inner polygon ---
  showInnerPolygon: boolean;
  innerPolygonColor: string;

  // --- Effects ---
  glowColor: string;
  glowRadius: number;
  shadowBlur: number;
  shadowColor: string;

  // --- Petal-specific ---
  petalWidth: number;
  petalCurve: number;

  // --- Export ---
  exportWidth: number;
  exportHeight: number;
}

export const DEFAULT_CONFIG: StarConfig = {
  starType: '9-2',
  outerRadius: 220,
  innerRadiusRatio: 0.38,
  rotation: -90,

  curveIntensity: 0,
  cornerRounding: 0,

  fillType: 'none',
  fillColor: '#5E6AD2',
  gradientColors: ['#5E6AD2', '#8B5CF6', '#EC4899'],
  gradientDirection: 'to-bottom-right',
  fillOpacity: 1,

  strokeColor: '#4F46E5',
  strokeWidth: 3,
  strokeDash: 'solid',

  bgColor: 'transparent',

  outerContainer: 'none',
  outerContainerPadding: 20,
  outerContainerColor: '#5E6AD2',
  outerContainerFill: 'none',

  showInnerPolygon: false,
  innerPolygonColor: '#FFFFFF',

  glowColor: '#5E6AD2',
  glowRadius: 0,
  shadowBlur: 0,
  shadowColor: '#00000066',

  petalWidth: 0.4,
  petalCurve: 0.6,

  exportWidth: 1024,
  exportHeight: 1024,
};

export const STAR_TYPE_LABELS: Record<StarType, string> = {
  '9-2': '{9/2} Enneagram',
  '9-4': '{9/4} Enneagram',
  '3-triangles': 'Triple Triangle',
  spike: 'Spike Star',
  kite: 'Kite Star',
  petal: 'Petal Rose',
};

export const STAR_TYPES_ORDERED: StarType[] = [
  '9-2', '9-4', '3-triangles', 'spike', 'kite', 'petal',
];
