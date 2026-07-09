---
type: Teardown
slug: m-01-payments-financing-checkout
topic: Payments, financing & checkout
competitors: [servicegrove, tradehalo, dispatchowl]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Payments, Financing & Checkout: How ServiceGrove, TradeHalo, and DispatchOwl Stack Up

Payments have quietly become the second product inside every field-service platform. A dispatcher opens the app to route a crew; a homeowner opens the same app to approve an estimate, put a card on file, and — increasingly — spread a $6,400 heat-pump replacement across eighteen monthly payments without ever leaving the technician's tablet. The three vendors in this teardown — ServiceGrove, TradeHalo, and DispatchOwl — have each built a distinct answer to "how does money move through the job," and the differences show up less in headline processing rates and more in the plumbing: who underwrites the financing, how fast cash lands in the contractor's bank account, whether a deposit can be collected before a truck rolls, and how cleanly the whole thing reconciles against QuickBooks or Xero on a rainy Sunday night.

This teardown walks through embedded payments, in-house financing/BNPL, the actual checkout surfaces a customer sees, payout and reconciliation mechanics, and the fine print buried in each vendor's packaging. All figures below were gathered from public pricing pages, help-center articles, and partner-network disclosures as of the date on this document; several of the numbers (particularly financing APR ranges) are described as "typical" ranges by the vendors themselves and will vary by underwriting.

## At a glance

| | ServiceGrove | TradeHalo | DispatchOwl |
|---|---|---|---|
| Payments engine | ServiceGrove Pay (in-house, built on a licensed processor called Wharfline) | TradeHalo Checkout (white-labeled on top of a processor called Bramblecard) | OwlPay (in-house ledger, settles through Meridian Capital's merchant-services arm) |
| Card-present rate | 2.6% + $0.25 | 2.7% + $0.20 | 2.5% + $0.15 |
| Card-not-present / keyed rate | 3.1% + $0.25 | 3.2% + $0.20 | 3.05% + $0.15 |
| ACH / bank-pay rate | 0.9% flat, capped at $9 | 0.85% flat, capped at $11 | 0.75% flat, no cap |
| Financing partner | Homeline Credit (bank-funded) | SnapFund Pay (fintech-funded, revolving + installment) | OwlCredit, underwritten by Meridian Capital |
| Typical APR range | 0%–26.9% | 0%–27.4% | 0%–25.9% |
| Standard payout speed | next business day | three business days | next business day |
| Instant payout fee | 1.5% | 1.75% | 1.4% |
| Entry plan (monthly) | Field — $89 | Core — $119 | Essentials — $69 |
| Mid plan (monthly) | Crew — $179 | Team — $219 | Advantage — $189 |
| Top plan (monthly) | Command — $349 | Enterprise — from $429 | Command — $379 |
| Deposit-at-booking | Yes, via booking widget | Yes, via estimate approval only | Yes, via booking widget and dispatch board |
| Text-to-pay | Yes | Yes | Yes, plus a "Pay by QR" sticker option |

## 1 · Embedded Payments & Processing Rates

**ServiceGrove**
- ServiceGrove Pay is bundled into every plan tier — there's no separate "payments module" toggle, which the vendor pitches as reducing setup friction for owner-operators who don't want to negotiate a merchant account.
- The card-present rate (2.6% + $0.25) applies to both the technician-facing tap-to-pay flow on a phone and the optional Bluetooth card reader ServiceGrove sells for roughly $59 through its hardware store (not to be confused with a monthly fee).
- Keyed and online-link transactions jump to 3.1% + $0.25, and ServiceGrove's help docs are explicit that "typed card numbers carry materially higher fraud exposure," which is the justification given for the spread.
- ACH/bank-pay is capped at $9 per transaction, which the vendor markets heavily toward larger commercial jobs — a $12,000 rooftop-unit invoice paid by ACH costs the contractor a flat $9 instead of roughly $312 under the card rate.
- There is no separate gateway fee; ServiceGrove folds statement, PCI-compliance, and chargeback-alert fees into the per-transaction rate, though a $16 monthly "risk reserve" line item appears on merchant statements for businesses processing above a volume threshold the sales team wouldn't disclose in writing.

**TradeHalo**
- TradeHalo Checkout is opt-in on the Core pl