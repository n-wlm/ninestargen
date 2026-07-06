---
id: ui-design
title: UI design
order: 60
status: current
last_updated: 2026-07-06
owner: @naim
linked_paths: components/controls/, components/generator/, components/header/, components/ui/popover.tsx, app/globals.css, components/SaveDesignModal.tsx, components/HistoryPanel.tsx, components/RestoreConfirmModal.tsx, components/ImageEmptyState.tsx, components/WhatsNewDialog.tsx, lib/clipboard.ts, lib/color-palettes.ts, lib/recent-colors.ts
summary: Design language, the accent-variable system, control conventions, and accessibility notes.
---

## Design principles

- Calm, focused, Linear-style UI: a single accent, lots of neutral grays,
  compact controls, a live square preview.
- Explain features in place (empty states, hints) instead of crowding the UI.
- Destructive actions ask for confirmation; risky-but-valid values are allowed
  but signposted.

**Chrome placement (post-redesign) — keep new features in their lane:**

- **Header = app + document-level actions**: identity, mode switch, Templates /
  About / What's new, and the History · Share · Download cluster.
- **Sidebar = properties**: the controls for the selected layer, plus the
  canvas-level group. No mode switch, no export panel.
- **Layers = their own surface**: a floating panel (desktop) / Controls-Layers
  toggle (mobile), the same in both modes — never buried in the property list.
- **Canvas = the artwork only**: no overlays.

When adding chrome, place it by which lane it belongs to; if the header cluster
or a corner fills up, consolidate (e.g. the mobile `⋯` menu) before adding a new
region.

## Accent system (design tokens)

The accent is a set of CSS variables in [globals.css](app/globals.css),
overridden per mode (see ADR-004). Use the variables, never the raw hex, for new
accent chrome.

| Token | Geometry (indigo) | Images (teal) | Use |
| --- | --- | --- | --- |
| `--nsg-accent` | `#5E6AD2` | `#0D9488` | primary fills, active text, slider |
| `--nsg-accent-strong` | `#4F5BBF` | `#0F766E` | hover/darker |
| `--nsg-accent-soft` | `#EEF2FF` | `#F0FDFA` | tinted backgrounds |
| `--nsg-accent-ring` | `#C7D2FE` | `#99F6E4` | rings/borders |
| `--nsg-accent-border` | `#A5B4FC` | `#5EEAD4` | dashed/secondary borders |

Neutral grays: text `#374151`/`#6B7280`, muted `#9CA3AF`, lines `#F3F4F6`/`#EAECF0`.
Danger `#EF4444`. Fonts: Inter (UI), JetBrains Mono (numeric/hex fields).

## Key components & conventions

- **Controls** ([controls/](components/controls/)): `SliderInput` (slider +
  typed numeric field; supports `parse` for percent fields, `snap` targets, a
  `disabledHint` shown when a control doesn't apply to the current shape, and an
  optional amber "Set to default" pill). `ColorControl` pairs an editable hex
  field (accepting `#abc`/`aabbcc`) with a swatch that opens a **color popover**
  ([ui/popover.tsx](components/ui/popover.tsx), a Base UI Popover in house
  style): a curated 30-color grid (`SWATCH_COLORS` in
  [lib/color-palettes.ts](lib/color-palettes.ts) — 5-wide: neutrals, warm, green,
  cool, purple/pink, plus a full soft-pastel row; each hue row leads with a
  lighter tint), a Recent row
  ([lib/recent-colors.ts](lib/recent-colors.ts), localStorage
  `nsg:recent-colors`, max 8, deduped, only pushed when a color actually changed
  between popover open and close), and a **pipette button** that opens the system
  colour picker (a real 0×0 `<input type=color>` triggered via `.click()` — an
  overlaid `opacity-0` input leaked its native swatch through in some browsers)
  plus the hex field. Gradient stops in `GradientBuilder` use the same popover; the
  at-rest layout is unchanged, so the picker stays invisible until clicked.
  Shared `primitives`: `Section`, `GroupLabel` (a heavier divider that
  introduces a group of sections — used for the geometry **Canvas** group),
  `SegmentedControl`, `Toggle`, and `ConfirmButton` (inline confirm popover;
  `destructive` = red confirm; `placement` top/bottom; `align` right or center —
  the centered variant is **portaled to `<body>`** with fixed positioning so it
  isn't clipped by the sidebar's `overflow`; the in-flow right variant is used
  inside modals).
