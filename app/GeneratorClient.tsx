'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { motion } from 'motion/react';
import StarPreview from '@/components/StarPreview';
import ImagePreview from '@/components/ImagePreview';
import ImageEmptyState from '@/components/ImageEmptyState';
import ControlPanel from '@/components/controls/ControlPanel';
import ImageControlPanel from '@/components/controls/ImageControlPanel';
import { SegmentedControl } from '@/components/controls/primitives';
import ExportPanel from '@/components/ExportPanel';
import MobileExportFab from '@/components/MobileExportFab';
import ShareButton from '@/components/ShareButton';
import { useStarConfig } from '@/hooks/useStarConfig';
import { useComposition } from '@/hooks/useComposition';
import { useUrlSync } from '@/hooks/useUrlSync';

type Mode = 'geometry' | 'images';

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'geometry', label: 'Geometry' },
  { value: 'images', label: 'Images' },
];

function Generator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<Mode>('geometry');

  const { config, update, reset, setConfig } = useStarConfig();
  const comp = useComposition();
  const [snapKey, setSnapKey] = useState(0);

  useUrlSync(config, setConfig);

  useEffect(() => {
    const handler = (e: Event) => {
      setConfig((e as CustomEvent).detail);
      setMode('geometry');
      setSnapKey((k) => k + 1);
    };
    window.addEventListener('nsg:apply-preset', handler);
    return () => window.removeEventListener('nsg:apply-preset', handler);
  }, [setConfig]);

  const isImages = mode === 'images';

  const exportProps = isImages
    ? {
        svgRef,
        exportWidth: comp.config.exportWidth,
        exportHeight: comp.config.exportHeight,
        onSize: (w: number, h: number) => { comp.update('exportWidth', w); comp.update('exportHeight', h); },
        filename: 'ninestar-composition',
      }
    : {
        svgRef,
        exportWidth: config.exportWidth,
        exportHeight: config.exportHeight,
        onSize: (w: number, h: number) => { update('exportWidth', w); update('exportHeight', h); },
        filename: 'star',
      };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Controls sidebar */}
      <motion.aside
        className="w-full lg:w-80 xl:w-88 flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#EAECF0] bg-white order-2 lg:order-1 lg:flex-none lg:h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Mode switch */}
        <div className="px-4 py-2.5 border-b border-[#EAECF0] shrink-0">
          <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {isImages ? (
            <ImageControlPanel
              config={comp.config}
              update={comp.update}
              addLayer={comp.addLayer}
              removeLayer={comp.removeLayer}
              updateLayer={comp.updateLayer}
              reorderLayer={comp.reorderLayer}
              onReset={comp.reset}
            />
          ) : (
            <ControlPanel config={config} update={update} onReset={reset} />
          )}
        </div>
        {/* Export panel: desktop only */}
        <div className="hidden lg:block">
          <ExportPanel {...exportProps} />
        </div>
      </motion.aside>

      {/* Preview canvas */}
      <motion.section
        className="shrink-0 h-[40svh] flex items-center justify-center relative order-1 lg:order-2 lg:h-auto lg:shrink lg:flex-1 lg:min-h-0 bg-[#F7F8FA]"
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

        {/* Preview */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-5 lg:p-14 [container-type:size]">
          {isImages && comp.config.layers.length === 0 ? (
            <ImageEmptyState onAddImage={() => window.dispatchEvent(new CustomEvent('nsg:add-image'))} />
          ) : (
            <motion.div
              key={snapKey}
              className="aspect-square w-[min(100cqw,100cqh)] flex items-center justify-center"
              initial={snapKey > 0 ? { scale: 0.93, opacity: 0.7 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              {isImages ? (
                <ImagePreview
                  config={comp.config}
                  svgRef={svgRef}
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.10))' }}
                />
              ) : (
                <StarPreview
                  config={config}
                  svgRef={svgRef}
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.10))' }}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Share — top right (geometry mode only; image compositions aren't URL-encoded) */}
        {!isImages && (
          <div className="absolute top-3 right-3 z-20">
            <ShareButton />
          </div>
        )}

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
