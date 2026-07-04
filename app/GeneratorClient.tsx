'use client';

import { useRef, useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { motion } from 'motion/react';
import StarPreview from '@/components/StarPreview';
import ImagePreview from '@/components/ImagePreview';
import PreviewErrorBoundary from '@/components/PreviewErrorBoundary';
import ImageEmptyState from '@/components/ImageEmptyState';
import ControlPanel from '@/components/controls/ControlPanel';
import ImageControlPanel from '@/components/controls/ImageControlPanel';
import LayersPanel, { type LayersPanelProps } from '@/components/controls/LayersPanel';
import LayerList from '@/components/controls/LayerList';
import { SegmentedControl } from '@/components/controls/primitives';
import TopBar from '@/components/header/TopBar';
import Wordmark from '@/components/header/Wordmark';
import HeaderNav from '@/components/header/HeaderNav';
import ModeSwitch from '@/components/generator/ModeSwitch';
import ActionsCluster from '@/components/generator/ActionsCluster';
import SaveDesignModal from '@/components/SaveDesignModal';
import HistoryPanel from '@/components/HistoryPanel';
import { useStarComposition } from '@/hooks/useStarComposition';
import { useComposition } from '@/hooks/useComposition';
import { useUrlSync } from '@/hooks/useUrlSync';
import { addHistory, loadHistory, removeHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import type { StarConfig } from '@/types/star';
import { MAX_LAYERS, type CompositionConfig } from '@/types/composition';
import {
  asComposition,
  configFromLayer,
  isGeometryCanvasKey,
  MAX_GEOMETRY_LAYERS,
  type GeometryComposition,
  type GeometryLayer,
} from '@/types/geometry';

type Mode = 'geometry' | 'images';

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

type MobileTab = 'controls' | 'layers';
const MOBILE_TABS: { value: MobileTab; label: string }[] = [
  { value: 'controls', label: 'Controls' },
  { value: 'layers', label: 'Layers' },
];

function Generator() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<Mode>('geometry');
  const [mobileTab, setMobileTab] = useState<MobileTab>('controls');

  const star = useStarComposition();
  const comp = useComposition();

  // Latest values behind refs so download/history handlers stay STABLE (so
  // memoized header/actions don't re-render on every slider tick).
  const starConfigRef = useRef(star.config);
  const compConfigRef = useRef(comp.config);
  const modeRef = useRef<Mode>('geometry');
  useEffect(() => { starConfigRef.current = star.config; }, [star.config]);
  useEffect(() => { compConfigRef.current = comp.config; }, [comp.config]);

  // Legacy flat view of the selected layer + canvas. The control panel (and
  // the single-config URL sync) still speak StarConfig; the layer UI and the
  // multi-layer URL scheme land in follow-up cycles.
  const config = useMemo(
    () => configFromLayer(star.selectedLayer, star.config),
    [star.selectedLayer, star.config],
  );

  const { updateLayer, selectedLayerId, update: updateCanvas, setConfig: setStarComposition } = star;
  const update = useCallback(
    <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => {
      if (isGeometryCanvasKey(key)) {
        updateCanvas(key, value as GeometryComposition[typeof key]);
      } else {
        updateLayer(selectedLayerId, { [key]: value } as Partial<GeometryLayer>);
      }
    },
    [updateCanvas, updateLayer, selectedLayerId],
  );
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

  useUrlSync(star.config, setStarComposition);

  // Load after mount (not during render) so server and client first paint match —
  // localStorage only exists in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadHistory());
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      // Preset detail is a GeometryComposition (single-config presets are
      // wrapped upstream); asComposition also tolerates a legacy flat config.
      setStarComposition(asComposition((e as CustomEvent).detail));
      setMode('geometry');
      setSnapKey((k) => k + 1);
    };
    window.addEventListener('nsg:apply-preset', handler);
    return () => window.removeEventListener('nsg:apply-preset', handler);
  }, [setStarComposition]);

  const isImages = mode === 'images';
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Snapshot the design on every download, then offer to save the link.
  // Stable ([] deps) — reads current config/mode from refs.
  const handleDownloaded = useCallback((format: 'svg' | 'png' | 'jpeg') => {
    const im = modeRef.current === 'images';
    const link = !im && typeof window !== 'undefined' ? window.location.href : undefined;
    const { entries: nextEntries, trimmed } = addHistory(
      im
        ? { mode: 'images', format, config: compConfigRef.current }
        : { mode: 'geometry', format, config: starConfigRef.current, link },
    );
    setEntries(nextEntries);
    setSavePrompt({
      open: true,
      mode: modeRef.current,
      link,
      format: format === 'jpeg' ? 'jpg' : format,
      storageWarning: trimmed,
    });
  }, []);

  const onOpenHistory = useCallback(() => setHistoryOpen(true), []);

  function restore(entry: HistoryEntry) {
    if (entry.mode === 'geometry') {
      setStarComposition(asComposition(entry.config as StarConfig | GeometryComposition));
      setMode('geometry');
    } else {
      comp.setConfig(entry.config as CompositionConfig);
      setMode('images');
    }
    setSnapKey((k) => k + 1);
    setHistoryOpen(false);
  }

  const compUpdate = comp.update;
  const exportProps = useMemo(
    () =>
      isImages
        ? {
            svgRef,
            exportWidth: comp.config.exportWidth,
            exportHeight: comp.config.exportHeight,
            onSize: (w: number, h: number) => { compUpdate('exportWidth', w); compUpdate('exportHeight', h); },
            filename: 'ninestar-composition',
            onDownloaded: handleDownloaded,
            disabled: comp.config.layers.length === 0,
          }
        : {
            svgRef,
            exportWidth: star.config.exportWidth,
            exportHeight: star.config.exportHeight,
            onSize: (w: number, h: number) => { updateCanvas('exportWidth', w); updateCanvas('exportHeight', h); },
            filename: 'star',
            onDownloaded: handleDownloaded,
          },
    // Value deps (numbers/bools) stay stable across slider ticks; callbacks are stable.
    [isImages, comp.config.exportWidth, comp.config.exportHeight, comp.config.layers.length,
     star.config.exportWidth, star.config.exportHeight, compUpdate, updateCanvas, handleDownloaded],
  );

  // One layer-surface prop set per mode, shared by the floating LayersPanel
  // (desktop) and the sidebar Controls/Layers toggle (mobile). Memoized so it
  // only changes when the layers/selection actually change (not every tick);
  // thumbnails come from stable memo'd components (kind + layers), not a closure.
  const {
    selectLayer: cSelect, toggleLayerVisible: cToggle, reorderLayer: cReorder,
    duplicateLayer: cDup, removeLayer: cRemove,
  } = comp;
  const {
    selectLayer: sSelect, toggleLayerVisible: sToggle, reorderLayer: sReorder,
    duplicateLayer: sDup, removeLayer: sRemove,
  } = star;
  const imgLayers = comp.config.layers;
  const geoLayers = star.config.layers;
  const geoSelectedId = star.selectedLayerId;
  const onAddImage = useCallback(() => window.dispatchEvent(new CustomEvent('nsg:add-image')), []);
  const onAddLayer = useCallback(() => sDup(geoSelectedId), [sDup, geoSelectedId]);

  const layerProps: LayersPanelProps = useMemo(
    () =>
      isImages
        ? {
            layers: imgLayers,
            selectedId: comp.selectedLayerId,
            max: MAX_LAYERS,
            minLayers: 0,
            addLabel: 'Add image',
            maxHint: `Layer limit reached (${MAX_LAYERS}).`,
            kind: 'images' as const,
            onSelect: cSelect,
            onToggleVisible: cToggle,
            onReorder: cReorder,
            onDuplicate: cDup,
            onRemove: cRemove,
            onAdd: onAddImage,
          }
        : {
            layers: geoLayers,
            selectedId: geoSelectedId,
            max: MAX_GEOMETRY_LAYERS,
            addLabel: 'Add layer',
            maxHint: `Layer limit reached (${MAX_GEOMETRY_LAYERS}).`,
            kind: 'geometry' as const,
            onSelect: sSelect,
            onToggleVisible: sToggle,
            onReorder: sReorder,
            onDuplicate: sDup,
            onRemove: sRemove,
            onAdd: onAddLayer,
          },
    [isImages, imgLayers, comp.selectedLayerId, geoLayers, geoSelectedId,
     cSelect, cToggle, cReorder, cDup, cRemove, sSelect, sToggle, sReorder, sDup, sRemove, onAddImage, onAddLayer],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0" style={isImages ? IMAGES_ACCENT : undefined}>
      {/* Unified top bar: identity · mode · app nav · document actions */}
      <TopBar>
        <Wordmark mode={mode} />
        <ModeSwitch mode={mode} onChange={setMode} />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <HeaderNav />
          <ActionsCluster
            entriesCount={entries.length}
            onOpenHistory={onOpenHistory}
            isImages={isImages}
            {...exportProps}
          />
        </div>
      </TopBar>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Controls sidebar */}
        <motion.aside
          className="w-full lg:w-80 xl:w-88 flex-1 min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#EAECF0] bg-white order-2 lg:order-1 lg:flex-none lg:h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Mobile-only Controls/Layers toggle (desktop uses the floating panel) */}
          <div className="lg:hidden px-4 py-2.5 border-b border-[#EAECF0] shrink-0">
            <SegmentedControl options={MOBILE_TABS} value={mobileTab} onChange={setMobileTab} />
          </div>

          {/* Layers view — mobile only, when its tab is active */}
          <div className={`flex-1 overflow-y-auto min-h-0 p-3 ${mobileTab === 'layers' ? 'lg:hidden' : 'hidden'}`}>
            <LayerList {...layerProps} />
          </div>

          {/* Controls view — always on desktop; on mobile when its tab is active */}
          <div className={`flex-1 overflow-y-auto min-h-0 ${mobileTab === 'layers' ? 'hidden lg:block' : ''}`}>
            {isImages ? (
              <ImageControlPanel
                config={comp.config}
                update={comp.update}
                addLayer={comp.addLayer}
                updateLayer={comp.updateLayer}
                selectedLayer={comp.selectedLayer}
                onReset={comp.reset}
              />
            ) : (
              <ControlPanel
                config={config}
                update={update}
                onReset={star.reset}
                layers={star.config.layers}
                selectedLayer={star.selectedLayer}
                updateLayer={star.updateLayer}
              />
            )}
          </div>
        </motion.aside>

        {/* Preview canvas — cleared of overlays; actions live in the header */}
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
              <ImageEmptyState />
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
                      composition={star.config}
                      svgRef={svgRef}
                      className="w-full h-full"
                      style={PREVIEW_SHADOW}
                    />
                  )}
                </PreviewErrorBoundary>
              </motion.div>
            )}
          </div>

          {/* Floating layers window — always shown (images add their first image
              here too); desktop only, mobile uses the sidebar Layers toggle. */}
          <div className="absolute top-3 left-3 z-20 hidden lg:block">
            <LayersPanel {...layerProps} />
          </div>
        </motion.section>
      </div>

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
