// Recent-chats list + single-chat load for resume (IAI-267).
//   GET /api/chats        → [{ id, title, updated_at }] most-recent first
//   GET /api/chats?id=... → { id, title, messages } | null
// Service-role reads via _supabase.ts. Gated by middleware.ts like every route.
import { listChats, getChat } from './_supabase.js';

export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get('id');
  const data = id ? await getChat(id) : await listChats();
  return Response.json(data);
}
