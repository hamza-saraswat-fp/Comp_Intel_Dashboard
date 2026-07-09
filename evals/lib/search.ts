// Condition B's search: MiniSearch (BM25+) over full doc bodies.
// combineWith:'AND' approximates Postgres websearch_to_tsquery's conjunctive
// behavior; note for the report that MiniSearch BM25+ ranking is generally
// STRONGER than stock Postgres ts_rank (no corpus IDF / length norm there),
// so condition B here upper-bounds stock-Postgres retrieval quality.
import MiniSearch from 'minisearch';
import type { ManifestDoc } from './types.ts';
import { readDocText, stripFrontmatter } from './corpus.ts';

export interface SearchHit {
  id: string;
  title: string;
  score: number;
  snippet: string;
}

export function buildSearchIndex(docs: ManifestDoc[]) {
  const bodies = new Map<string, string>();
  const mini = new MiniSearch({
    fields: ['title', 'body'],
    storeFields: ['id', 'title'],
    searchOptions: { boost: { title: 2 }, prefix: true, combineWith: 'AND' },
  });
  mini.addAll(
    docs.map((d) => {
      const body = stripFrontmatter(readDocText(d));
      bodies.set(d.id, body);
      return { id: d.id, title: d.title, body };
    }),
  );

  return {
    search(query: string, limit = 8): SearchHit[] {
      let hits = mini.search(query);
      // AND can be too strict for long natural-language queries; fall back to OR
      // (documented behavior — mirrors what a production tool would do).
      if (hits.length === 0) hits = mini.search(query, { combineWith: 'OR' });
      return hits.slice(0, limit).map((h) => ({
        id: h.id as string,
        title: (h as any).title as string,
        score: h.score,
        snippet: makeSnippet(bodies.get(h.id as string) ?? '', h.queryTerms as string[]),
      }));
    },
    readDoc(id: string): string | null {
      return bodies.get(id) ?? null;
    },
  };
}

function makeSnippet(body: string, terms: string[], span = 240): string {
  const lower = body.toLowerCase();
  let idx = -1;
  for (const t of terms) {
    const i = lower.indexOf(t.toLowerCase());
    if (i >= 0 && (idx < 0 || i < idx)) idx = i;
  }
  if (idx < 0) idx = 0;
  const start = Math.max(0, idx - 60);
  return body.slice(start, start + span).replace(/\s+/g, ' ').trim();
}
