-- 0001_init.sql — Competitor Intel: the lean projection schema.
--
-- Supabase is a DERIVED, rebuildable read layer. The OKF markdown bundle in
-- knowledge/ is the single source of truth; scripts/project_okf.py projects it
-- here one-way. Every column maps to something the dashboard shows. Tables and
-- columns are added back only when a view needs them (search index, separate
-- sources table, maturity 0-5, sub-rows, detections feed -> all deferred).

create table if not exists competitors (
  slug    text primary key,
  name    text not null,
  summary text                              -- per-competitor AI summary (top of a competitor view)
);

create table if not exists capabilities (  -- the 7 headline categories
  slug       text primary key,
  title      text not null,
  blurb      text,                          -- what the category means
  overall    text,                          -- "state of the field" one-liner (capability lens)
  sort_order int not null default 0
);

create table if not exists offerings (     -- one row per competitor x capability (~21)
  competitor         text not null references competitors(slug) on delete cascade,
  capability         text not null references capabilities(slug) on delete cascade,
  status             text not null default 'not_researched'
                       check (status in ('shipped','beta','announced','none','not_researched')),
  depth              text check (depth in ('basic','strong','market_leading')),  -- exec badge
  assessment         text,                          -- short description shown in the cell/drawer
  primary_source     text,                          -- the "learn more" link
  sources            jsonb not null default '[]',   -- [{title,url}] citations shown per cell
  needs_verification boolean not null default false,
  updated_at         timestamptz not null default now(),
  primary key (competitor, capability)
);

-- Read-mostly internal tool: anon may read everything; writes are service-role only
-- (the projector uses the service key, which bypasses RLS).
alter table competitors  enable row level security;
alter table capabilities enable row level security;
alter table offerings    enable row level security;

create policy anon_read_competitors  on competitors  for select using (true);
create policy anon_read_capabilities on capabilities for select using (true);
create policy anon_read_offerings    on offerings    for select using (true);
