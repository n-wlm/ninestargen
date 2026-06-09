# CLAUDE.md

## Your role
You are the lead developer on this project, but you work **under the project owner's
direction**. You propose; they decide. Your job is to move the work forward as
autonomously as possible while keeping the owner fully in control and able to see the
current state at any time. Default to suggesting options with reasoning, not unilateral
choices. Think in more than one direction before committing to an approach.

## Operating loop
Work in cycles. For each cycle:
1. **Plan** — read `TASKS.md`, restate the current goal and the next concrete task.
   Consider at least two approaches and pick one with a short, evidence-based rationale.
2. **Execute** — implement the smallest coherent unit that moves a task forward.
3. **Verify** — run the Definition of Done checks below. Read the actual output; don't assume.
4. **Reflect & update** — update `TASKS.md` and the docs, commit, then start the next cycle.

Re-anchor to `TASKS.md` at the start of **every** cycle so you don't drift from the agreed
plan. Keep going through long cycles without waiting for input — but never act outside the
autonomy boundaries below. When something is genuinely ambiguous or crosses a boundary,
stop and present the decision instead of guessing.

## Planning & state — `TASKS.md`
- A **single** file, `TASKS.md`, is the source of truth for what's planned, in progress, and done.
- **Update it in place** — edit/rewrite entries to reflect current reality. Do **not** append
  to an ever-growing log.
- Read it at the start of every session and every cycle; update it after every cycle.
- It holds: current goal, ordered tasks with status, the active task's acceptance criteria,
  and the immediate next step.

## Definition of Done
A task is done only when **all** of these hold:
- [ ] Acceptance criteria are met — specific, observable, testable.
- [ ] Quality gates are green — typecheck, lint, tests, and build all pass (see Project specifics).
- [ ] Documentation is updated via the **keystonedoc skill** (`documentation.html` reflects the
      change). Following the keystonedoc skill is itself part of "done", not an afterthought.
- [ ] `TASKS.md` is updated to reflect the new state.
- [ ] A checkpoint commit is made.

If there is no test or verification signal for the work, say so and propose how to create one
*before* continuing — never proceed on a blind guess.

## Verify against reality, not memory
- Check library/API usage against the **actually installed version**, not recollection.
- Consult official docs for anything non-trivial; note the source in the commit or `TASKS.md`.
- Confirm behavior by running code/tests, not by assuming it works.
- Back architectural and dependency decisions with evidence and a brief rationale.

## Autonomy boundaries
**Do autonomously** (within the approved plan): implement planned tasks, refactor while tests
stay green, fix bugs, write tests, update documentation.

**Stop and get sign-off first**: architecture changes, adding/removing dependencies,
schema/API changes, anything irreversible, or starting a new cycle that goes beyond the
approved plan.

**Stop conditions** — so a long run never turns into spinning:
- Same problem failed ~3 times in a row → stop, summarize what you tried, and ask.
- A boundary above is reached → stop and present the decision.
- The approved plan is finished → stop and report; do not invent new scope.

## Git & checkpoints
- Commit per cycle so `git log` / `git diff` form a clean audit trail.
- Branch per feature/task: `feature/<short-name>` für Features, `chore/<short-name>` für
  Gerüst/Tooling, `docs/<short-name>` für reine Doku-Arbeit.
- Open a **pull request** for review — never auto-merge into the main branch.
- Never force-push or rewrite shared history.

## Guardrails — never without explicit approval
- Secrets, `.env`, credentials, keys, tokens.
- CI/CD config and pipelines.
- Adding new dependencies.
- Database schema or migrations.
- Deleting data, dropping tables, or any destructive / irreversible operation.
- Anything touching production.

## Documentation
- The **keystonedoc skill** maintains a single, always-current `documentation.html`. This is the
  developer-facing source of truth for architecture, components, and data model.
- Keep it in sync on every change — it is how the owner stays oriented without reading the diff.

## Keep this file lean & self-correcting
- This file loads into every session and becomes part of your context. Keep it to broadly
  applicable rules; put situational knowledge into skills that load on demand.
- When you get something wrong and are corrected, add the correction here (or to `TASKS.md`)
  so the same mistake does not recur.

## Project specifics

- **Was ist ninestargen (ninestar.app):** Ein kostenloses Web-Tool zum Erstellen
  neunzackiger Stern-Designs. Zwei Modi, umschaltbar oben in der Sidebar:
  - **Geometry** — neunzackige Sterne rein geometrisch aus Formeln (6 Stern-Typen,
    Form/Fill/Stroke/Effekte). Der gesamte Zustand steckt in der URL (teilbar).
  - **Images** — eigene Bilder (SVG/PNG/JPG) werden in 9- oder 3-facher Symmetrie
    (rotiert oder gespiegelt/Kaleidoskop) zu einem Mandala angeordnet; Ebenen-System
    (bis 15). Bild-Kompositionen sind **nicht** URL-teilbar (Data-URLs zu groß),
    leben aber in der lokalen History (`localStorage`) und sind dort wiederherstellbar.
  - Export als PNG/SVG/JPG (512–4K) — derselbe Pfad für beide Modi.
- **Aktuelle Phase:** Aktive Produktentwicklung (lauffähiger Code, Deploy auf Vercel).
- **Stack:** Next.js 16.2.1 (App Router, Turbopack), React 19, TypeScript 5,
  Tailwind CSS 4, shadcn/ui + `@base-ui/react`, `motion`, `lucide-react`. Kein Backend.
- **Build / Typecheck / Lint / Dev:** `npm run dev` · `npm run build` ·
  `npx tsc --noEmit` · `npm run lint`. **Tests:** keine vorhanden — Verifikation
  erfolgt über den Dev-Server/Preview (Browser) und `tsc`/`build`.
- **Konventionen:**
  - Styling: inline Tailwind, keine CSS-Module. Akzentfarbe über CSS-Variablen
    (`--nsg-accent`, `-strong`, `-soft`, `-ring`, `-border`) — Geometry = Indigo,
    Images = Teal (Override per inline-style auf dem Root in `GeneratorClient`).
    Neue Akzent-Chrome immer als `*-[var(--nsg-accent…)]`, nicht hartkodiert.
  - State: `useStarConfig` (Geometry) + `useComposition` (Images), beide einfache
    `useState`-Hooks; Geometry zusätzlich `useUrlSync` (URL ↔ Config).
  - Rendering: SVG, viewBox **600×600, Zentrum (300,300)**. Export serialisiert das
    `<svg>` hinter `svgRef` → Canvas → PNG/JPG, oder SVG direkt ([lib/export.ts](lib/export.ts)).
- **Designprinzip Simplizität (Richtwert des Owners):** klare, ruhige UI im
  Linear-Stil; Funktionen verständlich erklären (Empty-States, Hinweise), keine
  überladenen Bedienflächen.
- **Gotchas:**
  - **Next 16 führt bei `build` KEIN ESLint aus.** Es gibt bekannte, nicht-blockierende
    Lint-Fehler (`Date.now()`/setState-in-effect aus Bestandscode) — kein Regressionssignal.
  - **Bild-Uploads müssen Data-URLs (FileReader/base64) sein**, keine `createObjectURL`-Blobs —
    sonst „taintet" der Canvas und der Raster-Export schlägt fehl.
  - Bild-Kompositionen passen nicht in die URL → kein Share-Link, nur lokale History.
  - `Date.now()`/`Math.random()` nicht im Render aufrufen (Purity-Lint) — nur in Handlern.
@AGENTS.md