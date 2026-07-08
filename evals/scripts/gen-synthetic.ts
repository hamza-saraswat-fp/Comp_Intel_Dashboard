// Generates SYNTHETIC EVAL FIXTURE distractor docs to scale the corpus to M/L,
// then validates them against the gold question set:
//   gate 1: no distractor can answer (fully or partially) any gold question
//   gate 2: no distractor contradicts any gold key_fact
// Distractors use fictional or uncovered competitors with value namespaces
// disjoint from gold facts, in the production teardown/pricing template.
// They are checked in under corpus/synthetic/ and NEVER merged into knowledge/.
//
// Usage: npx tsx scripts/gen-synthetic.ts --target-m 120000 --target-l 480000
import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { EVALS_ROOT, loadManifest } from '../lib/corpus.ts';
import { buildSearchIndex } from '../lib/search.ts';
import { generateJson } from '../lib/json-out.ts';
import type { GoldQuestion } from '../lib/types.ts';

const SYNTH_DIR = join(EVALS_ROOT, 'corpus/synthetic');
mkdirSync(SYNTH_DIR, { recursive: true });

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const targetM = Number(arg('target-m', '120000')); // total corpus tokens at M
const targetL = Number(arg('target-l', '480000'));

// Fictional/uncovered competitors — names + value namespaces disjoint from the gold three.
// (Real adjacent-vertical vendors deliberately NOT in the corpus + fictional ones.)
const DISTRACTOR_COMPETITORS = [
  'FieldRocket', 'ServiceGrove', 'TradeHalo', 'DispatchOwl', 'CrewNimbus',
  'JobSprocket', 'RouteFalcon', 'ProValve', 'SiteBeacon', 'WrenchWave',
  'FlowServe Pro', 'TorqueDesk', 'GableWorks', 'PermitPine', 'LadderLoop',
];
const TOPICS = [
  'Scheduling & dispatch', 'Payments, financing & checkout', 'CRM & customer communications',
  'Price book & catalog management', 'Reporting & analytics', 'Estimates & invoices',
  'Mobile technician app', 'Memberships & service agreements', 'Inventory & purchase orders',
  'Marketing & reviews', 'Timesheets & job costing', 'Integrations & API',
];
// ~10 near-miss docs: the GOLD competitors' NON-gold topic areas, but only topics
// far from what gold questions probe get generated as near-misses; validation gates still apply.
const NEAR_MISS = [
  ['Jobber', 'Inventory & purchase orders'],
  ['Housecall Pro', 'Timesheets & job costing'],
  ['ServiceTitan', 'Memberships & service agreements'],
  ['Jobber', 'Integrations & API'],
  ['Housecall Pro', 'Mobile technician app'],
  ['ServiceTitan', 'Marketing & reviews'],
  ['Jobber', 'Memberships & service agreements'],
  ['Housecall Pro', 'Integrations & API'],
  ['ServiceTitan', 'Mobile technician app'],
  ['Jobber', 'Timesheets & job costing'],
] as const;

const questions: GoldQuestion[] = JSON.parse(readFileSync(join(EVALS_ROOT, 'questions.json'), 'utf8'));
const goldFacts = questions.flatMap((q) => q.key_facts);

async function generateDistractor(competitors: string[], topic: string, scaleTag: 'M' | 'L', slug: string) {
  const outPath = join(SYNTH_DIR, `${slug}.md`);
  if (existsSync(outPath)) return outPath;
  // Plain markdown generation (streamText dodges the non-streaming large-output guard).
  const stream = streamText({
    model: anthropic('claude-sonnet-5'),
    maxOutputTokens: 12000,
    messages: [
      {
        role: 'user',
        content: `Write a realistic competitor-teardown markdown document for an eval corpus. It must LOOK exactly like a real field-service-software research teardown but be entirely synthetic.

Topic: ${topic}
Competitors covered: ${competitors.join(', ')}
${competitors.some((c) => ['Jobber', 'Housecall Pro', 'ServiceTitan'].includes(c)) ? 'These are real companies, but INVENT plausible-sounding but fictional feature names, prices, and details for this topic — this is a distractor fixture, accuracy is not the goal, non-collision is.' : 'These are fictional vendors: invent coherent products, UI details, plans, and prices.'}

Hard requirements:
- Start with EXACTLY this frontmatter (fill in):
---
type: Teardown
slug: ${slug}
topic: ${topic}
competitors: [${competitors.map((c) => c.toLowerCase().replace(/\s+/g, '-')).join(', ')}]
as_of: 2026-07-07
eval_scale: ${scaleTag}
synthetic: true
---
- Then the line: > SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.
- Structure: H1 title, intro, "## At a glance" comparison table, 4-5 numbered "## N · Section" sections with per-competitor bullet blocks, "## What it means for FieldPulse", "## Questions this raises", "## Source pages" (invent plausible-looking but clearly fictional URLs on example.com subdomains, e.g. https://help.fieldrocket.example.com/...).
- Length: 3,000-4,500 words.
- CRITICAL non-collision rules: do NOT assert anything about these specific subjects: real prices/plans of Jobber, Housecall Pro, or ServiceTitan; their real product names (Dispatch Pro, Pricebook Pro, CSR AI, AI Receptionist, Copilot, Titan Intelligence, Atlas, Marketing Pro, Wisetack); their estimate/invoice/price-book/dispatch/reporting/pricing facts. All invented numbers must avoid these values: ${JSON.stringify([...new Set(goldFacts.flatMap((f) => f.match(/\$?\d[\d,.]*%?/g) ?? []))]).slice(0, 1500)}.
Return only the full markdown document, starting with the frontmatter --- line. No code fences.`,
      },
    ],
  });
  let md = (await stream.text).trim();
  md = md.replace(/^```(?:markdown)?\s*\n?/, '').replace(/\n?```\s*$/, ''); // strip stray fences
  writeFileSync(outPath, md);
  console.log(`generated ${slug}.md (${md.length} chars)`);
  return outPath;
}

