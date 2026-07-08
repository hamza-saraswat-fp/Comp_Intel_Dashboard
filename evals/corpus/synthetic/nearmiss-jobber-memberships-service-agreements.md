---
type: Teardown
slug: nearmiss-jobber-memberships-service-agreements
topic: Memberships & service agreements
competitors: [jobber]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Competitor Teardown: Jobber's Memberships & Service Agreements Stack

This teardown looks specifically at how Jobber packages recurring revenue tooling for home and commercial service contractors — membership plan builders, service-agreement templates, renewal billing, and the reporting layer that ties recurring work back to technician schedules. It's written for the FieldPulse product and growth teams who are weighing whether our own membership module needs a rebuild before the next roadmap cycle. Everything below reflects publicly documented behavior at the time of writing plus hands-on trial-account testing; feature names, prices, and limits are paraphrased and may drift as Jobber ships updates.

Memberships have become a quiet battleground in field service software. Contractors increasingly treat recurring maintenance plans — HVAC tune-ups, pest control routes, gutter and drain packages — as their most defensible revenue line, and the software that manages renewals, reminders, and agreement terms is now a genuine differentiator rather than a back-office nicety. Jobber has invested visibly here, folding membership logic into its scheduling and invoicing core rather than treating it as a bolt-on.

## At a glance

| Dimension | Jobber's current approach | Notes for FieldPulse |
|---|---|---|
| Plan builder | Visual "RecurraPlan" builder with tiered pricing and add-on visit bundles | Ours is closer to a flat recurring invoice; no tiering UI yet |
| Agreement templates | "Agreement Vault" library with pre-built clause sets by trade | We rely on generic PDF uploads today |
| Renewal billing | Auto-renew engine with configurable grace windows (45–90 days) | Comparable logic exists but lacks grace-window config |
| Customer self-service | Client Hub renewal cards inside the existing customer portal | We expose renewals only via email, no portal card |
| Reporting | PlanTrack dashboard for MRR-style recurring revenue tracking | We report recurring revenue as a manual export only |
| Cancellation handling | Configurable win-back sequence with reason-code capture | We log cancellation as a status flag with no follow-up |
| Multi-property support | Linked "Property Grouping" for one payer, many service addresses | We support this at the job level, not the agreement level |

## 1 · Membership Plan Builder & Tiering

Jobber's membership tooling centers on what the company calls RecurraPlan, a builder that lets office staff assemble named tiers (their sample account ships with "Essential," "Preferred," and "Premier" naming conventions) and attach visit cadences, included services, and discount rules to each one.

- Plan tiers can be built with a drag-style visit scheduler — a Preferred tier might include four seasonal visits plus a discounted rate on parts, while Premier adds priority dispatch language and a bundled inspection.
- Pricing per tier is configurable per customer segment; in testing, a residential HVAC template defaulted to roughly $45/mo for the entry tier, $75/mo for the mid tier, and $95/mo for the top tier, though these are clearly meant as starting templates rather than fixed numbers.
- Add-on visits outside the plan cadence can be billed at a preset overage rate — the sandbox account had this set to $9 per extra dispatch, automatically pulled from the card on file.
- Multi-property grouping lets a single commercial payer link several service addresses under one membership record, with consolidated billing and per-site visit tracking. This is presented as a premium capability gated behind Jobber's higher account tiers rather than available broadly.
- Plans can be cloned and versioned, so a contractor rolling out a rate change mid-year can create a new plan version without breaking existing customer agreements — existing members stay on the legacy terms unless manually migrated.
- There's a built-in "plan health" indicator that flags members whose visit cadence has drifted (for example, someone on a quarterly plan who hasn't had a technician on site in the expected window), which nudges dispatch to schedule a catch-up visit.

What's less developed: the tiering UI doesn't obviously support usage-based add-ons (metered consumables, for instance), and testers reported that switching a customer between tiers mid-cycle triggers a manual proration step rather than an automatic recalculation.

- Jobber support documentation frames RecurraPlan as most mature for trades with predictable seasonal cadences (HVAC, lawn care, pest control) and less tailored to trades with irregular service intervals.
- The plan builder does not currently expose a public API endpoint for bulk plan creation, meaning agencies managing plans across many franchise locations must configure each account by hand or via CSV import.

## 2 · Recurring Billing & Renewal Automation

Once a membership is active, Jobber's renewal engine takes over recurring invoicing, dunning, and grace-period handling.

-