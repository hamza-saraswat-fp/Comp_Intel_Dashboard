// The Braintrust experiment runner. Env-driven so one file serves every run:
//   BT_SUBSET=3            smoke on the first 3 questions
//   CHAT_MODEL=...         answerer model (default anthropic/claude-sonnet-5)
//   BT_TEMP=0.2            temperature variant (omit for prod default)
//   BT_TRIALS=4            repeat each question N× → consistency (pass^k)
//   BT_EXPERIMENT=name     experiment label in the Braintrust UI
//   BT_JUDGE_MODEL=...     judge model (default openai/gpt-4o, cross-family)
//
// Run: npx tsx bt/askintel.eval.ts   (needs BRAINTRUST_API_KEY + OPENROUTER_API_KEY in .env)
import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Eval } from 'braintrust';
import { buildTask } from './task.ts';
import { scorers } from './scorers.ts';
import { cases } from './data.ts';

const subset = process.env.BT_SUBSET ? Number(process.env.BT_SUBSET) : undefined;
const trials = process.env.BT_TRIALS ? Number(process.env.BT_TRIALS) : 1;
const model = process.env.CHAT_MODEL ?? 'anthropic/claude-sonnet-5';
const temperature = process.env.BT_TEMP !== undefined ? Number(process.env.BT_TEMP) : undefined;
const experimentName =
  process.env.BT_EXPERIMENT ??
  `${model.split('/').pop()}${temperature !== undefined ? `-t${temperature}` : ''}${trials > 1 ? `-x${trials}` : ''}`;

const data = cases(subset);
console.log(`running "${experimentName}": ${data.length} questions × ${trials} trial(s), model=${model}, temp=${temperature ?? 'default'}`);

const res = await Eval('Ask Intel', {
  data: () => data,
  task: buildTask({ model, temperature }),
  scores: scorers,
  experimentName,
  trialCount: trials,
  maxConcurrency: 3,
  metadata: { model, temperature: temperature ?? 'default', trials, judge: process.env.BT_JUDGE_MODEL ?? 'openai/gpt-4o' },
});

// Dump per-run judged rows for records + human calibration.
const results = (res.results ?? []) as Array<{ input: unknown; output: unknown; scores: Record<string, number | null>; metadata?: unknown }>;
mkdirSync('bt/results', { recursive: true });
writeFileSync(`bt/results/${experimentName}.jsonl`, results.map((r) => JSON.stringify(r)).join('\n') + '\n');

// Consistency (pass^k): a run "passes" the rubric if the key dimensions clear their bars.
const passes = (s: Record<string, number | null>) =>
  (s.FactCoverage ?? 0) >= 0.75 &&
  (s.Groundedness == null || s.Groundedness >= 0.8) &&
  (s.CitationValidity == null || s.CitationValidity >= 0.999) &&
  (s.RefusalAccuracy ?? 0) === 1;

if (trials > 1) {
  const byQ = new Map<string, boolean[]>();
  for (const r of results) {
    const k = String(r.input);
    if (!byQ.has(k)) byQ.set(k, []);
    byQ.get(k)!.push(passes(r.scores));
  }
  let meanRate = 0;
  let allPass = 0;
  for (const [, p] of byQ) {
    meanRate += p.filter(Boolean).length / p.length;
    if (p.every(Boolean)) allPass++;
  }
  const q = byQ.size;
  console.log(`\n=== consistency: ${trials} trials × ${q} questions ===`);
  console.log(`mean per-question pass rate: ${(meanRate / q).toFixed(3)}`);
  console.log(`pass^${trials} (all trials pass): ${(allPass / q).toFixed(3)}  (${allPass}/${q})`);
}
console.log(`\nresults → bt/results/${experimentName}.jsonl · view in the Braintrust UI under project "Ask Intel"`);
