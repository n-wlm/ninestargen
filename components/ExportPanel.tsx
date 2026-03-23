'use client';

import { useState } from 'react';
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

export default function ExportPanel({ svgRef, config, update }: ExportPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleSVG() {
    if (!svgRef.current) return;
    setLoading('svg');
    exportSVG(svgRef.current, 'star.svg');
    setLoading(null);
    showToast('SVG downloaded');
  }

  async function handleRaster(format: 'png' | 'jpeg') {
    if (!svgRef.current) return;
    setLoading(format);
    try {
      await exportRaster(svgRef.current, format, config.exportWidth, config.exportHeight);
      showToast(`${format.toUpperCase()} downloaded`);
    } catch {
      showToast('Export failed');
    }
    setLoading(null);
  }

  return (
    <div className="px-4 py-3 border-t border-[#F3F4F6] bg-white shrink-0">
      {/* Resolution row */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] shrink-0">Size</span>
        <div className="flex gap-1 flex-1">
          {RESOLUTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { update('exportWidth', value); update('exportHeight', value); }}
              className={`flex-1 py-1 text-[11px] rounded-md font-medium transition-all ${
                config.exportWidth === value
                  ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-1.5">
        <button
          onClick={handleSVG}
          disabled={loading !== null}
          className="flex-1 py-2 rounded-md text-[11px] font-semibold bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] transition-all disabled:opacity-40"
        >
          {loading === 'svg' ? '…' : 'SVG'}
        </button>
        <button
          onClick={() => handleRaster('png')}
          disabled={loading !== null}
          className="flex-1 py-2 rounded-md text-[11px] font-semibold bg-[#5E6AD2] hover:bg-[#4F5BBF] text-white transition-all disabled:opacity-40 shadow-sm"
        >
          {loading === 'png' ? '…' : 'PNG'}
        </button>
        <button
          onClick={() => handleRaster('jpeg')}
          disabled={loading !== null}
          className="flex-1 py-2 rounded-md text-[11px] font-semibold bg-[#111827] hover:bg-[#1F2937] text-white transition-all disabled:opacity-40 shadow-sm"
        >
          {loading === 'jpeg' ? '…' : 'JPG'}
        </button>
      </div>

      {toast && (
        <p className="text-center text-[11px] text-[#059669] font-medium mt-2">✓ {toast}</p>
      )}
    </div>
  );
}
