'use client';

import { memo, useState, useEffect, useMemo } from 'react';
import { buildStarPaths } from '@/lib/star-geometry';
import { DEFAULT_CONFIG } from '@/types/star';
import { LOGO_CONFIGS, LOGO_INTERVAL_MS } from '@/lib/logo-configs';

const LOGO_SIZE = 20;
const LOGO_VB = 500;
const CX = LOGO_VB / 2;
const CY = LOGO_VB / 2;

function LogoStar() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % LOGO_CONFIGS.length);
        setFading(false);
      }, 300);
    }, LOGO_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Only rebuilt when the rotating config index changes (every 30 min), not on
  // the fade toggle or unrelated parent renders.
  const { cfg, paths } = useMemo(() => {
    const c = { ...DEFAULT_CONFIG, ...LOGO_CONFIGS[idx], outerRadius: 200 };
    return { cfg: c, paths: buildStarPaths(CX, CY, c) };
  }, [idx]);

  return (
    <svg
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      viewBox={`0 0 ${LOGO_VB} ${LOGO_VB}`}
      fill="none"
      style={{ transition: 'opacity 0.3s', opacity: fading ? 0 : 1 }}
      aria-hidden
    >
      <g>
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={cfg.fillType === 'none' ? 'none' : cfg.fillColor}
            stroke={cfg.fillType === 'none' ? cfg.strokeColor : 'none'}
            strokeWidth={cfg.fillType === 'none' ? cfg.strokeWidth * 8 : 0}
          />
        ))}
      </g>
    </svg>
  );
}

export default memo(LogoStar);
