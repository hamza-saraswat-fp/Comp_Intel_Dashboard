// The rubric (IAI-272): accuracy, groundedness, citation validity, refusal accuracy,
// format/tone. Two LLM-judge scorers (ported from evals/judge.ts, run through the
// tolerant OpenRouter judge) + three deterministic programmatic scorers. Each returns a
// Braintrust score in [0,1] (or null to skip, e.g. groundedness on a refusal).
import { z } from 'zod';
import { judgeJson } from './judge.ts';
import { goldDocText, urlToDocs, type QMeta } from './data.ts';

// Braintrust passes loosely-typed metadata (BaseMetadata); narrow it to our shape.
type Args = { input: string; output: string; expected?: string[]; metadata?: Record<string, unknown> };
const asQ = (m?: Record<string, unknown>): QMeta =>
  (m ?? { id: '', category: '', answerable: true, gold_doc_ids: [] }) as unknown as QMeta;

// The system prompt mandates this exact sentinel, so refusal is a deterministic check.
const SENTINEL = /intel base (does\s?n['’]?t|does not) cover/i;
const refused = (output: string) => SENTINEL.test(output);

const citedUrls = (output: string) => [...output.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);

// --- Accuracy: fact coverage vs the gold key-fact checklist (blind rubric judge) ---
const CorrectnessSchema = z.object({
  coverage: z.array(z.enum(['yes', 'partial', 'no'])),
  unsupported_claims: z.array(z.string()),
  refusal: z.boolean(),
});

export async function FactCoverage({ input, expected, output }: Args) {
  const keyFacts = expected ?? [];
  const c = await judgeJson({
    schema: CorrectnessSchema,
    maxOutputTokens: 1500,
    prompt: `You are grading an answer against a key-fact checklist. Ignore style, length, and formatting; grade ONLY against the checklist. Citation markers like [S1] are artifacts, ignore them.

Question: ${input}

Key facts a correct answer must contain:
${keyFacts.map((f, i) => `${i + 1}. ${f}`).join('\n') || '(none — this question is not answerable from the intel base; a correct answer declines)'}

Answer to grade:
"""
${output}
"""

Return EXACTLY this JSON shape: {"coverage": ["yes"|"partial"|"no", ...one entry per key fact IN ORDER], "unsupported_claims": ["..."], "refusal": true|false}. If there are no key facts, coverage is [].`,
  });
  if (keyFacts.length === 0) return { name: 'FactCoverage', score: c.refusal ? 1 : 0, metadata: { refusal: c.refusal } };
  const yes = c.coverage.filter((x) => x === 'yes').length;
  const partial = c.coverage.filter((x) => x === 'partial').length;
  return {
    name: 'FactCoverage',
    score: (yes + 0.5 * partial) / keyFacts.length,
    metadata: { coverage: c.coverage, unsupported_claims: c.unsupported_claims },
  };
}

// --- Groundedness: every substantive claim supported by the cited/gold docs ---
const GroundSchema = z.object({ claims: z.array(z.object({ claim: z.string(), supported: z.boolean() })) });

export async function Groundedness({ output, metadata }: Args) {
  const m = asQ(metadata);
  if (!m.answerable || refused(output)) return { name: 'Groundedness', score: null };
  const ref = goldDocText(m.gold_doc_ids);
  if (!ref) return { name: 'Groundedness', score: null };
  const g = await judgeJson({
    schema: GroundSchema,
    maxOutputTokens: 1500,
    prompt: `Break the answer below into its substantive factual claims (max 10) and mark each claim supported=true only if the reference documents support it.

Reference documents:
"""
${ref}
"""

Answer:
"""
${output}
"""

Return EXACTLY: {"claims": [{"claim": "...", "supported": true|false}, ...]}`,
  });
  const n = g.claims.length;
  return {
    name: 'Groundedness',
    score: n ? g.claims.filter((c) => c.supported).length / n : null,
    metadata: { claims: g.claims },
  };
}

// --- Citation validity: cited URLs exist in the corpus; gold-doc recall in metadata ---
export function CitationValidity({ output, metadata }: Args) {
  const m = asQ(metadata);
  if (!m.answerable || refused(output)) return { name: 'CitationValidity', score: null };
  const us = citedUrls(output);
  if (us.length === 0) return { name: 'CitationValidity', score: null }; // FormatTone flags missing citations
  const citedDocs = new Set<string>();
  let known = 0;
  for (const u of us) {
    const owners = urlToDocs.get(u);
    if (owners) {
      known++;
      for (const id of owners) citedDocs.add(id);
    }
  }
  const goldHit = m.gold_doc_ids.filter((id) => citedDocs.has(id)).length;
  return {
    name: 'CitationValidity',
    score: known / us.length,
    metadata: {
      precision: known / us.length,
      goldRecall: m.gold_doc_ids.length ? goldHit / m.gold_doc_ids.length : null,
      citedCount: us.length,
    },
  };
}

// --- Refusal accuracy: declines iff the question is unanswerable ---
export function RefusalAccuracy({ output, metadata }: Args) {
  const m = asQ(metadata);
  const r = refused(output);
  return {
    name: 'RefusalAccuracy',
    score: m.answerable ? (r ? 0 : 1) : r ? 1 : 0,
    metadata: { refused: r, answerable: m.answerable },
  };
}

// --- Format/tone: no em-dashes; a citation present on answerable questions ---
export function FormatTone({ output, metadata }: Args) {
  const m = asQ(metadata);
  const noDash = !output.includes('—') && !/ – /.test(output); // no em-dash, no spaced en-dash
  if (!m.answerable || refused(output)) return { name: 'FormatTone', score: noDash ? 1 : 0, metadata: { noDash } };
  const hasCitation = /\]\(https?:\/\//.test(output);
  return {
    name: 'FormatTone',
    score: ((noDash ? 1 : 0) + (hasCitation ? 1 : 0)) / 2,
    metadata: { noDash, hasCitation },
  };
}

export const scorers = [FactCoverage, Groundedness, CitationValidity, RefusalAccuracy, FormatTone];
