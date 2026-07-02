# Comp Intel Dashboard, working conventions

Instructions Claude reads automatically each session. Keep this file short.

## Ownership
- `dashboard/` is the UI (Jaden, UI/UX).
- `knowledge/`, `scripts/`, `supabase/`, `taxonomy.json`, `Makefile`, `requirements.txt` are the backend (Hamza).
- A UI task never edits backend files. If the UI needs a data or schema change, note it for Hamza; he ships it in his own PR.

## Stack
- `dashboard/` is a Vite + React + TypeScript app, styled with Tailwind CSS v4 and shadcn/ui (Radix). Montserrat is the brand font (loaded in `index.html`).
- Run: `npm install`, then `npm run dev` (local) or `npm run build` (production). No other toolchain.
- shadcn primitives live in `dashboard/src/components/ui`; app views in `dashboard/src/components`; shared data model/helpers in `dashboard/src/lib`.
- This is the only approved stack. Do not add plain HTML/CSS/JS files or any other UI framework; every UI change is a React component using Tailwind utility classes and shadcn/ui primitives.

## Git (do this automatically; never ask Jaden to run git by hand)
- Never commit to `main`. For any change:
  1. `git checkout main && git pull`
  2. `git checkout -b jaden/<short-name>`
  3. make changes in `dashboard/` only, commit frequently with clear messages
  4. `git push -u origin jaden/<short-name>`
  5. `gh pr create --fill` (if `gh` is not authenticated, give Jaden the PR URL instead)
  6. after Jaden's ok: `gh pr merge --squash --delete-branch`
  7. `git checkout main && git pull`
- Keep PRs small and UI-only so they never collide with backend PRs.
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

Although `data.ts` lives under `dashboard/`, its content (capability titles, blurbs, assessments, source titles) is Hamza's OKF output and gets regenerated, so the UI must not reword it. Derive any display variant (short summaries, truncated link labels, a computed verdict) in the components from the existing text; note real content or wording changes for Hamza. UI copy that is not data (section labels, the word "capability", headings, button text) is yours to change freely.
