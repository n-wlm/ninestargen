'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useExport, RESOLUTIONS, type ExportFormat } from '@/hooks/useExport';
import ExportToast from '@/components/ExportToast';

interface Props {
  svgRef: React.RefObject<SVGSVGElement | null>;
  exportWidth: number;
  exportHeight: number;
  onSize: (width: number, height: number) => void;
  filename?: string;
  onDownloaded?: (format: ExportFormat) => void;
  disabled?: boolean; // nothing to export (e.g. images mode with no layers)
}

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'png',  label: 'PNG' },
  { id: 'svg',  label: 'SVG' },
  { id: 'jpeg', label: 'JPG' },
];

export default function MobileExportFab({ svgRef, exportWidth, exportHeight, onSize, filename = 'star', onDownloaded, disabled }: Props) {
  const { loading, toast, download } = useExport({ svgRef, exportWidth, exportHeight, filename, onDownloaded });
  const [open, setOpen]     = useState(false);
  const [format, setFormat] = useState<ExportFormat>('png');

  async function handleDownload() {
    await download(format);
    setOpen(false);
  }

  return (
    <>
      {/* FAB trigger */}
      <motion.button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        title={disabled ? 'Add an image first' : undefined}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold bg-[var(--nsg-accent)] text-white shadow-md disabled:opacity-40"
        whileHover={disabled ? undefined : { scale: 1.04 }}
        whileTap={disabled ? undefined : { scale: 0.95 }}
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
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Size</p>
              <div className="flex gap-2 mb-4">
                {RESOLUTIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => onSize(value, value)}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      exportWidth === value
                        ? 'bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
                        : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Format */}
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Format</p>
              <div className="flex gap-2 mb-5">
                {FORMATS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFormat(id)}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      format === id
                        ? 'bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
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
                disabled={loading !== null}
                className="w-full py-3 rounded-xl text-[15px] font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--nsg-accent), var(--nsg-accent-strong))' }}
              >
                {loading ? 'Downloading…' : `Download ${format === 'jpeg' ? 'JPG' : format.toUpperCase()}`}
              </button>

            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Toast — fixed bottom-center */}
      <ExportToast toast={toast} />
    </>
  );
}
