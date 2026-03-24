"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import StarPreview from "@/components/StarPreview";
import { PRESETS } from "@/lib/presets";
import { normalizePresetConfig } from "@/lib/preset-normalization";
import type { Preset } from "@/lib/presets";

const FEATURE_PILLS = ["Styles", "Gradients", "SVG · PNG · JPG", "Free & instant"];

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
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
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
      <div className="aspect-square p-3 flex items-center justify-center bg-white rounded-lg overflow-hidden">
        <StarPreview config={previewConfig} className="w-full h-full rounded-lg" />
      </div>

      <div className="px-2.5 py-2">
        <span className="text-[12px] font-medium text-[#111827] truncate leading-tight">
          {preset.name}
        </span>
      </div>
    </motion.div>
  );
}

export default function TemplatesModal({
  isOpen,
  onClose,
  onSelectPreset,
  onStartFromScratch,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: Preset) => void;
  onStartFromScratch: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          <motion.div
            key="panel"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden pointer-events-auto border border-[#E5E7EB]"
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Template selector"
            >
              <div className="relative overflow-hidden px-5 pt-5 pb-4 sm:px-8 sm:pt-8 sm:pb-7 shrink-0 border-b border-[#F3F4F6]">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 40%, #EEF2FF 70%, #E0E7FF 100%)",
                  }}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <motion.p
                      className="text-indigo-500 text-[11px] font-semibold uppercase tracking-widest mb-1.5 sm:mb-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, duration: 0.3 }}
                    >
                      Welcome to ninestar.app
                    </motion.p>

                    <h2 className="text-[#111827] text-xl sm:text-2xl font-bold tracking-tight leading-tight sm:leading-snug mb-2 sm:mb-1 max-w-[18ch]">
                      Select a template to get started.
                    </h2>

                    <motion.p
                      className="text-[#6B7280] text-[12px] sm:text-[13px] mt-1.5 sm:mt-2 mb-2 sm:mb-4 max-w-[34ch]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45, duration: 0.4 }}
                    >
                      Customize shape, color, and gradients.
                      <span className="hidden sm:inline"> Then export as SVG, PNG, or JPG.</span>
                    </motion.p>

                    <motion.div
                      className="hidden sm:flex flex-wrap gap-2"
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

                  <motion.button
                    onClick={onClose}
                    aria-label="Close"
                    className="mt-0.5 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors shrink-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

              <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 sm:px-8 sm:py-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {PRESETS.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      onSelect={() => onSelectPreset(preset)}
                    />
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 sm:px-8 sm:py-4 border-t border-[#F3F4F6] bg-[#F9FAFB] shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <p className="text-[12px] sm:text-[11px] text-[#9CA3AF] leading-snug sm:leading-normal">
                  <span className="sm:hidden">
                    Open again from <span className="text-[#6B7280] font-medium">Templates</span>.
                  </span>
                  <span className="hidden sm:inline">
                    Reopen anytime via <span className="text-[#6B7280] font-medium">Templates</span> in the menu.
                  </span>
                </p>
                <motion.button
                  onClick={onStartFromScratch}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[13px] sm:text-[12px] font-medium text-[#374151] hover:text-[#111827] transition-colors shrink-0"
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
  );
}
