// Server-side Supabase access for chat history (IAI-267).
//
// Uses the SERVICE ROLE key (never shipped to the browser) over PostgREST. The `chats`
// table has RLS enabled with NO policies, so the dashboard's anon/publishable key can
// neither read nor write it — history is server-mediated only. Raw fetch, no SDK,
// mirroring src/lib/supabase.ts. If the env is unset (e.g. a local run without the
// service key), the functions degrade gracefully: chat still works, history is skipped.
const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface ChatRow {
  id: string;
  title: string | null;
  updated_at: string;
  messages?: unknown;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY as string}`,
    'content-type': 'application/json',
    ...extra,
  };
}

export async function saveChat(row: { id: string; title: string; messages: unknown }): Promise<void> {
  if (!BASE || !KEY) return;
  const res = await fetch(`${BASE}/rest/v1/chats?on_conflict=id`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify([
      { id: row.id, title: row.title, messages: row.messages, updated_at: new Date().toISOString() },
    ]),
  });
  if (!res.ok) console.error(`saveChat ${row.id} → HTTP ${res.status}: ${await res.text()}`);
}

export async function listChats(): Promise<ChatRow[]> {
  if (!BASE || !KEY) return [];
  const res = await fetch(
    `${BASE}/rest/v1/chats?select=id,title,updated_at&order=updated_at.desc&limit=50`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`listChats → HTTP ${res.status}`);
  return (await res.json()) as ChatRow[];
}

export async function getChat(id: string): Promise<ChatRow | null> {
  if (!BASE || !KEY) return null;
  const res = await fetch(
    `${BASE}/rest/v1/chats?select=id,title,messages&id=eq.${encodeURIComponent(id)}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`getChat → HTTP ${res.status}`);
  const rows = (await res.json()) as ChatRow[];
  return rows[0] ?? null;
}
