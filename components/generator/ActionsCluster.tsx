'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { FolderOpen, Share2, Download, ChevronDown, Check, X } from 'lucide-react';
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
  getMetadata?: () => string | undefined;
  disabled?: boolean;
  // One-time first-visit nudge under the Projects button.
  showProjectsHint?: boolean;
  onDismissHint?: () => void;
}

const FORMATS: { id: ExportFormat; label: string; desc: string; recommended?: boolean }[] = [
  { id: 'png',  label: 'PNG', desc: 'Lossless · transparent', recommended: true },
  { id: 'svg',  label: 'SVG', desc: 'Vector · infinite scale' },
  { id: 'jpeg', label: 'JPG', desc: 'Compressed · white bg' },
];

// History · Share · Download, bundled into one container in the header.
function ActionsCluster({
  entriesCount, onOpenHistory, isImages,
  svgRef, exportWidth, exportHeight, onSize, filename, onDownloaded, getMetadata, disabled,
  showProjectsHint, onDismissHint,
}: Props) {
  const { loading, toast, showToast, download } = useExport({ svgRef, exportWidth, exportHeight, filename, onDownloaded, getMetadata });
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
    showToast(ok ? 'Design link copied to clipboard' : 'Copy failed — try again');
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const seg = 'flex items-center gap-1.5 px-2 sm:px-2.5 lg:px-3 h-full text-[12px] lg:text-[13px] font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors whitespace-nowrap';

  return (
    <div className="relative flex items-stretch h-8 lg:h-9 border border-[#E5E7EB] rounded-lg overflow-visible bg-white">
      <button
        onClick={() => { onDismissHint?.(); onOpenHistory(); }}
        className={`${seg} rounded-l-lg`}
        title="Projects — restore a design or reopen a recent one"
      >
        <FolderOpen className="w-4 h-4" />
        <span className="hidden min-[720px]:inline">Projects</span>
        {entriesCount > 0 && (
          <span className="ml-0.5 px-1.5 rounded-full bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] text-[10px] font-semibold">
            {entriesCount}
          </span>
        )}
      </button>

      {/* First-visit nudge, anchored under the Projects button (leftmost).
          z-30 keeps it behind every modal (Templates z-50, History/Save/
          WhatsNew/About z-60, RestoreConfirm z-65) — on a first visit the
          Templates modal auto-opens, and the hint must sit behind it, not
          in front. */}
      <AnimatePresence>
        {showProjectsHint && (
          <motion.div
            className="absolute top-full left-0 mt-2.5 w-60 z-30"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <span className="absolute -top-1 left-5 w-2.5 h-2.5 rotate-45 bg-[var(--nsg-accent)]" />
            <div className="relative rounded-xl bg-[var(--nsg-accent)] text-white shadow-xl p-3 pr-8">
              <p className="text-[12.5px] font-semibold leading-tight">Continue where you left off</p>
              <p className="text-[11.5px] leading-snug text-white/85 mt-1">
                Reopen a recent design, or restore one from a file you downloaded.
              </p>
              <button
                onClick={onDismissHint}
                aria-label="Dismiss"
                className="absolute top-2 right-2 p-0.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isImages && (
        <>
          <span className="w-px self-center h-5 bg-[#EAECF0]" />
          <button onClick={handleShare} className={seg} title="Copy shareable design link">
            {copied ? <Check className="w-4 h-4 text-[#059669]" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden min-[720px]:inline">{copied ? 'Copied' : 'Share Design'}</span>
          </button>
        </>
      )}

      <span className="w-px self-center h-5 bg-[#EAECF0]" />

      <div className="relative flex" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={loading !== null || disabled}
          title={disabled ? 'Add an image first' : undefined}
          className="flex items-center gap-1.5 px-3 lg:px-4 text-[12px] lg:text-[13px] font-semibold text-white bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] transition-colors rounded-r-lg disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          {/* Below ~360px the word drops so the button stays fully visible
              (icon + caret) instead of being clipped; the label is back on any
              real-world phone width. */}
          <span className={loading ? 'inline' : 'hidden min-[360px]:inline'}>
            {loading ? 'Downloading…' : 'Download'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 -mr-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden z-50 p-3"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] shrink-0">Size</span>
                <LayoutGroup id="header-resolution">
                  <div className="flex gap-1 flex-1">
                    {RESOLUTIONS.map(({ label, value }) => {
                      const active = exportWidth === value;
                      return (
                        <button
                          key={value}
                          onClick={() => onSize(value, value)}
                          className={`relative flex-1 py-1.5 text-[11px] rounded-md font-medium transition-colors z-10 ${
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

              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] mb-1.5">Download as</span>
              <div className="flex flex-col gap-1.5">
                {FORMATS.map(({ id, label, desc, recommended }) => (
                  <button
                    key={id}
                    onClick={() => { setOpen(false); void download(id); }}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#E5E7EB] hover:border-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-soft)] transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-[#9CA3AF] group-hover:text-[var(--nsg-accent)] shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#111827]">{label}</span>
                        {recommended && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">Best</span>
                        )}
                      </span>
                      <span className="block text-[11px] text-[#9CA3AF]">{desc}</span>
                    </span>
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

export default memo(ActionsCluster);
