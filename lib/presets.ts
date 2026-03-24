import type { StarConfig } from '@/types/star';
import { DEFAULT_CONFIG } from '@/types/star';

export interface Preset {
  id: string;
  name: string;
  category: 'classic' | 'modern' | 'decorative' | 'geometric' | 'artistic';
  config: StarConfig;
}

function preset(id: string, name: string, category: Preset['category'], overrides: Partial<StarConfig>): Preset {
  return { id, name, category, config: { ...DEFAULT_CONFIG, ...overrides } };
}

export const PRESETS: Preset[] = [
  preset('classic-bahai', "Classic Bahá'í", 'classic', {
    starType: '3-triangles',
    fillType: 'none',
    strokeColor: '#C5961E',
    strokeWidth: 3,
    bgColor: '#FFFFFF',
    fillRule: 'evenodd',
    outerRadius: 210,
    innerRadiusRatio: 0.45,
  }),
  preset('modern-minimal', 'Modern Minimal', 'modern', {
    starType: '9-2',
    fillType: 'solid',
    fillColor: '#0F172A',
    strokeWidth: 0,
    bgColor: '#FFFFFF',
    innerRadiusRatio: 0.35,
  }),
  preset('sunset-gradient', 'Sunset Gradient', 'modern', {
    starType: '9-2',
    fillType: 'radial-gradient',
    gradientColors: ['#F97316', '#EC4899', '#8B5CF6'],
    strokeWidth: 0,
    bgColor: '#0F172A',
    innerRadiusRatio: 0.38,
  }),
  preset('neon-glow', 'Neon Glow', 'modern', {
    starType: '9-4',
    fillType: 'none',
    strokeColor: '#22D3EE',
    strokeWidth: 2.5,
    bgColor: '#030712',
    glowColor: '#22D3EE',
    glowRadius: 12,
    innerRadiusRatio: 0.42,
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
    strokeColor: '#6366F1',
    strokeWidth: 2,
    bgColor: 'transparent',
    innerRadiusRatio: 0.45,
  }),
  preset('crystalline', 'Crystalline', 'geometric', {
    starType: 'spike',
    fillType: 'linear-gradient',
    gradientColors: ['#BAE6FD', '#E0E7FF'],
    strokeColor: '#1E40AF',
    strokeWidth: 1.5,
    bgColor: '#0F172A',
    innerRadiusRatio: 0.5,
  }),
  preset('earth-tones', 'Earth Tones', 'classic', {
    starType: '3-triangles',
    fillType: 'solid',
    fillColor: '#B45309',
    fillOpacity: 0.85,
    strokeColor: '#78350F',
    strokeWidth: 2,
    bgColor: '#FEF3C7',
    fillRule: 'evenodd',
  }),
  preset('linked-petals', 'Linked Petals', 'geometric', {
    starType: 'kite',
    innerRadiusRatio: 0.85,
    fillType: 'solid',
    fillColor: '#111827',
    strokeWidth: 0,
    bgColor: '#FFFFFF',
  }),
  preset('diamond-grid', 'Diamond Grid', 'geometric', {
    starType: 'kite',
    fillType: 'solid',
    fillColor: '#3B82F6',
    fillOpacity: 0.8,
    strokeColor: '#1D4ED8',
    strokeWidth: 1.5,
    bgColor: '#EFF6FF',
    innerRadiusRatio: 0.38,
  }),
  preset('indigo-solid', 'Indigo', 'modern', {
    starType: '9-2',
    fillType: 'solid',
    fillColor: '#5E6AD2',
    strokeWidth: 0,
    bgColor: 'transparent',
  }),
];

export const PRESET_CATEGORIES = ['classic', 'modern', 'decorative', 'geometric', 'artistic'] as const;
