'use client';

import { useRef, useState } from 'react';
import { exportSVG, exportRaster } from '@/lib/export';

export type ExportFormat = 'svg' | 'png' | 'jpeg';

// Shared by the desktop ExportPanel and the MobileExportFab.
export const RESOLUTIONS = [
  { label: '512', value: 512 },
  { label: '1K', value: 1024 },
  { label: '2K', value: 2048 },
  { label: '4K', value: 4096 },
];

export interface ExportToastState {
  msg: string;
  key: number;
}

interface UseExportOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  exportWidth: number;
  exportHeight: number;
  filename?: string;
  onDownloaded?: (format: ExportFormat) => void;
}

// Download + toast logic shared by both export UIs (desktop panel, mobile sheet).
export function useExport({ svgRef, exportWidth, exportHeight, filename = 'star', onDownloaded }: UseExportOptions) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [toast, setToast] = useState<ExportToastState | null>(null);
  const toastCounter = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, key: ++toastCounter.current });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  async function download(format: ExportFormat) {
    if (!svgRef.current || loading) return;
    setLoading(format);
    try {
      if (format === 'svg') {
        exportSVG(svgRef.current, `${filename}.svg`);
      } else {
        await exportRaster(svgRef.current, format, exportWidth, exportHeight, `${filename}.${format === 'jpeg' ? 'jpg' : 'png'}`);
      }
      showToast(`Downloaded as ${format === 'jpeg' ? 'JPG' : format.toUpperCase()}`);
      onDownloaded?.(format);
    } catch {
      showToast('Export failed');
    }
    setLoading(null);
  }

  return { loading, toast, showToast, download };
}
