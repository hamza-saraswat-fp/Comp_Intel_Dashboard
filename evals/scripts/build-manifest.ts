// Copies the knowledge base into corpus/real/ (flattened ids), derives titles/
// abstracts/source URLs, sizes every doc with the Anthropic count_tokens endpoint
// (model-accurate: Sonnet 5's tokenizer differs from prior models), and writes
// corpus/manifest.json. Synthetic docs (corpus/synthetic/) are merged in if present.
//
// Scale assignment:
//   S0 = the pre-research-wave dashboard knowledge only (matrix, no research/)
//   S  = everything real (S0 + research teardowns + pricing profiles)
//   M  = S + synthetic docs tagged M
//   L  = S + synthetic docs tagged M or L
import 'dotenv/config';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { EVALS_ROOT, deriveAbstract, extractUrls, parseFrontmatter } from '../lib/corpus.ts';
import type { Manifest, ManifestDoc, Scale } from '../lib/types.ts';

const KNOWLEDGE = join(EVALS_ROOT, '..', 'knowledge');
const REAL = join(EVALS_ROOT, 'corpus/real');
const SYNTH = join(EVALS_ROOT, 'corpus/synthetic');
const MODEL = process.env.EVAL_ANSWER_MODEL ?? 'claude-sonnet-5';

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

async function countTokens(text: string): Promise<number> {
  const res = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: text }] }),
  });
  if (!res.ok) throw new Error(`count_tokens ${res.status}: ${await res.text()}`);
  return ((await res.json()) as any).input_tokens as number;
}

// 1. Refresh corpus/real from knowledge/
rmSync(REAL, { recursive: true, force: true });
mkdirSync(REAL, { recursive: true });
cpSync(KNOWLEDGE, REAL, {
  recursive: true,
  filter: (src) => statSync(src).isDirectory() || src.endsWith('.md'),
});

// 2. Build doc entries
const docs: ManifestDoc[] = [];
for (const file of walk(REAL)) {
  const rel = relative(REAL, file);
  if (rel === 'index.md' || rel === 'log.md') continue; // bundle plumbing, not knowledge
  const id = rel.replace(/\.md$/, '').split('/').join('__');
  const text = readFileSync(file, 'utf8');
  const fm = parseFrontmatter(text);
  const heading = text.match(/^#\s+(.+)$/m)?.[1];
  const isResearch = rel.startsWith('research/');
  const scales: Scale[] = isResearch ? ['S', 'M', 'L'] : ['S0', 'S', 'M', 'L'];
  docs.push({
    id,
    title: fm.title ?? heading ?? id,
    path: `corpus/real/${rel}`,
    scales,
    tokens: 0,
    sourceUrls: extractUrls(text),
    synthetic: false,
    abstract: deriveAbstract(text),
  });
}

// 3. Merge synthetic docs (if generated yet); their scale tag lives in frontmatter `eval_scale: M|L`
if (existsSync(SYNTH)) {
  for (const file of walk(SYNTH)) {
    const rel = relative(SYNTH, file);
    const id = 'synthetic__' + rel.replace(/\.md$/, '').split('/').join('__');
    const text = readFileSync(file, 'utf8');
    const fm = parseFrontmatter(text);
    const tag = (fm.eval_scale ?? 'M') as 'M' | 'L';
    docs.push({
      id,
      title: fm.title ?? text.match(/^#\s+(.+)$/m)?.[1] ?? id,
      path: `corpus/synthetic/${rel}`,
      scales: tag === 'M' ? ['M', 'L'] : ['L'],
      tokens: 0,
      sourceUrls: extractUrls(text),
      synthetic: true,
      abstract: deriveAbstract(text),
    });
  }
}

docs.sort((a, b) => a.id.localeCompare(b.id)); // deterministic corpus order

// 4. Size every doc (count_tokens is free)
for (const d of docs) {
  d.tokens = await countTokens(readFileSync(join(EVALS_ROOT, d.path), 'utf8'));
  console.log(`${d.tokens}\t${d.id}`);
}

const scaleTokens = Object.fromEntries(
  (['S0', 'S', 'M', 'L'] as Scale[]).map((s) => [
    s,
    docs.filter((d) => d.scales.includes(s)).reduce((n, d) => n + d.tokens, 0),
  ]),
) as Record<Scale, number>;

const manifest: Manifest = { builtAt: new Date().toISOString(), model: MODEL, docs, scaleTokens };
writeFileSync(join(EVALS_ROOT, 'corpus/manifest.json'), JSON.stringify(manifest, null, 1));
console.log('\nscale sizes (tokens):', scaleTokens);
console.log(`manifest written: ${docs.length} docs`);
