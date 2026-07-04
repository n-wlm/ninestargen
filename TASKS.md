# TASKS.md — Source of Truth

## Aktuelles Ziel
**Feature-Ausbau 2026-07** — zwei aufeinander aufbauende Arbeitsströme:
1. **Feature-Stack** (Plan `eager-meandering-meteor.md`, freigegeben 2026-07-03):
   Farbauswahl v2, „What's new", Template-Kuration, Geometry-Layer. → weitgehend fertig.
2. **Layout-Redesign** (Owner-Feedback 2026-07-04, Richtung per Mockup+Rückfragen freigegeben):
   Modus-Switch + Aktionen in den Header, schwebendes Layer-Fenster für beide Modi, Mobile-Umbau,
   mehr Farben/Pastell. → R0 fertig, R1–R4 offen.

**Gesamtstatus auf einen Blick:**
| # | Thema | Branch | Status |
|---|-------|--------|--------|
| 1 | Farbauswahl v2 (Popover, Recent) | `feature/color-picker-v2` | ✅ PR-bereit |
| 2 | „What's new" | `feature/whats-new` | ✅ PR-bereit |
| 3 | Template-Kuration | `feature/template-curation` | ⏸ wartet auf Owner-Auswahl |
| 4 | Geometry-Layer (Modell/URL/UI) | `feature/geometry-layers` | ✅ Code fertig, ⏳ Live-Klick-Test offen |
| R0 | Farben 20→30 + Pastell | `feature/layout-redesign` | ✅ committet |
| R1 | Unified Header | `feature/layout-redesign` | ✅ committet |
| R2 | Schwebendes Layer-Fenster (beide Modi) | `feature/layout-redesign` | ✅ committet |
| R3 | Mobile-Layout (Controls/Layers-Toggle, ⋯-Menü) | `feature/layout-redesign` | ✅ committet |
| R4 | Doku-Kapitel + Template-Finalisierung | `feature/layout-redesign` | ✅ committet (Owner justiert Templates nach) |

Branches stacken in dieser Reihenfolge (jeder baut auf dem vorigen auf); Naim pusht + öffnet PRs.

**Arbeitsmodus (Owner 2026-07-04):** R1–R4 werden autonom durchgezogen (Commit + Selbst-
Verifikation je Scheibe), **keine Zwischenfragen** — erst beim fertigen Gesamtergebnis Rückfrage
für Owner-Input (inkl. Template-Feinschliff). Template-Set wird mit Owner-Picks + selbst erstellten
Multi-Layer-Showcases vorläufig final gemacht; Owner justiert am Ende nach.

**Bestätigte Architektur-Entscheidungen:**
- `GeometryComposition { layers: GeometryLayer[], canvas-Props }`, MAX 5 Layer; kein `scale`
  (outerRadius IST die Größe); neu pro Layer: `opacity`, `offsetX/Y`.
- URL v2: Ziffern-präfixierte Kurz-Keys (`0t=`, `1rot=`…), Canvas-Keys unverändert,
  `n=<count>`-Marker; alte URLs (nackte Keys) parsen unverändert als Layer 0.
- Redesign: Modus-Switch farbig in den Header (treibt Akzent-Theme); History·Share·Download
  gebündelt im Header rechts; Layer als schwebende, einklappbare Karte oben links auf der Fläche
  (gleiches Muster für Geometry + Images); mobil Controls/Layers-Umschalter im Sidebar-Kopf.
- Keine neuen Dependencies (Popover aus installiertem `@base-ui/react`).
- **Verifikations-Realität:** Preview-Tab läuft hier backgrounded → interaktive Teile per SSR +
  Build absichern, Live-Klick-Durchlauf macht Naim im echten Browser (siehe Memory).

## Phasen (je Branch → PR; Gates: tsc ✓ lint ✓ build ✓ + Preview; keystonedoc + Commit je Zyklus)

