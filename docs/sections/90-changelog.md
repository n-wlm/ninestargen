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
