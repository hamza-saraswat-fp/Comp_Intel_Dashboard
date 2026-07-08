// Corpus loading + the deterministic renderings each condition consumes.
// Everything here must be byte-stable across runs: doc order is manifest order
// (sorted by id at build time), no timestamps, no randomness — Anthropic prompt
// caching is a prefix match and silent nondeterminism would zero the cache hits.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Manifest, ManifestDoc, Scale } from './types.ts';

export const EVALS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadManifest(): Manifest {
  return JSON.parse(readFileSync(join(EVALS_ROOT, 'corpus/manifest.json'), 'utf8')) as Manifest;
}

export function docsForScale(manifest: Manifest, scale: Scale): ManifestDoc[] {
  // Manifest docs are stored sorted by id; keep that order verbatim.
  return manifest.docs.filter((d) => d.scales.includes(scale));
}

export function readDocText(doc: ManifestDoc): string {
  return readFileSync(join(EVALS_ROOT, doc.path), 'utf8');
}

/** Condition A: the full corpus as one deterministic markdown blob. */
export function renderFullCorpus(docs: ManifestDoc[]): string {
  return docs
    .map((d) => `<document id="${d.id}" title="${d.title}">\n${readDocText(d).trim()}\n</document>`)
    .join('\n\n');
}

/** Condition B: compact always-in-context index — doc catalog + capability matrix summary. */
export function renderIndex(docs: ManifestDoc[]): string {
  const catalog = docs
    .map((d) => `- ${d.id} — ${d.title}: ${d.abstract}`)
    .join('\n');
  const matrix = renderMatrixSummary(docs);
  return `## Document catalog (use search_docs to find docs, read_doc to read one in full)\n${catalog}\n\n## Capability matrix summary\n${matrix}`;
}

/**
 * One-line-per-offering summary derived from offering docs' frontmatter.
 * Gives condition B the same at-a-glance grounding the dashboard's matrix gives users,
 * without the prose (which it must retrieve).
 */
export function renderMatrixSummary(docs: ManifestDoc[]): string {
  const lines: string[] = [];
  for (const d of docs) {
    if (!d.id.startsWith('offerings__')) continue;
    const fm = parseFrontmatter(readDocText(d));
    if (!fm.competitor || !fm.capability) continue;
    const bits = [`status: ${fm.status ?? 'unknown'}`];
    if (fm.depth) bits.push(`depth: ${fm.depth}`);
    if (fm.as_of) bits.push(`as of ${fm.as_of}`);
    lines.push(`- ${fm.competitor} × ${fm.capability}: ${bits.join(', ')} (full detail: ${d.id})`);
  }
  return lines.join('\n');
}

export function parseFrontmatter(text: string): Record<string, string> {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.+)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["'[]|["'\]]$/g, '').trim();
  }
  return out;
}

/** Body without frontmatter — what search/chunking should operate on. */
export function stripFrontmatter(text: string): string {
  return text.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

/** Deterministic short abstract: first prose paragraph, truncated. */
export function deriveAbstract(text: string, maxLen = 180): string {
  const body = stripFrontmatter(text);
  const para = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 40 && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('<'));
  const s = (para ?? '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '');
  return s.length > maxLen ? s.slice(0, maxLen - 1).trimEnd() + '…' : s;
}

export function extractUrls(text: string): string[] {
  const urls = new Set<string>();
  for (const m of text.matchAll(/https?:\/\/[^\s)\]>"']+/g)) {
    urls.add(m[0].replace(/[.,;:]+$/, ''));
  }
  return [...urls].sort();
}
