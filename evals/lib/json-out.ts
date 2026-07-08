// Robust JSON generation. We avoid the AI SDK's constrained structured-output
// mode (Output.object) here: with Sonnet 5's always-on adaptive thinking and
// large inputs it intermittently throws NoOutputGeneratedError. Plain text
// generation + tolerant extraction + zod validation is model-agnostic and
// survives an unattended batch run. One retry on parse failure.
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { z } from 'zod';
import type { PricedModel } from './cost.ts';

function extractJson(text: string): string {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  // Grab the outermost object or array.
  const firstObj = t.indexOf('{');
  const firstArr = t.indexOf('[');
  const start =
    firstArr >= 0 && (firstObj < 0 || firstArr < firstObj) ? firstArr : firstObj;
  if (start < 0) return t;
  const open = t[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let esc = false;
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

export async function generateJson<T>(opts: {
  model: PricedModel;
  prompt: string;
  schema: z.ZodType<T>;
  maxOutputTokens?: number;
}): Promise<{ value: T; usage: any }> {
  const messages: any[] = [
    {
      role: 'user',
      content:
        opts.prompt +
        '\n\nRespond with ONLY a single valid JSON value (no prose, no markdown code fences, no commentary before or after).',
    },
  ];
  let lastErr = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    let text = '';
    let usage: any = undefined;
    try {
      // streamText avoids the SDK's non-streaming large-max_tokens timeout guard.
      const stream = streamText({
        model: anthropic(opts.model),
        maxOutputTokens: opts.maxOutputTokens ?? 8000,
        messages,
      });
      // Drain the stream ourselves so an empty/thinking-only completion yields ''
      // instead of throwing the uncatchable NoOutputGeneratedError from `.text`.
      for await (const delta of stream.textStream) text += delta;
      usage = await Promise.resolve(stream.usage).catch(() => undefined);
      const parsed = JSON.parse(extractJson(text));
      return { value: opts.schema.parse(parsed), usage };
    } catch (e: any) {
      lastErr = String(e?.message ?? e).slice(0, 300);
      if (process.env.EVAL_DEBUG) {
        console.error(`\n[json-out attempt ${attempt}] err: ${lastErr}\n--- raw (first 600) ---\n${text.slice(0, 600)}\n--- (len ${text.length}) ---\n`);
      }
      // If we got text, show it back and ask for a fix; if empty (no output),
      // just retry with a fresh, more forceful instruction.
      if (text.trim()) messages.push({ role: 'assistant', content: text.slice(0, 4000) });
      messages.push({
        role: 'user',
        content: text.trim()
          ? `That did not parse as JSON matching the required schema (${lastErr}). Return ONLY the corrected JSON value, nothing else — start your response with { or [.`
          : `You returned no usable output. Return ONLY the requested JSON value now, starting with { or [ — be brief.`,
      });
    }
  }
  throw new Error(`generateJson failed after 3 attempts: ${lastErr}`);
}
