---
type: Teardown
slug: nearmiss-housecall-pro-integrations-api
topic: Integrations & API
competitors: [housecall-pro]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Housecall Pro — Integrations & API Teardown

This teardown looks specifically at how Housecall Pro exposes its platform to third parties: the public API surface, webhook infrastructure, native marketplace connectors, accounting/payments plumbing, and the partner ecosystem wrapped around all of it. The goal is to understand where Housecall Pro is investing engineering effort, where the integration story is mostly marketing gloss over a thin API, and what gaps FieldPulse should either close or lean into as a differentiator. All figures below were pulled from publicly reachable documentation, changelog entries, and community forum threads; where Housecall Pro gates something behind a sales call, that is flagged explicitly rather than guessed at.

Housecall Pro markets its integration layer under the brand name **ConnectHub**, which bundles a hosted marketplace, a REST-ish developer API, and a webhook relay service called **Relay Events**. None of this is free by default — most of the meaningful pieces sit behind an add-on called the **Open Access Tier**, which is layered on top of the core subscription plans (branded internally as Core, Plus, and Max, none of which map cleanly onto anything FieldPulse currently ships).

## At a glance

| Dimension | Housecall Pro (ConnectHub) | FieldPulse (current state) |
|---|---|---|
| Public REST API | Yes, gated behind Open Access Tier add-on | Yes, included on all paid plans |
| Webhook event types | Roughly forty-seven documented event types | Around twenty, expanding quarterly |
| Native marketplace apps | Ninety-four listed, many are thin/read-only | Sixty-ish listed, curated more tightly |
| Accounting connectors | QuickBooks Online (deep), Xero (basic) | QuickBooks Online (deep), Xero (deep) |
| Payment gateway options | Native processor only, no BYO gateway | Native processor plus BYO gateway |
| Developer sandbox | Available, requires partner approval | Self-serve, no approval gate |
| API rate limit (standard tier) | ~1800 requests/hour, burst-limited | 5000 requests/hour flat |
| OAuth support | Yes, authorization-code flow only | Yes, authorization-code and client-credentials |
| Partner/reseller program | Three-tier program (Registered, Certified, Premier) | Informal, no tiered structure |
| Add-on pricing for API access | $45–$340+/mo depending on tier | Included, no separate SKU |

## 1 · Public API surface

**Housecall Pro**
- The core API is described in developer docs as "REST-based" but several endpoints (notably job scheduling and technician assignment) still return SOAP-flavored XML wrapped in a JSON envelope, which partner-forum threads describe as an unpleasant surprise for new integrators.
- Access is not bundled with the base subscription. A business has to purchase the Open Access Tier add-on — priced at $45/mo for a "Read" scope, $85/mo for "Read/Write," and $125/mo for "Read/Write + Webhooks" — before any API keys are issued.
- Enterprise customers can negotiate a custom SKU (documented informally as "$340+/mo") that raises rate limits and unlocks a dedicated integration success manager, but this requires a sales conversation; there's no self-serve path to that tier.
- Authentication uses OAuth with an authorization-code flow only. There is no client-credentials grant for pure server-to-server integrations, which several developer-forum posts flag as a friction point for backend automation tools that don't have a human in the loop to click "Authorize."
- Rate limits sit around eighteen hundred requests per rolling hour on the standard Open Access tier, with a documented burst allowance that drops sharply after repeated spikes — described in the docs as "adaptive throttling," though the exact throttling curve isn't published.
- The API reference site uses an interactive explorer, but write-endpoint examples are noticeably sparser than read-endpoint examples; roughly seven of the documented write operations have no example payload at all as of the last changelog pass.
- Versioning is handled via a URL path segment; the current stable version is referred to as "the v5 surface," with v4 still live for legacy partners but marked deprecated with a stated sunset window of "future notice," not a fixed date.

**FieldPulse comparison note**
- FieldPulse ships API access on every paid plan with no separate purchase step, and supports both authorization-code and client-credentials OAuth flows out of the box — a meaningful edge for backend-only integrations like data warehouses or BI pipelines that don't have a human user to authenticate.

## 2 · Webhooks & real-time data sync

**Housecall Pro**
- Relay Events, the webhook system, supports roughly forty-seven distinct event types spanning job status changes, invoice state transitions, payment captures, and technician location pings.
- Delivery is "at least once," and Housecall Pro's own docs recommend idempotency keys on the consumer side — a reasonable practice, but it means every integrator has to build dedupe logic rather than relying on guaranteed single delivery.
- Retry behavior is described as exponential backoff over a window of "up to several hours," with failed deliveries eventually landing in a dead-letter view inside the ConnectHub developer dashboard, viewable only by account admins, not by the technical contact who set up the webhook.
- There is no webhook signing secret rotation self-service flow; rotating a signing secret requires opening a support ticket, which several partner-community threads describe as a multi-day turnaround during busy season.
- Batch/replay tooling exists but is described in the docs as "beta," and forum chatter suggests it silently drops events older than a retention window that isn't clearly stated anywhere public.
- There is no support for filtering webhook payloads server-side (e.g., "only send me jobs tagged HVAC") — consumers get the full event stream for a category and have to filter client-side, which increases bandwidth and processing overhead for high-volume shops.