### Phase 1 — `feature/color-picker-v2` (M) ✅
- [x] `components/ui/popover.tsx` (neu, Base-UI-Popover im House-Style)
- [x] `lib/color-palettes.ts`: `SWATCH_COLORS` (20 kuratierte Farben, 4 Reihen:
      Neutral/Warm/Pink-Lila/Kühl, enthält alle Paletten-Anker)
- [x] `lib/recent-colors.ts` (neu): localStorage `nsg:recent-colors`, max 8, dedupe,
      Push nur bei tatsächlicher Änderung zwischen Popover-Open und -Close
- [x] `ColorControl.tsx` v2: gemeinsamer `ColorSwatchButton` (Popover mit Preset-Grid,
      Recent-Zeile, nativer Picker + Hex); GradientBuilder-Stops nutzen ihn; API unverändert
- Verifiziert im Preview: Stroke-Swatch + Gradient-Stops (Geometry) + Bg-Swatch (Images)
  öffnen den Popover; Preset-Klick wirkt sofort (URL-Sync ok); Hex-Commit per Enter;
  Esc schließt; Recent akkumuliert dedupliziert über beide Modi und überlebt Reload;
  Ring markiert aktuellen Wert; Konsole fehlerfrei. Gates: tsc ✓ Lint 0 ✓ Build ✓.
  Doku: 60-ui-design + Changelog aktualisiert, Build 100 % Health.
- PR-bereit — Naim pusht & öffnet PR.

### Phase 2 — `feature/whats-new` (S) ✅ (Branch gestackt auf Phase 1)
- [x] `lib/changelog.ts` (APP_VERSION 1.1.0, typisierte CHANGELOG-Einträge,
      hasUnseenChanges/markChangesSeen, localStorage `nsg:version-seen`)
- [x] `AppHeader.tsx`: „What's new"-Button neben About + 5-px-Akzent-Punkt;
      `WhatsNewDialog.tsx` (HistoryPanel-Modal-Muster)
- [x] Erstbesucher-Unterdrückung: ohne `templates_seen` + `version-seen` wird still
      markiert — nur das Templates-Modal begrüßt Neubesucher
- Verifiziert im Preview: Wiederkehrer → Punkt (Akzentfarbe), Klick → Dialog mit beiden
  Einträgen, Punkt weg, `nsg:version-seen`=1.1.0 persistiert; Erstbesuch → kein Punkt,
  still markiert, Templates-Modal öffnet; Mobile-Header (375 px) ohne Overflow;
  Konsole fehlerfrei. Gates: tsc ✓ Lint 0 ✓ Build ✓. Doku 100 % Health
  (ui-design, data-model +localStorage-Tabelle, requirements FR-13/14, architecture).
- PR-bereit — Merge-Reihenfolge: nach Phase 1 (gestackt).

### Phase 3 — `feature/template-curation` (M) ⏸ WARTET AUF OWNER-AUSWAHL
- [x] 13 Kandidaten entworfen (`lib/preset-candidates.ts`): Porcelain, Midnight Ink, Dawn,
      Ocean Mist, Sage Circle, Terracotta, Blush Rose, Amethyst Line, Copper Thread,
      Slate Facet, Honey Petal, Sky Weave, Graphite Bloom — alle 6 Sterntypen,
      ruhige Paletten, im echten Preview iteriert (Porcelain/Dawn/Ocean Mist/Sky Weave
      nachjustiert). Kategorien: 3 modern, 4 geometric, 3 decorative, 1 classic, 2 artistic.
- [x] Temporäre Vorschau-Galerie unter `/dev-candidates` (Kandidaten + Bestand;
      Seite + candidates-Datei werden nach der Auswahl gelöscht)
- [ ] **STOPP: Owner wählt aus** → gewählte in `lib/presets.ts`, 5 schwache raus
      (Modern Minimal, Crystalline, Diamond Grid, Sunset Gradient, Neon Glow),
      Galerie-Seite löschen, Doku, Commit
