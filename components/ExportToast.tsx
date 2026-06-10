'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { ExportToastState } from '@/hooks/useExport';

// Fixed bottom-center confirmation toast, shared by both export UIs.
export default function ExportToast({ toast }: { toast: ExportToastState | null }) {
  return (
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
  );
}
