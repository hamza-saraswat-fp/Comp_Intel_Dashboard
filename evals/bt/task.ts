// The eval task = an exact replica of the production answer path. It imports the SAME
// grounding prompt and the SAME committed intel pack the deployed function uses
// (dashboard/api/_prompt.ts + _intel-pack.ts), and calls OpenRouter with the identical
// cache-control + Anthropic-pin options as dashboard/api/chat.ts. So an experiment score
// reflects what prod actually does, not a re-implementation.
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { SYSTEM_RULES, PREAMBLE } from '../../dashboard/api/_prompt.ts';
import { INTEL_PACK } from '../../dashboard/api/_intel-pack.ts';
import { deformatTransform } from '../../dashboard/api/_format.ts';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
const SYSTEM = SYSTEM_RULES + PREAMBLE + INTEL_PACK;

export interface TaskOpts {
  model?: string;
  temperature?: number;
}

/** Build the Braintrust task fn. `hooks.metadata` gets token usage for cost tracking. */
export function buildTask(opts: TaskOpts = {}) {
  const model = opts.model ?? process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-5';
  const anthropicCaching = model.startsWith('anthropic/');
  return async function task(question: string, hooks?: { metadata?: Record<string, unknown> }): Promise<string> {
    const res = streamText({
      model: openrouter(model),
      system: SYSTEM,
      messages: [{ role: 'user', content: question }],
      experimental_transform: [deformatTransform()], // same normalizer as prod chat.ts
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(anthropicCaching
        ? { providerOptions: { openrouter: { cache_control: { type: 'ephemeral' }, provider: { order: ['anthropic'] } } } }
        : {}),
    });
    const text = await res.text;
    try {
      const u = (await res.usage) as { inputTokens?: number; outputTokens?: number; cachedInputTokens?: number };
      if (hooks?.metadata) {
        hooks.metadata.inputTokens = u?.inputTokens;
        hooks.metadata.outputTokens = u?.outputTokens;
        hooks.metadata.cachedInputTokens = u?.cachedInputTokens;
      }
    } catch {
      /* usage is best-effort */
    }
    return text;
  };
}
