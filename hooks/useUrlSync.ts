'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type { GeometryComposition } from '@/types/geometry';
import { compositionToParams, paramsToComposition } from '@/lib/url-params';

export function useUrlSync(
  config: GeometryComposition,
  setConfig: (c: GeometryComposition) => void,
) {
  const searchParams = useSearchParams();
  const isMounting = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: read the composition from the URL if params exist. Legacy
  // single-star URLs (bare keys, no `n`) parse to a one-layer composition.
  useEffect(() => {
    if (searchParams.size > 0) {
      setConfig(paramsToComposition(searchParams));
    }
    isMounting.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On change: write to the URL (debounced)
  useEffect(() => {
    if (isMounting.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const query = compositionToParams(config).toString();
      window.history.replaceState(null, '', query ? `/?${query}` : '/');
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config]);
}
