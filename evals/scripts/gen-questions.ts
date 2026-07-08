// Generates the CANDIDATE gold question set directly from corpus docs — never
// through any of the three systems under test. Output goes to
// questions.candidates.json for human/verifier review; the reviewed file is
// saved as questions.json (frozen).
//
// Bias controls: the generator is instructed to paraphrase away from doc wording
// (verbatim phrasing favors BM25; pure paraphrase favors embeddings — we ask for
// natural PM/exec phrasing), and the category mix is fixed.
import 'dotenv/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { EVALS_ROOT, docsForScale, loadManifest, readDocText } from '../lib/corpus.ts';
import { JUDGE_MODEL } from '../lib/anthropic.ts';
import { generateJson } from '../lib/json-out.ts';

const QuestionsSchema = z.array(
  z.object({
    question: z.string(),
    category: z.enum(['single-doc', 'cross-doc', 'aggregate', 'unanswerable']),
    answerable: z.boolean(),
    key_facts: z.array(z.string()),
    gold_doc_ids: z.array(z.string()),
    notes: z.string().optional(),
  }),
);

const manifest = loadManifest();
const docs = docsForScale(manifest, 'S'); // gold docs must all live in S
const corpus = docs
  .map((d) => `<document id="${d.id}" title="${d.title}">\n${readDocText(d)}\n</document>`)
  .join('\n\n');

const TARGET = { 'single-doc': 12, 'cross-doc': 8, aggregate: 6, unanswerable: 4 };

const { value: output } = await generateJson({
  model: JUDGE_MODEL,
  maxOutputTokens: 32000,
  schema: QuestionsSchema,
  prompt: `You are building a gold question set to evaluate an internal competitor-intel chatbot for FieldPulse (rivals: ServiceTitan, Housecall Pro, Jobber). The corpus it will be tested against follows at the end.

Return a JSON array of exactly ${Object.values(TARGET).reduce((a, b) => a + b, 0)} question objects with this category mix:
- ${TARGET['single-doc']} single-doc: answerable from ONE document (fact lookups, workflow details, prices, statuses).
- ${TARGET['cross-doc']} cross-doc: require synthesizing 2+ documents (comparisons across competitors or across topics).
- ${TARGET.aggregate} aggregate: matrix-style sweeps ("list every…", "which competitor leads…", "how many…").
- ${TARGET.unanswerable} unanswerable: plausible intel questions the corpus does NOT cover (revenue figures, headcount, unreleased roadmaps, competitors not in the corpus). key_facts=[] and gold_doc_ids=[] for these; answerable=false.

Rules:
- Phrase questions the way a busy product manager or exec would ask in chat — natural language, NOT copied phrasing from the docs (paraphrase concepts; avoid reusing distinctive multi-word strings from the corpus).
- key_facts: 2-5 ATOMIC facts, each a SHORT single clause (not a paragraph), independently checkable, with the specific value/name/date. Facts must be true per the corpus as of its as_of dates. Keep each fact under ~25 words.
- gold_doc_ids: the exact document id(s) (from the id attribute) that support the facts.
- Spread coverage across ALL document types: capability matrix cells, teardowns (estimates/invoices, price book, and others present), pricing profiles, detections, competitor/capability profiles.
- Include a few time-sensitive ones (where as_of/dates matter) and a couple touching needs_verification or unverified items (the right answer flags the uncertainty).

CORPUS:
${corpus}`,
});

const qs = output.map((q, i) => ({
  id: `q${String(i + 1).padStart(2, '0')}`,
  ...q,
}));
writeFileSync(join(EVALS_ROOT, 'questions.candidates.json'), JSON.stringify(qs, null, 1));
console.log(`wrote ${qs.length} candidate questions → questions.candidates.json (review, then save as questions.json)`);
