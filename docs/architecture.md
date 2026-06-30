# Backend architecture — git storage + Supabase

How Competitor Intel stores its knowledge and serves it fast. The one rule: **the OKF
markdown bundle in `knowledge/` is the single source of truth; Supabase is a derived,
disposable copy** projected one-way from it.

## The flow

```
edit markdown in knowledge/  →  PR  →  validate_okf.py (gate)  →  merge to main
   →  GitHub Action (.github/workflows/project-okf.yml):  validate  →  project_okf.py
   →  Supabase (Postgres)  →  the dashboard reads Supabase
```

Nothing is hand-entered into Postgres. Drop the whole database and re-run `project_okf.py`
and you get an identical DB back — that disposability is the proof the source of truth
never splits.

## Where everything lives

```
knowledge/                 # SOURCE OF TRUTH — the OKF bundle (markdown + YAML frontmatter)
  competitors/<slug>.md    # one per competitor; body "# AI summary"
  capabilities/<id>.md     # the 7 categories; frontmatter description (blurb), body "# State of the field"
  offerings/<comp>/<cap>.md# competitor x capability cell: status/depth/primary_source + "# Assessment" + "# Citations"
  index.md  log.md         # reserved OKF files (listing + dated history)
taxonomy.json              # canonical 7-category list (hand-edited); seeds gen_skeleton + the monitor
scripts/
  gen_skeleton.py          # taxonomy.json -> knowledge/ skeleton (idempotent; preserves edits below the okf marker)
  okf_parser.py            # the one shared reader (frontmatter + sections + citations)
  validate_okf.py          # conformance gate (frontmatter + type; valid status/depth; real slug refs)
  project_okf.py           # the projector: knowledge/ -> Supabase (upsert + prune)
supabase/migrations/0001_init.sql   # the schema (below)
.github/workflows/project-okf.yml   # validate -> project on merge
dashboard/                 # the UI (owned separately) — reads Supabase
```

Each markdown cell has an `<!-- okf:generated -->` marker: the frontmatter above it is
regenerable by `gen_skeleton.py`; everything below it (the researched prose) is owned by
whoever edits it and is never clobbered.

## The schema (lean by design)

Three tables, every column tied to something the dashboard shows. ~21 rows today.

| table | columns | serves |
|---|---|---|
| `competitors` | `slug, name, summary` | the per-competitor view header |
| `capabilities` | `slug, title, blurb, overall, sort_order` | the 7 categories + the capability lens |
| `offerings` | `(competitor, capability) PK, status, depth, assessment, primary_source, sources jsonb, needs_verification, updated_at` | each competitor×category cell |

`status ∈ {shipped, beta, announced, none, not_researched}`; `depth ∈ {basic, strong, market_leading}`
(the exec badge that replaces a raw 0–5 score). Anon read-only RLS; the projector writes with
the service-role key.

**Deliberately not built yet** (added back only when a view needs them — the markdown keeps the
data regardless): full-text search index, a separate sources table, maturity 0–5, the 12 sub-rows,
long-form detail, the `detections` "what's new" feed, and any internal bookkeeping columns.

## Running it

```bash
make gen        # regenerate the skeleton from taxonomy.json
make validate   # OKF conformance gate
make dry-run    # print the rows that would be projected (no DB, no deps)

# real projection (after the Supabase project exists):
pip install -r requirements.txt
export SUPABASE_URL=https://<ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<service-role key>
supabase link --project-ref <ref> && supabase db push   # apply 0001_init.sql
make project                                             # knowledge/ -> Supabase
```
