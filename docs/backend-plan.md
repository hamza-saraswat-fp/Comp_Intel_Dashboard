# Competitor Intel — Backend / Infrastructure Plan (Supabase + OKF)

*Source-of-truth plan for the dashboard backend. Drafted 2026-06-29.*

## Context

UI work has moved to a separate team. The remaining focus is the **backend/infrastructure**: a good database (Supabase), good loading time, and a properly-understood **OKF** workflow for ongoing knowledge-base management. The monitors (`comp_intel_monitor`) already work well and are **explicitly out of scope to re-architect**.

Today the "database" is markdown-in-git (the `ai-competitor-intel/knowledge/` OKF bundle — 99 files, 48 offering cells) plus a regenerated static `dashboard/data.json`. There is no query layer, no search, no detection-event history. The current written spec even says *"Memory Store, not a database; no Supabase in MVP"* — so adding Supabase is a deliberate, recorded evolution (spec updates listed below).

This plan was produced from a 3-architecture design study (minimal-projection / Supabase-forward / OKF-purist) + adversarial synthesis. All three converged on the same spine.

## The decision (the core architectural call)

**OKF git-markdown stays the SINGLE source of truth; Supabase is a derived, fully-rebuildable read/search layer projected from it.** Postgres is authoritative for *nothing* about the domain — it holds no column the bundle lacks, and the entire DB can be dropped and rebuilt deterministically from git (`make rebuild-db`). That disposability is the structural proof the source of truth has not split.

Why not "Supabase as the primary database": it would split/abandon the cited, diffable, PR-reviewed source of truth; force an admin-UI + review-queue to edit facts safely (the exact RBAC/snapshot machinery the prior app collapsed under); and buy *zero* extra speed — projecting OKF into Postgres already gives 100% of the query/search/loading win. Supabase-primary is only right for many-user live editing / high write volume, none of which applies (48 cells, periodic research passes, small team, review-as-a-feature).

## Architecture — five layers, data flows one direction (OKF → derived views)

1. **Source of truth** — the existing `ai-competitor-intel/knowledge/` OKF v0.1 bundle. Every fact (status, maturity, `needs_verification`, Assessment/Detail/Citations prose, the `<!-- okf:generated -->` split) lives here and only here. Authored via `scaffold.py` + hand-edits below the marker; gated by `scripts/validate_okf.py`.
2. **Parse layer** — a **shared parser module** extracted from `scripts/build_dashboard_data.py` (`parse_frontmatter`, `first_heading_section`, the `[title](url)` citation regex). Both the existing `data.json` builder **and** the new projector import this one module, so JSON and Postgres can never disagree (CI assertion enforces it).
3. **Projection layer** — a new `scripts/project_okf.py`: a sibling of `build_dashboard_data.py` (same inputs, Postgres sink instead of JSON). Full deterministic reconcile each run (upsert-all-present + delete-where-key-absent), `content_hash` to no-op unchanged rows.
4. **Derived read layer** — Supabase managed Postgres: flat projected tables + a generic `concepts` mirror for type-agnostic full-text search. Auto-generated PostgREST/`supabase-js` API; generated `tsvector` + GIN for instant FTS; anon read-only RLS.
5. **Serving layer (hybrid, static-first)** — the existing `dashboard/index.html` keeps loading `dashboard/data.js` (`window.OKF_DATA`) for an instant, DB-independent, `file://`-openable first paint; the UI team's *dynamic* affordances (search box, recent-detections feed, `needs_verification`/status/capability filters) query Supabase directly.

**Data flow:** edit markdown → PR → `validate_okf.py` gate (CI) → squash-merge → GitHub Action (`paths: knowledge/**`) runs validate → `build_dashboard_data.py` (data.json/js) → `project_okf.py` (upsert + prune) → Supabase reflects it. The detector runtime is untouched; its durable output reaches the DB only as a reviewed OKF PR the same projector picks up.

