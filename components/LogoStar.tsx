'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { buildStarPaths } from '@/lib/star-geometry';
import { DEFAULT_CONFIG, type StarConfig } from '@/types/star';

const LOGO_SIZE = 20;
const LOGO_VB = 500;
const CX = LOGO_VB / 2;
const CY = LOGO_VB / 2;

export type LogoMode = 'geometry' | 'images';

// Two faces of the app icon: the indigo enneagram for geometry, a teal spike
// star for images. Switching modes does a 3D flip that reveals the other one.
const LOGO_CONFIGS: Record<LogoMode, StarConfig> = {
  geometry: { ...DEFAULT_CONFIG, starType: '9-2', fillType: 'solid', fillColor: '#5E6AD2', strokeWidth: 0, outerRadius: 200, innerRadiusRatio: 0.42 },
  images: { ...DEFAULT_CONFIG, starType: 'spike', fillType: 'solid', fillColor: '#0D9488', strokeWidth: 0, outerRadius: 210, innerRadiusRatio: 0.44 },
};

const LOGO_PATHS: Record<LogoMode, string[]> = {
  geometry: buildStarPaths(CX, CY, LOGO_CONFIGS.geometry),
  images: buildStarPaths(CX, CY, LOGO_CONFIGS.images),
};

function LogoStar({ mode = 'geometry' }: { mode?: LogoMode }) {
  const cfg = LOGO_CONFIGS[mode];
  const paths = LOGO_PATHS[mode];

  // A full flip per switch: geometry faces 0°, images faces 180° — the icon
  // spins in 3D and lands on the other star/colour.
  const rotateY = mode === 'images' ? 180 : 0;

  return (
    <motion.svg
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      viewBox={`0 0 ${LOGO_VB} ${LOGO_VB}`}
      fill="none"
      aria-hidden
      className="shrink-0"
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateY }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <g>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={cfg.fillColor} />
        ))}
      </g>
    </motion.svg>
  );
}

export default memo(LogoStar);
