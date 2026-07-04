'use client';

import { memo } from 'react';
import StarPreview from '@/components/StarPreview';
import { configFromLayer, DEFAULT_GEOMETRY_COMPOSITION, type GeometryLayer } from '@/types/geometry';
import type { ImageLayer } from '@/types/composition';

export type LayerRow = GeometryLayer | ImageLayer;

// Neutral canvas for geometry thumbnails — just the star, no bg/container.
const THUMB_CANVAS = { ...DEFAULT_GEOMETRY_COMPOSITION, bgColor: 'transparent', outerContainer: 'none' as const };

// Memoized per layer OBJECT, so a slider tick that replaces only the edited
// layer re-renders exactly one thumbnail — the others bail out (identity
// unchanged). Previously an inline `renderThumb` closure rebuilt all N.
export const LayerThumb = memo(function LayerThumb({ kind, layer }: { kind: 'geometry' | 'images'; layer: LayerRow }) {
  if (kind === 'geometry') {
    return <StarPreview config={configFromLayer(layer as GeometryLayer, THUMB_CANVAS)} className="w-full h-full" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={(layer as ImageLayer).src} alt="" className="w-full h-full object-contain" />;
});
