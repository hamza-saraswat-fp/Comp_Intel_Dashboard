---
type: Teardown
slug: payments-financing
topic: Payments, financing & checkout
competitors: [jobber, housecall-pro, servicetitan]
as_of: 2026-07-07
author: fable-deep-research
---

# Competitor Teardown — Payments, Financing & Checkout
*Jobber · Housecall Pro · ServiceTitan | Prepared for FieldPulse · July 2026*

How each competitor moves money: native card/ACH processing, in-field collection, consumer financing, deposits and stored cards, and instant payouts. Captured from public help centers and feature pages. Processing rates change and vary by account, so every rate here is date-qualified to July 2026 and reflects published/standard pricing (negotiated rates differ, especially at ServiceTitan's enterprise tier).

**On sourcing:** vendor help-center and feature pages, plus published financing partner terms (Wisetack). No competitor logins. Jobber help articles 403 to automated fetchers; Jobber figures were corroborated across Jobber help snippets, the Jobber payments feature page, and secondary breakdowns, noted inline.

## At a glance

| Dimension | Jobber | Housecall Pro | ServiceTitan |
|---|---|---|---|
| **Card rate (published)** | 2.9% + $0.30 | starts at 2.59% | 2.9% + $0.30 (Stripe); interchange-plus negotiable |
| **ACH rate** | 1% | 1% (bank payments) | 0.8% |
| **Instant payout** | Instant Payout, 1% fee (seconds, incl. weekends) | Instapay, +1% (~30 min, card + ACH) | Faster deposits (via ServiceTitan Payments) |
| **Consumer financing** | Wisetack, flat 3.9%, 3–120 mo | Wisetack, flat 3.9%, 0% APR options, up to 120 mo | Wisetack + Sunbit |
| **In-field collection** | Tap to Pay (phone) + optional reader (reduced card-present rate) | Card readers, in-app | In-field, office, online; stored cards |
| **Stored cards / auto-charge** | Card on file, auto-charge recurring; require method on quote deposit | Card on file, auto-invoicing | Stored cards, automated collection |
| **Financial account** | Payouts to bank | HCP Money (expense cards, check deposit beta, bill pay alpha) | Accounting automation, batching |
| **Processing backend** | Jobber Payments (Stripe-based) | HCP payments | Stripe + TSYS / NMI / Adyen |

## 1 · Payment processing & rates

**Jobber**
- **Jobber Payments** processes credit cards at **2.9% + $0.30**, **ACH at 1%** (as of Jul 2026). It's built in, with reporting under Jobber Payments Reports. [Jobber Payments Basics (via help snippet)](https://help.getjobber.com/hc/en-us/articles/115009571387-Jobber-Payments-Basics) · [Online payments feature page](https://www.getjobber.com/features/field-service-credit-card-processing/) · [Jobber pricing breakdown 2026 (secondary)](https://myquoteiq.com/jobber-pricing-breakdown-2026/)

**Housecall Pro**
- Card processing **starts at 2.59%** with **1% on bank (ACH) payments** (as of Jul 2026); the exact card rate varies by plan/volume. [Housecall Pro payment processing options](https://help.housecallpro.com/en/articles/2046930-housecall-pro-payment-processing-options) · [Payment feature page](https://www.housecallpro.com/features/payment/)

**ServiceTitan**
- Published card processing is **2.9% + $0.30** (Stripe) with **ACH at 0.8%**; ServiceTitan also integrates **TSYS, NMI, and Adyen** on the backend and offers **interchange-plus** pricing that is negotiable at scale. [Payments Home](https://help.servicetitan.com/docs/payments-overview) · [Payment processing feature page](https://www.servicetitan.com/features/payments) · [ServiceTitan payment processing review (secondary)](https://merchantcostconsulting.com/lower-credit-card-processing-fees/servicetitan-review/)

## 2 · In-field collection (mobile)

**Jobber**
- **Tap to Pay** runs in the Jobber app on a phone (no hardware), letting a client settle up on-site before the pro leaves; an optional **card reader** collects card-present payments at a **reduced rate**. [Online payments feature page](https://www.getjobber.com/features/field-service-credit-card-processing/)

**Housecall Pro**
- Supports **card readers** for in-person payments and in-app collection at the job; payment is one tap from the job's action bar (Schedule · OMW · Start · Finish · Invoice · Pay). [HCP Payments collection](https://help.housecallpro.com/en/collections/74819-hcp-payments)

**ServiceTitan**
- Accepts payments **in the field, office, or online**, with stored cards and ACH; in-field collection is tied to the job and feeds the accounting/batching workflow. [Payments Home](https://help.servicetitan.com/docs/payments-overview) · [Collect a payment](https://help.servicetitan.com/how-to/payment-collect)

## 3 · Consumer financing

**Jobber**
- **Wisetack** financing on all plans at a **flat 3.9%** merchant fee; the client sees an **"as low as" monthly** figure next to the quote total, applies in a short form, gets an **instant** eligibility response, and terms run **3 to 120 months**. The pro is **paid in full**, funds arriving **1–3 business days** after the work is completed. [Jobber & Wisetack integration (via help snippet)](https://help.getjobber.com/hc/en-us/articles/360056100954-Jobber-and-Wisetack-Consumer-Financing-Integration) · [Wisetack Finance](https://wisetackapp.com/wisetack-finance.html)

**Housecall Pro**
- **Wisetack** consumer financing at a **flat 3.9%** of the financed amount, **no subscription or extra card-processing fees on top**; Wisetack offers **0% APR for up to 24 months** and terms up to **84–120 months** for larger projects; surfaced directly on invoices and estimates. [Wisetack consumer financing (invoices & estimates)](https://help.housecallpro.com/en/articles/3538947-wisetack-consumer-financing-invoices-estimates) · [Consumer financing feature page](https://www.housecallpro.com/features/consumer-financing/)

**ServiceTitan**
- Integrated financing via **both Sunbit and Wisetack** (more options than the SMB tools), presented as part of the estimate/checkout flow. Exact merchant terms are set with the financing partner. [Integrated customer finance options](https://www.servicetitan.com/features/customer-financing)

## 4 · Deposits, stored cards & auto-charge

**Jobber**
- Can **require a payment method on file** when a client pays a **quote deposit**, saving a card or bank account for future use; Jobber **auto-charges** stored cards, suited to recurring work. [Manage Jobber Payments settings (via help snippet)](https://help.getjobber.com/hc/en-us/articles/115009590727-Manage-your-Jobber-Payments-Settings)

**Housecall Pro**
- **Card on file**, **auto-invoicing**, and progress invoicing; payment methods can be stored and charged for recurring/service-plan work. [HCP Payments collection](https://help.housecallpro.com/en/collections/74819-hcp-payments)

**ServiceTitan**
- **Stored cards** and automated collection tied to the job and invoice; deposits and progress billing feed the accounting/batching layer built for AR teams. [Payment settings and general workflows](https://help.servicetitan.com/docs/payment-settings-and-general-workflows)

## 5 · Instant payout & financial accounts

**Jobber**
- **Instant Payout**: funds land **seconds** after a client pays, **including weekends and holidays**, skipping the standard ~2-day window, for a **1% fee** deducted after all other fees. [Instant Payouts (via help snippet)](https://help.getjobber.com/hc/en-us/articles/360046796833-Instant-Payouts)

**Housecall Pro**
- **Instapay**: card and ACH payments deposited **in ~30 minutes** for **+1% per transaction**. **HCP Money** is a broader financial account adding **Expense Cards**, **Mobile Check Deposit (beta)**, and **Bill Pay (alpha)** — Housecall reaching beyond processing into business banking. [Instapay feature page](https://www.housecallpro.com/features/instapay/) · [HCP Money sign-up & FAQs](https://help.housecallpro.com/en/articles/7263467-hcp-money-how-to-sign-up-faqs) · [My Money overview](https://help.housecallpro.com/en/articles/2790259-my-money-overview)

**ServiceTitan**
- Emphasizes **faster bank deposits** and **automation for accounting** rather than a branded consumer-style instant-payout product; the value is AR/GL integration and batching at scale. [Payment processing feature page](https://www.servicetitan.com/features/payments)

## What it means for FieldPulse

**Native processing at ~2.6–2.9% + ACH is the floor.** All three bundle first-party card + ACH processing at broadly similar published rates; this is table stakes, not a differentiator. The competition is on what sits around it.

**Wisetack at a flat 3.9% is the shared financing default.** Jobber and Housecall both resell Wisetack at the same 3.9% merchant fee with "as low as" messaging on the quote; ServiceTitan adds Sunbit as a second option. Consumer financing surfaced inside the estimate is now an expected checkout element, and matching the Wisetack integration is a concrete, well-trodden path.

**Instant payout has become a paid, expected feature.** Jobber's Instant Payout and Housecall's Instapay are the same idea at the same ~1% premium. If FieldPulse charges card fees but makes pros wait two days for money while competitors offer 30-second payouts for 1%, that's a visible gap.

**Housecall is pushing past payments into banking.** HCP Money (expense cards, check deposit, bill pay) is a land-grab for the contractor's whole financial stack, not just their card processing. That is a strategic direction worth watching: the processor that also holds the operating account is stickier.

**ServiceTitan's edge is accounting depth, not consumer polish.** Its payments story is GL sync, batching, negotiated interchange-plus, and multiple processors, aimed at AR teams. FieldPulse should decide whether it's competing on Housecall's slick consumer-checkout ground or ServiceTitan's accounting-integration ground.

## Questions this raises

- Does FieldPulse offer native card + ACH processing at competitive published rates, and an instant-payout option (the ~1% Instapay/Instant-Payout equivalent)?
- Is consumer financing (Wisetack or similar) surfaced directly on estimates with "as low as" messaging?
- Do we support stored cards + auto-charge for recurring/service-plan work, and required deposits on quotes?
- Is there any ambition toward a financial-account play like HCP Money, or do we stay a processor?
- For larger customers, do we offer interchange-plus / negotiated rates and the AR/GL batching ServiceTitan leans on?

## Source pages

**Jobber:** [Jobber Payments Basics](https://help.getjobber.com/hc/en-us/articles/115009571387-Jobber-Payments-Basics) · [Online payments feature page](https://www.getjobber.com/features/field-service-credit-card-processing/) · [Instant Payouts](https://help.getjobber.com/hc/en-us/articles/360046796833-Instant-Payouts) · [Jobber & Wisetack integration](https://help.getjobber.com/hc/en-us/articles/360056100954-Jobber-and-Wisetack-Consumer-Financing-Integration) · [Manage Jobber Payments settings](https://help.getjobber.com/hc/en-us/articles/115009590727-Manage-your-Jobber-Payments-Settings) · [Jobber pricing breakdown 2026 (secondary)](https://myquoteiq.com/jobber-pricing-breakdown-2026/)

**Housecall Pro:** [Payment processing options](https://help.housecallpro.com/en/articles/2046930-housecall-pro-payment-processing-options) · [Payment feature page](https://www.housecallpro.com/features/payment/) · [Wisetack financing](https://help.housecallpro.com/en/articles/3538947-wisetack-consumer-financing-invoices-estimates) · [Consumer financing feature page](https://www.housecallpro.com/features/consumer-financing/) · [Instapay](https://www.housecallpro.com/features/instapay/) · [HCP Money sign-up & FAQs](https://help.housecallpro.com/en/articles/7263467-hcp-money-how-to-sign-up-faqs) · [My Money overview](https://help.housecallpro.com/en/articles/2790259-my-money-overview) · [HCP Payments collection](https://help.housecallpro.com/en/collections/74819-hcp-payments)

**ServiceTitan:** [Payments Home](https://help.servicetitan.com/docs/payments-overview) · [Payment processing feature page](https://www.servicetitan.com/features/payments) · [Integrated customer finance options](https://www.servicetitan.com/features/customer-financing) · [Payment settings & workflows](https://help.servicetitan.com/docs/payment-settings-and-general-workflows) · [Collect a payment](https://help.servicetitan.com/how-to/payment-collect) · [Payments FAQ](https://help.servicetitan.com/faq/payments-faq) · [Payment processing review (secondary)](https://merchantcostconsulting.com/lower-credit-card-processing-fees/servicetitan-review/)
