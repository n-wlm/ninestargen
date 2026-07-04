'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

// The About content as a modal — opens over the app like the other dialogs, with
// the signature gradient laid over a semi-transparent, blurred backdrop (so the
// app shows through) instead of being its own route.
const GRADIENT_BACKDROP =
  'radial-gradient(120% 120% at 0% 0%, rgba(224,231,255,0.92) 0%, transparent 46%),' +
  'radial-gradient(120% 120% at 100% 100%, rgba(253,230,138,0.82) 0%, transparent 42%),' +
  'linear-gradient(135deg, rgba(248,250,252,0.82) 0%, rgba(238,242,255,0.78) 50%, rgba(248,250,252,0.82) 100%)';

export default function AboutDialog({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Semi-transparent, blurred backdrop with the gradient laid over it */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: GRADIENT_BACKDROP }}
            onClick={onClose}
          />

          <motion.article
            className="relative w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white/95 backdrop-blur-sm shadow-[0_30px_80px_rgba(15,23,42,0.18)] p-6 sm:p-8 max-h-[88vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="About ninestar.app"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#374151] transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Hey there!</h1>

            <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-4">
              I created this little tool with a simple goal in mind: to help you generate
              nine-pointed stars for your projects, your communities, or wherever your creativity
              takes you. Whether you&rsquo;re here for a specific design or just exploring shapes, I
              hope you find this generator useful.
            </p>
            <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-4">
              This project is a work in progress, and I&rsquo;m always looking to learn and improve.
              If you have any feedback, suggestions, or just want to share what you&rsquo;ve created,
              please feel free to reach out to me at{' '}
              <a
                href="mailto:naim@woellmer.io"
                className="text-[var(--nsg-accent)] hover:text-[var(--nsg-accent-strong)] transition-colors"
              >
                naim@woellmer.io
              </a>
            </p>
            <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">With love,</p>
            <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-8">Naim</p>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-strong)] text-white text-sm font-medium transition-colors shadow-sm"
            >
              Start creating →
            </button>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
