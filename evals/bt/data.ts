// Gold questions → Braintrust eval cases, plus the lookups the scorers need
// (gold-doc text for groundedness, url→doc map for citation validity). Reuses the
// frozen manifest + corpus reader from the retrieval eval (evals/lib/corpus.ts).
import questions from '../questions.json';
import { loadManifest, readDocText } from '../lib/corpus.ts';

export interface QMeta {
  id: string;
  category: string;
  answerable: boolean;
  gold_doc_ids: string[];
}
export interface Case {
  input: string;
  expected: string[]; // key_facts
  metadata: QMeta;
}

interface RawQ {
  id: string;
  question: string;
  category: string;
  answerable: boolean;
  key_facts: string[];
  gold_doc_ids: string[];
}

const manifest = loadManifest();
const docById = new Map(manifest.docs.map((d) => [d.id, d]));

// url → the doc ids that cite it (a url can appear in several docs).
export const urlToDocs = new Map<string, Set<string>>();
for (const d of manifest.docs) {
  for (const u of d.sourceUrls) {
    if (!urlToDocs.has(u)) urlToDocs.set(u, new Set());
    urlToDocs.get(u)!.add(d.id);
  }
}

export function cases(subset?: number): Case[] {
  const qs = questions as RawQ[];
  const sliced = subset && subset > 0 ? qs.slice(0, subset) : qs;
  return sliced.map((q) => ({
    input: q.question,
    expected: q.key_facts,
    metadata: { id: q.id, category: q.category, answerable: q.answerable, gold_doc_ids: q.gold_doc_ids },
  }));
}

/** Concatenated text of the gold docs (groundedness reference), capped like judge.ts. */
export function goldDocText(goldIds: string[], cap = 60_000): string {
  const parts: string[] = [];
  for (const id of goldIds) {
    const d = docById.get(id);
    if (d) parts.push(`# ${d.title}\n${readDocText(d)}`);
  }
  return parts.join('\n\n').slice(0, cap);
}
