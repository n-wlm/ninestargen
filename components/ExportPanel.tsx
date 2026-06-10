'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { useExport, RESOLUTIONS, type ExportFormat } from '@/hooks/useExport';
import ExportToast from '@/components/ExportToast';
import { copyText } from '@/lib/clipboard';

interface ExportPanelProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  exportWidth: number;
  exportHeight: number;
  onSize: (width: number, height: number) => void;
  filename?: string;
  onDownloaded?: (format: ExportFormat) => void;
  disabled?: boolean; // nothing to export (e.g. images mode with no layers)
}

const FORMATS: { id: ExportFormat; label: string; desc: string; recommended?: boolean }[] = [
  { id: 'png',  label: 'PNG', desc: 'Lossless, transparent bg', recommended: true },
  { id: 'svg',  label: 'SVG', desc: 'Vector — infinite scale' },
  { id: 'jpeg', label: 'JPG', desc: 'Compressed, white bg' },
];

export default function ExportPanel({ svgRef, exportWidth, exportHeight, onSize, filename = 'star', onDownloaded, disabled }: ExportPanelProps) {
  const { loading, toast, showToast, download } = useExport({ svgRef, exportWidth, exportHeight, filename, onDownloaded });
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleDownload(format: ExportFormat) {
    setOpen(false);
    void download(format);
  }

  return (
    <div className="px-4 py-3.5 lg:py-3 border-t border-[#F3F4F6] bg-white shrink-0">

      {/* Resolution row */}
      <div className="flex items-center gap-2 mb-3 lg:mb-2.5">
        <span className="text-[12px] lg:text-[10px] font-semibold uppercase tracking-widest text-[#6B7280] shrink-0">Size</span>
        <LayoutGroup id="resolution">
          <div className="flex gap-1.5 lg:gap-1 flex-1">
            {RESOLUTIONS.map(({ label, value }) => {
              const active = exportWidth === value;
              return (
                <button
                  key={value}
                  onClick={() => onSize(value, value)}
                  className={`relative flex-1 py-2 lg:py-1 text-[13px] lg:text-[11px] rounded-md font-medium transition-colors z-10 ${
                    active ? 'text-[var(--nsg-accent)]' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="res-active"
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

      {/* Download + Share row */}
      <div className="flex gap-1.5 relative" ref={dropdownRef}>
        {/* Download button */}
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={loading !== null || disabled}
          title={disabled ? 'Add an image first' : undefined}
          className="flex-1 py-2.5 lg:py-2 rounded-md text-[14px] lg:text-[12px] font-semibold bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--nsg-accent)] shadow-sm flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <span className="opacity-70">Downloading…</span>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 ml-0.5">
                <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>

        {/* Share button */}
        <button
          onClick={() => copyText(window.location.href).then((ok) => showToast(ok ? 'URL copied to clipboard' : 'Copy failed'))}
          title="Copy shareable link"
          className="px-2.5 py-2 rounded-md text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] hover:text-[#374151] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M4.3 6.2L9.7 3.3M4.3 7.8L9.7 10.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Format dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute bottom-full mb-1.5 left-0 right-10 bg-white rounded-lg shadow-lg border border-[#E5E7EB] overflow-hidden z-50"
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {FORMATS.map(({ id, label, desc, recommended }) => (
                <button
                  key={id}
                  onClick={() => handleDownload(id)}
                  className="w-full px-4 py-3 lg:px-3.5 lg:py-2.5 text-left hover:bg-[#F9FAFB] transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] lg:text-[12px] font-semibold text-[#111827]">{label}</span>
                    {recommended && (
                      <span className="text-[11px] lg:text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D]">Best</span>
                    )}
                  </span>
                  <span className="text-[12px] lg:text-[11px] text-[#9CA3AF] group-hover:text-[#6B7280]">{desc}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast — fixed bottom-center, outside flow */}
      <ExportToast toast={toast} />

    </div>
  );
}
