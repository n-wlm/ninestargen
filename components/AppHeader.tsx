'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import LogoStar from '@/components/LogoStar';
import StarPreview from '@/components/StarPreview';
import SplitText from '@/components/ui/SplitText';
import { PRESETS } from '@/lib/presets';
import { configToParams } from '@/lib/url-params';
import type { Preset } from '@/lib/presets';

// ── Category badge colors (still used on cards) ────────────────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  classic:    'bg-amber-50 text-amber-700 border-amber-200',
  modern:     'bg-indigo-50 text-indigo-700 border-indigo-200',
  decorative: 'bg-pink-50 text-pink-700 border-pink-200',
  geometric:  'bg-blue-50 text-blue-700 border-blue-200',
  artistic:   'bg-purple-50 text-purple-700 border-purple-200',
};

const FEATURE_PILLS = ['9 star styles', 'Gradients', 'SVG · PNG · JPG', 'Free & instant'];

// ── useTilt hook ───────────────────────────────────────────────────────────────

function useTilt(maxDeg = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const nx = ((e.clientX - left) / width - 0.5) * 2;
    const ny = ((e.clientY - top) / height - 0.5) * 2;
    setTilt({ x: ny * -maxDeg, y: nx * maxDeg });
  }, [maxDeg]);

  const handleLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return { ref, tilt, handleMove, handleLeave };
}

// ── PresetCard ─────────────────────────────────────────────────────────────────

function PresetCard({ preset, onSelect }: { preset: Preset; onSelect: () => void }) {
  const { ref, tilt, handleMove, handleLeave } = useTilt(5);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onSelect}
      style={{
        perspective: 800,
        rotateX: tilt.x,
        rotateY: tilt.y,
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
      }}
      className="group flex flex-col rounded-xl border border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-white/10 transition-colors overflow-hidden"
    >
      {/* Star preview */}
      <div className="aspect-square p-3 flex items-center justify-center bg-white/5">
        <StarPreview config={preset.config} className="w-full h-full" />
      </div>

      {/* Info */}
      <div className="px-2.5 py-2 flex flex-col gap-1">
        <span className="text-[12px] font-medium text-white/90 truncate leading-tight">{preset.name}</span>
        <span className={`self-start text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${CATEGORY_BADGE[preset.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          {preset.category}
        </span>
      </div>
    </motion.div>
  );
}

// ── AppHeader ──────────────────────────────────────────────────────────────────

export default function AppHeader() {
  const [showTemplates, setShowTemplates] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;
    try {
      if (!localStorage.getItem('templates_seen')) setShowTemplates(true);
    } catch { /* SSR guard */ }
  }, [pathname]);

  const closeModal = useCallback(() => {
    try { localStorage.setItem('templates_seen', '1'); } catch { /* noop */ }
    setShowTemplates(false);
  }, []);

  const selectPreset = useCallback((preset: Preset) => {
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('nsg:apply-preset', { detail: preset.config }));
      const params = configToParams(preset.config).toString();
      router.replace(params ? `/?${params}` : '/', { scroll: false });
    } else {
      const params = configToParams(preset.config).toString();
      router.push(params ? `/?${params}` : '/');
    }
    closeModal();
  }, [router, pathname, closeModal]);

  return (
    <>
      {/* ── Header ── */}
      <header className="h-11 flex items-center px-5 border-b border-[#EAECF0] bg-white shrink-0">
        <Link href="/" className="flex items-center gap-2 text-[#111827] hover:text-[#5E6AD2] transition-colors">
          <LogoStar />
          <span className="text-[13px] font-semibold tracking-tight">ninestar.app</span>
        </Link>

        <nav className="flex items-center ml-5">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6] cursor-pointer"
          >
            Templates
          </button>
          <Link
            href="/about"
            className="px-2.5 py-1 text-[12px] text-[#6B7280] hover:text-[#111827] transition-colors font-medium rounded-md hover:bg-[#F3F4F6]"
          >
            About
          </Link>
        </nav>

        <div className="ml-auto hidden sm:block">
          <span className="text-[11px] text-[#9CA3AF]">Free nine-pointed star creator</span>
        </div>
      </header>

      {/* ── Templates modal ── */}
      <AnimatePresence>
        {showTemplates && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeModal}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <motion.div
                className="bg-[#0F1117] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto border border-white/10"
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >

                {/* ── Hero section ── */}
                <div className="relative overflow-hidden px-8 pt-8 pb-7 shrink-0">
                  {/* Animated mesh gradient background */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'linear-gradient(135deg, #4F46E5 0%, #1e1b4b 35%, #0f172a 60%, #312e81 100%)',
                      backgroundSize: '300% 300%',
                      animation: 'mesh-shift 8s ease infinite',
                    }}
                  />
                  {/* Noise overlay for texture */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      {/* Eyebrow */}
                      <motion.p
                        className="text-indigo-400 text-[11px] font-semibold uppercase tracking-widest mb-2"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                      >
                        Welcome to ninestar.app
                      </motion.p>

                      {/* Main heading */}
                      <h2 className="text-white text-2xl font-bold tracking-tight leading-snug mb-1">
                        <SplitText text="Create stunning nine-pointed stars." delay={0.12} />
                      </h2>

                      {/* Sub heading */}
                      <motion.p
                        className="text-white/50 text-[13px] mt-2 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        Customize shape, color, and gradients — then export as SVG, PNG, or JPG.
                      </motion.p>

                      {/* Feature pills */}
                      <motion.div
                        className="flex flex-wrap gap-2"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } },
                        }}
                      >
                        {FEATURE_PILLS.map((pill) => (
                          <motion.span
                            key={pill}
                            variants={{
                              hidden: { opacity: 0, scale: 0.85 },
                              visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
                            }}
                            className="px-2.5 py-1 rounded-full border border-white/15 bg-white/8 text-white/70 text-[11px] font-medium backdrop-blur-sm"
                          >
                            {pill}
                          </motion.span>
                        ))}
                      </motion.div>
                    </div>

                    {/* Close button */}
                    <motion.button
                      onClick={closeModal}
                      aria-label="Close"
                      className="mt-0.5 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors shrink-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* ── Preset grid ── */}
                <div className="flex-1 overflow-y-auto min-h-0 px-8 py-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {PRESETS.map((preset, i) => (
                      <motion.div
                        key={preset.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025, duration: 0.22 }}
                      >
                        <PresetCard preset={preset} onSelect={() => selectPreset(preset)} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-8 py-4 border-t border-white/10 bg-white/3 shrink-0 flex items-center justify-between gap-4">
                  <p className="text-[11px] text-white/30">
                    Reopen anytime via <span className="text-white/50 font-medium">Templates</span> in the menu.
                  </p>
                  <motion.button
                    onClick={() => { router.push('/'); closeModal(); }}
                    className="px-4 py-2 rounded-lg border border-white/15 bg-white/8 hover:bg-white/12 text-[12px] font-medium text-white/70 hover:text-white transition-colors shrink-0"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Start from scratch →
                  </motion.button>
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
