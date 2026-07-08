# Ask Intel — retrieval architecture eval

Does the Ask Intel chatbot need RAG, or does full-context stuffing hold as the
knowledge base grows? This harness answers that empirically instead of by
intuition. It runs the **same AI SDK v6 + Claude Sonnet 5 stack the production
chat will use**, so results transfer.

## The question

Three ways to give the chatbot its knowledge, compared head to head:

| | Architecture | How it gets the answer |
|---|---|---|
| **A** | Full-context stuffing | the whole corpus in a cached system prompt (today's plan) |
| **B** | Agentic retrieval | small always-loaded index + `search_docs`/`read_doc` tools, multi-step (mirrors the planned Supabase `tsvector` FTS path) |
| **C** | Vector RAG | contextual chunks, OpenAI embeddings, top-k injected, single shot |

…at three corpus **scales** — `S` (today's real research corpus), `M` (~2 more
research quarters), `L` (15-competitor deep coverage) — against a frozen set of
~50 gold questions. `S0` is a cheap "today's bare matrix" A-only sanity point.

## Metrics

Per condition × scale: **fact recall** and **fact precision** (blind rubric
judge, Opus 4.8, key-fact checklists), **groundedness** (second judge call vs
cited docs), **citation precision/recall** (programmatic), **refusal accuracy**,
**TTFT + total latency**, and **cost/question split cold vs warm cache**.

## Running it

```bash
cd evals
npm install
cp .env.example .env    # fill in ANTHROPIC_API_KEY (+ OPENAI_API_KEY for condition C)

# 1. Size + freeze the corpus (count_tokens against Sonnet 5)
npm run build-manifest

# 2. Generate candidate questions, review them, freeze as questions.json
npm run gen-questions
#    → review questions.candidates.json by hand, then:  cp questions.candidates.json questions.json

# 3. Smoke: condition A at S, a few questions (validates cache + usage plumbing)
npx tsx run.ts --run-id smoke --conditions A --scales S --subset 3
npx tsx judge.ts --run-id smoke     # then hand-verify ~25 judgments before trusting the judge

# 4. Full S run across all three conditions
npx tsx run.ts --run-id r1 --conditions A,B,C --scales S0,S

# 5. Build synthetic M/L corpora (validated: no distractor answers/contradicts gold)
npm run gen-synthetic -- --target-m 130000 --target-l 480000
npm run build-manifest              # re-size including synthetic docs

# 6. Full matrix + variance pass + judge + report
npx tsx run.ts --run-id r1 --conditions A,B,C --scales M,L
npx tsx run.ts --run-id r1 --conditions A,B,C --scales M --repeats 3 --subset 10   # variance
npx tsx judge.ts --run-id r1
npx tsx report.ts --run-id r1       # → results/r1/report.md
```

`run.ts` is **resumable** — re-running skips completed records (a ~450-call
matrix will occasionally hit a 529). Estimated spend for the full matrix +
judging: **~$65–90** (dominated by judging and A@L cache traffic).

## Fairness protocol (why you can trust the comparison)

Retrieval evals are easy to rig by accident. The mitigations, all live in the harness:

1. **Questions generated from raw docs**, never through any of the three systems (`scripts/gen-questions.ts`), then human-reviewed.
2. **Balanced category mix + paraphrased phrasing** (verbatim wording favors BM25; pure paraphrase favors embeddings). Per-category results reported, not just aggregate.
3. **Cold vs warm cache measured separately.** Q1 is naturally cold; 2 extra nonce-busted cold samples per cell; the rest run **sequentially** inside the 5-min TTL as warm. Reported in separate columns.
4. **Every condition gets a cache breakpoint** on its static prefix (A: rules+corpus; B: rules+index+tool defs; C: rules only). C's per-question chunks are inherently uncacheable — that's the architecture's real cost, not unfairness.
5. **B costed across all steps** via `totalUsage`, priced from `inputTokenDetails` (cache-aware). Naive `inputTokens × price` over-bills warm runs ~10× — see `lib/cost.ts`.
6. **Latency apples-to-apples:** all conditions stream through the same `runAnswer`; B reports both first-event and first-visible-token TTFT.
7. **C's tunables fixed** (800-tok chunks, 15% overlap, context headers, k=8); a k∈{4,8,16} sweep at M is a sensitivity appendix, not cherry-picking C's best.
8. **A's doc order is fixed-deterministic** (cache needs byte stability); ordering noted as an untested variable.
9. **No temperature knob exists** on Sonnet 5 (400s) — variance handled by a 10-question × 3-repeat pass with bootstrap CIs. **Winners claimed only where CIs separate** (`lib/stats.ts`).
10. **Judge is blinded:** citations normalized to `[S1]` tokens, grading order shuffled, no condition labels, no retrieval traces in the correctness call.
11. **Same-family judge bias** is constant across conditions (all use the same answerer); hand-verify a 25–30 judgment sample and report agreement.
12. **Scale isolation:** S ⊂ M ⊂ L with all gold docs in S, so only distractor mass changes across scales.
13. **Sequential execution per cell** (cache entries only become readable after the first response streams).
14. **Corpus sized with `count_tokens`** against Sonnet 5 (its tokenizer differs from prior models) — not heuristics.

## Transfer caveats (in the decision memo, not hidden)

- MiniSearch **BM25+ ≥ stock Postgres `ts_rank`** (no corpus IDF / length norm there). Condition B here **upper-bounds** stock-Postgres retrieval quality; a B win may need pg tuning or a BM25 extension to realize in prod.
- Synthetic distractors simulate *scale*, not real-doc messiness. Re-run as real research lands (that's why this is a checked-in, rerunnable asset).
- A narrow C-over-B result should be re-verified with Voyage embeddings (Anthropic's recommended vendor) before buying an embeddings dependency.

## Layout

```
lib/        corpus loading, cost accounting, search (BM25+), embeddings, streaming runner, stats
conditions/ stuff.ts (A), agentic.ts (B), rag.ts (C)
scripts/    build-manifest, gen-questions, gen-synthetic
run.ts      matrix runner (sequential, cold/warm, resumable)
judge.ts    blind rubric + groundedness + programmatic citation/refusal checks
report.ts   aggregation → results/<runId>/report.md
corpus/     real/ (copied from ../knowledge), synthetic/ (generated distractors), manifest.json
```
