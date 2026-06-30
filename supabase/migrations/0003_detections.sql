-- 0003_detections.sql — the "what's new" feed.
-- Monitor detections (comp_intel_monitor) land in OKF as knowledge/detections/*.md via
-- reviewed PRs; project_okf.py projects them here. `capability` is NULLABLE so a detection
-- that fits none of the 7 categories still has a home (flagged for triage, never force-fit).
-- Apply in the Supabase SQL Editor (or `supabase db push`) before projecting detections.
create table if not exists detections (
  id           text primary key,                                      -- date-slug, e.g. 2026-07-01-servicetitan-atlas-voice
  competitor   text references competitors(slug) on delete set null,
  capability   text references capabilities(slug) on delete set null, -- nullable: uncategorized allowed
  what         text not null,
  kind         text check (kind in ('new','expansion','rebrand','announcement-only')),
  significance text check (significance in ('high','med','low')),
  source_url   text,
  first_seen   date,
  okf_path     text,
  created_at   timestamptz not null default now()
);
create index if not exists detections_first_seen_idx on detections(first_seen desc);

-- anon read-only (the dashboard's "recent activity" feed)
alter table detections enable row level security;
create policy anon_read_detections on detections for select using (true);
