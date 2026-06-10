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

### Phase 1 — Dead Code & Quick Wins ⬜
- [ ] `updateMany()` aus `hooks/useStarConfig.ts` entfernen (nirgends genutzt)
- [ ] `buildStellated`/`buildExplosion` aus `lib/star-geometry.ts` entfernen (nicht im Dispatcher)
- [ ] `ExportPanel.tsx:49`: Toast-Key ohne `Date.now()` (Counter/Ref) — fixt Lint-Fehler
- [ ] Dependencies entfernen (Owner-Sign-off ✓): `@base-ui/react` (0 Imports), `shadcn` (CLI, gehört
      nicht in deps); `tw-animate-css` + `class-variance-authority` vorher auf Nutzung prüfen
- Akzeptanz: Gates grün, `npm run build` unverändert erfolgreich, keine toten Exporte mehr

### Phase 3 — Render-Performance ⬜ (vorgezogen vor Phase 2)
- [ ] `StarPreview`: `buildStarPaths`/`buildInnerPolygonPath`/`gradientCoords`/`strokeProps` memoizen
- [ ] `ImagePreview`: `placements()` memoizen
- [ ] `GeneratorClient`: `exportProps`/Callbacks stabilisieren (`useCallback`), dann `memo()` auf Previews
- [ ] SliderInput/ColorControl: setState-in-Effect beheben (fixt die 2 restlichen Lint-Fehler)
- Akzeptanz: Lint 0 Fehler; Preview verifiziert (Slider ziehen flüssig, kein visueller Regress)

### Phase 4 — History & Storage robust ⬜
- [ ] `lib/history.ts`: QuotaExceeded abfangen → Nutzer-Feedback statt stillem History-Verlust
- [ ] Dedup ohne Voll-`JSON.stringify` (Vergleich über billigere Signatur)
- [ ] `lib/image-upload.ts`: Bild-Dimensionen validieren (NaN/0-Schutz für `layerSize`)
- [ ] Error Boundary um StarPreview/ImagePreview
- Akzeptanz: Quota-Fall manuell simuliert, Fehlerpfad sichtbar; Gates grün

### Phase 2 — Styling-Konsistenz ⬜
- [ ] Hartkodierte `indigo-*` → `var(--nsg-accent…)` in: `app/loading.tsx`, `app/gallery/page.tsx`,
      `app/about/page.tsx`, `components/TemplatesModal.tsx`, `components/gallery/PresetCard.tsx`
- [ ] Defaults-Definitionen prüfen/bündeln (`DEFAULT_CONFIG`, `DEFAULT_COMPOSITION`)
- Akzeptanz: `grep indigo-` nur noch in CSS-Variablen-Definitionen; visuell identisch (Preview)

### Phase 5 — Export-Deduplikation ⬜
- [ ] Gemeinsame Export-Logik aus `ExportPanel` + `MobileExportFab` in Hook (`useExport`) extrahieren
- [ ] Eine Toast-Implementierung statt zwei
- [ ] ControlPanels bewusst NICHT vereinheitlichen (Entscheidung: Domänen zu verschieden,
      erzwungene Abstraktion wäre schlechter als die Duplikation)
- Akzeptanz: Export in beiden UIs (Desktop/Mobile) für PNG/SVG/JPG in beiden Modi verifiziert

### Abschluss ⬜
- [ ] `documentation.html` via keystonedoc aktuell (läuft pro Phase mit)
- [ ] PR öffnen (`chore/system-check` → `main`), Phasen-Commits als Audit-Trail

## Nächster Schritt
Phase 0 committen, dann Phase 1 (Dead Code + Dependencies).
