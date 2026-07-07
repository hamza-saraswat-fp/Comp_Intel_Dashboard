# Comp Intel Dashboard, working conventions

Instructions Claude reads automatically each session. Keep this file short.

## Ownership and collaboration
- `dashboard/` is the UI (Jaden, UI/UX). `knowledge/`, `scripts/`, `supabase/`, `taxonomy.json`, `Makefile`, `requirements.txt` are the backend (Hamza).
- Per Evan's team norm we can work across projects, so backend changes are allowed when the work needs them. Keep Hamza informed: ship them as a clean branch + PR (with a Linear issue) he can review, and get his review before merging a backend-touching PR. Never silent edits, never commit to `main`.
- Change data/schema in the repo, not the live DB: edit the OKF markdown in `knowledge/` (the source of truth) plus `supabase/` migrations and `scripts/project_okf.py`. Supabase is a derived, rebuildable projection, so direct DB edits get overwritten on the next `project_okf.py` run.

## Stack
- `dashboard/` is a Vite + React + TypeScript app, styled with Tailwind CSS v4 and shadcn/ui (Radix). Montserrat is the brand font (loaded in `index.html`).
- Run: `npm install`, then `npm run dev` (local) or `npm run build` (production). No other toolchain.
- shadcn primitives live in `dashboard/src/components/ui`; app views in `dashboard/src/components`; shared data model/helpers in `dashboard/src/lib`.
- This is the only approved stack. Do not add plain HTML/CSS/JS files or any other UI framework; every UI change is a React component using Tailwind utility classes and shadcn/ui primitives.

## Git (do this automatically; never ask Jaden to run git by hand)
- Never commit to `main`. For any change:
  1. `git checkout main && git pull`
  2. `git checkout -b jaden/<short-name>`
  3. make your changes (UI in `dashboard/`; backend files too when the work needs them), commit frequently with clear messages
  4. `git push -u origin jaden/<short-name>`
  5. `gh pr create --fill` (if `gh` is not authenticated, give Jaden the PR URL instead)
  6. after Jaden's ok: `gh pr merge --squash --delete-branch`
  7. `git checkout main && git pull`
- Keep PRs small and focused. When a change spans UI and backend, prefer splitting into a UI PR and a backend PR, and flag Hamza on the backend one.
- Narrate each git step in plain language. Jaden is new to GitHub.

## Design rules (the UI is a designer's product, not a backend view)
- Status is the only field that carries color, and it must be colorblind-safe: shape carries the meaning, color reinforces.
- Depth is a neutral gray pip, never colored.
- FieldPulse is shown honestly (not yet assessed / needs verification), never inflated.
- Competitor logos load from logo.dev (publishable token in `src/components/LogoMark.tsx`) and fill the tile; FieldPulse uses its own SVG in `public/`; a missing logo falls back to an initials chip.
- Overview and competitor profiles stay scannable (status glyph + short note); the full four-way comparison, assessments, and sources open in the capability slide-out (shadcn `Sheet`).
- Tabular, lining numerals for every number. Hairlines over shadows. Light surface, navy brand.
- Sentence case. No em-dashes (use commas, colons, parentheses).

## Brand palette
navy `#00034D` (ink, chrome, brand) · cobalt `#253E9A` (interactive) · sky `#6183D8` · fog `#E2E2E2` (neutral fill) · aqua `#6CB4E4` · quartz `#8B8ED6`.

## Data
The app renders entirely from a typed `DATA` object in `dashboard/src/data.ts`, a seed snapshot generated from the OKF bundle. It is data-source-agnostic, so swapping the seed for a Supabase fetch needs no changes to the views. The source of truth is always the OKF markdown in `knowledge/`.

**Everything domain-level lives in the OKF, never hardcoded in the UI or hand-entered in Supabase.** Any new field the UI needs (e.g. the feature checklist) is added to the OKF markdown first, then carried through a `supabase/` migration + `scripts/project_okf.py`, so it flows through the pipeline and stays live and updatable. Seeding domain content as a UI constant, or editing it directly in the DB, is not allowed: both are static and drift from the source. (One deliberate, temporary exception: the FieldPulse honest-gap placeholder in `data.ts`, UI-only because FieldPulse is not a researched competitor in the DB; move it into the OKF once FP data is sourced.)

Although `data.ts` lives under `dashboard/`, its content (capability titles, blurbs, assessments, source titles) is Hamza's OKF output and gets regenerated, so the UI must not reword it. Derive any display variant (short summaries, truncated link labels, a computed verdict) in the components from the existing text; make real content or wording changes at the source (the OKF markdown in `knowledge/`) via a PR, not by rewording in the UI. UI copy that is not data (section labels, the word "capability", headings, button text) is yours to change freely.
