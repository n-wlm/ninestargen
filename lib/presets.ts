import type { StarConfig } from '@/types/star';
import { DEFAULT_CONFIG } from '@/types/star';
import {
  DEFAULT_GEOMETRY_COMPOSITION,
  configFromLayer,
  makeGeometryLayer,
  type GeometryComposition,
} from '@/types/geometry';

export interface Preset {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'decorative' | 'geometric' | 'artistic';
  config: StarConfig;
  // Multi-layer showcases carry a full composition; `config` is then just the
  // top layer, kept for any single-config fallback path.
  composition?: GeometryComposition;
}

function preset(id: string, name: string, category: Preset['category'], overrides: Partial<StarConfig>): Preset {
  return { id, name, category, config: { ...DEFAULT_CONFIG, ...overrides } };
}

function multiPreset(id: string, name: string, category: Preset['category'], composition: GeometryComposition): Preset {
  const top = composition.layers[composition.layers.length - 1];
  return { id, name, category, config: configFromLayer(top, composition), composition };
}

// Emerald Weave — an outline enneagram curved sharply inward, overlaid with a
// triple triangle; the owner's own two-layer combo, kept as a showcase of what
// stacking generated stars can do.
const EMERALD_WEAVE: GeometryComposition = {
  ...DEFAULT_GEOMETRY_COMPOSITION,
  layers: [
    makeGeometryLayer('l0', 'Star 1', {
      starType: '9-2', outerRadius: 180, fillType: 'none',
      fillColor: '#10B981', gradientColors: ['#10B981', '#059669'],
      strokeColor: '#059669', curveIntensity: -141,
    }),
    makeGeometryLayer('l1', 'Star 2', {
      starType: '3-triangles', outerRadius: 180, fillType: 'none', strokeColor: '#059669',
    }),
  ],
};

export const PRESETS: Preset[] = [
  preset('classic-bahai', "Classic Bahá'í", 'classic', {
    starType: '3-triangles',
    fillType: 'none',
    strokeColor: '#C5961E',
    strokeWidth: 3,
    bgColor: '#FFFFFF',
    outerRadius: 210,
    innerRadiusRatio: 0.45,
  }),
  preset('porcelain', 'Porcelain', 'modern', {
    starType: '9-4',
    fillType: 'solid',
    fillColor: '#FFFFFF',
    strokeColor: '#C8C4BF',
    strokeWidth: 1,
    bgColor: '#EBE9E6',
    innerRadiusRatio: 0.42,
    shadowBlur: 18,
    shadowColor: '#00000033',
    cornerRounding: 0.05,
  }),
  preset('watercolor-petal', 'Watercolor Petal', 'decorative', {
    starType: 'petal',
    fillType: 'solid',
    fillColor: '#EC4899',
    fillOpacity: 0.65,
    strokeColor: '#BE185D',
    strokeWidth: 1,
    bgColor: '#FDF2F8',
    petalWidth: 0.5,
    petalCurve: 0.7,
  }),
  preset('outline-enneagram', 'Outline Enneagram', 'geometric', {
    starType: '9-4',
    fillType: 'none',
    fillColor: '#111827',
    gradientColors: ['#374151', '#111827'],
    strokeColor: '#000000',
    strokeWidth: 2,
    curveIntensity: -100,
    innerRadiusRatio: 0.45,
  }),
  preset('sage-circle', 'Sage Circle', 'decorative', {
    starType: 'petal',
    fillType: 'solid',
    fillColor: '#87A987',
    fillOpacity: 0.85,
    strokeColor: '#5F7A61',
    strokeWidth: 1,
    petalWidth: 0.45,
    petalCurve: 0.65,
    outerContainer: 'circle',
    outerContainerPadding: 24,
    outerContainerColor: '#5F7A61',
    bgColor: '#F7F8F5',
  }),
  preset('earth-tones', 'Earth Tones', 'classic', {
    starType: '3-triangles',
    fillType: 'solid',
    fillColor: '#B45309',
    fillOpacity: 0.85,
    strokeColor: '#78350F',
    strokeWidth: 2,
    bgColor: '#FEF3C7',
  }),
  preset('linked-petals', 'Linked Petals', 'geometric', {
    starType: 'kite',
    innerRadiusRatio: 0.85,
    fillType: 'solid',
    fillColor: '#111827',
    strokeWidth: 0,
    bgColor: '#FFFFFF',
  }),
  preset('copper-thread', 'Copper Thread', 'geometric', {
    starType: '9-2',
    fillType: 'none',
    strokeColor: '#B45309',
    strokeWidth: 1.5,
    outerContainer: 'circle',
    outerContainerPadding: 16,
    outerContainerColor: '#D4A574',
    bgColor: '#FDFBF7',
  }),
  preset('indigo-solid', 'Leafburst', 'modern', {
    starType: 'spike',
    fillType: 'solid',
    fillColor: '#10B981',
    gradientColors: ['#10B981', '#059669'],
    strokeWidth: 0,
    bgColor: 'transparent',
    innerRadiusRatio: 0.34,
    curveIntensity: 121,
  }),
  preset('golden-kite', 'Golden Kite', 'decorative', {
    starType: 'kite',
    fillType: 'radial-gradient',
    fillColor: '#F59E0B',
    gradientColors: ['#F59E0B', '#D97706'],
    strokeWidth: 0,
    cornerRounding: 1,
  }),
  preset('honey-petal', 'Honey Petal', 'decorative', {
    starType: 'petal',
    fillType: 'solid',
    fillColor: '#EAB308',
    fillOpacity: 0.8,
    strokeColor: '#A16207',
    strokeWidth: 1,
    petalWidth: 0.5,
    petalCurve: 0.6,
  }),
  multiPreset('emerald-weave', 'Emerald Weave', 'artistic', EMERALD_WEAVE),
];

export const PRESET_CATEGORIES = ['classic', 'modern', 'decorative', 'geometric', 'artistic'] as const;
