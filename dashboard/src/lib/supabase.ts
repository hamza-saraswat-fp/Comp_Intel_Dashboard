// Minimal read-only Supabase access for the dashboard (IAI-241).
//
// The dashboard reads the derived tables straight from Supabase PostgREST with the
// project's ANON key (safe to ship client-side: the tables have read-only RLS).
// No SDK — a single fetch helper keeps the bundle lean, matching the project's
// zero-dependency ethos. Config comes from Vite env (set in .env.local locally and
// in Vercel → Project Settings → Environment Variables, Production + Preview):
//   VITE_SUPABASE_URL        https://<ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY   the anon / publishable key (NOT service_role)

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Fetch every row of a table via PostgREST. Throws with a clear message on misconfig or HTTP error. */
export async function q<T>(table: string): Promise<T[]> {
  if (!URL || !ANON) {
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (set them in .env.local and in Vercel).')
  }
  const res = await fetch(`${URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  })
  if (!res.ok) throw new Error(`Supabase ${table} → HTTP ${res.status}`)
  return (await res.json()) as T[]
}
