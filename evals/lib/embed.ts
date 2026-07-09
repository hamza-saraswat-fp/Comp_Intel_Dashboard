// Condition C's retrieval: contextual chunking + OpenAI embeddings + cosine top-k.
// Chunks carry a short generated context header (per Anthropic's contextual-
// retrieval guidance) prepended before embedding AND before prompt insertion.
// Vectors are cached on disk keyed by content hash so re-runs are free.
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { cosineSimilarity, embedMany, embed, generateText } from 'ai';
import type { ManifestDoc } from './types.ts';
import { EVALS_ROOT, readDocText, stripFrontmatter } from './corpus.ts';

const EMBED_MODEL = 'text-embedding-3-small';
const CHUNK_TOKENS = 800; // approx; we chunk by chars at ~4 chars/token
const CHUNK_CHARS = CHUNK_TOKENS * 4;
const OVERLAP_CHARS = Math.floor(CHUNK_CHARS * 0.15);
const CACHE_DIR = join(EVALS_ROOT, 'corpus/.cache');

export interface Chunk {
  docId: string;
  docTitle: string;
  idx: number;
  text: string;      // chunk body (no header)
  header: string;    // contextual header
  hash: string;
}

export function chunkDoc(doc: ManifestDoc): Chunk[] {
  const body = stripFrontmatter(readDocText(doc)).trim();
  const chunks: Chunk[] = [];
  let start = 0;
  let idx = 0;
  while (start < body.length) {
    let end = Math.min(start + CHUNK_CHARS, body.length);
    if (end < body.length) {
      const nl = body.lastIndexOf('\n', end);
      if (nl > start + CHUNK_CHARS / 2) end = nl; // break on a line boundary when reasonable
    }
    const text = body.slice(start, end).trim();
    if (text.length > 0) {
      chunks.push({
        docId: doc.id,
        docTitle: doc.title,
        idx,
        text,
        header: '',
        hash: createHash('sha256').update(`${doc.id}#${idx}#${text}`).digest('hex').slice(0, 16),
      });
      idx++;
    }
    if (end >= body.length) break;
    start = end - OVERLAP_CHARS;
  }
  return chunks;
}

/** Generate 1–2 sentence contextual headers with Haiku (cached by chunk hash). */
export async function withContextHeaders(chunks: Chunk[]): Promise<Chunk[]> {
  mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = join(CACHE_DIR, 'chunk-headers.json');
  const cache: Record<string, string> = existsSync(cachePath)
    ? JSON.parse(readFileSync(cachePath, 'utf8'))
    : {};

  for (const c of chunks) {
    if (cache[c.hash]) {
      c.header = cache[c.hash];
      continue;
    }
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5'),
      maxOutputTokens: 100,
      messages: [
        {
          role: 'user',
          content: `Document title: "${c.docTitle}" (id ${c.docId}). Here is a chunk of it:\n\n${c.text.slice(0, 2000)}\n\nWrite ONE short sentence situating this chunk within the document for search purposes (what it covers, which competitor/topic). Respond with only that sentence.`,
        },
      ],
    });
    c.header = text.trim();
    cache[c.hash] = c.header;
    writeFileSync(cachePath, JSON.stringify(cache, null, 1));
  }
  return chunks;
}

function embeddedText(c: Chunk): string {
  return `[${c.docTitle}] ${c.header}\n${c.text}`;
}

export async function buildVectorIndex(chunks: Chunk[]) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required for condition C (vector RAG). Set it in evals/.env.');
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = join(CACHE_DIR, `embeddings-${EMBED_MODEL}.json`);
  const cache: Record<string, number[]> = existsSync(cachePath)
    ? JSON.parse(readFileSync(cachePath, 'utf8'))
    : {};

  const missing = chunks.filter((c) => !cache[c.hash]);
  if (missing.length > 0) {
    const { embeddings } = await embedMany({
      model: openai.embedding(EMBED_MODEL),
      values: missing.map(embeddedText),
      maxParallelCalls: 4,
    });
    missing.forEach((c, i) => (cache[c.hash] = embeddings[i]));
    writeFileSync(cachePath, JSON.stringify(cache));
  }
  const vectors = chunks.map((c) => ({ chunk: c, vector: cache[c.hash] }));

  return {
    async retrieve(query: string, k = 8): Promise<Chunk[]> {
      const { embedding } = await embed({ model: openai.embedding(EMBED_MODEL), value: query });
      return vectors
        .map((v) => ({ chunk: v.chunk, score: cosineSimilarity(embedding, v.vector) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map((s) => s.chunk);
    },
  };
}

export function renderChunksForPrompt(chunks: Chunk[]): string {
  return chunks
    .map((c) => `<excerpt doc="${c.docId}" title="${c.docTitle}">\n${c.header}\n${c.text}\n</excerpt>`)
    .join('\n\n');
}
