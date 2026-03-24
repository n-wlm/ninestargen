import type { StarConfig } from "@/types/star";

/**
 * Keep template previews and loaded template state in sync.
 * Any visual normalization used in previews must also be applied when loading.
 */
export function normalizePresetConfig(config: StarConfig): StarConfig {
  const bg = config.bgColor.trim().toLowerCase();
  if (bg === "#ffffff" || bg === "#fff" || bg === "white") {
    return { ...config, bgColor: "transparent" };
  }
  return config;
}
