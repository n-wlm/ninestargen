'use client';

import { useCallback, useState } from 'react';
import type { CompositionConfig, ImageLayer } from '@/types/composition';
import { DEFAULT_COMPOSITION, MAX_LAYERS } from '@/types/composition';

function newLayerId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `l-${Math.random().toString(36).slice(2)}`;
}

export function useComposition(initial?: Partial<CompositionConfig>) {
  const [config, setConfigState] = useState<CompositionConfig>({ ...DEFAULT_COMPOSITION, ...initial });
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    (initial?.layers ?? DEFAULT_COMPOSITION.layers)[0]?.id ?? '',
  );

  const setConfig = useCallback((next: CompositionConfig) => {
    setConfigState(next);
    setSelectedLayerId(next.layers[next.layers.length - 1]?.id ?? '');
  }, []);

  const update = useCallback(<K extends keyof CompositionConfig>(key: K, value: CompositionConfig[K]) => {
    setConfigState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Layers are stored back-to-front; index 0 is the bottom layer. The UI shows
  // the list reversed (top = front). A newly added layer becomes selected.
  const addLayer = useCallback((layer: ImageLayer) => {
    setConfigState((prev) => (prev.layers.length >= MAX_LAYERS ? prev : { ...prev, layers: [...prev.layers, layer] }));
    setSelectedLayerId(layer.id);
  }, []);

  const duplicateLayer = useCallback((sourceId: string) => {
    setConfigState((prev) => {
      if (prev.layers.length >= MAX_LAYERS) return prev;
      const idx = prev.layers.findIndex((l) => l.id === sourceId);
      if (idx === -1) return prev;
      const id = newLayerId();
      const copy: ImageLayer = { ...prev.layers[idx], id };
      const layers = [...prev.layers];
      layers.splice(idx + 1, 0, copy);
      setSelectedLayerId(id);
      return { ...prev, layers };
    });
  }, []);

  const removeLayer = useCallback((id: string) => {
    setConfigState((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      const layers = prev.layers.filter((l) => l.id !== id);
      if (idx !== -1) {
        setSelectedLayerId((sel) => (sel === id ? layers[Math.min(idx, layers.length - 1)]?.id ?? '' : sel));
      }
      return { ...prev, layers };
    });
  }, []);

  const updateLayer = useCallback((id: string, partial: Partial<ImageLayer>) => {
    setConfigState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    }));
  }, []);

  // dir is added to the array index: +1 moves toward the front (end of array,
  // rendered on top), -1 toward the back. The UI list is shown reversed.
  const reorderLayer = useCallback((id: string, dir: -1 | 1) => {
    setConfigState((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.layers.length) return prev;
      const layers = [...prev.layers];
      [layers[idx], layers[target]] = [layers[target], layers[idx]];
      return { ...prev, layers };
    });
  }, []);

  const selectLayer = useCallback((id: string) => setSelectedLayerId(id), []);

  const reset = useCallback(() => {
    setConfigState({ ...DEFAULT_COMPOSITION });
    setSelectedLayerId(DEFAULT_COMPOSITION.layers[0]?.id ?? '');
  }, []);

  const selectedLayer = config.layers.find((l) => l.id === selectedLayerId) ?? config.layers[config.layers.length - 1];

  return {
    config,
    setConfig,
    update,
    addLayer,
    duplicateLayer,
    removeLayer,
    updateLayer,
    reorderLayer,
    reset,
    selectedLayer,
    selectedLayerId: selectedLayer?.id ?? '',
    selectLayer,
  };
}
