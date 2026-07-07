# Design: capability feature checklist (In-Product AI Copilot first)

*Status: proposed, for review. Date: 2026-07-07. Author: Jaden (with Claude). Branch: `jaden/copilot-feature-checklist`.*

## Summary

Add a feature-level comparison inside the capability drawer: a small grid that scores each player (ServiceTitan, Housecall Pro, Jobber, FieldPulse) against a fixed set of concrete features for a capability. Ship it first for **In-Product AI Copilot** and, in the same change, surface the already-researched `# Detail` prose that the projector currently drops.

This answers the depth half of Gabe's feedback ("more detail on their embedded AI"), and it is built so it stays current on its own pipeline rather than as a static snapshot.

## Goal and non-goals

**Goal:** a scannable "does X do this?" grid per capability, OKF-backed so it updates through the same pipeline as every other cell.

**Non-goals (deliberately out of scope for this PR):**
- Filling the FieldPulse column with real data (deferred, Jaden to source with Evan/Eva). FieldPulse shows `unknown` here for now.
- The AI assistant / chat over the data.
- Re-plumbing the dashboard onto the `wgsr` auto-monitoring system.
- A checklist for the other 6 capabilities (the pattern generalizes later, one capability proves it).
- Marketing-content and voice rows (fold into the Marketing and Contact-Agent capabilities instead).

## The update guarantee (why this is not a one-off)

The checklist is **data in the OKF**, never hardcoded in the UI. It rides the existing pipeline:

`edit OKF markdown → PR → validate → merge → project_okf.py → Supabase → dashboard reads live`

So when a competitor changes (e.g. Jobber graduates Copilot out of beta): the monitor flags it into `#competitor-ai` + the What's New feed (automatic), a person edits that offering's `# Features` marks and citations (deliberate, reviewed step), the projector upserts on merge, and the website reflects it on next load. The only non-automatic step is a human turning an article into a cited fact, which is the intended quality gate. Because the checklist lives in the same tables and projection as `status`/`assessment`, it cannot silently fall out of date while the rest updates.

This PR also recommends enabling the auto-projection GitHub Action (see below) so the projection step stops being manual.

## Data model

Two new `jsonb` columns (matching the existing `sources jsonb` pattern, no new tables) plus surfacing detail:

- `capabilities.features` — the row definitions for that capability: `[{ key, title, sort_order }]`. Empty for capabilities without a checklist.
- `offerings.features` — each competitor's marks: `[{ key, value, note? }]`, where `value ∈ { yes, partial, no, unknown }`.
- `offerings.detail` — the `# Detail` prose (currently parsed in the OKF but dropped by the projector).

### OKF authoring format

Row definitions live in the **capability** markdown (`knowledge/capabilities/in-product-copilot.md`), below the `okf:generated` marker:

```
# Features
- query-data: Query your business data
- reports-lists: Reports & filtered lists
- coaching: Coaching & advice
- field-tech-qa: Field / technician Q&A
- takes-actions: Takes actions, not just answers
- included-free: Included by default
```

(source order becomes `sort_order`.)

Marks live in each **offering** markdown (`knowledge/offerings/<comp>/in-product-copilot.md`):

```
# Features
- query-data: partial (office analytics in private preview; field-tech Q&A is GA)
- reports-lists: partial
- coaching: partial (Sales Coach in private preview)
- field-tech-qa: yes
- takes-actions: no
- included-free: partial (base Atlas free; office modules preview, equipment gated behind Field Pro)
```

Format per line: `- <key>: <value> (optional note)`. The value is the first token; the parenthetical is the note.

## The features (In-Product AI Copilot)

| key | title |
|---|---|
| `query-data` | Query your business data |
| `reports-lists` | Reports & filtered lists |
| `coaching` | Coaching & advice |
| `field-tech-qa` | Field / technician Q&A |
| `takes-actions` | Takes actions, not just answers |
| `included-free` | Included by default |

### Proposed marks (from the existing `# Detail` research, to be verified in review)

| feature | ServiceTitan | Housecall Pro | Jobber | FieldPulse |
|---|:---:|:---:|:---:|:---:|
| Query your business data | partial | yes | yes | unknown |
| Reports & filtered lists | partial | yes | partial | unknown |
| Coaching & advice | partial | yes | yes | unknown |
| Field / technician Q&A | yes | no | no | unknown |
| Takes actions, not just answers | no | no | no | unknown |
| Included by default | partial | yes | yes | unknown |

