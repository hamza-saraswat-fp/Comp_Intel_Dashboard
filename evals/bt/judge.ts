// Tolerant JSON judge, run on the OpenRouter judge model (cross-family vs the Anthropic
// answerer, per IAI-274). Ported from evals/lib/json-out.ts: plain streamText + robust
// extraction + zod validation + 3 retries — survives the occasional non-JSON completion.
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { z } from 'zod';

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
export const JUDGE_MODEL = process.env.BT_JUDGE_MODEL ?? 'openai/gpt-4o';

function extractJson(text: string): string {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const firstObj = t.indexOf('{');
  const firstArr = t.indexOf('[');
  const start = firstArr >= 0 && (firstObj < 0 || firstArr < firstObj) ? firstArr : firstObj;
  if (start < 0) return t;
  const open = t[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return t.slice(start, i + 1);
    }
  }
  return t.slice(start);
}

export async function judgeJson<T>(opts: { prompt: string; schema: z.ZodType<T>; maxOutputTokens?: number }): Promise<T> {
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    { role: 'user', content: opts.prompt + '\n\nRespond with ONLY a single valid JSON value (no prose, no markdown fences).' },
  ];
  let lastErr = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    let text = '';
    try {
      const stream = streamText({
        model: openrouter(JUDGE_MODEL),
        maxOutputTokens: opts.maxOutputTokens ?? 2000,
        messages,
      });
      for await (const delta of stream.textStream) text += delta;
      return opts.schema.parse(JSON.parse(extractJson(text)));
    } catch (e: unknown) {
      lastErr = String((e as Error)?.message ?? e).slice(0, 300);
      if (text.trim()) messages.push({ role: 'assistant', content: text.slice(0, 4000) });
      messages.push({
        role: 'user',
        content: text.trim()
          ? `That did not parse as JSON matching the schema (${lastErr}). Return ONLY the corrected JSON, starting with { or [.`
          : `You returned no usable output. Return ONLY the requested JSON now, starting with { or [.`,
      });
    }
  }
  throw new Error(`judgeJson failed after 3 attempts: ${lastErr}`);
}
