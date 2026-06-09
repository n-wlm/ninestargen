'use client';

import { useCallback, useState } from 'react';
import type { CompositionConfig, ImageLayer } from '@/types/composition';
import { DEFAULT_COMPOSITION, MAX_LAYERS } from '@/types/composition';

export function useComposition(initial?: Partial<CompositionConfig>) {
  const [config, setConfig] = useState<CompositionConfig>({ ...DEFAULT_COMPOSITION, ...initial });

  const update = useCallback(<K extends keyof CompositionConfig>(key: K, value: CompositionConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Layers are stored back-to-front; we render in array order, so index 0 is the
  // bottom layer. The UI shows the list reversed (top = front).
  const addLayer = useCallback((layer: ImageLayer) => {
    setConfig((prev) =>
      prev.layers.length >= MAX_LAYERS ? prev : { ...prev, layers: [...prev.layers, layer] },
    );
  }, []);

  const removeLayer = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== id) }));
  }, []);

  const updateLayer = useCallback((id: string, partial: Partial<ImageLayer>) => {
    setConfig((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    }));
  }, []);

  // dir is added to the array index: +1 moves toward the front (end of array,
  // rendered on top), -1 toward the back. The UI list is shown reversed.
  const reorderLayer = useCallback((id: string, dir: -1 | 1) => {
    setConfig((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.layers.length) return prev;
      const layers = [...prev.layers];
      [layers[idx], layers[target]] = [layers[target], layers[idx]];
      return { ...prev, layers };
    });
  }, []);

  const reset = useCallback(() => setConfig({ ...DEFAULT_COMPOSITION }), []);

  return { config, setConfig, update, addLayer, removeLayer, updateLayer, reorderLayer, reset };
}