- Behalten (fix): Classic Bahá'í, Watercolor Petal, Outline Enneagram, Earth Tones,
  Linked Petals, Leafburst, Golden Kite.
- Hinweis: `curveIntensity`-Kommentar in types/star.ts sagt „-1–1", real ist der
  Slider -250–250 — Kommentar bei Gelegenheit fixen (Phase 4a).

### Phase 4 — `feature/geometry-layers` (L, 3 Zyklen sequenziell) ⏳ 4a fertig
- [x] 4a Modell + Rendering: `types/geometry.ts` (GeometryLayer/Composition,
      compositionFromConfig/asComposition/configFromLayer/normalize, MAX 5),
      `hooks/useStarComposition.ts` (add/duplicate/remove/update/reorder +
      selectedLayer), StarPreview multi-layer (interne `StarLayerGroup`,
      eindeutige Grad/Filter-IDs pro Layer, `config`-Convenience-Prop,
      unsichtbare Layer übersprungen, Container = größter sichtbarer Layer),
      GeneratorClient auf Komposition umgebaut, history.ts Dual-Shape-Normalize,
      `useStarConfig` gelöscht. UI noch single-layer (bearbeitet selektierten Layer).
      Verifiziert: tsc ✓ Lint 0 ✓ Build ✓; SSR-Check (react-dom/server): 1-Layer
      rendert, 2-Layer → Circle-Container + 2 eindeutige Gradient-IDs (kein
      Cross-Bleed) + opacity 0.6, normalize repariert/verwirft korrekt,
      asComposition passthrough/wrap; live: Radius-Edit → Pfad + URL `?r=…`,
      Legacy-URL-Parse round-trip. (Preview-Tab war backgrounded → motion/Effekte
      gedrosselt; daher SSR statt Klick-Verifikation für Multi-Layer.)
- [x] 4b URL v2: `lib/url-params.ts` CANVAS/LAYER-Key-Split, Präfix-Schema
      (Layer 0 bare = byte-identisch zu alt, Layer 1+ `${i}`-Präfix, `n=count`),
      `useUrlSync` synct die ganze Komposition. Verifiziert (tsx round-trip):
      Legacy-URL byte-identisch, 3-Layer round-trip, `n`-Marker, 5-Layer = 1162 Z.
- [x] 4c Layer-UI: `LayerList.tsx` (generisch, Selected-Layer-Liste), `GroupLabel`,
      ControlPanel edit-selektierter-Layer, „+ Layer"-Ghost bei 1 Layer (dupliziert),
      Opacity/Offset X/Y nur bei >1 Layer, „Canvas"-Gruppe (Background + Outer
      Container), Effects bleibt per-Layer. Verifiziert: tsc/lint/build ✓ + SSR
      (single vs multi-layer Struktur korrekt: Liste-Gating, Ghost, Slider,
      Sektions-Reihenfolge Effects→Canvas→Background, reversed Namen).
      **Offen: Live-Klick-Durchlauf** (Preview-Tab war backgrounded → Effekte/
      Renders gedrosselt; Naim sollte im echten Browser durchklicken: + Layer,
      Select, Reorder, Auge, Duplizieren, Löschen, Export, History-Restore, Share).
- Kritisch erfüllt: 4c auf 4b aufgesetzt (Share-Links tragen Layer).

### Phase 5 (ALT) — `feature/images-layer-ui` → aufgegangen im Layout-Redesign
Wird durch R2 ersetzt (Images bekommt dasselbe schwebende Layer-Panel wie Geometry).

---

## LAYOUT-REDESIGN (Owner-Feedback 2026-07-04, Richtung freigegeben)
Branch: `feature/layout-redesign` (auf `feature/geometry-layers` gestackt).
Owner-Entscheidungen (Mockup + Rückfragen bestätigt):
- **Modus-Switch (Geometry/Images) wandert in die Kopfleiste**, farbig (Indigo/Teal),
  mit gleitendem Indikator; treibt das Akzent-Theme sichtbar.
