"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import LogoStar from "@/components/LogoStar";
import StarPreview from "@/components/StarPreview";
import { PRESETS } from "@/lib/presets";
import { configToParams } from "@/lib/url-params";
import { normalizePresetConfig } from "@/lib/preset-normalization";
import type { Preset } from "@/lib/presets";

const FEATURE_PILLS = [
  "Styles",
  "Gradients",
  "SVG · PNG · JPG",
  "Free & instant",
];

// ── useTilt hook ───────────────────────────────────────────────────────────────

function useTilt(maxDeg = 6) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const nx = ((e.clientX - left) / width - 0.5) * 2;
      const ny = ((e.clientY - top) / height - 0.5) * 2;
      setTilt({ x: ny * -maxDeg, y: nx * maxDeg });
    },
    [maxDeg],
  );

  const handleLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return { ref, tilt, handleMove, handleLeave };
}

// ── PresetCard ─────────────────────────────────────────────────────────────────

function PresetCard({
  preset,
  onSelect,
}: {
  preset: Preset;
  onSelect: () => void;
}) {
  const { ref, tilt, handleMove, handleLeave } = useTilt(5);
  const previewConfig = normalizePresetConfig(preset.config);

  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      role="button"
      tabIndex={0}
      aria-label={preset.name}
      style={{
        perspective: 800,
        rotateX: tilt.x,
        rotateY: tilt.y,
        transformStyle: "preserve-3d",
        cursor: "pointer",
      }}
      className="group flex flex-col rounded-xl border border-[#E5E7EB] bg-white hover:border-[#C7D2FE] transition-colors overflow-hidden shadow-sm hover:shadow-md"
    >
      {/* Star preview */}
      <div className="aspect-square p-3 flex items-center justify-center bg-white rounded-lg overflow-hidden">
        <StarPreview
          config={previewConfig}
          className="w-full h-full rounded-lg"
        />
      </div>

      {/* Name only */}
      <div className="px-2.5 py-2">
        <span className="text-[12px] font-medium text-[#111827] truncate leading-tight">
          {preset.name}
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
    if (pathname !== "/") return;
    try {
      if (!localStorage.getItem("templates_seen")) setShowTemplates(true);
    } catch {
      /* SSR guard */
    }
  }, [pathname]);

  const closeModal = useCallback(() => {
    try {
      localStorage.setItem("templates_seen", "1");
    } catch {
      /* noop */
    }
    setShowTemplates(false);
  }, []);

  const selectPreset = useCallback(
    (preset: Preset) => {
      const normalizedConfig = normalizePresetConfig(preset.config);
      if (pathname === "/") {
        window.dispatchEvent(
          new CustomEvent("nsg:apply-preset", { detail: normalizedConfig }),
        );
        const params = configToParams(normalizedConfig).toString();
        router.replace(params ? `/?${params}` : "/", { scroll: false });
      } else {
        const params = configToParams(normalizedConfig).toString();
        router.push(params ? `/?${params}` : "/");
      }
      closeModal();
    },
    [router, pathname, closeModal],
  );

  return (
    <>
      {/* ── Header ── */}
      <header className="h-11 flex items-center px-5 border-b border-[#EAECF0] bg-white shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#111827] hover:text-[#5E6AD2] transition-colors"
        >
          <LogoStar />
          <span className="text-[13px] font-semibold tracking-tight">
            ninestar.app
          </span>
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
          <span className="text-[11px] text-[#9CA3AF]">
            Free nine-pointed star creator
          </span>
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto border border-[#E5E7EB]"
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* ── Hero section ── */}
                <div className="relative overflow-hidden px-8 pt-8 pb-7 shrink-0 border-b border-[#F3F4F6]">
                  {/* Subtle light gradient background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 40%, #EEF2FF 70%, #E0E7FF 100%)",
                    }}
                  />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      {/* Eyebrow */}
                      <motion.p
                        className="text-indigo-500 text-[11px] font-semibold uppercase tracking-widest mb-2"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                      >
                        Welcome to ninestar.app
                      </motion.p>

                      {/* Main heading */}
                      <h2 className="text-[#111827] text-2xl font-bold tracking-tight leading-snug mb-1">
                        Select a template to get started.
                      </h2>

                      {/* Sub heading */}
                      <motion.p
                        className="text-[#6B7280] text-[13px] mt-2 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        Customize shape, color, and gradients — then export as
                        SVG, PNG, or JPG.
                      </motion.p>

                      {/* Feature pills */}
                      <motion.div
                        className="flex flex-wrap gap-2"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.06,
                              delayChildren: 0.5,
                            },
                          },
                        }}
                      >
                        {FEATURE_PILLS.map((pill) => (
                          <motion.span
                            key={pill}
                            variants={{
                              hidden: { opacity: 0, scale: 0.85 },
                              visible: {
                                opacity: 1,
                                scale: 1,
                                transition: { duration: 0.25, ease: "easeOut" },
                              },
                            }}
                            className="px-2.5 py-1 rounded-full border border-indigo-200 bg-white text-indigo-600 text-[11px] font-medium"
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
                      className="mt-0.5 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors shrink-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M12 4L4 12M4 4l8 8"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* ── Preset grid ── */}
                <div className="flex-1 overflow-y-auto min-h-0 px-8 py-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {PRESETS.map((preset) => (
                      <PresetCard
                        key={preset.id}
                        preset={preset}
                        onSelect={() => selectPreset(preset)}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="px-8 py-4 border-t border-[#F3F4F6] bg-[#F9FAFB] shrink-0 flex items-center justify-between gap-4">
                  <p className="text-[11px] text-[#9CA3AF]">
                    Reopen anytime via{" "}
                    <span className="text-[#6B7280] font-medium">
                      Templates
                    </span>{" "}
                    in the menu.
                  </p>
                  <motion.button
                    onClick={() => {
                      router.push("/");
                      closeModal();
                    }}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[12px] font-medium text-[#374151] hover:text-[#111827] transition-colors shrink-0"
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
