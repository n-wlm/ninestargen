'use client';

import { motion, AnimatePresence } from 'motion/react';
import { TriangleAlert, X } from 'lucide-react';

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Guards restoring (from history or an uploaded file) when it would overwrite
// a design already in progress — skipped entirely when the current design is
// still the untouched default (nothing to lose).
export default function RestoreConfirmModal({ open, onConfirm, onCancel }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#EAECF0] p-5"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 shrink-0">
                  <TriangleAlert className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
                </span>
                <h2 className="text-[15px] font-semibold text-[#111827] tracking-tight">
                  Replace current design?
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors -mt-0.5 -mr-1 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-4 pl-7">
              This replaces what&apos;s open in the editor. Anything you haven&apos;t downloaded
              yet will be lost.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors"
              >
                Keep editing
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] text-white transition-colors"
              >
                Restore anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