- **Layers — selected-layer pattern, both modes** (R2/R3). The layer stack is a
  shared `LayerList` ([controls/LayerList.tsx](components/controls/LayerList.tsx))
  — a compact list shown front→back; clicking a row selects it and **all the
  property sections edit that selected layer**. The action cluster (visibility,
  reorder ▲▼, duplicate, delete) appears on hover/selection, keeping the list
  calm; delete is disabled below `minLayers` (geometry needs ≥1, images may reach
  0). On **desktop** the list lives in a floating, collapsible
  `LayersPanel` ([controls/LayersPanel.tsx](components/controls/LayersPanel.tsx))
  over the top-left of the canvas — prominent and separated from the property
  controls (the owner's ask). On **mobile** the sidebar shows a **Controls /
  Layers** segmented toggle instead. `GeneratorClient` builds one `layerProps`
  set per mode and feeds both surfaces. Geometry thumbnails render a mini
  `StarPreview`; image thumbnails an `<img>`.
- **ControlPanel (geometry)**: the selected star's Type / Shape / Stroke / Fill /
  Effects; per-layer **Layer Opacity / Offset X / Offset Y** appear in Shape only
  when >1 layer. `MAX_GEOMETRY_LAYERS = 15` (the floating panel scrolls past a
  few). Background + Outer Container sit under
  a **Canvas** `GroupLabel` (composition-level), separated by a divider not tabs.
- **ImageControlPanel**: the selected image layer's **Arrangement** (count 9/3,
  Mirror, Angle) and **Transform** (Size, Radius, Spin, Offset X/Y, Opacity)
  sections, then the **Canvas** group. **Images are added only in the Layers
  panel** (the "+ Add image" row / canvas empty-state, both firing
  `nsg:add-image` → the hidden file input this panel still owns) — the control
  column has no upload button. Before the first image the layer controls show
  **greyed-out** under a quiet muted hint (not an accent banner), so they're
  discoverable but clearly inert. The floating Layers panel is shown from the
  start in images mode, and while it's empty it shows a **prominent dashed
  "Add image" button** (`LayerList` renders this whenever the stack is empty) so
  the add point is unmistakable.
