---
id: changelog
title: Changelog
order: 90
status: current
last_updated: 2026-06-10
owner: @naim
linked_paths: 
summary: A running log of documentation updates, newest first.
---

Append one entry per documentation update, newest first. Each records the date,
the sections touched, and a one-line summary.

## 2026-07-04

- Mid-width header overflow (branch `chore/perf-audit`): in the 640–700px band
  the `sm` breakpoint turned on the wordmark, mode-switch and History/Share
  labels all at once, pushing the Download button past the edge; and just below
  that the middle sat empty. Staggered the label breakpoints instead — Download
  ≥360, ModeSwitch ≥480 (fills the middle gap), History/Share ≥720, wordmark
  ≥`lg`. Swept 360–1280px: no header overflow at any width. Updated ui-design.
- Tablet header wrap (branch `chore/perf-audit`): at ~768–1023px the inline nav
  (Templates/About/What's new) appeared and pushed "Share Design" onto a second
  line. Moved the nav's inline↔`⋯` breakpoint from `md` to **`lg`** (tablet now
  uses the overflow menu) and made the action labels `whitespace-nowrap`.
  Verified one-line actions with no overflow at 800/1024/1280px. Updated
  ui-design (responsive).
- Mobile polish trio (branch `chore/perf-audit`): (1) on mobile in images mode
  with no image, the Controls/Layers toggle now **locks to Layers** (Controls
  segment `disabled`, `effectiveMobileTab` derives to `layers`) so you can't land
  on the inert controls before adding an image — `SegmentedControl` gained
  optional per-option `disabled`. (2) The collapsed geometry mode icon changed
  from `Shapes` to **`Spline`** (a flowing curve, subtler). (3) Fixed a faint
  light seam at the rounded corners of `TemplatesModal` — a hairline `border` on
  a rounded `overflow-hidden` card with a colour-filled header leaks the white
  card bg at the corners; swapped to a `ring-1` outline (box-shadow follows the
  radius cleanly). Verified by zooming the corner 6× (before/after) and the
  mobile toggle state. Updated ui-design.
- Narrow-phone top bar (branch `chore/perf-audit`): on small screens the header
  was cramped and the Download button got pushed past the edge. The `ModeSwitch`
  now collapses to icons below `sm` (`Shapes` / `Images`, ~40px tap targets,
  `aria-label`), mobile bar gaps/padding tightened, and below ~360px the Download
  label drops to icon + caret so the accent button stays fully visible. Verified
  by measuring header overflow at 320/360px (fits, no clip) and that desktop
  keeps the text labels. Updated ui-design (responsive).
- App versioning + "What's new" rework (branch `chore/perf-audit`): adopted a
  `MAJOR.FEATURE.PATCH` scheme, reconstructed the release history from git
  (geometry launch = **1.0.0**, Images mode = **1.1.0**, this layers/layout/perf
  release = **1.2.0**) and rewrote `CHANGELOG` accordingly; `APP_VERSION`
  1.1.0 → 1.2.0 (so returning visitors see the dot). `WhatsNewDialog` now shows
  only the current release, with a subtle "Show full changelog" toggle revealing
  the earlier entries. Scheme documented in ui-design; versions go in commit
  subjects going forward.
- Three additions (branch `chore/perf-audit`): (1) deleting geometry layers back
  down to one now resets the lone layer's `offsetX/offsetY/opacity` (the stacking
  sliders are hidden at one layer, so a shifted/faded star had no fix);
  (2) `LogoStar` flips in 3-D on mode switch — indigo enneagram for geometry, teal
  spike star for images (replaced the never-seen 30-min rotation; removed the dead
  `lib/logo-configs.ts`); (3) About is now an `AboutDialog` modal (gradient over a
  blurred backdrop) opened from the header instead of navigating to the page.
  Updated ui-design.
- Performance audit + optimization (branch `chore/perf-audit`). Root cause:
  `GeneratorClient` holds all state, so a slider tick re-rendered the whole tree
  and fresh prop objects defeated existing `memo()`s. Fixes: stabilized the hook
  callbacks (refs + functional updaters), memoized `exportProps`/`layerProps` and
  the whole chrome (`ModeSwitch`, `HeaderNav`, `LogoStar`, `ActionsCluster`,
  `ControlPanel`, `ImageControlPanel`, `LayersPanel`), extracted memoized
  `LayerThumb`/`LayerRowItem` (CSS hover instead of JS state), static corner-preview
  configs, `memo(SliderInput)` fed by module-level formatters + stable per-key
  handlers, and narrowed `StarLayerGroup`'s path `useMemo` to geometric fields.
  Measured on a 5-layer outer-radius drag (60 ticks): dev region render time
  header −92 %, sidebar −65 %, layers panel −83 %, wall 446 ms → 128 ms (−71 %);
  prod ~0.35 ms/tick (very smooth). A temporary `Profiler` harness was used to
  measure and then removed. Updated architecture (render-cost section).

## 2026-07-04

