# Comp Intel Dashboard, working conventions

Instructions Claude reads automatically each session. Keep this file short.

## Ownership
- `dashboard/` is the UI (Jaden, UI/UX).
- `knowledge/`, `scripts/`, `supabase/`, `taxonomy.json`, `Makefile`, `requirements.txt` are the backend (Hamza).
- A UI task never edits backend files. If the UI needs a data or schema change, note it for Hamza; he ships it in his own PR.

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
- No prose inside matrix cells; detail lives in the drawer.
- Tabular, lining numerals for every number. Hairlines over shadows. Light surface, navy brand.
- Sentence case. No em-dashes (use commas, colons, parentheses).

## Brand palette
navy `#00034D` (ink, chrome, brand) · cobalt `#253E9A` (interactive) · sky `#6183D8` · fog `#E2E2E2` (neutral fill) · aqua `#6CB4E4` · quartz `#8B8ED6`.

## Data
The dashboard reads a `DATA` object. Today it is a seed snapshot in `dashboard/data.js` generated from the OKF bundle; later it becomes a Supabase fetch. The source of truth is always the OKF markdown in `knowledge/`.
