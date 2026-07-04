'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeometryComposition, GeometryLayer } from '@/types/geometry';
import { DEFAULT_GEOMETRY_COMPOSITION, MAX_GEOMETRY_LAYERS, makeGeometryLayer } from '@/types/geometry';

function newLayerId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `l-${Math.random().toString(36).slice(2)}`;
}

function nextName(layers: GeometryLayer[]): string {
  return `Star ${layers.length + 1}`;
}

// Geometry twin of useComposition. Selection lives here because the geometry
// panel edits ONE selected layer (the sections below the layer list), so
// add/duplicate must auto-select and delete must fall back sensibly.
export function useStarComposition(initial?: Partial<GeometryComposition>) {
  const [config, setConfigState] = useState<GeometryComposition>({ ...DEFAULT_GEOMETRY_COMPOSITION, ...initial });
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    (initial?.layers ?? DEFAULT_GEOMETRY_COMPOSITION.layers)[0]?.id ?? 'star-1',
  );

  // Latest layers, so add/duplicate/remove can keep STABLE identities ([] deps)
  // instead of churning every time a layer changes — which was defeating memo on
  // everything downstream (LayersPanel, ActionsCluster…).
  const layersRef = useRef(config.layers);
  useEffect(() => { layersRef.current = config.layers; }, [config.layers]);

  // Full replace (URL parse, preset apply, history restore) — selection resets
  // to the top-most layer of the incoming composition.
  const setConfig = useCallback((next: GeometryComposition) => {
    setConfigState(next);
    setSelectedLayerId(next.layers[next.layers.length - 1]?.id ?? 'star-1');
  }, []);

  const update = useCallback(<K extends keyof GeometryComposition>(key: K, value: GeometryComposition[K]) => {
    setConfigState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Layers are stored back-to-front; index 0 renders at the bottom.
  // Read the latest layers from the ref so these callbacks stay stable.
  const addLayer = useCallback((from?: GeometryLayer) => {
    const layers = layersRef.current;
    if (layers.length >= MAX_GEOMETRY_LAYERS) return;
    const layer = makeGeometryLayer(newLayerId(), nextName(layers), from);
    setConfigState((prev) => ({ ...prev, layers: [...prev.layers, layer] }));
    setSelectedLayerId(layer.id);
  }, []);

  const duplicateLayer = useCallback((sourceId: string) => {
    const layers = layersRef.current;
    if (layers.length >= MAX_GEOMETRY_LAYERS) return;
    const idx = layers.findIndex((l) => l.id === sourceId);
    if (idx === -1) return;
    const copy = makeGeometryLayer(newLayerId(), nextName(layers), layers[idx]);
    setConfigState((prev) => {
      const next = [...prev.layers];
      next.splice(idx + 1, 0, copy); // directly above the source
      return { ...prev, layers: next };
    });
    setSelectedLayerId(copy.id);
  }, []);

  const removeLayer = useCallback((id: string) => {
    const layers = layersRef.current;
    if (layers.length <= 1) return; // a composition always has ≥1 layer
    const idx = layers.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const remaining = layers.filter((l) => l.id !== id);
    setConfigState((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== id) }));
    setSelectedLayerId((sel) => (sel === id ? remaining[Math.min(idx, remaining.length - 1)].id : sel));
  }, []);

  const updateLayer = useCallback((id: string, partial: Partial<GeometryLayer>) => {
    setConfigState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    }));
  }, []);

  // Stable (no closure over `layers`) so the layer-row memo isn't defeated.
  const toggleLayerVisible = useCallback((id: string) => {
    setConfigState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    }));
  }, []);

  // dir is added to the array index: +1 moves toward the front (rendered on
  // top), -1 toward the back. The UI list is shown reversed.
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
    setConfigState({ ...DEFAULT_GEOMETRY_COMPOSITION });
    setSelectedLayerId(DEFAULT_GEOMETRY_COMPOSITION.layers[0].id);
  }, []);

  const selectedLayer =
    config.layers.find((l) => l.id === selectedLayerId) ?? config.layers[config.layers.length - 1];

  return {
    config,
    setConfig,
    update,
    addLayer,
    duplicateLayer,
    removeLayer,
    updateLayer,
    toggleLayerVisible,
    reorderLayer,
    reset,
    selectedLayer,
    selectedLayerId: selectedLayer.id,
    selectLayer,
  };
}