- Fixes (on `main`): the colour picker's custom-colour trigger is now a clean
  **pipette button** — the old approach overlaid an `opacity-0`
  `<input type=color>` whose native swatch leaked through as a dark box in some
  browsers; it's now a real 0×0 input opened via `.click()`. Gave the Outer
  Container **Fill** its own label (matching Stroke) in both control panels, and
  unified the toggle wording to "None" (was "No fill").
- Images empty state, follow-up (on `main`): the canvas onboarding card lost its
  now-redundant "Add image" button (the Layers panel is the single add point) —
  it ends with a muted "Add your first image in the Layers panel." line instead;
  reworded the left hint to "…to edit the controls."
- Images empty-state emphasis (on `main`): toned the left "add an image" hint
  down to a quiet muted line (was a prominent accent box); `LayerList` now shows
  a **prominent dashed "Add image" button** while the stack is empty, so the
  Layers panel is the clear add point.
- Images add-flow consistency (branch `feature/layout-redesign`): images are now
  added **only** via the Layers panel (shown from the start in images mode with a
  "+ Add image" row) — the left control column's upload button is gone. Before
  the first image the Arrangement/Transform controls show greyed-out behind an
  "Add an image in the Layers panel" hint. The hidden file input + `nsg:add-image`
  listener stay in `ImageControlPanel`. Updated ui-design.
- Small tweaks (branch `feature/layout-redesign`): dropped the `n/15` count from
  the Layers panel header (the max-reached hint already covers the limit); moved
  **None** to the far left of the Fill type control, consistent with Background /
  Outer Container.
- Redesign polish (branch `feature/layout-redesign`): `MAX_GEOMETRY_LAYERS`
  5 → 15 (matches images) — the URL parser now splits **two-digit** layer indices
  (`^(\d+)([a-z].*)$`) and the floating layers panel scrolls past a few. Shared
  `TopBar` shell so `/about` + `/gallery` match the home bar (with an "Open
  editor" CTA). Desktop bar is taller and the Download button more prominent; its
  menu lists PNG/SVG/JPG as clear bordered buttons. "Share" → "Share Design" with
  a toast confirmation on copy. (Performance with many layers is the next step.)
- Template curation finalized + multi-layer presets (branch
  `feature/layout-redesign`): dropped Modern Minimal, Crystalline, Diamond Grid,
  Sunset Gradient, Neon Glow; added the owner's picks (Porcelain, Sage Circle,
  Copper Thread, Honey Petal) and a **multi-layer showcase** *Emerald Weave*.
  `Preset` gained an optional `composition`; `presetToComposition()` now resolves
  every preset (single or multi-layer) for both preview and apply, so cards match
  results. Removed the temporary `/dev-candidates` gallery + `preset-candidates`.
  Updated data-model (Presets) + ui-design (chrome-placement principles).
- Layout redesign R2/R3 — floating layers panel + mobile (branch
  `feature/layout-redesign`): the layer stack moved out of the controls into a
  floating, collapsible `LayersPanel` over the canvas (desktop) and a
  Controls/Layers sidebar toggle (mobile) — the **same** shared `LayerList` and
  `layerProps` drive both, for geometry **and** images. `useComposition` gained
  selected-layer + `duplicateLayer`; `ImageControlPanel` was rebuilt on the
  selected-layer pattern (Arrangement/Transform sections + Canvas group, no more
  expandable cards); `ControlPanel` dropped its inline layer list. Header nav
  collapses to a `⋯` menu on mobile. `LayerList` gained `minLayers` (images may
  reach 0). Updated ui-design.
- Layout redesign R1 — unified header (branch `feature/layout-redesign`): the
  mode switch moves into a full-width top bar the generator renders on home
  (colored `ModeSwitch` driving the theme), and History · Share · Download are
  bundled into one header `ActionsCluster`. The canvas is cleared of overlays;
  the sidebar loses its mode switch and export panel. Shared header pieces
  extracted (`Wordmark`, `HeaderNav`); `SiteHeader` hides the standalone
  `AppHeader` on `/`. Deleted the now-dead `ExportPanel`, `MobileExportFab`,
  `ShareButton`. Updated architecture.
- Color picker swatches expanded from 20 to 30 (branch `feature/layout-redesign`):
  a 5-wide grid of neutrals, warm, green, cool, purple/pink plus a full row of
  soft pastels; each hue row leads with a lighter tint. `SWATCH_COLORS` in
  `lib/color-palettes.ts`. First slice of the layout-redesign work (see below).

## 2026-07-03

- Geometry layers — cycle 4c (branch `feature/geometry-layers`): the layer UI.
  New shared `components/controls/LayerList.tsx` (compact selected-layer list —
  thumbnail, visibility, reorder, duplicate, delete on hover) and a `GroupLabel`
  primitive. `ControlPanel` now edits the **selected** layer; with one layer the
  list is hidden (just a "+ Layer" ghost button), per-layer Opacity/Offset show
  only at >1 layer, and Background + Outer Container sit under a "Canvas" group.
  Verified via gates + SSR structural render (single vs multi-layer); a live
  click-through is pending (the preview tab was backgrounded). Updated ui-design.