**FieldPulse comparison note**
- FieldPulse's webhook layer is smaller in raw event-type count but supports payload filtering by tag and by job type, plus self-service signing-secret rotation — both of which show up as recurring asks in Housecall Pro's own community forum.

## 3 · Native marketplace & pre-built connectors

**Housecall Pro**
- The ConnectHub Marketplace lists ninety-four apps, but a manual audit of the top forty by install count shows a meaningful chunk are thin, read-only integrations (e.g., "view your jobs in [Tool]") rather than deep, bidirectional syncs.
- Marketing and review-management connectors are the most mature category — Housecall Pro clearly prioritized this segment, with polished two-way sync for review requests, campaign triggers, and reputation dashboards.
- Inventory and parts-ordering connectors are thin; only a handful of listed apps actually push stock-level data back into job costing, and none of the audited ones support multi-warehouse quantity sync.
- Marketplace listings are curated by Housecall Pro's own partner team, and there's a visible backlog — several partner applications sit in a "Submitted" status in the public partner directory for what forum posts describe as extended periods without status updates.
- There's no user-facing sandbox environment for testing a marketplace app before installing it into a live account; testing happens in production, which several small-business owners on the community forum cite as a reason they avoid trying new marketplace apps during busy seasons.
- Marketplace apps do not carry a standardized permission-scope model visible to the installing business — installing an app grants it broad account access by default, and there's no granular "only see jobs, not payroll" toggle at install time.

**FieldPulse comparison note**
- FieldPulse's marketplace is smaller in raw count but every listed connector must pass a written integration-quality checklist before publishing, and installs use a granular scope-consent screen — a difference worth calling out in competitive materials aimed at security-conscious franchise buyers.

## 4 · Accounting & payments connectors

**Housecall Pro**
- QuickBooks Online sync is the deepest connector in the whole marketplace — two-way sync of invoices, payments, customers, and a subset of job-costing data, with a documented sync cadence of roughly every fifteen minutes.
- Xero support exists but is materially behind QuickBooks: it syncs invoices and payments but not customers or job-costing detail, and several accountant-focused forum threads describe it as "good enough for basic bookkeeping, not for real job profitability tracking."
- There is no native Sage or Wave connector; both show up as frequently requested items in the public feature-request board with no committed timeline.
- Payments are processed exclusively through Housecall Pro's own in-house processor — there is no bring-your-own-gateway (BYOG) option, meaning a shop already contracted with an external processor has to either switch or run payments outside the platform entirely and reconcile manually.
- The in-house processor's transaction fee is listed in small print as roughly 3.4% plus a flat $0.45 per transaction for card-present, with a slightly different blended rate for card-not-present transactions that isn't published on the main pricing page and instead requires opening the billing FAQ.
- ACH processing is supported but carries its own separate fee schedule, and the reconciliation export for ACH transactions doesn't automatically match to QuickBooks — it has to be manually mapped, according to a support-article footnote.

**FieldPulse comparison note**
- FieldPulse supports bring-your-own-gateway alongside its native processor, and syncs both QuickBooks Online and Xero at comparable depth (customers, invoices, payments, and job costing) — a genuine structural advantage worth highlighting to prospects currently locked into Housecall Pro's single-processor model.

## 5 · Partner program & ecosystem strategy

**Housecall Pro**
- The partner program has three published tiers: Registered (free, listing-only), Certified (requires a technical review and a small annual fee, reported informally as being in the low hundreds of dollars), and Premier (invite-only, includes co-marketing and a dedicated partner manager).
- Certified-tier partners get access to a private Slack-adjacent community channel and quarterly roadmap briefings, but several partner accounts report that roadmap briefings are frequently rescheduled and thin on concrete detail.
- There is no public API changelog subscription (RSS/webhook) for developers — changes are announced via a blog post and an email list, and multiple partner-forum posts describe missing breaking-change announcements until something broke in production.
- Housecall Pro does not publish a formal deprecation policy (e.g., "endpoints stay live for X months after deprecation notice"); the only language available is "reasonable advance notice," which partner developers have flagged as too vague to plan against.
- The developer sandbox environment requires partner-tier approval before issuing sandbox credentials — there's no fully self-serve "sign up and get a test account in minutes" flow, which is a real friction point compared to more API-forward competitors in adjacent verticals (not covered in this teardown).
- Co-marketing opportunities (joint webinars, marketplace placement boosts) are reserved for Premier-tier partners, creating a fairly steep climb for smaller integration vendors trying to get visibility inside the marketplace.

**FieldPulse comparison note**
- FieldPulse's lighter-weight partner model (no formal tiering yet) is