---
id: requirements
title: Requirements
order: 10
status: current
last_updated: 2026-06-10
owner: @naim
linked_paths: app/GeneratorClient.tsx, components/controls/, lib/export.ts
summary: What the two modes must do, plus the technical constraints they operate under.
---

## User stories

- As a **creator**, I want to design a nine-pointed star and tweak its shape,
  colours and effects, so that I can produce a custom mark.
- As a **creator**, I want to upload my own image and turn it into a nine-fold
  mandala, so that I can make kaleidoscopic art from my own motifs.
- As a **creator**, I want to stack several image layers with independent
  settings, so that I can build richer compositions.
- As a **user**, I want to export my design as PNG/SVG/JPG at high resolution.
- As a **user**, I want to come back to a design later — via a shareable link
  (geometry) or a local history (images).

## Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Switch between **Geometry** and **Images** modes in the same layout | must |
| FR-02 | Geometry: 6 star types with sliders for radius, inner ratio, rotation, curve, rounding, plus fill/stroke/container/effects | must |
| FR-03 | Geometry: encode the full design in the URL and offer a share link | must |
| FR-04 | Images: upload SVG/PNG/JPG (≤5 MB) as layers (max 15) | must |
| FR-05 | Images: arrange each layer in **9 or 3**-fold symmetry, **rotate or mirror** | must |
| FR-06 | Images: per-layer size, radius, spin, offset, opacity, visibility, reorder, delete | must |
| FR-07 | Export as PNG (transparent), JPG (white bg), or SVG (self-contained), 512–4K | must |
| FR-08 | After a download, prompt to save the design (link for geometry) | should |
| FR-09 | Keep a local **history** of downloaded designs with restore/delete; image designs restorable in-browser | should |
| FR-10 | Disable the download action when there is nothing to export (images mode, no layers) | should |
| FR-11 | Numeric fields accept typed values, including beyond slider ranges (exotic shapes) | should |
| FR-12 | Hex colour fields accept typed/pasted hex codes (`#abc`, `aabbcc`, …) | should |

## Technical requirements

| ID | Requirement | Target |
| --- | --- | --- |
| TR-01 | Client-only; no backend or accounts | All logic in the browser |
| TR-02 | Image data must not taint the canvas on raster export | Use base64 **data URLs**, not blob URLs |
| TR-03 | History persists locally and survives reloads | `localStorage`, quota-safe trimming (≤12 entries) |
| TR-04 | Per-mode accent theming without duplicating components | CSS variables overridden per mode |
| TR-05 | Quality gates | `tsc` + `next build` pass |
