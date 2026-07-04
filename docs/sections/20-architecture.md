---
id: architecture
title: Architecture
order: 20
status: current
last_updated: 2026-07-04
owner: @naim
linked_paths: app/GeneratorClient.tsx, components/, hooks/, lib/export.ts, components/ui/slider.tsx
summary: How the editor shell, the two render paths, state, and the shared export pipeline fit together.
---

## Context

A single-page, client-only app. The only external touchpoint is the user's
browser storage (URL + localStorage). No server, no API.

```mermaid
flowchart TD
  user([Creator]) --> app[ninestar.app SPA]
  app -->|geometry design| url[(URL query params)]
  app -->|image history| ls[(localStorage)]
  app -->|download| files[PNG / SVG / JPG files]
```

## Components

`GeneratorClient` is the shell. It holds the active **mode**, both config hooks
(`useStarComposition` for geometry layers, `useComposition` for images), the
history state, and the modals, and decides which control panel and which preview
to render. The geometry control panel and single-config URL sync still speak a
flat `StarConfig`, derived from the selected layer via `configFromLayer`; the
multi-layer URL scheme and layer UI are follow-up cycles.

```mermaid
flowchart TD
  GC[GeneratorClient] --> TB[Top bar: ModeSwitch · HeaderNav · ActionsCluster]
  GC -->|geometry| CP[ControlPanel] --> EB[PreviewErrorBoundary] --> SP[StarPreview svg]
  GC -->|images| ICP[ImageControlPanel] --> EB --> IP[ImagePreview svg]
  TB --> AC[ActionsCluster: History · Share · Download]
  AC -.shared logic.-> UE[useExport + ExportToast]
  GC --> SM[SaveDesignModal]
  GC --> HP[HistoryPanel]
  CP -.uses.-> SI[SliderInput / ColorControl / primitives]
  ICP -.uses.-> SI
  SP -.svgRef.-> AC
  IP -.svgRef.-> AC
```

**Top bar.** On the home route the generator renders its own full-width top bar
(logo + colored `ModeSwitch` + `HeaderNav` + `ActionsCluster`); the standalone
`AppHeader` is suppressed there by [SiteHeader](components/SiteHeader.tsx)
(`usePathname() === '/'` → null) and only shows on other routes. Both reuse the
shared `Wordmark` and `HeaderNav` (Templates modal auto-opened on first visit,
About, the "What's new" dialog — [WhatsNewDialog](components/WhatsNewDialog.tsx)
fed by [lib/changelog.ts](lib/changelog.ts)). `ModeSwitch`
([components/generator/](components/generator/ModeSwitch.tsx)) is the mode
control (lifted out of the sidebar); its active pill is accent-filled so it
shows and drives the indigo/teal theme. `ActionsCluster` bundles History · Share
· Download into one header container (replacing the former canvas overlays,
sidebar export panel, and mobile FAB — one export path via
[useExport](hooks/useExport.ts)). The canvas is now free of chrome. Control
panels draw color input from the shared `ColorControl`, whose swatch popover is
built on [ui/popover.tsx](components/ui/popover.tsx) (Base UI).

Both previews render into the **same `svgRef`**, which is all the export
pipeline needs — so PNG/SVG/JPG export is identical for both modes. They are
wrapped in [PreviewErrorBoundary](components/PreviewErrorBoundary.tsx) so a
corrupted design (e.g. restored from history) can't take down the editor.

Export runs through a single UI now: the header
[ActionsCluster](components/generator/ActionsCluster.tsx) download menu, backed
by the [useExport](hooks/useExport.ts) hook (which owns the canonical
`RESOLUTIONS` list) and [ExportToast](components/ExportToast.tsx). (The old
desktop `ExportPanel` and mobile `MobileExportFab` were removed in R1.)

## Rendering & export pipeline

Everything is **SVG**, on a fixed `600×600` viewBox centred at `(300,300)`.

- **Geometry**: [lib/star-geometry.ts](lib/star-geometry.ts) builds path strings
  from `StarConfig`; [StarPreview](components/StarPreview.tsx) renders them with
  gradients, filters (glow/shadow), and an optional container.
- **Images**: [ImagePreview](components/ImagePreview.tsx) places each visible
  layer `count` (or `2×count` when mirrored) times via SVG `transform`, each an
  `<image href="data:…">`.
- **Render cost**: both previews are `memo()`-wrapped and compute their
  geometry/placements in `useMemo`, so unrelated editor state (modals, history
  panel, toasts) re-renders neither the trigonometry nor the data-URL-heavy
  `<image>` trees. `GeneratorClient` keeps the preview `style` prop a module
  constant for the same reason.
- **Export**: [lib/export.ts](lib/export.ts) serialises the `<svg>` behind
  `svgRef`. SVG is downloaded directly (self-contained, images inlined); PNG/JPG
  are drawn onto a canvas at the chosen resolution. Because uploaded images are
  **data URLs**, the canvas is never tainted (see ADR-002).

## State

- [useStarComposition](hooks/useStarComposition.ts) — `GeometryComposition`
  (layer list + canvas) for geometry, with add/duplicate/remove/update/reorder +
  the selected-layer id.
- [useComposition](hooks/useComposition.ts) — `CompositionConfig` (image layer
  list + background/container/export) with add/remove/update/reorder.
- [useUrlSync](hooks/useUrlSync.ts) — debounced two-way sync of the geometry
  composition with the URL query string. Image state is **not** URL-synced.
- History lives in `GeneratorClient` state, backed by
  [lib/history.ts](lib/history.ts) (`localStorage`).

## Theming

A per-mode accent is implemented with CSS variables (`--nsg-accent`, …) defined
in [globals.css](app/globals.css) and overridden to teal on the
`GeneratorClient` root when in images mode. Shared components reference
`var(--nsg-accent…)`, so they re-theme automatically by subtree (see ADR-004).

## Key decisions

The consequential choices live in the **Architecture decisions** section: SVG +
data-URL export, no backend, URL-state for geometry only, localStorage history,
and CSS-variable theming.
