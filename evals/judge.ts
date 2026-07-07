// Blind rubric judge + groundedness + programmatic citation/refusal checks.
// The correctness judge NEVER sees which condition produced an answer: citation
// links are normalized to opaque [S1]-style tokens before grading, and grading
// order is shuffled deterministically.
//
// Usage: npx tsx judge.ts --run-id r1
import 'dotenv/config';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { EVALS_ROOT, loadManifest, readDocText } from './lib/corpus.ts';
import { JUDGE_MODEL } from './lib/anthropic.ts';
import type { GoldQuestion, JudgedRecord, RunRecord } from './lib/types.ts';

const runId = (() => {
  const i = process.argv.indexOf('--run-id');
  if (i < 0) throw new Error('missing --run-id');
  return process.argv[i + 1];
})();

const manifest = loadManifest();
const questions: GoldQuestion[] = JSON.parse(readFileSync(join(EVALS_ROOT, 'questions.json'), 'utf8'));
const qById = new Map(questions.map((q) => [q.id, q]));
const resultsDir = join(EVALS_ROOT, 'results', runId);
const records: RunRecord[] = readFileSync(join(resultsDir, 'raw.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l));

const judgedPath = join(resultsDir, 'judged.jsonl');
const judged = new Set<string>();
if (existsSync(judgedPath)) {
  for (const line of readFileSync(judgedPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as JudgedRecord;
    judged.add(`${r.condition}|${r.scale}|${r.qId}|${r.repeat}`);
  }
}

// URL → owning docs (a URL can appear in several docs).
const urlToDocs = new Map<string, Set<string>>();
for (const d of manifest.docs) {
  for (const u of d.sourceUrls) {
    if (!urlToDocs.has(u)) urlToDocs.set(u, new Set());
    urlToDocs.get(u)!.add(d.id);
  }
}

function blind(text: string): { blinded: string; urls: string[] } {
  const urls: string[] = [];
  const blinded = text.replace(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, (_m, label, url) => {
    urls.push(url);
    return `${label} [S${urls.length}]`;
  });
  return { blinded, urls };
}

const CorrectnessSchema = z.object({
  facts: z.array(
    z.object({ fact: z.string(), covered: z.enum(['yes', 'partial', 'no']) }),
  ),
  unsupported_claims: z
    .array(z.string())
    .describe('substantive factual claims in the answer that are NOT among the listed key facts and NOT mere framing'),
  refusal: z.boolean().describe('true if the answer declines/says the intel base does not cover it'),
});

const GroundednessSchema = z.object({
  claims: z.array(z.object({ claim: z.string(), supported: z.boolean() })),
});

// Deterministic shuffle (mulberry32 seeded by runId) so grading order doesn't
// correlate with condition order without introducing nondeterminism across resumes.
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

for (const r of seededShuffle(records, runId)) {
  const key = `${r.condition}|${r.scale}|${r.qId}|${r.repeat}`;
  if (judged.has(key)) continue;
  const q = qById.get(r.qId);
  if (!q) continue;

  const { blinded, urls } = blind(r.text);

  // --- Judge call 1: correctness against the key-fact checklist (blind) ---
  const correctness = await generateText({
    model: anthropic(JUDGE_MODEL),
    maxOutputTokens: 2000,
    output: Output.object({ schema: CorrectnessSchema }),
    messages: [
      {
        role: 'user',
        content: `You are grading an answer against a key-fact checklist. Ignore style, length, and formatting entirely; grade ONLY against the checklist. Citation markers like [S1] are normalized artifacts — ignore them.

Question: ${q.question}

Key facts a correct answer must contain:
${q.key_facts.map((f, i) => `${i + 1}. ${f}`).join('\n') || '(none — this question is not answerable from the knowledge base; a correct answer declines)'}

Answer to grade:
"""
${blinded}
"""

For each key fact, mark covered yes/partial/no. List substantive factual claims that go beyond the key facts as unsupported_claims (framing, hedges, and restatements of the question don't count). Set refusal=true if the answer declines or says the knowledge base doesn't cover it.`,
      },
    ],
  });
  const c = (correctness as any).output as z.infer<typeof CorrectnessSchema>;

  const yes = c.facts.filter((f) => f.covered === 'yes').length;
  const partial = c.facts.filter((f) => f.covered === 'partial').length;
  const factRecall = q.key_facts.length === 0 ? (c.refusal ? 1 : 0) : (yes + 0.5 * partial) / q.key_facts.length;
  const supported = yes + partial;
  const factPrecision =
    supported + c.unsupported_claims.length === 0 ? 1 : supported / (supported + c.unsupported_claims.length);

  // --- Judge call 2: groundedness vs cited docs (or gold docs if none cited) ---
  let grounded: { claim: string; supported: boolean }[] | null = null;
  let groundednessRate: number | null = null;
  if (!c.refusal && q.answerable) {
    const citedDocIds = new Set<string>();
    for (const u of urls) for (const id of urlToDocs.get(u) ?? []) citedDocIds.add(id);
    const referenceIds = citedDocIds.size > 0 ? [...citedDocIds] : q.gold_doc_ids;
    const refDocs = manifest.docs.filter((d) => referenceIds.includes(d.id));
    if (refDocs.length > 0) {
      const refText = refDocs.map((d) => `# ${d.title}\n${readDocText(d)}`).join('\n\n').slice(0, 150_000);
      const g = await generateText({
        model: anthropic(JUDGE_MODEL),
        maxOutputTokens: 2000,
        output: Output.object({ schema: GroundednessSchema }),
        messages: [
          {
            role: 'user',
            content: `Break the answer below into its substantive factual claims (max 10) and mark each claim supported=true only if the reference documents support it.

Reference documents:
"""
${refText}
"""

Answer:
"""
${blinded}
"""`,
          },
        ],
      });
      grounded = ((g as any).output as z.infer<typeof GroundednessSchema>).claims;
      groundednessRate = grounded.length ? grounded.filter((x) => x.supported).length / grounded.length : null;
    }
  }

  // --- Programmatic checks ---
  let citationPrecision: number | null = null;
  let citationRecall: number | null = null;
  if (q.answerable && q.gold_doc_ids.length > 0) {
    const citedDocIds = new Set<string>();
    let known = 0;
    for (const u of urls) {
      const owners = urlToDocs.get(u);
      if (owners) {
        known++;
        for (const id of owners) citedDocIds.add(id);
      }
    }
    citationPrecision = urls.length === 0 ? null : known / urls.length; // cited URLs that exist in the corpus
    const goldHit = q.gold_doc_ids.filter((id) => citedDocIds.has(id)).length;
    citationRecall = goldHit / q.gold_doc_ids.length;
  }
  const refusalCorrect = q.answerable ? (c.refusal ? false : null) : c.refusal;

  const rec: JudgedRecord = {
    runId,
    condition: r.condition,
    scale: r.scale,
    qId: r.qId,
    repeat: r.repeat,
    factsCovered: c.facts.map((f) => f.covered),
    factRecall,
    unsupportedClaims: c.unsupported_claims,
    factPrecision,
    refusal: c.refusal,
    refusalCorrect,
    grounded,
    groundednessRate,
    citationPrecision,
    citationRecall,
    judgeModel: JUDGE_MODEL,
    timestamp: new Date().toISOString(),
  };
  appendFileSync(judgedPath, JSON.stringify(rec) + '\n');
  judged.add(key);
  console.log(
    `judged ${key}: recall ${factRecall.toFixed(2)} precision ${factPrecision.toFixed(2)} refusal=${c.refusal}`,
  );
}
console.log('judging complete.');
