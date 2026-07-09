// Pricing + cost accounting. THE most important correctness detail in the harness:
// usage.inputTokens (AI SDK v6 + Anthropic provider) includes cached tokens
// (input + cache_creation + cache_read summed), so naive inputTokens * price
// over-bills warm-cache runs by ~10x. Always price from inputTokenDetails.
import type { UsageRollup } from './types.ts';

// USD per million tokens, standard list price (Sonnet 5 intro pricing through
// 2026-08-31 is $2/$10 — we report standard; the report notes the intro delta).
export const PRICES = {
  'claude-sonnet-5': { in: 3, out: 15 },
  'claude-opus-4-8': { in: 5, out: 25 },
  'claude-haiku-4-5': { in: 1, out: 5 },
  'text-embedding-3-small': { in: 0.02, out: 0 }, // verify against live OpenAI pricing before reporting
} as const;

export type PricedModel = keyof typeof PRICES;

const CACHE_WRITE_MULTIPLIER = 1.25; // 5-minute-TTL ephemeral cache write premium
const CACHE_READ_MULTIPLIER = 0.1;

export function costUsd(usage: UsageRollup, model: PricedModel): number {
  const p = PRICES[model];
  return (
    (usage.noCacheTokens * p.in +
      usage.cacheWriteTokens * p.in * CACHE_WRITE_MULTIPLIER +
      usage.cacheReadTokens * p.in * CACHE_READ_MULTIPLIER +
      usage.outputTokens * p.out) /
    1_000_000
  );
}

// Normalize an AI SDK v6 LanguageModelUsage into our rollup shape.
// Defensive: if inputTokenDetails is missing (should not happen with the
// Anthropic provider — assert in the smoke run), fall back to treating all
// input as uncached so cost is over- rather than under-stated.
export function toRollup(usage: any): UsageRollup {
  const d = usage?.inputTokenDetails ?? {};
  const noCache = d.noCacheTokens ?? usage?.inputTokens ?? 0;
  return {
    noCacheTokens: noCache,
    cacheReadTokens: d.cacheReadTokens ?? 0,
    cacheWriteTokens: d.cacheWriteTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
    reasoningTokens: usage?.outputTokenDetails?.reasoningTokens ?? 0,
    totalInputTokens: usage?.inputTokens ?? 0,
  };
}

export function addRollups(a: UsageRollup, b: UsageRollup): UsageRollup {
  return {
    noCacheTokens: a.noCacheTokens + b.noCacheTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    reasoningTokens: a.reasoningTokens + b.reasoningTokens,
    totalInputTokens: a.totalInputTokens + b.totalInputTokens,
  };
}

export const ZERO_USAGE: UsageRollup = {
  noCacheTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  outputTokens: 0,
  reasoningTokens: 0,
  totalInputTokens: 0,
};