## Supabase schema (the projected tables)

- **competitors** — `slug PK, name, summary, is_fieldpulse bool, okf_path, updated_at`. From `competitors/*.md`.
- **capabilities** — `slug PK, title, description, sort_order int, okf_path`. The stable 12-capability taxonomy (preserves `scaffold.py` order).
- **offerings** (core 48-cell matrix) — `competitor → competitors(slug), capability → capabilities(slug), status CHECK(available|beta|announced|partial|none|unknown), maturity int CHECK 0–5, summary (# Assessment), detail (# Detail), needs_verification bool, tags text[], cell_timestamp, content_hash, okf_path, fts tsvector GENERATED (summary||detail) STORED; PK(competitor,capability); GIN(fts); idx(capability); idx(status); partial idx(needs_verification) WHERE needs_verification`.
- **offering_sources** — `id PK, competitor, capability, title, url; FK(competitor,capability)→offerings ON DELETE CASCADE; UNIQUE(competitor,capability,url)`. From each cell's `# Citations`. Enables "show every claim's source" + "which cells lack citations."
- **detections** (live feed) — `id PK (date-slug), competitor → competitors, competitor_name, what, kind CHECK(new|expansion|rebrand|announcement-only), source_url, significance CHECK(high|med|low), classification CHECK(SIGNIFICANT|MINOR|UNCLEAR), first_seen date, capability → capabilities NULL, okf_path, created_at; idx(competitor); idx(first_seen desc)`. Mirrors the detector's `FeatureRecord` verbatim; **projected from `knowledge/detections/*.md`, not written by the receiver.**
- **concepts** (Phase 1+) — `okf_path PK, type NOT NULL, title, description, tags text[], cell_timestamp, content_hash, body_md, fts tsvector GENERATED STORED; GIN(fts); idx(type); GIN(tags)`. Type-agnostic 1:1 mirror of *every* non-reserved `.md` (incl. `references/`, `roadmap/`). One universal search surface; honors OKF permissive consumption.
- **(optional) okf_sync_runs** (Phase 1) — `git_sha, counts, ok/error, ran_at`. Makes a stale dashboard diagnosable.

Expose stable **VIEWs** (`v_matrix` = offerings⋈competitors⋈capabilities; `v_live_feed`) so the UI codes against views and tables can be refactored underneath.

## Sync design