- **History · Share · Download** gebündelt in einen Container **rechts oben im Header**;
  Canvas-Overlays verschwinden, Fläche wird frei.
- **Layer als schwebendes Fenster** oben links auf der Fläche (Figma-Stil), einklappbar —
  raus aus den Controls. **Gleiches Muster für Geometry UND Images.**
- Mobile: Modus-Switch in den Header; der frei werdende Slot wird zum **Controls/Layers-Umschalter**;
  Layer-Panel darf mobil bleiben wo es ist (bzw. über den Umschalter).
- Farbauswahl: mehr Farben + Pastelltöne (✅ erledigt, siehe R0).
- Templates: Owner-Picks (Porcelain, Sage Circle, Copper Thread, Honey Petal) übernommen
  + Multi-Layer-Showcase „Emerald Weave" (Owner-Combo). Owner justiert am Ende nach.

### R0 — Farbauswahl erweitern (S) ✅
- [x] `SWATCH_COLORS` 20 → 30 (5×6-Grid inkl. voller Pastellreihe, jede Hue-Reihe hell zuerst)

### R1 — Unified Header (Modus-Switch + Aktionen) (L) ✅
- [x] Home-Bar in `GeneratorClient` (Wordmark + farbiger `ModeSwitch` + `HeaderNav` +
      `ActionsCluster` History·Share·Download); `SiteHeader` unterdrückt `AppHeader` auf `/`;
      Wordmark/HeaderNav als geteilte Bausteine.
- [x] Modus-Switch + Export-Panel aus Sidebar raus, Canvas-Overlays weg; `ExportPanel`/
      `MobileExportFab`/`ShareButton` gelöscht (ein Export-Pfad via `useExport`).
- Verifiziert: SSR (Switch farbig, Aktions-Container) + tsc/lint/build + Desktop-Screenshot.

### R2 — Schwebendes Layer-Panel, beide Modi (L) ✅
- [x] `LayersPanel` (schwebend/einklappbar) auf Basis `LayerList`; ein `layerProps` je Modus.
- [x] Geometry: Liste raus aus `ControlPanel`; Images: `useComposition` +selected/`duplicateLayer`,
      `ImageControlPanel` auf Selected-Layer-Muster (Arrangement/Transform), Karten weg.
- [x] `LayerList` `minLayers` (Images bis 0, Geometry ≥1). Verifiziert: SSR + Screenshot.

### R3 — Mobile-Layout (M) ✅
- [x] Mobile: Controls/Layers-Segmented-Toggle im Sidebar-Kopf; `HeaderNav` → ⋯-Overflow-Menü;
      Wordmark nur Logo, kompakte Aktions-Icons; Header passt in 375 px (Verifiziert: Screenshot).

### R4 — Doku-Kapitel + Template-Finalisierung (S) ✅
- [x] Presets finalisiert: 5 schwache raus, 4 Picks + Multi-Layer-Showcase „Emerald Weave";
      `Preset.composition` + `presetToComposition` (ein Pfad für Preview & Apply);
      `/dev-candidates` + `preset-candidates.ts` gelöscht. Verifiziert: SSR (12 Presets,
      Emerald Weave = 2 Layer, exakte Owner-URL), Gates grün.
- [x] Doku: Chrome-Prinzipien (ui-design), Presets (data-model), ADR-008, Workflows, Changelog.
- **Owner-Input offen (Ende):** weitere Multi-Layer-Combos + finale Template-Abnahme;
      Live-Klick-Durchlauf im echten Browser (Preview-Tab hier backgrounded).

## Erledigt (Vorgeschichte)
- System-Check-Audit 2026-06-10: alle 6 Phasen umgesetzt, PR `chore/system-check` → `main`
  gemergt (Commits e182de8…c62e80d auf main). Gates seither grün.

## Hinweise
- Kein Push durch den Agenten — Naim pusht und öffnet PRs.
- Preview-Browser: bei 0×0-Viewport zuerst `preview_resize` (motion-Animationen starten sonst nie).