- Geometry layers — cycle 4b (branch `feature/geometry-layers`): multi-layer URL
  scheme in `lib/url-params.ts` (`compositionToParams`/`paramsToComposition`) —
  canvas + layer-0 keys stay bare (old links parse unchanged), layers 1+ are
  index-prefixed, `n=<count>` marks multi-layer; `useUrlSync` now syncs the whole
  composition. Round-trip verified deterministically incl. legacy links and a
  5-layer worst case (~1.2k chars). Updated data-model.
- Geometry layers — cycle 4a (branch `feature/geometry-layers`): geometry state
  is now a `GeometryComposition` of stacked `GeometryLayer`s (new
  `types/geometry.ts`, `hooks/useStarComposition.ts`). `StarPreview` renders any
  number of layers with per-layer gradient/filter ids (extracted
  `StarLayerGroup`) and a `config` convenience prop for thumbnails; history
  normalizes both the legacy flat `StarConfig` and the new composition shape.
  UI still single-layer (URL scheme + layer list follow in 4b/4c). Removed the
  now-unused `useStarConfig`. Updated data-model + architecture.
- "What's new" indicator (branch `feature/whats-new`): `lib/changelog.ts` with
  `APP_VERSION` + typed `CHANGELOG` entries, header item with accent dot for
  returning visitors (`nsg:version-seen`), `WhatsNewDialog`; true first visits
  are marked seen silently so only the templates modal greets them. Updated
  UI-design + data-model (localStorage key table).
- Color picker v2 (branch `feature/color-picker-v2`): every color swatch in both
  modes now opens a popover with a curated 20-color preset grid, a persistent
  Recent row (`nsg:recent-colors`), and the native picker + hex field. New
  `components/ui/popover.tsx` (wraps the already-installed `@base-ui/react`
  Popover — no new dependency), new `lib/recent-colors.ts`, `SWATCH_COLORS` in
  `lib/color-palettes.ts`. `ColorControl`'s public API unchanged; all usage
  sites inherit the upgrade. Updated the UI-design section.

## 2026-06-10

- System-wide performance & consistency pass (branch `chore/system-check`):
  previews memoized (`memo()` + `useMemo` for geometry/placements); export
  logic unified into `useExport` + `ExportToast` (shared by `ExportPanel` and
  `MobileExportFab`); new `PreviewErrorBoundary`; `addHistory` returns
  `{ entries, trimmed }` with a storage warning in `SaveDesignModal` and a
  cheap `configSignature()` dedup; dead code removed (`updateMany`,
  `buildStellated`, `buildExplosion`); all hardcoded `indigo-*` accents
  replaced with `var(--nsg-accent…)`; ESLint now ignores `docs/**` (lint gate
  is clean at 0 findings). Updated architecture + data-model sections.
- Made history **durable across app updates**: stored as a versioned envelope and
  normalized on load (configs merged over current defaults; bad entries dropped
  individually) so future schema changes don't wipe or break saved designs. Added
  `normalizeLayer` (composition) + `normalizeEntry`/`SCHEMA_VERSION` (history) and
  ADR-006; documented in the data-model section.
- Mobile responsiveness fixes: `ImageEmptyState` is now compact on small screens
  (fits the 40svh canvas, no overlap) and the confirm popover is clamped to the
  viewport so reset/clear no longer runs off-screen.
- `SaveDesignModal` now leads with a green "{FORMAT} downloaded" confirmation
  ("nothing more to do here") so the download reads as already done; the
  link/history is reframed as an optional step. Threads the export `format`
  through `GeneratorClient`.
- `ConfirmButton` reset/clear popover now **centers under the trigger**, portaled
  to `<body>` to avoid sidebar `overflow` clipping (replaced the `edgeOffset` prop
  with `align`). Added `lib/clipboard.ts` (`copyText`) with an `execCommand`
  fallback for sandboxed contexts; wired into Share / save-link / export copy.
  Updated UI design section.
- Added per-layer **Offset X / Offset Y** (images): nudge each copy off-centre
  in its sector while keeping symmetry; renamed the angular "Offset" control to
  "Angle". Updated data-model, workflows, and UI design.
- `ConfirmButton` gained `edgeOffset`; header reset/clear confirms now align to
  the panel's right edge.
- Initialised KeystoneDoc and documented the current app: overview, requirements,
  architecture, data model, workflows, ADRs, and UI design.
- Captured the **Images mode** (image upload → 9/3-fold mandala, layer system),
  the shared SVG **export pipeline**, **local history** with restore, geometry
  **URL sharing**, and the per-mode **accent theming** (indigo/teal).
- Recorded ADR-001…005 for the foundational decisions (SVG + data URLs, no
  backend, history strategy, CSS-variable theming, fixed symmetry counts).
