---
id: adrs
title: Architecture decisions
order: 50
status: current
last_updated: 2026-07-04
owner: @naim
linked_paths: lib/export.ts, lib/image-upload.ts, lib/history.ts, app/globals.css, app/GeneratorClient.tsx
summary: The significant decisions behind the app and why they were made.
---

Newest first.

## ADR-008: Unified top bar + floating layers panel (layout redesign)

**Status:** accepted

> [!DECISION] On the home route the generator owns a full-width top bar (mode switch + document actions); the standalone `AppHeader` is suppressed there. Layers are a standalone floating panel (desktop) / sidebar toggle (mobile), the same in both modes.

**Context** — the original chrome spread controls across the sidebar (mode
switch, export panel) and canvas overlays (History, Share), and buried the layer
list inside the property controls. The owner wanted the mode switch and the
History/Share/Download actions consolidated into the (mostly empty) header, the
canvas cleared, and layers surfaced as their own prominent, discoverable window —
consistently across geometry and images.

**Decision** — the mode lives in `GeneratorClient`, so the generator renders its
own top bar on `/` (Wordmark + colored `ModeSwitch` + `HeaderNav` +
`ActionsCluster`), and [SiteHeader](components/SiteHeader.tsx) hides the standalone
`AppHeader` on `/` (other routes keep it, reusing the shared `Wordmark`/`HeaderNav`).
Rather than lift mode into a cross-route context/store, the home page owning its
bar keeps state local and adds no dependency. Layers render through one shared
`LayerList` fed by a per-mode `layerProps` — in a floating `LayersPanel` on
desktop and a Controls/Layers sidebar toggle on mobile.

**Consequences** — the canvas is chrome-free and both modes share one layer
surface; the trade-off is the home bar is client-rendered (a brief no-header
paint before hydration) and the header/AppHeader split must stay in sync via the
shared pieces. The old `ExportPanel`/`MobileExportFab`/`ShareButton` were removed.

## ADR-007: Geometry becomes a layer composition (mirroring images)

**Status:** accepted

> [!DECISION] Geometry mode edits a `GeometryComposition` of stacked star layers, mirroring the proven images layer model; `StarConfig` stays as the legacy single-star vocabulary behind a `compositionFromConfig` seam.

**Context** — users want to stack several generated stars (scale/rotate/offset
each) to invent compound shapes. The images mode already has a solid layer model
(`useComposition`, per-layer cards). Geometry state was a single flat
`StarConfig` woven into URLs, presets, and history.

**Decision** — introduce `GeometryLayer` (the per-star subset of `StarConfig` +
`opacity`/`offsetX`/`offsetY`) and `GeometryComposition` (`layers[]` + canvas
fields), capped at `MAX_GEOMETRY_LAYERS = 5`. Keep `StarConfig` untouched as the
vocabulary that presets, old URLs, and old history speak; **all three load
through `compositionFromConfig()`** as a one-layer composition. No `scale` field —
`outerRadius` already is a generated star's size. Each rendered layer gets unique
gradient/filter ids so stacks don't cross-bleed. The URL keeps layer-0 keys bare
(byte-identical to old links) and prefixes layers 1+.

**Consequences** — every existing shared link and saved design keeps working; the
control panel and single-config paths can migrate incrementally (they still read
a flat `StarConfig` derived from the selected layer via `configFromLayer`). Cost:
two parallel layer models (geometry + images) until a later unification, and a
5-layer ceiling to keep the URL and sidebar bounded.

## ADR-006: History survives app updates (versioned + normalized on load)

**Status:** accepted

> [!DECISION] Persisted history is versioned and every entry is normalized against current defaults on load, so future schema changes don't wipe or break saved designs.

**Context** — the download history lives in `localStorage`. As the app evolves,
config shapes gain fields (e.g. the layer `offsetX/offsetY` added later). Without
care, old snapshots would restore with missing fields (broken render) or a format
change could discard everyone's history.

**Decision** — store a `{ version, entries }` envelope (also reading the legacy
bare array), and run every entry through `normalizeEntry()` / `normalizeLayer()`
on load: configs are merged over `DEFAULT_CONFIG` / `DEFAULT_COMPOSITION` so new
fields are filled, and any individually-malformed entry is dropped (never the
whole list). See the **Data model** section (Persistence & compatibility).

**Consequences** — additive changes are free (no migration, no data loss); only
breaking field changes need a `SCHEMA_VERSION` bump + explicit migration. Cost:
a small normalization pass on load and the discipline to keep defaults complete.

## ADR-005: Per-layer fixed symmetry counts of 9 or 3

**Status:** accepted

> [!DECISION] Image layers may repeat 9 or 3 times only (divisors of 9), defaulting to 9.

**Context** — the app's identity is the nine-pointed star; arbitrary counts
dilute that, but a little flexibility is nice.

**Decision** — restrict `count` to `9 | 3`; mirroring (kaleidoscope) is a
separate per-layer toggle layered on top of rotation.

**Consequences** — keeps output on-brand and the math trivial; users wanting
other symmetries are intentionally not served.

## ADR-004: Per-mode accent via CSS variables

**Status:** accepted

> [!DECISION] Theme the two modes with CSS variables (`--nsg-accent…`) overridden by subtree, not by editing every component.

**Context** — the owner wanted the Images tab to feel distinct (teal vs the
geometry indigo) without forking shared components.

**Decision** — define the accent palette as CSS vars; shared/images components
use `var(--nsg-accent…)`; `GeneratorClient` overrides them to teal on its root
in images mode. Geometry-only `ControlPanel` keeps literal indigo.

**Consequences** — one-line hue changes; consistent theming for free. Geometry
must keep using the default indigo values (it inherits them).

## ADR-003: Local history in localStorage; geometry also shareable by URL

**Status:** accepted

> [!DECISION] Persist a download history in localStorage; share geometry designs via URL, image designs only locally.

**Context** — users want to return to designs. Geometry state is small and fits
a URL; image data URLs do not.

**Decision** — snapshot every download to `localStorage` (cap 12, quota-safe).
Geometry entries also carry a shareable `link`. Image entries store the full
composition (data URLs) so they restore in-browser.

**Consequences** — image designs are **not** shareable across devices and are
lost if browser data is cleared (surfaced to the user in the UI). A future
account/backend could lift this.

## ADR-002: Uploads are base64 data URLs, not blob URLs

**Status:** accepted

> [!DECISION] Store uploaded images as FileReader data URLs.

**Context** — raster export draws the SVG onto a canvas. Cross-origin/blob
image sources taint the canvas and break `toBlob`.

**Decision** — convert uploads to inline base64 data URLs.

**Consequences** — canvas export always works and the exported SVG is
self-contained; the trade-off is larger in-memory/stored payloads (drives the
history size cap).

## ADR-001: SVG rendering on a fixed 600×600 viewBox; no backend

**Status:** accepted

> [!DECISION] Render everything as SVG on a fixed 600×600 viewBox; ship a client-only app.

**Context** — designs must export crisply as vector and raster, and the tool
should be free and trivially hostable.

**Decision** — one SVG render target behind a shared `svgRef`; all state in the
browser.

**Consequences** — a single export pipeline serves both modes; geometry/image
sizes are reasoned in 600-unit space. Radii beyond ~290 bleed off the canvas (a
deliberate creative effect, preserved in export).
