'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCcw, Trash2 } from 'lucide-react';
import StarPreview from '@/components/StarPreview';
import ImagePreview from '@/components/ImagePreview';
import { ConfirmButton } from '@/components/controls/primitives';
import type { HistoryEntry } from '@/lib/history';
import type { StarConfig } from '@/types/star';
import type { CompositionConfig } from '@/types/composition';
import { asComposition, type GeometryComposition } from '@/types/geometry';

interface Props {
  open: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

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

export default function HistoryPanel({ open, entries, onClose, onRestore, onDelete, onClear }: Props) {
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
            className="w-full max-w-md max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#EAECF0] overflow-hidden"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-12 border-b border-[#F3F4F6] shrink-0">
              <h2 className="text-[14px] font-semibold text-[#111827] tracking-tight">History</h2>
              <button
                onClick={onClose}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors p-1 -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {entries.length === 0 ? (
                <div className="px-5 py-10 text-center">
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
                Saved only in this browser — never uploaded or shared with anyone. Clearing your
                browser data removes them.
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