- **Script:** `scripts/project_okf.py` in `ai-competitor-intel`, **reusing the shared parser** (do not fork it). Walks `knowledge/`, computes `content_hash = sha256(normalized cell)`, upserts via `supabase-py`/PostgREST `.upsert(rows, {onConflict})`. Conflict keys: `competitors.slug`, `capabilities.slug`, `offerings(competitor,capability)`, `concepts.okf_path`, `detections.id`, `offering_sources(competitor,capability,url)`.
- **Trigger:** `.github/workflows/project-okf.yml`, `on: push: branches:[main], paths:['knowledge/**']`. Steps: `validate_okf.py` (HARD gate — abort projection if non-conformant) → `build_dashboard_data.py` → `project_okf.py`, using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` as Action secrets (never client-side).
- **Idempotency / safety:** natural keys + `content_hash` ⇒ unchanged rows are no-ops; absent keys pruned by delete-where-not-in-current-set (cheap at 48 cells). **Sanity-floor guard:** refuse the delete pass if parsed file count < 50 (a partial checkout can't wipe the DB). Every run is a full reconcile, so a missed/failed run self-heals on the next merge; `python scripts/project_okf.py` rebuilds from scratch.
- **Anti-drift:** CI assertion that projected `offerings` rows == the `data.json` matrix.

## Detector integration (decision)

**The receiver writes NOTHING to Supabase in the MVP.** `comp_intel_monitor/src/server.ts` stays byte-for-byte as-is. Detections reach Postgres via **generate-and-review**: a SIGNIFICANT `FeatureRecord` becomes a small OKF concept `knowledge/detections/<date>-<slug>.md` (`type: Detection` + the FeatureRecord fields), landed as a human-approved PR; on merge the same `project_okf.py` reads it into `detections`. This preserves generate-and-review, keeps the "never touch FieldPulse" guarantee (receiver writes no knowledge), and adds zero new secret/failure mode to the only thing we host. (Deferred escape hatch, only on a concrete sub-minute-feed need: a best-effort `insert` the receiver POSTs *after* a successful Slack post — not MVP.)

## Search decision

**Postgres full-text (tsvector) NOW; pgvector LATER.** Stored generated `tsvector` + GIN over `summary||detail` (offerings) and `title||description||body_md` (concepts), queried via `websearch_to_tsquery('english', $q)` through PostgREST `.textSearch()`. A few lines of DDL the projector maintains automatically; serves "everything accessible easily" over the hand-edited prose `data.json` never exposed; single-digit-ms at this size. **pgvector deferred** (embedding pipeline = over-build for 48 cells of controlled vocabulary); pre-provision a nullable `offerings.embedding` column so enabling it later needs no migration.

## OKF workflow (the operating manual — what to actually do)

Five-step loop from `ai-competitor-intel/skill/SKILL.md`: **capture → enrich → cross-check → verify → publish**.
1. **Author:** `python3 scaffold.py .` to add a competitor/capability (idempotent; splits each file on `<!-- okf:generated -->` and preserves the hand-edited tail). The marker is the human/agent co-editing contract: boilerplate above is regenerable, prose below is owned.
2. **Deep-dive:** hand-edit *below the marker* — rewrite `# Assessment`, fill `# Detail` (packaging, pricing, GA/beta, limits, FieldPulse comparison), set frontmatter `status`/`maturity`/`needs_verification`, bump `timestamp`. **Every status/maturity claim needs a citation** in `# Citations`; new sources become `references/<slug>.md`.
3. **Cross-check:** pose the same questions to a second engine; on disagreement set `needs_verification: true` and note it — never silently pick a winner.
4. **Validate:** `python3 scripts/validate_okf.py` is the merge gate (parseable frontmatter + non-empty `type`; broken links/missing descriptions are soft warnings). Runs pre-commit *and* in the Action before any projection.
5. **FieldPulse:** rows stay `unknown`/`needs_verification: true` until Eva / Emerging Technology confirms — never from the open web.
6. **Publish + history:** dated entry in `log.md` each pass; git diffs are the per-cell history; all updates (incl. agent-written + detections) land as human-approved PRs.

Net: you manage knowledge by editing markdown and merging PRs; every derived view (data.json **and** Supabase) follows automatically. Supabase changes none of this — it's just a fast lens onto the bundle.

## Loading-time wins

1. Instant, DB-independent first paint — projector still emits the static `data.js` (`<script src>`, works under `file://`).
2. Matrix pre-parsed once at merge time (flat indexed rows) instead of a 99-file walk per request.
3. FTS in single-digit ms via stored `tsvector` + GIN (no request-time parsing/model calls).
4. Every filter is an index lookup (composite PK + `capability`/`status`/partial `needs_verification` indexes).
5. Recent-activity feed = cheap top-N via `first_seen desc` index.
6. No cold-start app hop — clients hit auto-generated PostgREST (optionally through VIEWs); latency is Postgres + edge.

## Phased plan (anti-bloat — first slice is the smallest real-value thing)

