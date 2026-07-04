'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { History, Share2, Download, ChevronDown, Check } from 'lucide-react';
import { useExport, RESOLUTIONS, type ExportFormat } from '@/hooks/useExport';
import ExportToast from '@/components/ExportToast';
import { copyText } from '@/lib/clipboard';

interface Props {
  entriesCount: number;
  onOpenHistory: () => void;
  isImages: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  exportWidth: number;
  exportHeight: number;
  onSize: (w: number, h: number) => void;
  filename: string;
  onDownloaded: (format: ExportFormat) => void;
  disabled?: boolean;
}

const FORMATS: { id: ExportFormat; label: string; desc: string; recommended?: boolean }[] = [
  { id: 'png',  label: 'PNG', desc: 'Lossless, transparent bg', recommended: true },
  { id: 'svg',  label: 'SVG', desc: 'Vector — infinite scale' },
  { id: 'jpeg', label: 'JPG', desc: 'Compressed, white bg' },
];

// History · Share · Download, bundled into one bordered container in the header
// (replaces the canvas overlays + the sidebar export panel + the mobile FAB).
export default function ActionsCluster({
  entriesCount, onOpenHistory, isImages,
  svgRef, exportWidth, exportHeight, onSize, filename, onDownloaded, disabled,
}: Props) {
  const { loading, toast, download } = useExport({ svgRef, exportWidth, exportHeight, filename, onDownloaded });
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('keydown', onKey); };
  }, [open]);

  async function handleShare() {
    const ok = await copyText(window.location.href);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const seg = 'flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors';

  return (
    <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-visible bg-white">
      <button onClick={onOpenHistory} className={`${seg} rounded-l-lg`} title="History">
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">History</span>
        {entriesCount > 0 && (
          <span className="ml-0.5 px-1.5 rounded-full bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] text-[10px] font-semibold">
            {entriesCount}
          </span>
        )}
      </button>

      {!isImages && (
        <>
          <span className="w-px h-5 bg-[#EAECF0]" />
          <button onClick={handleShare} className={seg} title="Copy shareable link">
            {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </>
      )}

      <span className="w-px h-5 bg-[#EAECF0]" />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={loading !== null || disabled}
          title={disabled ? 'Add an image first' : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] transition-colors rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{loading ? 'Downloading…' : 'Download'}</span>
          <ChevronDown className="w-3 h-3 -mr-0.5" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute top-full mt-1.5 right-0 w-60 bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden z-50 p-2.5"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] shrink-0">Size</span>
                <LayoutGroup id="header-resolution">
                  <div className="flex gap-1 flex-1">
                    {RESOLUTIONS.map(({ label, value }) => {
                      const active = exportWidth === value;
                      return (
                        <button
                          key={value}
                          onClick={() => onSize(value, value)}
                          className={`relative flex-1 py-1 text-[11px] rounded-md font-medium transition-colors z-10 ${
                            active ? 'text-[var(--nsg-accent)]' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
                          }`}
                        >
                          {active && (
                            <motion.div
                              layoutId="header-res-active"
                              className="absolute inset-0 rounded-md bg-[var(--nsg-accent-soft)] ring-1 ring-inset ring-[var(--nsg-accent-ring)] -z-10"
                              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                            />
                          )}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>
              </div>

              <div className="flex flex-col -mx-0.5">
                {FORMATS.map(({ id, label, desc, recommended }) => (
                  <button
                    key={id}
                    onClick={() => { setOpen(false); void download(id); }}
                    className="w-full px-2.5 py-2 rounded-md text-left hover:bg-[#F9FAFB] transition-colors flex items-center justify-between group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#111827]">{label}</span>
                      {recommended && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">Best</span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] group-hover:text-[#6B7280]">{desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExportToast toast={toast} />
    </div>
  );
}
