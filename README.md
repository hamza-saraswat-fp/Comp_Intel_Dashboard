# Comp Intel Dashboard

Home for the **Competitor Intel dashboard backend** — the data layer that turns FieldPulse's competitor-AI knowledge base into something fast, queryable, and searchable.

## What this is

Competitor Intel automatically detects when FieldPulse's FMS competitors (ServiceTitan, Housecall Pro, Jobber) ship new AI features and tracks how each one stacks up across a fixed 12-capability AI taxonomy. The knowledge itself lives as an **Open Knowledge Format (OKF)** markdown bundle (the single source of truth, in the `ai-competitor-intel` repo). This repo is about the **backend that makes that knowledge fast to read**: a **Supabase (Postgres)** layer projected one-directionally from the OKF bundle, powering search, filtering, and the dashboard.

The guiding principle: **OKF markdown is where you author and the source of truth; Supabase is a disposable, auto-generated copy that exists purely for speed and querying.** Edit markdown → a GitHub Action projects it into Postgres → the dashboard reads Postgres. The DB can be dropped and rebuilt from git at any time.

## The system at a glance

```
Firecrawl monitors → webhook → Managed Agent → Slack            (the detector — works today, untouched)
        │
        └─(reviewed PR)→  OKF markdown bundle  ──(GitHub Action: project_okf.py)──▶  Supabase (Postgres)  ──▶  dashboard
                          (single source of truth)                                   (fast read/search copy)
```

## Docs

- **[docs/OKF-explained.md](docs/OKF-explained.md)** — what OKF is, what it's used for here, and how it fits with Supabase (start here if OKF is new to you).
- **[docs/backend-plan.md](docs/backend-plan.md)** — the full backend/infrastructure plan: the architecture decision, Supabase schema, the OKF→Postgres sync, search strategy, and the phased build.
- **[docs/Competitor-Intel-PRD.md](docs/Competitor-Intel-PRD.md)** — the product brief (problem, existing system, proposed solution, scope).

## Status

Seeding the repo with the foundational docs. Implementation follows the phased plan in `docs/backend-plan.md` (Phase 0: the Supabase projection of the existing 48-cell matrix).
