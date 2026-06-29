# OKF, explained (and how it fits with Supabase)

A plain-English primer on what the **Open Knowledge Format (OKF)** is, what it's used for in Competitor Intel, and how it works together with Supabase. Written for anyone picking up this project who hasn't used OKF before.

---

## What OKF is, in one line

It's just **a folder of markdown files with a small structured header (YAML frontmatter) on each one.** That's the entire format. "Open Knowledge Format" is a tidy convention — published by Google Cloud (v0.1, June 2026) — for storing knowledge as plain text files in git.

- The **only required** frontmatter field is `type`. Recommended ones: `title`, `description`, `resource`, `tags`, `timestamp`.
- Two reserved filenames: `index.md` (a directory listing) and `log.md` (a dated change history).
- Links between files assert relationships through the surrounding prose.
- Consumption is **permissive** by design: tolerate missing fields, unknown types, and broken links.
- The spec deliberately **says nothing about how you store, serve, or query** the data — that's left to "consumers" (which is exactly the door Supabase walks through, below).

> If you can `cat` a file, you can read OKF. If you can `git clone` a repo, you can ship it.

---

## What OKF is used for here

In the `ai-competitor-intel` repo, the OKF bundle **is the knowledge base** — the durable, cited record of *"what AI does each competitor have, how mature is it, and what's the proof."* Today it's ~99 markdown files:

```
knowledge/
  competitors/   servicetitan.md, housecall-pro.md, jobber.md, fieldpulse.md   (4)
  capabilities/  ai-voice-agent.md, ai-chat-sms-assistant.md, …  (the 12 AI categories)
  offerings/     servicetitan/ai-voice-agent.md, …               (4 × 12 = 48 "cells")
  references/    the source links
  roadmap/       FieldPulse gap notes
  index.md       directory listing
  log.md         dated change history
```

The **offering cells are the heart of it** — one file per *competitor × capability*:

```markdown
---
competitor: servicetitan
capability: ai-voice-agent
status: available        # structured fields → queryable
maturity: 4
needs_verification: false
---
<!-- okf:generated -->   # ↑ boilerplate above (regenerated)  ↓ human research below (owned)
# Assessment
AI Voice Agents powered by TI answer inbound calls 24/7…   # the human-written analysis
# Citations
[Titan Intelligence](https://servicetitan.com/…)            # the proof
```

So OKF does three jobs here:

1. **System of record** for competitor-AI knowledge — every status/maturity/assessment/citation lives in these files, and only here. The dashboard is *built from* them.
2. **A human + AI co-editing surface** — the `<!-- okf:generated -->` marker splits each file: boilerplate above (a script regenerates it) vs. hand-written research below (never clobbered). Humans, research agents, and the detector can all contribute safely.
3. **The review trail** — because it's markdown in git, every change is a PR with a diff. That's how "cite every claim" and "never inflate FieldPulse's own row" get enforced — they're just code review.

---

## OKF vs. the detector's Memory Store (don't confuse them)

There are **two different markdown stores** in this project:

| | **OKF bundle** (`ai-competitor-intel/knowledge/`) | **Memory Store** (`comp_intel_monitor`) |
|---|---|---|
| Purpose | The **published, cited knowledge base** | The detector agent's **dedup scratchpad** |
| Who reads it | Humans, the dashboard, Supabase | Only the Managed Agent, at runtime |
| What it holds | Competitor × capability assessments + sources | "We already alerted on feature X for competitor Y" |
| Reviewed? | Yes — every change is a PR | No — the agent appends to it autonomously |

The Memory Store stops the detector from re-alerting the same feature twice. The OKF bundle is the curated, durable picture everyone looks at. They are not the same thing.

---

## How OKF and Supabase work together

OKF is great for **authoring and trust**, but it's a folder of text files — you can't query it, search it, or load it fast. Supabase (managed Postgres) fixes exactly that, **without OKF and Supabase ever fighting**, because the relationship is strictly one-directional:

1. **You author knowledge as OKF markdown** — edit a file, open a PR, merge.
2. **On merge, a GitHub Action runs one script** (`project_okf.py`) that reads the markdown and copies the data into Supabase tables. **One direction only: markdown → Postgres.**
3. **Anything that needs to be fast** (the dashboard, full-text search, filters, the "what's new" feed) **reads from Supabase**, never from the raw files.
4. **Supabase is disposable** — it holds nothing the markdown doesn't, so if it ever drifts or breaks you just re-run the script and it's rebuilt from git (`make rebuild-db`).

> **OKF = where you author + the single source of truth.**
> **Supabase = a fast, queryable copy that's auto-generated from it.**

There's only ever **one place to edit a fact** (the markdown), and the database is always downstream. That disposability — the fact that the whole DB can be dropped and rebuilt deterministically from the bundle — is the structural proof that the source of truth has not split.

See [`backend-plan.md`](./backend-plan.md) for the full architecture, schema, and phased build.
