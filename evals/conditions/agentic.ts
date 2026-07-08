// Condition B: agentic retrieval — compact cached index + search_docs/read_doc
// tools in a multi-step loop (v6: stopWhen + stepCountIs). Approximates the
// production path (Supabase tsvector FTS + fetch-doc) with in-process BM25+.
import { tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { SYSTEM_RULES, cachedSystemMessage, runAnswer } from '../lib/anthropic.ts';
import { renderIndex } from '../lib/corpus.ts';
import { buildSearchIndex } from '../lib/search.ts';
import type { ManifestDoc } from '../lib/types.ts';
import type { Condition } from './types.ts';

const PREAMBLE = `\n\nYou do NOT have the full intel base in context. You have an index of it below, plus two tools:
- search_docs(query): full-text search; returns doc ids, titles, and snippets.
- read_doc(id): returns a document's full text.
Search first, then read the most relevant document(s) in full before answering. Read a document rather than answering from a snippet. If searches come up empty after a couple of reformulations, the intel base doesn't cover it.\n\n--- INTEL BASE INDEX ---\n\n`;

const MAX_STEPS = 8;

export function makeAgenticCondition(): Condition {
  let systemContent = '';
  let index: ReturnType<typeof buildSearchIndex> | null = null;
  let readTokens = 0; // rough per-question retrieved volume, reset per ask
  let docTokens = new Map<string, number>();

  return {
    id: 'B',
    async prepare(docs: ManifestDoc[]) {
      index = buildSearchIndex(docs);
      systemContent = SYSTEM_RULES + PREAMBLE + renderIndex(docs);
      docTokens = new Map(docs.map((d) => [d.id, d.tokens]));
    },
    async ask(q, _scale, coldNonce) {
      if (!index) throw new Error('prepare() not called');
      readTokens = 0;
      const idx = index;
      const tools = {
        search_docs: tool({
          description:
            'Full-text search over the competitor-intel documents. Returns up to 8 matches with id, title, and a snippet.',
          inputSchema: z.object({ query: z.string().describe('search terms') }),
          execute: async ({ query }: { query: string }) => idx.search(query),
        }),
        read_doc: tool({
          description: 'Read one document in full by id (ids appear in the catalog and in search results).',
          inputSchema: z.object({ id: z.string() }),
          execute: async ({ id }: { id: string }) => {
            const text = idx.readDoc(id);
            if (text) readTokens += docTokens.get(id) ?? Math.round(text.length / 4);
            return text ?? `No document with id "${id}".`;
          },
        }),
      };
      const answer = await runAnswer({
        messages: [cachedSystemMessage(systemContent, coldNonce), { role: 'user', content: q.question }],
        tools,
        stopWhen: stepCountIs(MAX_STEPS),
      });
      const indexTokens = Math.round(systemContent.length / 4);
      return { answer, tokensProvidedToModel: indexTokens + readTokens };
    },
  };
}
