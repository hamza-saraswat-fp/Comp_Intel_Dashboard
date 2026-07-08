// Shared model setup, system rules, and the streaming runner that all three
// conditions execute through — identical maxOutputTokens, retries, and metric
// capture so latency/cost comparisons are apples-to-apples.
import 'dotenv/config';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { toRollup, addRollups, ZERO_USAGE, costUsd, type PricedModel } from './cost.ts';
import type { StepRecord, UsageRollup } from './types.ts';

export const ANSWER_MODEL = (process.env.EVAL_ANSWER_MODEL ?? 'claude-sonnet-5') as PricedModel;
export const JUDGE_MODEL = (process.env.EVAL_JUDGE_MODEL ?? 'claude-opus-4-8') as PricedModel;
export const MAX_OUTPUT_TOKENS = 4000;

// Mirrors the production Ask-Intel system rules (Ask-Intel-Chat-Plan.md §7).
// The retrieval-specific preamble differs per condition (appended by each
// condition module); these core rules are byte-identical across conditions.
export const SYSTEM_RULES = `You are the Competitor Intel assistant for FieldPulse's internal dashboard. You answer questions about how FieldPulse's field service management rivals (ServiceTitan, Housecall Pro, Jobber) compare — their products, workflows, pricing, and AI capabilities.

Grounding rules:
- Answer ONLY from the intel base provided to you. If it does not contain the answer, say plainly: "The intel base doesn't cover that yet." and suggest the closest covered topic. Never answer from outside knowledge about these companies, and never invent sources, dates, features, prices, or numbers.
- Cite claims as markdown links [Title](url) using source URLs that appear in the intel base, placed at the end of the relevant sentence or bullet. Never fabricate a URL. If a claim has no source in the intel base, say it is unsourced.
- Assessments carry as-of dates; qualify time-sensitive answers with them. If something is marked needing verification or unverified, say so.
- FieldPulse's own capabilities are not yet assessed in this system. Never estimate or inflate FieldPulse's standing; describe it as "not yet assessed".
- Use the intel base's status vocabulary (shipped, beta, announced, none, not assessed; depth: market leading, strong, basic).

Style: sentence case, no em-dashes (use commas, colons, or parentheses), concise and scannable, lead with the answer, bullets for comparisons, markdown allowed.`;

export interface AnswerResult {
  text: string;
  steps: StepRecord[];
  usage: UsageRollup;
  totalUsage: UsageRollup;
  ttftFirstEventMs: number;
  ttftVisibleMs: number;
  totalMs: number;
  costUsd: number;
}

/**
 * Run one answering call with full metric capture.
 * `messages` must already contain the condition's (cacheable) system message first.
 * `tools`/`stopWhen` are passed through for condition B; omit for A/C.
 */
export async function runAnswer(opts: {
  messages: any[];
  tools?: Record<string, any>;
  stopWhen?: any;
}): Promise<AnswerResult> {
  const t0 = performance.now();
  let ttftFirstEventMs = -1;
  const stepFirstText: number[] = [];
  let stepIdx = -1;

  const result = streamText({
    model: anthropic(ANSWER_MODEL),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    // cacheControl can only sit on a system message inside `messages` (not the
    // top-level `system` param), so we opt into that explicitly.
    allowSystemInMessages: true,
    messages: opts.messages,
    ...(opts.tools ? { tools: opts.tools, toolChoice: 'auto' as const } : {}),
    ...(opts.stopWhen ? { stopWhen: opts.stopWhen } : {}),
  });

  for await (const part of result.fullStream) {
    if (ttftFirstEventMs < 0) ttftFirstEventMs = performance.now() - t0;
    if (part.type === 'start-step') stepIdx++;
    if (part.type === 'text-delta') {
      const i = Math.max(stepIdx, 0);
      if (stepFirstText[i] === undefined) stepFirstText[i] = performance.now() - t0;
    }
    if (part.type === 'error') {
      throw new Error(`stream error: ${JSON.stringify((part as any).error).slice(0, 500)}`);
    }
  }
  const totalMs = performance.now() - t0;

  const [text, rawUsage, rawTotalUsage, rawSteps] = await Promise.all([
    result.text,
    result.usage,
    result.totalUsage,
    result.steps,
  ]);

  const steps: StepRecord[] = (rawSteps ?? []).map((s: any) => ({
    toolCalls: (s.toolCalls ?? []).map((c: any) => ({ toolName: c.toolName, input: c.input })),
    usage: s.usage ? toRollup(s.usage) : null,
  }));

  const usage = toRollup(rawUsage);
  // totalUsage should already sum steps; recompute defensively if it lacks details.
  let totalUsage = toRollup(rawTotalUsage);
  if (totalUsage.noCacheTokens === totalUsage.totalInputTokens && steps.some((s) => s.usage?.cacheReadTokens)) {
    totalUsage = steps.reduce((acc, s) => (s.usage ? addRollups(acc, s.usage) : acc), ZERO_USAGE);
  }

  const ttftVisibleMs = stepFirstText.length ? stepFirstText[stepFirstText.length - 1] : totalMs;

  return {
    text,
    steps,
    usage,
    totalUsage,
    ttftFirstEventMs,
    ttftVisibleMs,
    totalMs,
    costUsd: costUsd(totalUsage, ANSWER_MODEL),
  };
}

/** The cacheable system message (must live in `messages`, not top-level `system`). */
export function cachedSystemMessage(content: string, cacheBustNonce?: string) {
  return {
    role: 'system' as const,
    content: cacheBustNonce ? `<!-- cold-sample ${cacheBustNonce} -->\n${content}` : content,
    providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } },
  };
}

export function extractCitations(text: string): string[] {
  const urls = new Set<string>();
  for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) urls.add(m[1]);
  return [...urls];
}
