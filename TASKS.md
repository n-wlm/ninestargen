# TASKS.md — Source of Truth

## Aktuelles Ziel
**Feature-Ausbau 2026-07** (Plan vom 2026-07-03, vom Owner freigegeben — Details in
`/Users/nwlm/.claude/plans/eager-meandering-meteor.md`):
Geometry-Layer (mehrere Sterne übereinander), einheitliches Layer-UI für beide Modi
(Ausgewählter-Layer-Prinzip, Owner-Entscheidung), Farbauswahl v2 (Popover mit Presets/Recent),
Template-Kuration (5 schwache Presets ersetzen, Owner wählt aus Kandidaten), „What's new"-Hinweis.

**Bestätigte Architektur-Entscheidungen:**
- `GeometryComposition { layers: GeometryLayer[], canvas-Props }`, MAX 5 Layer; kein `scale`
  (outerRadius IST die Größe); neu pro Layer: `opacity`, `offsetX/Y`.
- URL v2: Ziffern-präfixierte Kurz-Keys (`0t=`, `1rot=`…), Canvas-Keys unverändert,
  `n=<count>`-Marker; alte URLs (nackte Keys) parsen unverändert als Layer 0.
- Layer-UI: kompakte Liste oben, Sektionen bearbeiten den ausgewählten Layer; bei Geometry
  mit 1 Layer unsichtbar (nur Ghost-„+ Layer"). Canvas-Sektionen unter Gruppen-Trenner „Canvas".
- Keine neuen Dependencies (Popover aus installiertem `@base-ui/react`).

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

### Phase 4 — `feature/geometry-layers` (L, 3 Zyklen sequenziell)
- [ ] 4a Modell + Rendering: `types/geometry.ts`, `hooks/useStarComposition.ts`,
      StarPreview multi-layer (eindeutige Grad/Filter-IDs, `config`-Convenience-Prop),
      GeneratorClient-Umbau, history.ts Dual-Shape-Normalize. UI noch single-layer.
- [ ] 4b URL v2: `lib/url-params.ts` Präfix-Schema (+`v,o,x,y,n`), `useUrlSync.ts`
- [ ] 4c Layer-UI: `LayerList.tsx` (generisch), GroupLabel-Primitive, ControlPanel
      Selected-Layer-Verdrahtung, Opacity (nur >1 Layer) + Offset X/Y in Shape
- Kritisch: 4c nie ohne 4b shippen (Share-Links würden Layer verlieren)

### Phase 5 — `feature/images-layer-ui` (M, nach Phase 4)
- [ ] ImageControlPanel auf gemeinsame LayerList + Selected-Layer-Sektionen migrieren
- [ ] `useComposition`: `selectedLayerId`, `duplicateLayer`

### Phase 6 — Doku-Kapitel UX (S)
- [ ] User Stories, Chrome-Prinzipien, Layer-Modell, URL-Schema in documentation.html

## Erledigt (Vorgeschichte)
- System-Check-Audit 2026-06-10: alle 6 Phasen umgesetzt, PR `chore/system-check` → `main`
  gemergt (Commits e182de8…c62e80d auf main). Gates seither grün.

## Hinweise
- Kein Push durch den Agenten — Naim pusht und öffnet PRs.
- Preview-Browser: bei 0×0-Viewport zuerst `preview_resize` (motion-Animationen starten sonst nie).
