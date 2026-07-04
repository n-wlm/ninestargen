import type { StarConfig } from "@/types/star";
import { compositionFromConfig, type GeometryComposition } from "@/types/geometry";
import type { Preset } from "@/lib/presets";

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

function normalizeBg(bg: string): string {
  const b = bg.trim().toLowerCase();
  return b === "#ffffff" || b === "#fff" || b === "white" ? "transparent" : bg;
}

export function normalizePresetComposition(comp: GeometryComposition): GeometryComposition {
  return { ...comp, bgColor: normalizeBg(comp.bgColor) };
}

/**
 * The single source of truth for turning a preset into the composition used for
 * both its preview and its applied state — multi-layer showcases pass through
 * their composition; single-config presets wrap into a one-layer composition.
 */
export function presetToComposition(preset: Preset): GeometryComposition {
  return preset.composition
    ? normalizePresetComposition(preset.composition)
    : compositionFromConfig(normalizePresetConfig(preset.config));
}
