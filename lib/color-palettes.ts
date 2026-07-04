import type { FillType } from '@/types/star';

export interface ColorPalette {
  id: string;
  name: string;
  swatch: string;
  fillType: FillType;
  fillColor: string;
  gradientColors: string[];
}

// Curated single colors for the picker popover, laid out as a 5-wide grid:
// neutrals, warm, green, cool, purple/pink, and a full row of soft pastels.
// Each hue row leads with a lighter/pastel tint so gentle colors are as easy
// to reach as saturated ones.
export const SWATCH_COLORS: string[] = [
  '#FFFFFF', '#E5E7EB', '#9CA3AF', '#4B5563', '#111827',
  '#FCA5A5', '#EF4444', '#F97316', '#F59E0B', '#C5961E',
  '#86EFAC', '#A3E635', '#34D399', '#10B981', '#059669',
  '#99F6E4', '#22D3EE', '#38BDF8', '#3B82F6', '#1D4ED8',
  '#C4B5FD', '#8B5CF6', '#5E6AD2', '#EC4899', '#BE185D',
  '#FED7AA', '#FEF3C7', '#BBF7D0', '#BAE6FD', '#DDD6FE',
];

export const PALETTES: ColorPalette[] = [
  { id: 'indigo',  name: 'Indigo',   swatch: '#5E6AD2', fillType: 'solid',           fillColor: '#5E6AD2', gradientColors: ['#5E6AD2', '#818CF8'] },
  { id: 'sunset',  name: 'Sunset',   swatch: '#F97316', fillType: 'linear-gradient', fillColor: '#F97316', gradientColors: ['#F97316', '#EC4899', '#8B5CF6'] },
  { id: 'ocean',   name: 'Ocean',    swatch: '#0EA5E9', fillType: 'linear-gradient', fillColor: '#0EA5E9', gradientColors: ['#0EA5E9', '#6366F1'] },
  { id: 'forest',  name: 'Forest',   swatch: '#10B981', fillType: 'solid',           fillColor: '#10B981', gradientColors: ['#10B981', '#059669'] },
  { id: 'gold',    name: 'Gold',     swatch: '#F59E0B', fillType: 'linear-gradient', fillColor: '#F59E0B', gradientColors: ['#F59E0B', '#D97706'] },
  { id: 'rose',    name: 'Rose',     swatch: '#EC4899', fillType: 'radial-gradient', fillColor: '#EC4899', gradientColors: ['#FDF2F8', '#EC4899'] },
  { id: 'mono',    name: 'Mono',     swatch: '#111827', fillType: 'solid',           fillColor: '#111827', gradientColors: ['#374151', '#111827'] },
  { id: 'bahai',   name: "Bahá'í",   swatch: '#C5961E', fillType: 'none',            fillColor: '#C5961E', gradientColors: ['#C5961E', '#F59E0B'] },
  { id: 'pastel',  name: 'Pastel',   swatch: '#A78BFA', fillType: 'linear-gradient', fillColor: '#A78BFA', gradientColors: ['#FDE68A', '#FCA5A5', '#A78BFA'] },
  { id: 'neon',    name: 'Neon',     swatch: '#22D3EE', fillType: 'solid',           fillColor: '#22D3EE', gradientColors: ['#22D3EE', '#A78BFA'] },
];