Notes: ServiceTitan `partial`s reflect office analytics/coaching being private-preview (only field-tech Q&A is GA). The all-`no` "takes actions" row is real: none ship true action-taking yet, which is the gap FieldPulse/Eva can later own. FieldPulse stays `unknown` (honest gap) until sourced.

## Backend changes (Hamza's layer, in this PR for his review)

1. **Migration** `supabase/migrations/0004_features_detail.sql`:
   ```sql
   alter table capabilities add column if not exists features jsonb not null default '[]';
   alter table offerings   add column if not exists features jsonb not null default '[]';
   alter table offerings   add column if not exists detail   text;
   ```
2. **`scripts/okf_parser.py`**: add a small helper to parse a `# Features` section (the `- key: value (note)` list) into structured rows. Reuse the existing `section()` reader.
3. **`scripts/project_okf.py`** `build_rows()`: for capabilities, project `features` from the capability `# Features` section; for offerings, project `features` from the offering `# Features` section and `detail` from `# Detail`.
4. **`scripts/validate_okf.py`**: soft-validate that each offering feature `value ∈ {yes,partial,no,unknown}` and its `key` exists in the parent capability's feature defs (warn, do not hard-fail, to match the existing gate's tone).
5. **OKF content**: add the `# Features` sections to `knowledge/capabilities/in-product-copilot.md` and the three `knowledge/offerings/<comp>/in-product-copilot.md` files (`# Detail` already exists).

## UI changes (Jaden's layer)

1. **`src/data.ts`**: extend `Offering` with `features: {key,value,note?}[]` and `detail: string | null`; extend `Capability` with `features: {key,title,sort_order}[]`. `FIELDPULSE_OFFERINGS` gets `features: []` and `detail: null` (renders as `unknown`).
2. **`src/lib/loadData.ts`**: fetch and map the new columns.
3. **`src/components/FeatureMatrix.tsx`** (new): given a capability's feature defs and the four players' offerings, render a grid, feature titles down the left, players across the top, one glyph per cell. `partial` exposes its note on hover; `unknown` uses the honest-gap treatment.
4. **`src/components/CapabilityDrawer.tsx`**: after the overall-summary block, if `cap.features?.length`, render `<FeatureMatrix>`. In the expanded player card, show `o.detail` (the deep, cited writeup) with the existing show-more pattern, falling back to `assessment` when detail is absent.
5. **Glyphs**: shape-first and colorblind-safe per the design rules (shape carries meaning, color only reinforces). `yes` filled, `partial` half, `no` dash, `unknown` hollow. Numerals/hairlines consistent with the rest of the board.
6. **Graceful degradation**: a capability with no feature defs renders no matrix (every other drawer is unchanged); a missing mark for a defined key renders `unknown`.

## Enable auto-projection (recommended, in this PR)

Add `.github/workflows/project-okf.yml` (the workflow already drafted in `docs/ci-workflow.md`) so the projector runs on every merge to `main` touching `knowledge/`. Hamza adds the two repo secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Caveat: committing under `.github/workflows/` needs a push token with the `workflow` scope; if the push is rejected, Hamza adds that one file. Keep the `validate_okf.py` hard gate, and add a failure notification so a silently failed sync is noticeable.

## How it ships and applies

Our Supabase access token is read-only, so the migration and re-projection against the live DB (`comp-intel-dashboard`, ref `jlgyvtlejacoubioufbp`) are applied by Hamza on merge (his key), via `supabase db push` + `make project`, or automatically once the Action is enabled. The UI degrades gracefully, so merging the UI before the backend is applied shows no matrix rather than breaking. Left as one open PR for Hamza to review; do not self-merge a backend-touching PR.

## Verification

- `make dry-run` shows the new `features` and `detail` fields parsed into the projected rows (no DB needed).
- UI rendered locally against mock feature data (until Hamza applies the migration), with a preview screenshot of the Copilot drawer showing the matrix.
- Confirm graceful degradation: the other six capability drawers are unchanged.
- After Hamza applies the migration + projection: verify the live drawer shows the marks and the surfaced detail.

## Risks and open questions

- **Drawer width.** The drawer is a narrow slide-out; a 6-row by 4-column grid is tight. Plan: compact glyph columns and wrapped/abbreviated feature labels; if still cramped, drop to 5 rows or stack on the narrowest widths.
- **Detail length.** `# Detail` is multi-paragraph; use the existing collapsible show-more so the card does not become a wall of text.
- **Mark accuracy.** The proposed marks are my read of the existing Detail research; Hamza verifies in review, and they are cited by each cell's existing sources.
