'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { motion } from 'motion/react';
import StarPreview from '@/components/StarPreview';
import ControlPanel from '@/components/controls/ControlPanel';
import ExportPanel from '@/components/ExportPanel';
import MobileExportFab from '@/components/MobileExportFab';
import ShareButton from '@/components/ShareButton';
import { useStarConfig } from '@/hooks/useStarConfig';
import { useUrlSync } from '@/hooks/useUrlSync';
import type { StarConfig } from '@/types/star';

function Generator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { config, update, reset, setConfig } = useStarConfig();
  const [snapKey, setSnapKey] = useState(0);

  useUrlSync(config, setConfig);

  useEffect(() => {
    const handler = (e: Event) => {
      setConfig((e as CustomEvent).detail);
      setSnapKey((k) => k + 1);
    };
    window.addEventListener('nsg:apply-preset', handler);
    return () => window.removeEventListener('nsg:apply-preset', handler);
  }, [setConfig]);

  const exportProps = {
    svgRef,
    config,
    update: update as <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void,
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Controls sidebar */}
      <motion.aside
        className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#EAECF0] bg-white order-2 lg:order-1 h-[58vh] lg:h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex-1 overflow-y-auto min-h-0">
          <ControlPanel config={config} update={update} onReset={reset} />
        </div>
        {/* Export panel: desktop only */}
        <div className="hidden lg:block">
          <ExportPanel {...exportProps} />
        </div>
      </motion.aside>

      {/* Preview canvas */}
      <motion.section
        className="flex-1 flex items-center justify-center relative order-1 lg:order-2 min-h-[38vh] lg:min-h-0 bg-[#F7F8FA]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
      >
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Star */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-5 lg:p-14">
          <motion.div
            key={snapKey}
            className="w-full h-full flex items-center justify-center max-w-[min(100%,56vh)] max-h-[min(100%,56vw)]"
            initial={snapKey > 0 ? { scale: 0.93, opacity: 0.7 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            <StarPreview
              config={config}
              svgRef={svgRef}
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.10))' }}
            />
          </motion.div>
        </div>

        {/* Share — top right */}
        <div className="absolute top-3 right-3 z-20">
          <ShareButton />
        </div>

        {/* Export FAB — bottom left, mobile only */}
        <div className="absolute bottom-3 left-3 z-20 lg:hidden">
          <MobileExportFab {...exportProps} />
        </div>
      </motion.section>
    </div>
  );
}

export default function GeneratorClient() {
  return (
    <Suspense>
      <Generator />
    </Suspense>
  );
}
