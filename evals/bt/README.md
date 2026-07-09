# Braintrust evals — Ask Intel (IAI-272 / 274 / 275)

A simple, thorough eval suite for the live Ask Intel chat. The **task is an exact prod
replica** — it imports the same `dashboard/api/_prompt.ts` + `_intel-pack.ts` the deployed
function uses and calls OpenRouter `anthropic/claude-sonnet-5` with the identical
cache-control + Anthropic-pin options as `dashboard/api/chat.ts` — so a score reflects what
prod actually does. Results log to the Braintrust project **Ask Intel**.

## Setup

Add to `evals/.env` (gitignored):

```
OPENROUTER_API_KEY=...     # same key as Vercel — answerer + judge
BRAINTRUST_API_KEY=...     # braintrust.dev → Settings → API keys
# BT_JUDGE_MODEL=openai/gpt-4o   # optional; judge model (cross-family vs the Anthropic answerer)
```

## Rubric (`bt/scorers.ts`)

| Scorer | Type | What it checks |
|---|---|---|
| FactCoverage | LLM judge | answer covers the gold `key_facts` |
| Groundedness | LLM judge | claims supported by the cited/gold docs (skipped on refusals) |
| CitationValidity | programmatic | cited URLs exist in the corpus; gold-doc recall in metadata |
| RefusalAccuracy | programmatic | declines iff the question is unanswerable |
| FormatTone | programmatic | no em-dashes; a citation present on answerable questions |

Judge = `openai/gpt-4o` via OpenRouter (cross-family, avoids self-preference). Both judges
run through the tolerant `bt/judge.ts` (ported from `evals/lib/json-out.ts`).

## Runs (`bt/askintel.eval.ts`, env-driven)

```
npx tsx bt/push-dataset.ts                                      # version the 30 gold Qs as a Braintrust dataset
BT_SUBSET=3 npx tsx bt/askintel.eval.ts                         # smoke
BT_EXPERIMENT=baseline-sonnet5 npx tsx bt/askintel.eval.ts      # baseline (30 Qs)
BT_TEMP=0.2 BT_EXPERIMENT=temp02 npx tsx bt/askintel.eval.ts    # variant
BT_TRIALS=4 BT_SUBSET=10 BT_EXPERIMENT=consistency npx tsx bt/askintel.eval.ts   # pass^k
```

## Baseline (2026-07-09, 30 questions)

| Scorer | Baseline | Temp 0.2 |
|---|---|---|
| FactCoverage | 0.972 | 0.958 |
| CitationValidity | 1.00 | 1.00 |
| RefusalAccuracy | 1.00 | 0.933 |
| Groundedness | 0.845 | 0.894 |
| FormatTone | 0.533 | 0.45 |

Consistency (10 Qs × 4 trials): mean per-question pass rate **0.65**, **pass⁴ = 0.40** (4/10 fully consistent).

## Findings / recommendation

- Accuracy, citation validity, and refusal accuracy are excellent (≥ 0.97); grounding is solid (0.84).
- **FormatTone (0.53) is the weak spot** — the model uses em-dashes despite the prompt forbidding them. Temperature 0.2 made it *worse* and dipped refusal accuracy, so **lowering temperature is not the fix**. Strengthen the prompt (a hard "no em-dashes" rule + a fixed answer structure); that should lift both FormatTone and pass⁴. This is the next iteration (feeds the prompt-tuning follow-up).
- **Cost note:** the task isn't `wrapAISDK`-wrapped, so Braintrust aggregates latency but not token cost (per-answer usage is attached to `hooks.metadata`). Wire `wrapAISDK` in `bt/task.ts` if cost dashboards are needed.
