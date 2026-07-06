'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Trash2, UploadCloud, AlertCircle } from 'lucide-react';
import StarPreview from '@/components/StarPreview';
import ImagePreview from '@/components/ImagePreview';
import { ConfirmButton } from '@/components/controls/primitives';
import { ACCEPT_ATTR } from '@/lib/image-upload';
import { extractProjectFromFile } from '@/lib/project-metadata';
import type { HistoryEntry } from '@/lib/history';
import type { StarConfig } from '@/types/star';
import type { CompositionConfig } from '@/types/composition';
import { asComposition, type GeometryComposition } from '@/types/geometry';

interface Props {
  open: boolean;
  entries: HistoryEntry[];
  // Images mode can't be restored from a file, so the upload area is hidden there.
  isImages: boolean;
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
  onRestoreProject: (comp: GeometryComposition) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const IMPORT_MESSAGES: Record<'no-data' | 'unreadable' | 'unsupported', string> = {
  'no-data': 'No saved design found in this file. Only files downloaded here on or after 6 Jul 2026 can be restored.',
  unreadable: 'Couldn’t read that file. Is it a valid image?',
  unsupported: 'Please choose an SVG, PNG or JPG file.',
};

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function Thumb({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="w-12 h-12 rounded-lg bg-[#F7F8FA] border border-[#EAECF0] overflow-hidden flex items-center justify-center shrink-0">
      {entry.mode === 'geometry' ? (
        <StarPreview
          composition={asComposition(entry.config as StarConfig | GeometryComposition)}
          className="w-full h-full"
        />
      ) : (
        <ImagePreview config={entry.config as CompositionConfig} className="w-full h-full" />
      )}
    </div>
  );
}

export default function HistoryPanel({
  open, entries, isImages, onClose, onRestore, onRestoreProject, onDelete, onClear,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fresh start each time the panel opens (clear any prior import error).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) { setError(null); setDragging(false); setBusy(false); }
  }, [open]);

  async function handleFile(file: File | undefined) {
    if (!file || busy) return;
    setError(null);
    setBusy(true);
    const res = await extractProjectFromFile(file);
    setBusy(false);
    if (res.ok) {
      onRestoreProject(res.composition); // parent applies + closes the panel
    } else {
      setError(IMPORT_MESSAGES[res.reason]);
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#EAECF0] overflow-hidden"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-[#F3F4F6] shrink-0">
              <h2 className="text-[14px] font-semibold text-[#111827] tracking-tight">Projects</h2>
              <button
                onClick={onClose}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors p-1 -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Restore from a file — geometry only (images can't be rebuilt from a link) */}
            {!isImages && (
              <div className="px-5 pt-4 pb-3 border-b border-[#F3F4F6] shrink-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-2">
                  Restore from a file
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT_ATTR}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    handleFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`w-full flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border border-dashed transition-colors text-center ${
                    dragging
                      ? 'border-[var(--nsg-accent)] bg-[var(--nsg-accent-soft)]'
                      : 'border-[#D8DCE3] hover:border-[var(--nsg-accent-ring)] hover:bg-[#F9FAFB]'
                  }`}
                >
                  <UploadCloud className={`w-5 h-5 ${dragging ? 'text-[var(--nsg-accent)]' : 'text-[#9CA3AF]'}`} />
                  <span className="text-[12.5px] font-medium text-[#374151]">
                    {busy ? 'Reading…' : 'Drop a file or click to choose'}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">SVG, PNG or JPG</span>
                </button>
                <p className="text-[11px] text-[#6B7280] leading-relaxed mt-2">
                  Open a file you downloaded here to keep editing it. Only files saved on or after
                  6 Jul 2026 can be restored.
                </p>
                {error && (
                  <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11.5px] text-amber-800 leading-snug">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recent downloads */}
            <p className="px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] shrink-0">
              Recent
            </p>
            <div className="flex-1 overflow-y-auto min-h-0">
              {entries.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-[13px] text-[#6B7280]">No saved designs yet.</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">
                    Each time you download, a snapshot is saved here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <Thumb entry={entry} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium text-[#374151] capitalize">
                          {entry.mode} · {entry.format.toUpperCase()}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF]">{formatDate(entry.date)}</p>
                      </div>
                      <button
                        onClick={() => onRestore(entry)}
                        title="Restore this design"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-soft)] transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        title="Delete"
                        className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — privacy note + clear */}
            <div className="px-5 py-3 border-t border-[#F3F4F6] shrink-0 flex items-center justify-between gap-3">
              <p className="text-[10.5px] text-[#9CA3AF] leading-snug flex-1">
                Saved only in this browser, never uploaded. Clearing browser data removes them.
              </p>
              {entries.length > 0 && (
                <ConfirmButton
                  label="Clear"
                  message="Delete all saved designs?"
                  confirmLabel="Clear"
                  onConfirm={onClear}
                  destructive
                  placement="top"
                  className="text-[11px] text-[#6B7280] hover:text-[#EF4444] transition-colors font-medium shrink-0"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
