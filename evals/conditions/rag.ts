// Condition C: vector RAG — contextual chunks, OpenAI embeddings, top-k
// injected into a single-shot prompt. k is fixed at 8 by default (sweep via
// EVAL_RAG_K for the sensitivity appendix).
import { SYSTEM_RULES, cachedSystemMessage, runAnswer } from '../lib/anthropic.ts';
import { chunkDoc, withContextHeaders, buildVectorIndex, renderChunksForPrompt, type Chunk } from '../lib/embed.ts';
import type { ManifestDoc } from '../lib/types.ts';
import type { Condition } from './types.ts';

const PREAMBLE = `\n\nYou will be given excerpts retrieved from the intel base for this question. Answer ONLY from these excerpts. If they don't contain the answer, say the intel base doesn't cover it (the excerpts are the only part of the intel base you can see).`;

export function makeRagCondition(k = Number(process.env.EVAL_RAG_K ?? 8)): Condition {
  let retriever: Awaited<ReturnType<typeof buildVectorIndex>> | null = null;

  return {
    id: 'C',
    async prepare(docs: ManifestDoc[]) {
      let chunks: Chunk[] = docs.flatMap(chunkDoc);
      chunks = await withContextHeaders(chunks);
      retriever = await buildVectorIndex(chunks);
    },
    async ask(q, _scale, coldNonce) {
      if (!retriever) throw new Error('prepare() not called');
      const retrieved = await retriever.retrieve(q.question, k);
      const excerpts = renderChunksForPrompt(retrieved);
      const answer = await runAnswer({
        messages: [
          // C's static prefix is just the rules — small, may sit below the min
          // cacheable size; that's part of the architecture's cost profile.
          cachedSystemMessage(SYSTEM_RULES + PREAMBLE, coldNonce),
          { role: 'user', content: `Retrieved excerpts:\n\n${excerpts}\n\nQuestion: ${q.question}` },
        ],
      });
      const providedTokens = Math.round(excerpts.length / 4);
      return { answer, tokensProvidedToModel: providedTokens };
    },
  };
}
