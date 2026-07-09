// Joins raw.jsonl (run records) with judged.jsonl (verdicts), aggregates by
// condition × scale, and writes summary.json + report.md. Headline metrics carry
// bootstrap 95% CIs; the report flags where CIs separate (a defensible winner)
// vs overlap (a tie — decide on cost/latency/ops).
//
// Usage: npx tsx report.ts --run-id r1
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EVALS_ROOT } from './lib/corpus.ts';
import { mean, bootstrapCI, ciSeparated } from './lib/stats.ts';
import type { JudgedRecord, RunRecord } from './lib/types.ts';

const runId = (() => {
  const i = process.argv.indexOf('--run-id');
  if (i < 0) throw new Error('missing --run-id');
  return process.argv[i + 1];
})();
const dir = join(EVALS_ROOT, 'results', runId);
const raw: RunRecord[] = readFileSync(join(dir, 'raw.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const judged: JudgedRecord[] = readFileSync(join(dir, 'judged.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

const runByKey = new Map(raw.map((r) => [`${r.condition}|${r.scale}|${r.qId}|${r.repeat}`, r]));
const conditions = [...new Set(raw.map((r) => r.condition))].sort();
const scales = [...new Set(raw.map((r) => r.scale))].sort();

interface Cell {
  n: number;
  factRecall: number; factRecallCI: [number, number];
  factPrecision: number;
  groundedness: number;
  citationPrecision: number; citationRecall: number;
  refusalAccuracy: number;
  ttftWarmMs: number; totalWarmMs: number;
  costWarm: number; costCold: number;
  tokensToModel: number;
  stepsAvg: number;
}

function agg(cond: string, scale: string): Cell {
  const js = judged.filter((j) => j.condition === cond && j.scale === scale);
  const recalls = js.map((j) => j.factRecall);
  const warm = js.map((j) => runByKey.get(`${j.condition}|${j.scale}|${j.qId}|${j.repeat}`)).filter((r): r is RunRecord => !!r && r.coldOrWarm === 'warm');
  const cold = js.map((j) => runByKey.get(`${j.condition}|${j.scale}|${j.qId}|${j.repeat}`)).filter((r): r is RunRecord => !!r && r.coldOrWarm === 'cold');
  const refusalGraded = js.filter((j) => j.refusalCorrect !== null);
  return {
    n: js.length,
    factRecall: mean(recalls),
    factRecallCI: bootstrapCI(recalls),
    factPrecision: mean(js.map((j) => j.factPrecision)),
    groundedness: mean(js.map((j) => j.groundednessRate).filter((x): x is number => x !== null)),
    citationPrecision: mean(js.map((j) => j.citationPrecision).filter((x): x is number => x !== null)),
    citationRecall: mean(js.map((j) => j.citationRecall).filter((x): x is number => x !== null)),
    refusalAccuracy: refusalGraded.length ? refusalGraded.filter((j) => j.refusalCorrect).length / refusalGraded.length : NaN,
    ttftWarmMs: mean(warm.map((r) => r.ttftVisibleMs)),
    totalWarmMs: mean(warm.map((r) => r.totalMs)),
    costWarm: mean(warm.map((r) => r.costUsd)),
    costCold: mean(cold.map((r) => r.costUsd)),
    tokensToModel: mean(warm.map((r) => r.tokensProvidedToModel)),
    stepsAvg: mean(warm.map((r) => r.steps.length)),
  };
}

const cells: Record<string, Cell> = {};
for (const c of conditions) for (const s of scales) cells[`${c}|${s}`] = agg(c, s);

const n = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : '—');
const money = (x: number) => (Number.isFinite(x) ? `$${x.toFixed(4)}` : '—');

let md = `# Retrieval eval — results (${runId})\n\n`;
md += `Conditions: ${conditions.join(', ')} · Scales: ${scales.join(', ')} · Judged records: ${judged.length}\n\n`;
md += `A = full-context stuffing · B = agentic retrieval (BM25+ tools) · C = vector RAG (OpenAI embeddings)\n\n`;

for (const s of scales) {
  md += `## Scale ${s}\n\n`;
  md += `| Condition | n | fact recall (95% CI) | fact prec. | grounded | cite prec. | cite recall | refusal acc. | ttft warm | total warm | cost warm | cost cold | tokens→model | avg steps |\n`;
  md += `|---|--|--|--|--|--|--|--|--|--|--|--|--|--|\n`;
  for (const c of conditions) {
    const x = cells[`${c}|${s}`];
    if (!x || x.n === 0) continue;
    md += `| **${c}** | ${x.n} | ${n(x.factRecall)} [${n(x.factRecallCI[0])}, ${n(x.factRecallCI[1])}] | ${n(x.factPrecision)} | ${n(x.groundedness)} | ${n(x.citationPrecision)} | ${n(x.citationRecall)} | ${n(x.refusalAccuracy)} | ${Math.round(x.ttftWarmMs)}ms | ${Math.round(x.totalWarmMs)}ms | ${money(x.costWarm)} | ${money(x.costCold)} | ${Math.round(x.tokensToModel)} | ${n(x.stepsAvg, 1)} |\n`;
  }
  md += `\n`;
  // Winner determination on fact recall
  const present = conditions.filter((c) => cells[`${c}|${s}`]?.n);
  const ranked = [...present].sort((a, b) => cells[`${b}|${s}`].factRecall - cells[`${a}|${s}`].factRecall);
  if (ranked.length >= 2) {
    const top = cells[`${ranked[0]}|${s}`], second = cells[`${ranked[1]}|${s}`];
    const sep = ciSeparated(top.factRecallCI, second.factRecallCI);
    md += sep
      ? `**Quality:** ${ranked[0]} leads on fact recall and its CI separates from ${ranked[1]} — a defensible difference at ${s}.\n\n`
      : `**Quality:** ${ranked[0]} and ${ranked[1]} are within CI on fact recall at ${s} — treat as a tie; decide on cost, latency, and ops.\n\n`;
  }
}

// Cross-scale degradation view for condition A (the full-context question).
md += `## Full-context (A) degradation across scale\n\n`;
md += `| Scale | fact recall | grounded | ttft warm | cost warm | cost cold | tokens→model |\n|---|--|--|--|--|--|--|\n`;
for (const s of scales) {
  const x = cells[`A|${s}`];
  if (!x?.n) continue;
  md += `| ${s} | ${n(x.factRecall)} | ${n(x.groundedness)} | ${Math.round(x.ttftWarmMs)}ms | ${money(x.costWarm)} | ${money(x.costCold)} | ${Math.round(x.tokensToModel)} |\n`;
}
md += `\n> Note: costs use standard Sonnet-5 pricing; intro pricing (through 2026-08-31) is ~33% lower. Cost priced from usage.inputTokenDetails (cache-aware), not raw inputTokens.\n`;

writeFileSync(join(dir, 'summary.json'), JSON.stringify(cells, null, 2));
writeFileSync(join(dir, 'report.md'), md);
console.log(`wrote ${join(dir, 'report.md')} and summary.json`);
console.log(md);
