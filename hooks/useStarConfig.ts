'use client';

import { useState, useCallback } from 'react';
import type { StarConfig } from '@/types/star';
import { DEFAULT_CONFIG } from '@/types/star';

export function useStarConfig(initial?: Partial<StarConfig>) {
  const [config, setConfig] = useState<StarConfig>({ ...DEFAULT_CONFIG, ...initial });

  const update = useCallback(<K extends keyof StarConfig>(key: K, value: StarConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateMany = useCallback((partial: Partial<StarConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
  }, []);

  return { config, update, updateMany, reset, setConfig };
}
