import type { StarConfig } from '@/types/star';

export const LOGO_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export const LOGO_CONFIGS: Array<Partial<StarConfig>> = [
  { starType: '9-2',         fillType: 'solid',           fillColor: '#5E6AD2', strokeWidth: 0 },
  { starType: '3-triangles', fillType: 'none',            strokeColor: '#F59E0B', strokeWidth: 1.5, fillRule: 'evenodd' },
  { starType: 'spike',       fillType: 'solid',           fillColor: '#EC4899', strokeWidth: 0 },
  { starType: '9-4',         fillType: 'solid',           fillColor: '#0EA5E9', strokeWidth: 0 },
  { starType: 'petal',       fillType: 'solid',           fillColor: '#10B981', strokeWidth: 0 },
  { starType: 'kite',        fillType: 'solid',           fillColor: '#8B5CF6', strokeWidth: 0 },
];
