# TASKS.md — Source of Truth

## Aktuelles Ziel
**System-Check: Performance & Code-Konsistenz** (Audit vom 2026-06-10, vom Owner freigegeben).
Die App schneller, robuster und konsistenter machen; toten Code entfernen.
Branch: `chore/system-check` (ein Commit pro Phase, PR am Ende — kein Auto-Merge).

## Baseline (2026-06-10)
- `npx tsc --noEmit` ✓ grün
- `npm run build` ✓ grün (alle Routen statisch)
- `npm run lint`: 3 echte Fehler (ExportPanel `Date.now()` im Render; SliderInput + ColorControl
  setState-in-Effect) + 2 Warnungen (tote Funktionen `buildStellated`/`buildExplosion`)
  + ~9.000 Phantom-Findings aus `docs/_assets/` (Vendor-JS wurde mitgelintet → in Phase 0 gefixt)

## Phasen (Reihenfolge: 0 → 1 → 3 → 4 → 2 → 5)

### Phase 0 — Baseline & Gerüst ✅ (in Arbeit → Commit)
- [x] Baseline-Checks ausführen und dokumentieren
- [x] TASKS.md anlegen
- [x] ESLint: `docs/**` ignorieren, damit Lint als Gate brauchbar ist
- Akzeptanz: Lint zeigt nur noch echte App-Findings (≤ 5 statt 9.017)

### Phase 1 — Dead Code & Quick Wins ✅
- [x] `updateMany()` aus `hooks/useStarConfig.ts` entfernt (nirgends genutzt)
- [x] `buildStellated`/`buildExplosion` aus `lib/star-geometry.ts` entfernt (nicht im Dispatcher)
- [x] `ExportPanel.tsx`: Toast-Key über Ref-Counter statt `Date.now()` — Lint-Fehler behoben
- [x] Dependencies geprüft — **Audit-Befund korrigiert: ALLE Dependencies sind in Gebrauch.**
      `@base-ui/react` → 5 Dateien in `components/ui/`; `shadcn` → CSS-Import
      `shadcn/tailwind.css` in `app/globals.css` (Build bricht ohne!); `tw-animate-css` →
      `globals.css`; `class-variance-authority` → ui/tabs|badge|button. Nichts entfernt.
- Verifiziert: tsc ✓, Build ✓, Lint nur noch 2 Fehler (setState-in-Effect → Phase 3)

### Phase 3 — Render-Performance ✅ (vorgezogen vor Phase 2)
- [x] `StarPreview`: Pfad-Berechnung in `useMemo`, `gradientCoords` als Modul-Konstante, `memo()`
- [x] `ImagePreview`: Layer-Größen + Transforms in einem `useMemo`, `memo()`
- [x] `GeneratorClient`: Preview-`style` als Modul-Konstante (`PREVIEW_SHADOW`) — inline-Literal
      hätte `memo()` ausgehebelt. `exportProps` bewusst NICHT memoized: geht nur an die leichten
      Export-Panels (nicht memoized), Stabilisierung brächte dort nichts.
- [x] SliderInput + ColorControl/HexInput: setState-in-Effect → „derived state during render"
      (offizielles React-Pattern mit prev-Tracking) — Lint jetzt 0 Findings
- Verifiziert: tsc ✓, Lint 0 ✓, Build ✓; Browser: Wert tippen → Geometrie aktualisiert,
  Reset all → Inputs spiegeln Defaults zurück, Hex-Normalisierung (#FF0000), Images-Modus
  + Teal-Akzent ok, Konsole fehlerfrei

### Phase 4 — History & Storage robust ✅
- [x] `addHistory` liefert jetzt `{ entries, trimmed }`; bei vollem Storage zeigt
      `SaveDesignModal` eine Amber-Warnung statt History stillschweigend zu kürzen
- [x] Dedup über `configSignature()` — lange Strings (Data-URLs) werden zu
      Länge+Kopf+Ende gefaltet statt Multi-MB-Serialisierung im Main Thread
- [x] Bild-Dimensionen: bereits abgesichert (Fallback 300 in `readDimensions`,
      `|| 1` in `layerSize`) — Audit-Befund war schon gelöst, keine Änderung nötig
- [x] `PreviewErrorBoundary` um beide Previews (defektes Design crasht nicht mehr die App)
- Verifiziert im Browser: Quota-Fehler simuliert → Warnung erscheint; normaler
  Download → keine Warnung, Eintrag persistiert; Dedup: 2 identische Downloads = 1 Eintrag

### Phase 2 — Styling-Konsistenz ✅
- [x] Alle hartkodierten `indigo-*` → `var(--nsg-accent…)` ersetzt (loading, gallery, about,
      TemplatesModal, PresetCard). Mapping: 500→accent, 600→strong, 300→border (exakt),
      200→ring (exakt), 100→soft. `grep indigo-|teal-` in app/components: 0 Treffer.
- [x] Defaults: bewusst NICHT zentralisiert — `DEFAULT_CONFIG`/`DEFAULT_COMPOSITION` liegen
      jeweils neben ihrem Typ (konsistentes Muster); zentrale Datei wäre reine Indirektion.
- Verifiziert: Gates grün; Browser: gallery-CTA & about-Links rendern rgb(94,106,210) = accent

### Phase 5 — Export-Deduplikation ✅
- [x] `hooks/useExport.ts`: gemeinsame Download/Toast-Logik + kanonische `RESOLUTIONS`
- [x] `components/ExportToast.tsx`: eine Toast-Implementierung (vorher 2× identisches JSX);
      Toast-Timer wird jetzt korrekt ge-cleart statt zu überlappen
- [x] Bonus: hartkodierter Indigo-Gradient im Mobile-Download-Button (inline-`style`,
      von Phase 2s Klassen-grep nicht erfasst) → `var(--nsg-accent…)`
- [x] ControlPanels bewusst NICHT vereinheitlicht (Domänen zu verschieden)
- Verifiziert im Browser: Desktop PNG (Canvas-Pfad) + SVG ✓, Mobile-Sheet JPG ✓,
  Toast + SaveDesignModal in beiden UIs, Gradient rendert Akzentfarbe ✓; Gates grün

### Abschluss ✅
- [x] `documentation.html` via keystonedoc aktualisiert (Architektur, Datenmodell,
      Changelog; Build: 8 Sektionen, 100 % Health)
- [x] PR öffnen (`chore/system-check` → `main`), Phasen-Commits als Audit-Trail

## Status: Plan vollständig umgesetzt (2026-06-10)
Alle 6 Phasen abgeschlossen. Endstand der Gates: tsc ✓ · Lint 0 Findings ✓ · Build ✓.
Hinweis für Verifikation im Preview-Browser: Bei leerem `main` zuerst Viewport prüfen
(`preview_resize` auf feste Maße) — 0×0-Fenster lässt motion-Animationen nie starten.
