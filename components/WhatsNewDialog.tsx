'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

import { CHANGELOG } from '@/lib/changelog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WhatsNewDialog({ open, onClose }: Props) {
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
            className="w-full max-w-sm max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#EAECF0] overflow-hidden"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-12 border-b border-[#F3F4F6] shrink-0">
              <h2 className="text-[14px] font-semibold text-[#111827] tracking-tight">What&apos;s new</h2>
              <button
                onClick={onClose}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors p-1 -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 flex flex-col gap-5">
              {CHANGELOG.map((entry) => (
                <div key={entry.version} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[13px] font-semibold text-[#111827]">{entry.title}</h3>
                    <span className="text-[11px] font-mono text-[#9CA3AF] shrink-0">v{entry.version}</span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {entry.items.map((item) => (
                      <li key={item} className="text-[12px] leading-relaxed text-[#6B7280] flex gap-2">
                        <span className="text-[var(--nsg-accent)] mt-px shrink-0">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