- **Phase 0 — Foundation.** Update the spec line (below). Create the Supabase project **in Evan's workspace** (alongside Railway), Hamza admin. One migration: `competitors`/`capabilities`/`offerings`/`offering_sources` with PKs, CHECKs, the index set, the generated `tsvector`+GIN; anon read-only RLS. Extract the shared parser; write `scripts/project_okf.py`; seed the 48 cells locally. **Verify:** projected `offerings` == `data.json` matrix; status/capability filters indexed; `websearch_to_tsquery` returns expected cells in single-digit ms; drop + re-project to prove disposability.
- **Phase 1 — Automation + universal search.** Add `project-okf.yml` Action (validate → build → project) with `content_hash` idempotency, prune, sanity-floor guard. Add the generic `concepts` mirror + its FTS. Optional `okf_sync_runs` audit + "last synced `<sha>`". **Verify:** merge a trivial `knowledge/` PR → Action green → Postgres reflects it with no manual steps; a failed validate aborts projection and leaves last-good rows.
- **Phase 2 — Detections feed (via OKF, reviewed).** Introduce `knowledge/detections/` (`type: Detection`, FeatureRecord verbatim); extend the projector to populate `detections`. Optional helper that drafts a detection PR from a SIGNIFICANT FeatureRecord (receiver still untouched). **Verify:** sample detection PR → merge → appears in `detections` ordered `first_seen desc`; `server.ts` unchanged.
- **Phase 3 — Deferred, only on concrete need (may never happen).** pgvector + hybrid FTS/vector once corpus > 15 competitors *and* keyword recall visibly misses paraphrases; OR a best-effort receiver→Supabase insert for sub-minute feed latency if Product needs it beyond Slack.

## Anti-bloat guardrails (what we deliberately do NOT build)

No queue/scheduler/app-server/ORM/Next.js/Vercel/Inngest (the stack that collapsed). Receiver writes nothing to Supabase. No RBAC/multi-tenant auth/snapshot tables (git is the versioning; anon read-only RLS is the whole auth story). No pgvector now. No 75-competitor scale machinery. No forking the parser. Postgres is never hand-edited and never a source of truth (rebuild-from-bundle test). One-directional sync only. `data.json` stays as the instant fallback.

## Spec updates needed (CLAUDE.md rule: keep local + Linear in sync)

- `Competitor-Intel-MVP.md` "This replaces any external database for the MVP." → record Supabase as a **derived read store / projection** of the OKF bundle (not a source of truth, not written by the receiver); Memory Store remains the detector's runtime dedup store.
- The "out of scope: dashboard/UI" note (both CLAUDE.md files) → clarify the dashboard **backend/data layer** (Supabase projection + search + feed) is now in scope; UI rendering is a separate team's.
- Apply the same edits to the Linear source-of-truth mirror so they don't drift.
- `ai-competitor-intel/CLAUDE.md` → add: `data.json` and Supabase are both generated consumers of the shared parser; never hand-edit either; Supabase is read-side only; any write path must be an OKF PR.

## Open questions (resolved defaults)

- **Supabase account:** ✅ **Evan's workspace** (with Railway), Hamza admin. *(answered)*
- **Repo for `project_okf.py` + Action:** default `ai-competitor-intel` (sibling of `build_dashboard_data.py`; shared-parser is a local import; `paths: knowledge/**` lives with the bundle).
- **Detections modeling:** default standalone `knowledge/detections/*.md` concepts (clean frontmatter the parser already handles); `log.md` stays human narrative.
- **Detection-PR authoring:** default manual at first; add a draft-PR helper only if volume makes manual capture tedious — never touching the receiver.
- **External exposure:** assume internal-only (anon read-only RLS + publishable key); revisit only if it goes public.

## Verification (end to end)

- `python scripts/project_okf.py` locally seeds 48 cells; CI assertion `projected offerings == data.json matrix` passes.
- Supabase queries: status/capability filters use indexes; `websearch_to_tsquery` over `summary` returns expected cells in single-digit ms.
- Drop schema + re-project ⇒ identical DB (disposability proof).
- Merge a `knowledge/` PR ⇒ Action runs validate → build → project green; Postgres reflects the change with no manual steps; a deliberately malformed file fails validate and aborts the projection (last-good rows remain).