// --- Generation plan: enough docs to hit token targets (docs ~5.5K tokens each) ---
const manifest = loadManifest();
const realS = manifest.scaleTokens.S;
const perDoc = 5500;
const needM = Math.max(0, Math.ceil((targetM - realS) / perDoc));
const needL = Math.max(0, Math.ceil((targetL - targetM) / perDoc));
console.log(`S=${realS} tokens → generating ~${needM} M-docs and ~${needL} L-docs (~${perDoc} tokens each)`);

let made = 0;
// Near-miss docs first (M scale — the harder distractors).
for (const [comp, topic] of NEAR_MISS) {
  if (made >= needM) break;
  await generateDistractor([comp], topic, 'M', `nearmiss-${comp.toLowerCase().replace(/\s+/g, '-')}-${topic.toLowerCase().replace(/[^a-z]+/g, '-')}`);
  made++;
}
// Fictional-vendor teardowns fill the rest.
let i = 0;
while (made < needM) {
  const comps = [DISTRACTOR_COMPETITORS[i % DISTRACTOR_COMPETITORS.length], DISTRACTOR_COMPETITORS[(i + 1) % DISTRACTOR_COMPETITORS.length], DISTRACTOR_COMPETITORS[(i + 2) % DISTRACTOR_COMPETITORS.length]];
  const topic = TOPICS[i % TOPICS.length];
  await generateDistractor(comps, topic, 'M', `m-${String(i).padStart(2, '0')}-${topic.toLowerCase().replace(/[^a-z]+/g, '-')}`);
  made++; i++;
}
for (let j = 0; j < needL; j++) {
  const comps = [DISTRACTOR_COMPETITORS[(j * 3) % DISTRACTOR_COMPETITORS.length], DISTRACTOR_COMPETITORS[(j * 3 + 1) % DISTRACTOR_COMPETITORS.length]];
  const topic = TOPICS[j % TOPICS.length];
  await generateDistractor(comps, topic, 'L', `l-${String(j).padStart(2, '0')}-${topic.toLowerCase().replace(/[^a-z]+/g, '-')}`);
}

// --- Validation gates ---
console.log('\nvalidating distractors against gold questions…');
const synthDocs = readdirSync(SYNTH_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({
    id: `synthetic__${f.replace(/\.md$/, '')}`,
    title: f,
    path: `corpus/synthetic/${f}`,
    scales: ['M', 'L'] as any,
    tokens: 0,
    sourceUrls: [],
    synthetic: true,
    abstract: '',
  }));
const idx = buildSearchIndex(synthDocs as any);

const AnswerableSchema = z.object({ can_answer: z.boolean(), contradicts_facts: z.array(z.string()) });
let failures = 0;
for (const q of questions) {
  const hits = idx.search(q.question, 3);
  for (const h of hits) {
    const text = idx.readDoc(h.id)!;
    const { value: v } = await generateJson({
      model: 'claude-sonnet-5',
      maxOutputTokens: 800,
      schema: AnswerableSchema,
      prompt: `Question: ${q.question}\n\nGold facts (the true answer): ${JSON.stringify(q.key_facts)}\n\nDocument:\n"""${text.slice(0, 30000)}"""\n\nReturn EXACTLY this JSON: {"can_answer": true|false, "contradicts_facts": ["..."]}\ncan_answer: could this document be used to answer the question, fully OR partially? contradicts_facts: list any gold facts this document asserts a COMPETING value for (same subject, different value).`,
    });
    if (v.can_answer || v.contradicts_facts.length > 0) {
      failures++;
      console.error(`✗ GATE FAIL: ${h.id} vs ${q.id} — can_answer=${v.can_answer} contradicts=${JSON.stringify(v.contradicts_facts)}`);
    }
  }
}
if (failures > 0) {
  console.error(`\n${failures} gate failures — regenerate or delete the offending docs, then re-run.`);
  process.exit(1);
}
console.log('all distractors pass both gates. Re-run build-manifest to include them.');
