'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { StarConfig } from '@/types/star';
import { configToParams, paramsToConfig } from '@/lib/url-params';
import { DEFAULT_CONFIG } from '@/types/star';

export function useUrlSync(
  config: StarConfig,
  setConfig: (c: StarConfig) => void,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMounting = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: read config from URL if params exist
  useEffect(() => {
    if (searchParams.size > 0) {
      const parsed = paramsToConfig(searchParams);
      setConfig(parsed);
    }
    isMounting.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On config change: write to URL (debounced)
  useEffect(() => {
    if (isMounting.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = configToParams(config);
      const query = params.toString();
      const url = query ? `/?${query}` : '/';
      router.replace(url, { scroll: false });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [config, router]);
}

export function getConfigFromSearchParams(searchParams: URLSearchParams): StarConfig {
  if (searchParams.size === 0) return DEFAULT_CONFIG;
  return paramsToConfig(searchParams);
}
