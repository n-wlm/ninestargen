---
id: overview
title: Overview
order: 0
status: current
last_updated: 2026-06-10
owner: @naim
linked_paths: package.json, CLAUDE.md, AGENTS.md, app/page.tsx
summary: A free web tool for creating nine-pointed star designs and nine-fold image mandalas.
---

## What is this

**ninestar.app** is a free, client-only web tool for creating nine-pointed star
designs and exporting them as PNG, SVG, or JPG. It has two modes you switch
between at the top of the control sidebar:

- **Geometry** — generates nine-pointed stars purely from math (six star types,
  with controls for shape, fill, stroke, container, and effects). The entire
  design is encoded in the URL, so any creation is shareable by link.
- **Images** — lets you upload your own images (SVG/PNG/JPG) and arranges each
  one in 9- or 3-fold radial symmetry (rotated, or mirrored for a kaleidoscope)
  to build a layered mandala.

There is no backend and no account: everything runs in the browser, designs are
shared via URL (geometry) or kept in a local history (images).

## Quickstart

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (Turbopack)
npx tsc --noEmit # typecheck
npm run lint     # eslint
```

There are no automated tests; behaviour is verified by running the dev server
and exercising the UI in the browser.

## Project structure

```
app/                 Next.js App Router
  page.tsx           landing → renders GeneratorClient
  GeneratorClient.tsx  the editor shell: mode switch, panels, canvas, modals
  globals.css        Tailwind theme + accent CSS variables + slider styles
components/
  StarPreview.tsx    SVG renderer for geometry mode
  ImagePreview.tsx   SVG renderer for images mode (n-fold image placement)
  ImageEmptyState.tsx, SaveDesignModal.tsx, HistoryPanel.tsx, ExportPanel.tsx,
  MobileExportFab.tsx, ShareButton.tsx, AppHeader.tsx
  controls/          ControlPanel, ImageControlPanel, SliderInput, ColorControl,
                     primitives (Section/SegmentedControl/Toggle/ConfirmButton)
hooks/               useStarConfig, useComposition, useUrlSync
lib/                 star-geometry, export, image-upload, history, url-params,
                     presets, color-palettes
types/               star.ts (StarConfig), composition.ts (CompositionConfig)
```

See the **Architecture** section for how these fit together.

## Tech stack

| Tech | Why |
| --- | --- |
| Next.js 16 (App Router, Turbopack) | React framework + build; static-friendly, deploys on Vercel |
| React 19 + TypeScript 5 | UI and type safety |
| Tailwind CSS 4 | All styling is inline utility classes; no CSS modules |
| shadcn/ui + @base-ui/react | Base UI primitives (button, slider, tabs, …) |
| motion | Animations (panels, modals, transitions) |
| lucide-react | Icons |

> [!NOTE]
> This repo uses a customised Next.js — check `node_modules/next/dist/docs/`
> before relying on framework APIs (see `AGENTS.md`). Note also that **Next 16
> does not run ESLint during `build`**.
