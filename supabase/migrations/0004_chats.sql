-- 0004_chats.sql — Ask Intel chat history (IAI-267).
-- One row per conversation; the full UI message transcript lives in `messages` (jsonb).
-- Written and read ONLY by the server functions (dashboard/api/chat.ts + chats.ts) via
-- the service-role key. RLS is enabled with NO policies, so the browser's anon key (which
-- the dashboard ships) can neither read nor write it — chat history stays server-mediated.
-- Apply in the Supabase SQL editor (or `supabase db push`) before using the chat.
create table if not exists chats (
  id         uuid primary key default gen_random_uuid(),
  title      text,
  messages   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chats_updated_at_idx on chats(updated_at desc);

-- Service-role only: RLS on, zero policies → anon/publishable key sees nothing.
alter table chats enable row level security;
