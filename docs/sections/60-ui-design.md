---
id: ui-design
title: UI design
order: 60
status: current
last_updated: 2026-07-03
owner: @naim
linked_paths: components/controls/, components/ui/popover.tsx, app/globals.css, components/SaveDesignModal.tsx, components/HistoryPanel.tsx, components/ImageEmptyState.tsx, components/ShareButton.tsx, components/WhatsNewDialog.tsx, lib/clipboard.ts, lib/color-palettes.ts, lib/recent-colors.ts
summary: Design language, the accent-variable system, control conventions, and accessibility notes.
---

## Design principles

- Calm, focused, Linear-style UI: a single accent, lots of neutral grays,
  compact controls, a live square preview.
- Explain features in place (empty states, hints) instead of crowding the UI.
- Destructive actions ask for confirmation; risky-but-valid values are allowed
  but signposted.

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
  style): a curated 20-color grid (`SWATCH_COLORS` in
  [lib/color-palettes.ts](lib/color-palettes.ts) — neutrals, warm, pink/purple,
  cool; includes every fill-palette anchor), a Recent row
  ([lib/recent-colors.ts](lib/recent-colors.ts), localStorage
  `nsg:recent-colors`, max 8, deduped, only pushed when a color actually changed
  between popover open and close), and the native OS picker + hex as the custom
  fallback. Gradient stops in `GradientBuilder` use the same popover; the
  at-rest layout is unchanged, so the picker stays invisible until clicked.
  Shared `primitives`: `Section`, `GroupLabel` (a heavier divider that
  introduces a group of sections — used for the geometry **Canvas** group),
  `SegmentedControl`, `Toggle`, and `ConfirmButton` (inline confirm popover;
  `destructive` = red confirm; `placement` top/bottom; `align` right or center —
  the centered variant is **portaled to `<body>`** with fixed positioning so it
  isn't clipped by the sidebar's `overflow`; the in-flow right variant is used
  inside modals).
- **Geometry layer UI** (selected-layer pattern): `LayerList`
  ([controls/LayerList.tsx](components/controls/LayerList.tsx)) is a compact
  list shown front→back; clicking a row selects it and **all the sections below
  edit that layer** (so the sidebar keeps the same shape as a single star). The
  action cluster (visibility, reorder ▲▼, duplicate, delete) only appears on
  hover/selection, keeping the list calm. With **one** layer the list is hidden
  entirely — only a quiet "+ Layer" ghost button in the Controls header — so a
  first-time visitor never meets the concept. "+ Layer" duplicates the current
  star; per-layer **Layer Opacity / Offset X / Offset Y** appear in Shape only
  when >1 layer. `MAX_GEOMETRY_LAYERS = 5`. Background + Outer Container sit under
  a **Canvas** `GroupLabel` (composition-level), separated from the per-layer
  sections by a divider rather than tabs. *(Future: the images panel will adopt
  this same `LayerList`, replacing its expandable cards.)*
- **Image layer controls**: per layer — count (9/3), Mirror toggle, Size, Radius,
  Spin, Angle (rotates the whole arrangement; snaps to half-sectors), **Offset X /
  Offset Y** (nudge the image off-centre within each copy), Opacity.
- **Panels**: `ControlPanel` (geometry, with the `LayerList` above) and
  `ImageControlPanel` (images, still with expandable layer cards: thumbnail,
  expand chevron, reorder arrows, visibility, separated delete; dropzone demotes
  to a slim button once a layer exists).
- **Canvas**: square preview via container-query units
  (`w-[min(100cqw,100cqh)] aspect-square`); `ImageEmptyState` explains the mode
  when no image is loaded (compact on mobile — smaller glyph/text and a shorter
  blurb — with `max-h-full overflow-y-auto` so it fits the short 40svh mobile
  canvas); History (top-left) and Share (top-right, geometry).
- **Responsive**: desktop is a side-by-side sidebar + canvas (≥`lg`); below that
  it stacks (canvas on top, controls below). The centered confirm popover is
  clamped to the viewport so it never runs off-screen on narrow widths.
- **Modals**: `SaveDesignModal` (post-download) and `HistoryPanel` — white
  rounded cards over a blurred backdrop, matching the export dropdown style.
  `SaveDesignModal` leads with a green check + "{FORMAT} downloaded" so it's
  clear the file already saved; the link/history is framed as an optional
  "keep editing later" step.
- **Clipboard**: Share / copy-link actions go through [lib/clipboard.ts](lib/clipboard.ts)
  (`copyText`), which falls back to `document.execCommand('copy')` when the async
  Clipboard API is unavailable (insecure/sandboxed contexts).
- **What's new**: header item next to About; a 5px accent dot appears while
  [lib/changelog.ts](lib/changelog.ts)'s `APP_VERSION` is newer than the
  visitor's `nsg:version-seen`. Clicking opens `WhatsNewDialog` (HistoryPanel
  modal pattern) and marks the version seen. True first visits are silently
  marked seen — the auto-opened templates modal is the only attention-grabber
  a new visitor gets. Bump `APP_VERSION` + add a `CHANGELOG` entry with each
  user-visible release.

## Accessibility notes

- Primary text/labels use `#6B7280`+ (≥4.5:1 on white). The power-user hint and
  some captions are lighter by intent.
- Icon buttons are ~28px hit targets; the layer-card delete is separated to
  avoid mis-taps.
- Preview SVGs carry `role="img"` + an aria-label; layer thumbnails use empty
  alt (decorative).
- Disabled controls are exempt from contrast minimums; they show a readable
  italic reason rather than just fading.