- **Top bar**: a shared [TopBar](components/header/TopBar.tsx) shell (one height
  — taller on desktop — border, padding) used by **both** the home generator bar
  and the standalone `AppHeader` on other routes, so `/about` and `/gallery` read
  as the same system (their right side is an accent "Open editor" CTA instead of
  the mode switch + actions). The home bar holds logo + colored `ModeSwitch`
  (accent-filled active pill, drives indigo/teal) + app nav (Templates, About,
  What's new) + an `ActionsCluster` bundling Projects · **Share Design** ·
  Download. It replaces the old sidebar mode switch, sidebar export panel, mobile
  export FAB, and canvas overlays.
- **ActionsCluster**: **Projects** (folder icon, with a count badge of saved
  designs) opens the panel to reopen a recent download or restore from a file;
  **Share Design** copies the full design link and fires a toast ("Design link
  copied to clipboard"); the **Download** button is the prominent accent primary,
  and its menu lists PNG/SVG/JPG as clear bordered buttons (each with a download
  icon) so it's obvious a click downloads.
- **First-visit Projects nudge**: on a fresh visit (no URL params → not a shared
  link), a small accent popover with an up-arrow appears under the Projects button
  after ~1.2s — "Continue where you left off. Reopen a recent design, or restore
  one from a file you downloaded." Shown once (localStorage `nsg:projects-hint-seen`),
  auto-hides after ~8s, and dismisses on click or opening the panel.
- **Canvas**: square preview via container-query units
  (`w-[min(100cqw,100cqh)] aspect-square`), now **free of overlays** (actions
  live in the header); `ImageEmptyState` explains the mode when no image is
  loaded (compact on mobile — smaller glyph/text and a shorter blurb — with
  `max-h-full overflow-y-auto` so it fits the short 40svh mobile canvas).
- **Responsive**: desktop is a side-by-side sidebar + canvas (≥`lg`); below that
  it stacks (canvas on top, controls below). The header nav (Templates / About /
  What's new) collapses into a `⋯` overflow menu **below `lg`** — so tablet
  widths use it too, otherwise the inline links push Projects · Share · Download
  into a second line (the action labels are also `whitespace-nowrap`). The
  wordmark drops to just the logo, and the sidebar gains the Controls/Layers
  toggle (the desktop floating layers panel is hidden).
  To keep the top bar from squeezing the Download action out on narrow phones,
  the text labels turn on in **staggered steps** (rather than all at `sm`, which
  caused the Download button to overflow in the 640–700px band): Download label
  ≥ ~360px, **`ModeSwitch` labels ≥ 480px** (`Spline` — a flowing curve — for
  geometry, `Images` for images, ~40px tap target + `aria-label` below that),
  **Projects / Share labels ≥ 720px**, and the **wordmark text ≥ `lg`**. Keeping
  the mode labels down to 480px also fills the mid-width middle gap. Below ~360px
  the Download label itself drops to the icon + caret; mobile bar gaps/padding
  are a touch tighter. Verified no header overflow across 360–1280px.
- **Mobile Controls/Layers toggle**: in images mode with no image yet, the
  property controls are inert, so the toggle **locks to Layers** (the only place
  to add an image) — the Controls segment is `disabled` in `SegmentedControl`
  and an `effectiveMobileTab` derives to `layers` until the first layer exists.
  Desktop is unaffected (it always shows the controls next to the floating panel).
  The centered confirm popover is clamped to the viewport so it never runs
  off-screen on narrow widths.
- **Modals**: `SaveDesignModal` (post-download) and the **Projects** panel
  (`HistoryPanel` — titled "Projects": a "Restore from a file" dropzone +
  explainer on top, the "Recent" download list below) — white rounded cards over a
  blurred backdrop, matching the export dropdown style. The dropzone is a dashed
  click-or-drag target; import failures show an inline amber note keyed to the
  reason (no-data / unreadable / unsupported). Because only files downloaded on
  or after 6 July 2026 (this feature's launch) carry the embedded data, a muted
  caption under the dropzone and the no-data message both say so — an older
  download reads as an expected limitation, not a bug.
  A rounded `overflow-hidden` card that also fills a corner with colour (e.g.
  `TemplatesModal`'s gradient header) must use a **`ring-1` outline, not a
  `border`** — a hairline `border` on such a card leaves a faint light seam at
  the rounded corners (the white card bg showing through the clipped fill),
  whereas a ring is a box-shadow that follows the radius crisply.
  `SaveDesignModal` leads with a green check + "{FORMAT} downloaded" so it's
  clear the file already saved; the link/history is framed as an optional
  "keep editing later" step — for geometry, that copy also names the file
  itself as a second way back in ("upload it again anytime via Projects"),
  since the download now doubles as a restore point.
- **RestoreConfirmModal**: a small amber-accented confirmation (same card style
  as `SaveDesignModal`) gates any restore — from history or an uploaded file —
  that would overwrite a design already in progress. Skipped silently when the
  design being replaced is still the untouched default (nothing to lose), so it
  never nags on a fresh visit or an empty canvas.
- **Clipboard**: Share / copy-link actions go through [lib/clipboard.ts](lib/clipboard.ts)
  (`copyText`), which falls back to `document.execCommand('copy')` when the async
  Clipboard API is unavailable (insecure/sandboxed contexts).
- **About**: opens as a modal (`AboutDialog`) from the header — the app content
  over a semi-transparent, blurred backdrop with the signature gradient laid on
  top — rather than navigating to a page (the `/about` route still exists as a
  direct-link fallback). The logo (`LogoStar`) does a 3-D `rotateY` flip on mode
  switch: an indigo enneagram for geometry, a teal spike star for images.
- **What's new**: header item next to About; a 5px accent dot appears while
  [lib/changelog.ts](lib/changelog.ts)'s `APP_VERSION` is newer than the
  visitor's `nsg:version-seen`. Clicking opens `WhatsNewDialog` (HistoryPanel
  modal pattern) and marks the version seen. The dialog shows **only the current
  release** (`CHANGELOG[0]`) expanded; a subtle "Show full changelog" toggle
  reveals the earlier entries below it (animated height, resets on close). True
  first visits are silently marked seen — the auto-opened templates modal is the
  only attention-grabber a new visitor gets.
- **Versioning** — `MAJOR.FEATURE.PATCH`, kept in `lib/changelog.ts`:
  **MAJOR** (1st) = sweeping overhauls that redefine the app; **FEATURE** (2nd) =
  a notable new capability (a mode, a system, a redesign); **PATCH** (3rd) =
  everything else, numbered straight up (…1.2.1, 1.2.2, …1.2.15). Reconstructed
  from git: geometry-only launch = **1.0**, adding Images mode = **1.1**, the
  layers + layout + performance release = **1.2** (current). Early ad-hoc
  `v0.x`/`v1.x` commit tags predate the scheme and roll up into 1.0. On each
  user-visible release: bump `APP_VERSION`, add a `CHANGELOG` entry (newest
  first), and put the version in the commit subject (e.g. `1.2.1 — …`).

## Accessibility notes

- Primary text/labels use `#6B7280`+ (≥4.5:1 on white). The power-user hint and
  some captions are lighter by intent.
- Icon buttons are ~28px hit targets; the layer-card delete is separated to
  avoid mis-taps.
- Preview SVGs carry `role="img"` + an aria-label; layer thumbnails use empty
  alt (decorative).
- Disabled controls are exempt from contrast minimums; they show a readable
  italic reason rather than just fading.
