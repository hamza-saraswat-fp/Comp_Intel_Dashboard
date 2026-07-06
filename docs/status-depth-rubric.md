# Status + depth rubric (IAI-227)

The two fields that carry the verdict in every offering cell (`knowledge/offerings/<competitor>/<capability>.md`). They are already applied consistently across the seeded research and the monitor agent's `suggestedStatus`/`suggestedDepth`; this doc makes the criteria explicit so future research, corrections, and the agent stay calibrated.

The golden rule: **describe what is generally usable today, not what was demoed or announced.** Separate GA reality from keynote vision, and heuristics/manual workflows from genuine AI/ML.

## `status` — does the capability exist, and how available is it?

| status | UI label | Criteria | Example |
|---|---|---|---|
| `shipped` | Live | Generally available now — any customer on the right plan can turn it on today. | ServiceTitan AI Voice Agent (GA, self-serve). |
| `beta` | Beta | Real and in-market but access-gated: private preview, waitlist, or a vendor-labeled beta. Not vaporware, not GA. | ServiceTitan Atlas office modules (private preview); Jobber Copilot (help center still labels it Beta). |
| `announced` | Announced | Publicly announced / roadmap / "coming soon" — not usable by anyone yet. | A Pantheon-keynote feature with no preview access. |
| `none` | None | The vendor genuinely lacks the AI capability **as defined**. Manual workflows, GPS/heuristics, or a paid third-party integration do **not** count as the vendor shipping AI. | Housecall Pro AI dispatch: routing is rules-based / offloaded to Beeline, so `none`. |
| `not_researched` | (blank / pending) | Not yet assessed. Used for FieldPulse's own column (shown as an honest gap, never inflated). | Every FieldPulse cell today. |

Notes:
- A **re-announcement or rename** of something already shipped is not a status bump — it stays at its true availability (this mirrors the monitor agent's MINOR/dedup rule).
- When you genuinely can't confirm availability, prefer the more conservative status and set `needs_verification: true` rather than guessing up.

## `depth` — for what *is* shipped/beta, how strong is it?

Only meaningful when `status` is `shipped` or `beta`. Leave `depth` empty for `none` / `announced` / `not_researched`.

| depth | UI pip | Criteria | Example |
|---|---|---|---|
| `basic` | ● | The feature exists but is narrow, assistive, or shallow — helps at the margin, not a category play. | Housecall Pro back-office: "Write it for me" drafts a summary from line items you already entered. |
| `strong` | ●● | A genuine, well-rounded, competitive capability — a real reason a buyer would pick this vendor for it. | Jobber AI Receptionist (real 24/7 voice agent, priced add-on). |
| `market_leading` | ●●● | Clearly ahead of the field; the benchmark others are measured against in this capability. | ServiceTitan Dispatch Pro — the only true ML-driven dispatch engine in FSM. |

Depth is a neutral gray pip in the UI (never colored) — color tracks `status`, shape tracks `depth`. Calibrate against the **shipped** surface only: don't let an ambitious roadmap inflate depth (that belongs in `# Detail` as "coming soon", not in the rating).

## How this maps in the stack
- Legal values are enforced by `scripts/validate_okf.py` (`ALLOWED_STATUS` / `ALLOWED_DEPTH`) — a cell outside these fails the gate and never reaches Supabase.
- The UI renders them in `dashboard/src/components/StatusPill.tsx` (status → tint + glyph) and `MaturityDots.tsx` (depth → pips).
- The monitor agent emits `suggestedStatus` / `suggestedDepth` on a detection using these same definitions (`comp_intel_monitor/agent.yaml`).
