'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { exportSVG, exportRaster } from '@/lib/export';
import type { StarConfig } from '@/types/star';

interface ExportPanelProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
}

const RESOLUTIONS = [
  { label: '512', value: 512 },
  { label: '1K', value: 1024 },
  { label: '2K', value: 2048 },
  { label: '4K', value: 4096 },
];

const FORMATS: { id: 'png' | 'svg' | 'jpeg'; label: string; desc: string; recommended?: boolean }[] = [
  { id: 'png',  label: 'PNG', desc: 'Lossless, transparent bg', recommended: true },
  { id: 'svg',  label: 'SVG', desc: 'Vector — infinite scale' },
  { id: 'jpeg', label: 'JPG', desc: 'Compressed, white bg' },
];

export default function ExportPanel({ svgRef, config, update }: ExportPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
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

  function showToast(msg: string) {
    setToast({ msg, key: Date.now() });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleDownload(format: 'svg' | 'png' | 'jpeg') {
    if (!svgRef.current) return;
    setOpen(false);
    setLoading(format);
    try {
      if (format === 'svg') {
        exportSVG(svgRef.current, 'star.svg');
        showToast('Downloaded as SVG');
      } else {
        await exportRaster(svgRef.current, format, config.exportWidth, config.exportHeight);
        showToast(`Downloaded as ${format.toUpperCase()}`);
      }
    } catch {
      showToast('Export failed');
    }
    setLoading(null);
  }

  return (
    <div className="px-4 py-3.5 lg:py-3 border-t border-[#F3F4F6] bg-white shrink-0">

      {/* Resolution row */}
      <div className="flex items-center gap-2 mb-3 lg:mb-2.5">
        <span className="text-[12px] lg:text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] shrink-0">Size</span>
        <LayoutGroup id="resolution">
          <div className="flex gap-1.5 lg:gap-1 flex-1">
            {RESOLUTIONS.map(({ label, value }) => {
              const active = config.exportWidth === value;
              return (
                <button
                  key={value}
                  onClick={() => { update('exportWidth', value); update('exportHeight', value); }}
                  className={`relative flex-1 py-2 lg:py-1 text-[13px] lg:text-[11px] rounded-md font-medium transition-colors z-10 ${
                    active ? 'text-[#5E6AD2]' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="res-active"
                      className="absolute inset-0 rounded-md bg-[#EEF2FF] ring-1 ring-inset ring-[#C7D2FE] -z-10"
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
          disabled={loading !== null}
          className="flex-1 py-2.5 lg:py-2 rounded-md text-[14px] lg:text-[12px] font-semibold bg-[#5E6AD2] hover:bg-[#4F5BBF] text-white transition-all disabled:opacity-40 shadow-sm flex items-center justify-center gap-1.5"
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
          onClick={() => navigator.clipboard.writeText(window.location.href).then(() => showToast('URL copied to clipboard')).catch(() => showToast('Copy failed'))}
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
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.key}
            className="fixed bottom-6 left-1/2 z-100 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111827] shadow-lg pointer-events-none"
            style={{ x: '-50%' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <svg className="w-3.5 h-3.5 text-[#34D399] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[12px] font-medium text-white whitespace-nowrap">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
