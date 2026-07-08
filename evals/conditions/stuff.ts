// Condition A: full-context stuffing — the whole corpus in one cached system message.
import { SYSTEM_RULES, cachedSystemMessage, runAnswer } from '../lib/anthropic.ts';
import { renderFullCorpus } from '../lib/corpus.ts';
import type { ManifestDoc } from '../lib/types.ts';
import type { Condition } from './types.ts';

const PREAMBLE = `\n\nThe complete intel base follows. Answer from it.\n\n--- INTEL BASE ---\n\n`;

export function makeStuffCondition(): Condition {
  let systemContent = '';
  let prefixTokens = 0;

  return {
    id: 'A',
    async prepare(docs: ManifestDoc[]) {
      systemContent = SYSTEM_RULES + PREAMBLE + renderFullCorpus(docs);
      prefixTokens = docs.reduce((n, d) => n + d.tokens, 0);
    },
    async ask(q, _scale, coldNonce) {
      const answer = await runAnswer({
        messages: [cachedSystemMessage(systemContent, coldNonce), { role: 'user', content: q.question }],
      });
      return { answer, tokensProvidedToModel: prefixTokens };
    },
  };
}
