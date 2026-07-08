// Matrix runner: conditions × scales × questions, SEQUENTIAL within each cell
// (Anthropic cache entries only become readable after the first response starts
// streaming — parallel identical-prefix calls would all pay cold-write price and
// corrupt the cost comparison). Resumable: existing records in raw.jsonl are skipped.
//
// Usage:
//   npx tsx run.ts --run-id r1 --conditions A,B --scales S0,S
//   npx tsx run.ts --run-id r1 --conditions A,B,C --scales S,M,L
//   npx tsx run.ts --run-id r1 --conditions A --scales M --repeats 3 --subset 10   (variance pass)
import 'dotenv/config';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EVALS_ROOT, docsForScale, loadManifest } from './lib/corpus.ts';
import { extractCitations } from './lib/anthropic.ts';
import { makeStuffCondition } from './conditions/stuff.ts';
import { makeAgenticCondition } from './conditions/agentic.ts';
import { makeRagCondition } from './conditions/rag.ts';
import type { Condition } from './conditions/types.ts';
import type { GoldQuestion, RunRecord, Scale } from './lib/types.ts';

// q1 is the cold sample (first question in a session — the realistic cold case).
// Trimmed run uses 1 to avoid paying extra full-price cache writes; the warm
// path (q2+) is the common case and is what the cost comparison hinges on.
const COLD_SAMPLES = Number(process.env.EVAL_COLD_SAMPLES ?? 1);

function arg(name: string, fallback?: string): string {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  if (fallback !== undefined) return fallback;
  throw new Error(`missing --${name}`);
}

const runId = arg('run-id');
const conditionIds = arg('conditions', 'A,B,C').split(',') as ('A' | 'B' | 'C')[];
const scales = arg('scales', 'S').split(',') as Scale[];
const repeats = Number(arg('repeats', '1'));
const subset = Number(arg('subset', '0')); // 0 = all questions

const manifest = loadManifest();
const questions: GoldQuestion[] = JSON.parse(
  readFileSync(join(EVALS_ROOT, 'questions.json'), 'utf8'),
);
const resultsDir = join(EVALS_ROOT, 'results', runId);
mkdirSync(resultsDir, { recursive: true });
const rawPath = join(resultsDir, 'raw.jsonl');

const done = new Set<string>();
if (existsSync(rawPath)) {
  for (const line of readFileSync(rawPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as RunRecord;
    done.add(`${r.condition}|${r.scale}|${r.qId}|${r.repeat}`);
  }
  console.log(`resuming: ${done.size} records already present`);
}

function makeCondition(id: 'A' | 'B' | 'C'): Condition {
  if (id === 'A') return makeStuffCondition();
  if (id === 'B') return makeAgenticCondition();
  return makeRagCondition();
}

const qs = subset > 0 ? questions.slice(0, subset) : questions;

for (const scale of scales) {
  const docs = docsForScale(manifest, scale);
  if (docs.length === 0) {
    console.warn(`scale ${scale}: no docs in manifest, skipping`);
    continue;
  }
  console.log(`\n=== scale ${scale}: ${docs.length} docs, ~${docs.reduce((n, d) => n + d.tokens, 0)} tokens ===`);

  for (const cid of conditionIds) {
    const condition = makeCondition(cid);
    console.log(`-- condition ${cid} @ ${scale}: preparing…`);
    await condition.prepare(docs);

    for (let rep = 0; rep < repeats; rep++) {
      for (let qi = 0; qi < qs.length; qi++) {
        const q = qs[qi];
        const key = `${cid}|${scale}|${q.id}|${rep}`;
        if (done.has(key)) continue;

        // Cold/warm protocol: on the main pass (rep 0), the first COLD_SAMPLES
        // questions are designated cold — q index 0 is naturally cold, the next
        // ones get a nonce that busts the prefix cache. Everything else is warm.
        const isCold = rep === 0 && qi < COLD_SAMPLES;
        const coldNonce = isCold && qi > 0 ? `${runId}-${scale}-${cid}-${qi}` : undefined;

        const started = new Date().toISOString();
        try {
          const { answer, tokensProvidedToModel } = await condition.ask(q, scale, coldNonce);
          const record: RunRecord = {
            runId,
            condition: cid,
            scale,
            qId: q.id,
            repeat: rep,
            coldOrWarm: isCold ? 'cold' : 'warm',
            text: answer.text,
            citations: extractCitations(answer.text),
            steps: answer.steps,
            usage: answer.usage,
            totalUsage: answer.totalUsage,
            ttftFirstEventMs: Math.round(answer.ttftFirstEventMs),
            ttftVisibleMs: Math.round(answer.ttftVisibleMs),
            totalMs: Math.round(answer.totalMs),
            costUsd: answer.costUsd,
            tokensProvidedToModel,
            timestamp: started,
          };
          appendFileSync(rawPath, JSON.stringify(record) + '\n');
          done.add(key);
          const cache = record.totalUsage;
          console.log(
            `${cid}@${scale} ${q.id} rep${rep} ${record.coldOrWarm} | ttft ${record.ttftVisibleMs}ms total ${record.totalMs}ms | $${record.costUsd.toFixed(4)} | cacheR ${cache.cacheReadTokens} cacheW ${cache.cacheWriteTokens} | steps ${record.steps.length}`,
          );
          // Cache tripwire: warm runs on A/B must show cache reads.
          if (!isCold && cid !== 'C' && cache.cacheReadTokens === 0) {
            console.warn(`⚠️  ${key}: warm run with cacheReadTokens=0 — cache silently invalidated?`);
          }
        } catch (err: any) {
          const msg = String(err?.message ?? err).slice(0, 500);
          console.error(`✗ ${key}: ${msg}`);
          appendFileSync(
            join(resultsDir, 'errors.jsonl'),
            JSON.stringify({ key, error: msg, timestamp: started }) + '\n',
          );
          // Overloaded/rate-limit: brief backoff, don't mark done (resume re-runs it).
          await new Promise((r) => setTimeout(r, 15_000));
        }
      }
    }
  }
}
console.log('\nrun complete.');
