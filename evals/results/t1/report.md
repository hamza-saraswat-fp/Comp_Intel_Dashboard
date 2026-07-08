# Retrieval eval — results (t1)

Conditions: A, B, C · Scales: M, S, S0 · Judged records: 270

A = full-context stuffing · B = agentic retrieval (BM25+ tools) · C = vector RAG (OpenAI embeddings)

## Scale M

| Condition | n | fact recall (95% CI) | fact prec. | grounded | cite prec. | cite recall | refusal acc. | ttft warm | total warm | cost warm | cost cold | tokens→model | avg steps |
|---|--|--|--|--|--|--|--|--|--|--|--|--|--|
| **A** | 30 | 0.95 [0.92, 0.98] | 0.40 | 0.89 | 1.00 | 0.82 | 1.00 | 4695ms | 11430ms | $0.0637 | $0.6401 | 166153 | 1.0 |
| **B** | 30 | 0.90 [0.85, 0.95] | 0.44 | 0.86 | 1.00 | 0.75 | 1.00 | 4801ms | 10733ms | $0.0361 | $0.0652 | 9751 | 2.3 |
| **C** | 30 | 0.88 [0.80, 0.94] | 0.41 | 0.79 | 0.99 | 0.64 | 1.00 | 2330ms | 8535ms | $0.0358 | $0.0360 | 5127 | 1.0 |

**Quality:** A and B are within CI on fact recall at M — treat as a tie; decide on cost, latency, and ops.

## Scale S

| Condition | n | fact recall (95% CI) | fact prec. | grounded | cite prec. | cite recall | refusal acc. | ttft warm | total warm | cost warm | cost cold | tokens→model | avg steps |
|---|--|--|--|--|--|--|--|--|--|--|--|--|--|
| **A** | 30 | 0.94 [0.89, 0.97] | 0.43 | 0.85 | 1.00 | 0.82 | 1.00 | 3363ms | 9645ms | $0.0440 | $0.4145 | 107027 | 1.0 |
| **B** | 30 | 0.94 [0.89, 0.97] | 0.45 | 0.88 | 1.00 | 0.76 | 1.00 | 5236ms | 11161ms | $0.0369 | $0.0586 | 9641 | 2.4 |
| **C** | 30 | 0.85 [0.79, 0.92] | 0.39 | 0.79 | 0.99 | 0.66 | 1.00 | 1989ms | 8511ms | $0.0358 | $0.0376 | 5099 | 1.0 |

**Quality:** A and B are within CI on fact recall at S — treat as a tie; decide on cost, latency, and ops.

## Scale S0

| Condition | n | fact recall (95% CI) | fact prec. | grounded | cite prec. | cite recall | refusal acc. | ttft warm | total warm | cost warm | cost cold | tokens→model | avg steps |
|---|--|--|--|--|--|--|--|--|--|--|--|--|--|
| **A** | 30 | 0.66 [0.51, 0.81] | 0.58 | 0.87 | 1.00 | 0.63 | 0.33 | 2672ms | 7659ms | $0.0176 | $0.1079 | 25942 | 1.0 |
| **B** | 30 | 0.66 [0.51, 0.80] | 0.46 | 0.86 | 1.00 | 0.52 | 0.33 | 4967ms | 9753ms | $0.0221 | $0.0299 | 4456 | 2.2 |
| **C** | 30 | 0.63 [0.49, 0.77] | 0.46 | 0.86 | 1.00 | 0.53 | 0.33 | 1555ms | 6736ms | $0.0269 | $0.0247 | 3777 | 1.0 |

**Quality:** A and B are within CI on fact recall at S0 — treat as a tie; decide on cost, latency, and ops.

## Full-context (A) degradation across scale

| Scale | fact recall | grounded | ttft warm | cost warm | cost cold | tokens→model |
|---|--|--|--|--|--|--|
| M | 0.95 | 0.89 | 4695ms | $0.0637 | $0.6401 | 166153 |
| S | 0.94 | 0.85 | 3363ms | $0.0440 | $0.4145 | 107027 |
| S0 | 0.66 | 0.87 | 2672ms | $0.0176 | $0.1079 | 25942 |

> Note: costs use standard Sonnet-5 pricing; intro pricing (through 2026-08-31) is ~33% lower. Cost priced from usage.inputTokenDetails (cache-aware), not raw inputTokens.
