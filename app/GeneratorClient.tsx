'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { motion } from 'motion/react';
import { History } from 'lucide-react';
import StarPreview from '@/components/StarPreview';
import ImagePreview from '@/components/ImagePreview';
import PreviewErrorBoundary from '@/components/PreviewErrorBoundary';
import ImageEmptyState from '@/components/ImageEmptyState';
import ControlPanel from '@/components/controls/ControlPanel';
import ImageControlPanel from '@/components/controls/ImageControlPanel';
import { SegmentedControl } from '@/components/controls/primitives';
import ExportPanel from '@/components/ExportPanel';
import MobileExportFab from '@/components/MobileExportFab';
import ShareButton from '@/components/ShareButton';
import SaveDesignModal from '@/components/SaveDesignModal';
import HistoryPanel from '@/components/HistoryPanel';
import { useStarConfig } from '@/hooks/useStarConfig';
import { useComposition } from '@/hooks/useComposition';
import { useUrlSync } from '@/hooks/useUrlSync';
import { addHistory, loadHistory, removeHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import type { StarConfig } from '@/types/star';
import type { CompositionConfig } from '@/types/composition';

type Mode = 'geometry' | 'images';

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: 'geometry', label: 'Geometry' },
  { value: 'images', label: 'Images' },
];

// Images mode uses a teal accent to feel distinct from geometry's indigo.
const IMAGES_ACCENT = {
  '--nsg-accent': '#0D9488',
  '--nsg-accent-strong': '#0F766E',
  '--nsg-accent-soft': '#F0FDFA',
  '--nsg-accent-ring': '#99F6E4',
  '--nsg-accent-border': '#5EEAD4',
} as React.CSSProperties;

// Stable reference — an inline literal here would defeat memo() on the previews.
const PREVIEW_SHADOW: React.CSSProperties = { filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.10))' };

function Generator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<Mode>('geometry');

  const { config, update, reset, setConfig } = useStarConfig();
  const comp = useComposition();
  const [snapKey, setSnapKey] = useState(0);

  // Download history (local to the browser).
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savePrompt, setSavePrompt] = useState<{
    open: boolean;
    mode: Mode;
    link?: string;
    format?: string;
    storageWarning?: boolean;
  }>({
    open: false,
    mode: 'geometry',
  });

  useUrlSync(config, setConfig);

  // Load after mount (not during render) so server and client first paint match —
  // localStorage only exists in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadHistory());
  }, []);

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

  // Snapshot the design on every download, then offer to save the link.
  function handleDownloaded(format: 'svg' | 'png' | 'jpeg') {
    const link = !isImages && typeof window !== 'undefined' ? window.location.href : undefined;
    const { entries: nextEntries, trimmed } = addHistory(
      isImages
        ? { mode: 'images', format, config: comp.config }
        : { mode: 'geometry', format, config, link },
    );
    setEntries(nextEntries);
    setSavePrompt({
      open: true,
      mode,
      link,
      format: format === 'jpeg' ? 'jpg' : format,
      storageWarning: trimmed,
    });
  }

  function restore(entry: HistoryEntry) {
    if (entry.mode === 'geometry') {
      setConfig(entry.config as StarConfig);
      setMode('geometry');
    } else {
      comp.setConfig(entry.config as CompositionConfig);
      setMode('images');
    }
    setSnapKey((k) => k + 1);
    setHistoryOpen(false);
  }

  const exportProps = isImages
    ? {
        svgRef,
        exportWidth: comp.config.exportWidth,
        exportHeight: comp.config.exportHeight,
        onSize: (w: number, h: number) => { comp.update('exportWidth', w); comp.update('exportHeight', h); },
        filename: 'ninestar-composition',
        onDownloaded: handleDownloaded,
        disabled: comp.config.layers.length === 0,
      }
    : {
        svgRef,
        exportWidth: config.exportWidth,
        exportHeight: config.exportHeight,
        onSize: (w: number, h: number) => { update('exportWidth', w); update('exportHeight', h); },
        filename: 'star',
        onDownloaded: handleDownloaded,
      };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0" style={isImages ? IMAGES_ACCENT : undefined}>
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
              <PreviewErrorBoundary>
                {isImages ? (
                  <ImagePreview
                    config={comp.config}
                    svgRef={svgRef}
                    className="w-full h-full"
                    style={PREVIEW_SHADOW}
                  />
                ) : (
                  <StarPreview
                    config={config}
                    svgRef={svgRef}
                    className="w-full h-full"
                    style={PREVIEW_SHADOW}
                  />
                )}
              </PreviewErrorBoundary>
            </motion.div>
          )}
        </div>

        {/* History — top left */}
        <div className="absolute top-3 left-3 z-20">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border bg-white/90 border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB] backdrop-blur-sm transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            History
            {entries.length > 0 && (
              <span className="ml-0.5 px-1.5 rounded-full bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] text-[10px] font-semibold">
                {entries.length}
              </span>
            )}
          </button>
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

      {/* Save-design prompt after a download */}
      <SaveDesignModal
        open={savePrompt.open}
        mode={savePrompt.mode}
        link={savePrompt.link}
        format={savePrompt.format}
        storageWarning={savePrompt.storageWarning}
        onClose={() => setSavePrompt((s) => ({ ...s, open: false }))}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      {/* History panel */}
      <HistoryPanel
        open={historyOpen}
        entries={entries}
        onClose={() => setHistoryOpen(false)}
        onRestore={restore}
        onDelete={(id) => setEntries(removeHistory(id))}
        onClear={() => setEntries(clearHistory())}
      />
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
