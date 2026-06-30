# Comp Intel Dashboard

Home for the **Competitor Intel dashboard + backend** — the data layer that turns FieldPulse's competitor-AI knowledge base into something fast and queryable, plus the UI that reads it.

## What this is

Competitor Intel tracks what AI FieldPulse's FMS competitors (ServiceTitan, Housecall Pro, Jobber) are shipping, across a fixed **7-capability AI taxonomy**, for an exec-glanceable view. The knowledge lives **here** as an **Open Knowledge Format (OKF)** markdown bundle in [`knowledge/`](knowledge/) — the single source of truth. A small projector turns it into a **Supabase (Postgres)** copy the dashboard reads.

The guiding principle: **OKF markdown is where you author and the source of truth; Supabase is a disposable, auto-generated copy that exists purely for fast querying.** Edit markdown → a GitHub Action projects it into Postgres → the dashboard reads Postgres. Drop the DB and re-run the projector and you get an identical database back.

## The system at a glance

```
Firecrawl monitors → webhook → Managed Agent → Slack         (the detector — separate repo, works today)
        │
        └─(reviewed PR)→  knowledge/ OKF bundle  ──(Action: project_okf.py)──▶  Supabase  ──▶  dashboard/
                          (single source of truth)                              (fast read copy)     (UI)
```

## Layout

```
knowledge/      the OKF bundle — SOURCE OF TRUTH (3 competitors × 7 capabilities)
taxonomy.json   canonical 7-category list (hand-edited)
scripts/        gen_skeleton · okf_parser · validate_okf · project_okf
supabase/       migrations/0001_init.sql (the schema) + config.toml
dashboard/      the UI (owned separately) — reads Supabase
docs/           architecture.md, OKF-explained.md, the PRD, the backend plan
```

See **[docs/architecture.md](docs/architecture.md)** for the storage + Supabase design, and **[docs/OKF-explained.md](docs/OKF-explained.md)** if OKF is new to you.

## Quickstart

```bash
make gen        # (re)generate the knowledge/ skeleton from taxonomy.json
make validate   # OKF conformance gate
make dry-run    # print the rows that would be projected (no DB, no deps)
```

Real projection (after the Supabase project exists in Evan's workspace):

```bash
pip install -r requirements.txt
export SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key>
supabase link --project-ref <ref> && supabase db push   # apply the schema
make project                                             # knowledge/ → Supabase
```

## Status

Backend foundation built: the OKF skeleton (21 cells, all `not_researched`), the lean 3-table Supabase schema, the projector, and the sync Action. **Next:** create the Supabase project + apply the schema, then the deep-research seeding fills the cells.
