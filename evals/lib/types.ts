// Shared types for the retrieval eval.

export type Scale = 'S0' | 'S' | 'M' | 'L';
export type ConditionId = 'A' | 'B' | 'C';

export interface ManifestDoc {
  id: string;               // e.g. offerings__servicetitan__customer-contact-agent
  title: string;
  path: string;             // relative to evals/ (corpus/real/... or corpus/synthetic/...)
  scales: Scale[];          // which corpus scales include this doc
  tokens: number;           // measured via Anthropic count_tokens against the answering model
  sourceUrls: string[];     // every http(s) URL that appears in the doc (citation ground truth)
  synthetic: boolean;
  abstract: string;         // first prose sentence(s), deterministic, for condition B's catalog
}

export interface Manifest {
  builtAt: string;
  model: string;            // model used for count_tokens sizing
  docs: ManifestDoc[];
  scaleTokens: Record<Scale, number>;
}

export interface GoldQuestion {
  id: string;               // q01...
  question: string;
  category: 'single-doc' | 'cross-doc' | 'aggregate' | 'unanswerable';
  answerable: boolean;
  key_facts: string[];      // atomic facts a correct answer must contain (empty for unanswerable)
  gold_doc_ids: string[];   // docs that support the answer (empty for unanswerable)
  notes?: string;
}

export interface UsageRollup {
  noCacheTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalInputTokens: number; // as reported by usage.inputTokens (includes cached)
}

export interface StepRecord {
  toolCalls: { toolName: string; input: unknown }[];
  usage: UsageRollup | null;
}

export interface RunRecord {
  runId: string;
  condition: ConditionId;
  scale: Scale;
  qId: string;
  repeat: number;            // 0 for the main pass; 1..n for variance repeats
  coldOrWarm: 'cold' | 'warm';
  text: string;
  citations: string[];       // markdown link URLs extracted from the answer
  steps: StepRecord[];       // condition B only; [] otherwise
  usage: UsageRollup;        // final-step usage
  totalUsage: UsageRollup;   // across steps (== usage for single-step conditions)
  ttftFirstEventMs: number;
  ttftVisibleMs: number;     // first text-delta of the final step
  totalMs: number;
  costUsd: number;           // priced from totalUsage via lib/cost.ts
  tokensProvidedToModel: number; // corpus/index/chunk tokens put in front of the model (context-budget visibility)
  error?: string;
  timestamp: string;
}

export interface JudgedRecord {
  runId: string;
  condition: ConditionId;
  scale: Scale;
  qId: string;
  repeat: number;
  factsCovered: ('yes' | 'partial' | 'no')[];
  factRecall: number;        // (yes + 0.5*partial) / total
  unsupportedClaims: string[];
  factPrecision: number;     // 1 - unsupported/(supported+unsupported), see judge.ts
  refusal: boolean;
  refusalCorrect: boolean | null; // only meaningful vs answerable flag
  grounded: { claim: string; supported: boolean }[] | null;
  groundednessRate: number | null;
  citationPrecision: number | null;
  citationRecall: number | null;
  judgeModel: string;
  timestamp: string;
}
