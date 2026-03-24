'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { exportSVG, exportRaster } from '@/lib/export';
import type { StarConfig } from '@/types/star';

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
}

const RESOLUTIONS = [
  { label: '512', value: 512 },
  { label: '1K',  value: 1024 },
  { label: '2K',  value: 2048 },
  { label: '4K',  value: 4096 },
];

const FORMATS = [
  { id: 'png'  as const, label: 'PNG' },
  { id: 'svg'  as const, label: 'SVG' },
  { id: 'jpeg' as const, label: 'JPG' },
];

export default function MobileExportFab({ svgRef, config, update }: Props) {
  const [open, setOpen]     = useState(false);
  const [format, setFormat] = useState<'png' | 'svg' | 'jpeg'>('png');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleDownload() {
    if (!svgRef.current || loading) return;
    setLoading(true);
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
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      {/* FAB trigger */}
      <motion.button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold bg-[#5E6AD2] text-white shadow-md"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Export"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Export
      </motion.button>

      {/* Sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl px-5 pt-4 pb-8"
              style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-5" />

              <p className="text-[13px] font-bold text-[#111827] mb-4">Export</p>

              {/* Size */}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">Size</p>
              <div className="flex gap-2 mb-4">
                {RESOLUTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => { update('exportWidth', value); update('exportHeight', value); }}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      config.exportWidth === value
                        ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Format */}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">Format</p>
              <div className="flex gap-2 mb-5">
                {FORMATS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFormat(id)}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      format === id
                        ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full py-3 rounded-xl text-[15px] font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                {loading ? 'Downloading…' : `Download ${format.toUpperCase()}`}
              </button>

            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Toast — fixed bottom-center */}
      <AnimatePresence>
        {toast && (
          <motion.div
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
            <span className="text-[12px] font-medium text-white whitespace-nowrap">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
