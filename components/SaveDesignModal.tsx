'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, X, History } from 'lucide-react';
import { copyText } from '@/lib/clipboard';

interface Props {
  open: boolean;
  mode: 'geometry' | 'images';
  link?: string;
  format?: string;
  onClose: () => void;
  onOpenHistory: () => void;
}

export default function SaveDesignModal({ open, mode, link, format, onClose, onOpenHistory }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!link) return;
    const ok = await copyText(link);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#EAECF0] p-5"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] shrink-0">
                  <Check className="w-3 h-3 text-[#16A34A]" strokeWidth={3} />
                </span>
                <h2 className="text-[15px] font-semibold text-[#111827] tracking-tight">
                  {format ? `${format.toUpperCase()} downloaded` : 'Download complete'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors -mt-0.5 -mr-1 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11.5px] text-[#6B7280] mb-3 pl-7">
              Saved to your device — nothing more to do here.
            </p>

            {mode === 'geometry' ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-1.5">
                  Keep editing later (optional)
                </p>
                <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-2">
                  This design lives entirely in its link — bookmark or copy it to come back. It&apos;s
                  also saved in your history.
                </p>
                <button
                  onClick={copy}
                  title="Click to copy"
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] hover:border-[var(--nsg-accent-ring)] transition-colors text-left group"
                >
                  <span className="flex-1 min-w-0 truncate text-[12px] font-mono text-[#374151]">{link}</span>
                  {copied ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#059669] shrink-0">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--nsg-accent)] shrink-0">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF] mb-1.5">
                  Keep editing later (optional)
                </p>
                <p className="text-[12.5px] text-[#6B7280] leading-relaxed mb-2">
                  Image designs can&apos;t be shared as a link (they include your uploaded files), but
                  this one is saved in your browser&apos;s history so you can restore it anytime.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenHistory();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] text-white transition-colors"
                >
                  <History className="w-4 h-4" />
                  View history
                </button>
              </>
            )}

            <p className="mt-3 text-[10.5px] text-[#9CA3AF] leading-relaxed">
              Saved only in this browser — never uploaded or shared. Clearing your browser data removes it.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
