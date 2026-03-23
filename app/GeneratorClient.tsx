'use client';

import { useRef, Suspense } from 'react';
import StarPreview from '@/components/StarPreview';
import ControlPanel from '@/components/controls/ControlPanel';
import ExportPanel from '@/components/ExportPanel';
import ShareButton from '@/components/ShareButton';
import { useStarConfig } from '@/hooks/useStarConfig';
import { useUrlSync } from '@/hooks/useUrlSync';
import type { StarConfig } from '@/types/star';

function Generator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { config, update, reset, setConfig } = useStarConfig();

  useUrlSync(config, setConfig);

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0">
      {/* Controls sidebar */}
      <aside className="w-full lg:w-80 xl:w-88 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#EAECF0] bg-white order-2 lg:order-1 h-[50vh] lg:h-full">
        <div className="flex-1 overflow-y-auto min-h-0">
          <ControlPanel config={config} update={update} onReset={reset} />
        </div>
        <ExportPanel
          svgRef={svgRef}
          config={config}
          update={update as <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void}
        />
      </aside>

      {/* Preview canvas */}
      <section className="flex-1 flex items-center justify-center relative order-1 lg:order-2 min-h-[45vh] lg:min-h-0 bg-[#F7F8FA]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Star */}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-8 lg:p-14">
          <StarPreview
            config={config}
            svgRef={svgRef}
            className="w-full h-full max-w-[min(100%,56vh)] max-h-[min(100%,56vw)]"
            style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.10))' }}
          />
        </div>

        {/* Share button */}
        <div className="absolute top-3 right-3 z-20">
          <ShareButton />
        </div>
      </section>
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
