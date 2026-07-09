---
type: Teardown
slug: nearmiss-jobber-integrations-api
topic: Integrations & API
competitors: [jobber]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Jobber Integrations & API: Where the Platform Actually Opens Up

This teardown looks specifically at how Jobber exposes its data and workflows to the outside world — public API surface, webhook coverage, the native integration marketplace, developer tooling, and the embedded/partner program that lets other vendors build "inside" Jobber's account experience. We pulled this together after several support threads from switching customers referenced friction points around syncing job data to outside accounting tools and CRM stacks, and we wanted a clearer picture of what Jobber actually ships versus what shows up in marketing copy.

The findings below are based on publicly reachable documentation, developer portal pages, and community forum threads. Where Jobber's docs were ambiguous or contradicted themselves across pages, we flagged it rather than guessing.

## At a glance

| Capability | Jobber (as documented) | FieldPulse (today) | Notes |
|---|---|---|---|
| Public REST/GraphQL API | Nexus API, GraphQL-only, gated behind Pinnacle tier | REST + GraphQL, available on all paid tiers | Jobber's lower tiers cannot query the API at all without an upgrade |
| Webhook event coverage | Flowline Webhooks, ~forty event types documented | Broader event catalog including custom-field change events | Jobber lacks granular field-level change events |
| Native integrations marketplace | Connect Hub, roughly ninety listed apps | Comparable app count, different category mix | Jobber leans heavier on accounting/payroll connectors |
| OAuth / embedded partner support | Partner Bridge Program, invite-only | Open self-serve partner onboarding | Jobber requires a business-development conversation before sandbox access |
| Developer sandbox | Sandbox Forge, separate signup required | Sandbox available inside every account | Extra step adds days to a partner's dev cycle |
| Rate limits | Points-based throttling, undocumented burst ceiling | Fixed per-minute request cap, published in docs | Jobber's throttling model isn't fully documented publicly |
| Zapier / no-code automation | Supported via a Jobber-maintained Zapier app | Supported via native automation builder + Zapier | Comparable coverage, different depth |
| White-label / embedded UI | Not offered | Offered as add-on | Structural gap for Jobber on this front |

## 1 · Public API surface (Jobber Nexus API)

### Jobber

- Jobber's current public API, branded internally in docs as the **Nexus API**, is GraphQL-only — there is no REST equivalent for new integrations, though legacy REST endpoints reportedly still exist for a shrinking list of "grandfathered" partners.
- Access to the Nexus API is gated by subscription tier. Based on the pricing page we reviewed, API access is bundled only with the top-of-line **Pinnacle** plan; customers on lower tiers ("Basecamp" and "Ascent" in Jobber's current naming) must either upgrade or purchase a standalone API add-on priced around **$495/mo**, which is a steep ask for a solo operator or small crew just trying to sync invoices to a bookkeeping tool.
- The schema covers core objects — clients, jobs, quotes, invoices, line items, team members — but notably does not expose recurring-job templates or custom field definitions through the API, according to the schema reference page. Anything built on top of recurring service plans has to fall back on CSV export or manual re-entry.
- Query complexity limits are enforced through a points system rather than a simple requests-per-minute cap. Each field requested contributes to a "cost," and the maximum cost per request isn't published anywhere we could find — several forum posts from partner developers mention hitting throttling errors without a clear budget to plan against.
- Mutations (write operations) lag behind read operations in coverage. Creating a job via the API works; updating job status transitions triggers inconsistent behavior according to a handful of community threads, with some partners reporting that status changes made via API don't always fire the same downstream automations that in-app changes trigger.
- There is no officially supported SDK for major languages. Jobber's docs link to a community-maintained wrapper library for one scripting language, but the repo appeared to have gone quiet, with the last merged pull request dated several release cycles ago based on the changelog we found.

### FieldPulse (for context)

- FieldPulse ships both REST and GraphQL access on every paid tier, with no plan-gating of the API itself (rate limits scale by tier instead of gating access entirely).
- Recurring job templates, custom fields, and custom statuses are all first-class API objects.
- Mutations and reads share the same event pipeline, so automations fire consistently regardless of whether a change originated in-app or via API.

## 2 · Webhooks & real-time event coverage

### Jobber

- Jobber's webhook system, branded **Flowline Webhooks**, supports a documented set of roughly forty event types spanning job creation, quote approval, invoice payment, and visit scheduling changes.
- Field-level change events are not supported — a webhook fires on "job updated" as a single blunt event, and the payload only sometimes includes a diff of what actually changed. Several partner-side developers on the community forum described having to do a full re-fetch of the job object on every webhook just to figure out what changed, which adds latency and API-call overhead (each of those refetches counts against the points-based query budget mentioned above).
- Webhook delivery retries are documented as "best effort" with no published retry schedule or maximum attempt count. One forum thread from a payments-integration vendor described missed webhook deliveries during a stated platform incident, with no backfill mechanism offered to recover the gap — partners were advised to reconcile manually via API pull.
- There's no webhook event for team member location or GPS ping updates, which limits any third-party dispatch-optimization tool from building live map views without polling.
- Signature verification is supported (HMAC-based), and the docs are reasonably clear on that part specifically — this was one of the better-documented corners of the whole developer platform.
- Webhook subscriptions are managed per-app rather than per-account-and-app combination, meaning a partner building a multi-tenant integration has to build their own account-routing logic on top of Jobber's delivery system rather than relying on Jobber to scope it.

### FieldPulse (for context)

- Field-level diffs are included in the payload for update events, reducing the need for a full re-fetch.
- Delivery includes an automatic retry window with exponential backoff and a dead-letter queue that partners can query to recover missed events after an outage.
- GPS/location ping events are available as an opt-in event stream for dispatch-focused integrations.

## 3 · Native integrations marketplace (Connect Hub)

### Jobber

- The marketplace, branded **Connect Hub**, lists somewhere in the neighborhood of ninety apps at the time of this review, spanning accounting, payments, marketing, and communications categories.
- Accounting/payroll is clearly the deepest category — general ledger sync tools, payroll processors, and tax-prep connectors dominate the listing. Marketing and review-management integrations are comparatively thin, with only a handful of listed apps and several appearing not to have been updated recently based on their "last verified" timestamps shown on the listing pages.
- A number of listed integrations are described in the docs as "community-built and unsupported by Jobber," which is a meaningful distinction buried in fine print — customers browsing the marketplace grid don't see an obvious visual indicator distinguishing an officially supported integration from a third-party one until they click through to the detail page.
- Two-way sync is inconsistently supported across listed apps. Several accounting connectors sync invoices one-way (Jobber → accounting tool) with no ability to reflect payment status changes made on the accounting side back into Jobber, which creates reconciliation drift for bookkeepers.
- Search and filtering inside the marketplace UI is limited — there's no way to filter by "two-way sync" or "officially maintained," so evaluating options requires opening each listing individually.
- Marketplace installation for most apps requires an account owner (not just an admin-level user) to authorize the connection, which we found mentioned in a support article as a common source of delay for larger crews where the account owner isn't the person managing day-to-day software.

### FieldPulse (for context)

- The FieldPulse app directory carries a comparable total count of listed integrations but with a more even split across accounting, marketing, and dispatch/routing categories.
- Every listed integration carries a visible "sync direction" badge (one-way vs. two-way) directly in the browse grid.

## 4 · Authentication, sandbox & developer experience

### Jobber

- OAuth2 is the supported auth flow for the Nexus API, using an authorization-code grant. Token lifetime is documented as a fixed number of hours, after which a refresh token must be exchanged — standard enough, though the refresh-token expiry policy (how long a refresh token itself remains valid before a partner has to send a user through full re-auth) isn't clearly stated anywhere in the docs we reviewed.
- A developer sandbox exists (**Sandbox Forge**) but requires a separate signup process distinct from a normal trial account, and based on a support-forum thread, approval for sandbox access is manual rather than instant — one partner developer described waiting several business days for their sandbox credentials to be issued.
- Documentation is organized as a single long-scroll reference page per object type rather than an interactive API explorer. There's no in-browser "try it" console for testing queries before writing code, which several third-party developers flagged as a friction point compared to other platforms they'd integrated with previously.
- Error responses from the API frequently return a generic error code with a human-readable message but no machine-readable error type field, making it harder for partner applications to build reliable retry/error-handling logic programmatically.
- Changelog entries for the API are published, but backward-incompatible schema changes have reportedly gone out with fairly short advance notice on at least one occasion referenced in a community post — a partner mentioned a field being renamed with what they described as "under a week's" notice before the old field name stopped resolving.
- Rate limit responses do include a header indicating the remaining points budget, which is a reasonable practice, but the total budget per plan tier isn't published on any public pricing or docs page we could locate — partners have to hit the ceiling empirically to learn it.

### FieldPulse (for context)

- Sandbox access is provisioned automatically and instantly for every account, no separate approval step required.
- The docs portal includes an interactive query console alongside static reference pages.
- Deprecation policy publishes a fixed minimum notice window for any breaking schema change, stated directly in the developer terms.

## 5 · Embedded / white-label & partner program

### Jobber

- Jobber runs an invite-only **Partner Bridge Program** for vendors who want deeper access — things like embedded UI components, co-branded onboarding flows, or revenue-share arrangements. There is no public self-serve application; the listed contact path is a business-development email address and a "tell us about your integration" form.
- There is no white-label or embeddable widget offering documented anywhere in the public developer materials — partners wanting to surface Jobber data inside their own product have to build entirely custom UI against the API rather than dropping in a pre-built embeddable component.
- A "Verified Partner" badge exists for apps that complete Jobber's review process, but the review criteria aren't published; the closest thing to a rubric is a short bullet list on a marketing page emphasizing "reliability, security, and customer support quality" without measurable thresholds.
- Revenue-share terms for the partner program aren't published publicly at all — every mention of compensation structure in what we found routes back to "contact our partnerships team," which makes it difficult for a smaller integration vendor to evaluate whether building on Jobber is worth the engineering investment before talking to a human.
- Co-marketing opportunities (joint webinars, marketplace featured placement) appear to be reserved for a short list of larger partners based on the "Featured Partners" section of the Connect Hub landing page, which has featured largely the same handful of logos across the snapshots we compared over recent months.

### FieldPulse (for context)

- FieldPulse's partner tiers are published with explicit criteria and self-serve application for the entry tier.
- An embeddable "Book Now" widget and a lightweight embedded scheduling component are available to partners without a custom-build requirement.

## What it means for FieldPulse

A few implications stand out from this pass:

- **The API-behind-a-paywall structure is a real wedge.** Prospects evaluating Jobber who want any kind of accounting sync, custom reporting pipeline, or homegrown automation have to either commit to the top plan or pay an incremental API add-on just to get read access. We should make sure sales conversations with price-sensitive switchers surface this clearly — "API access included on every paid tier" is a legitimate differentiator, not just a docs footnote.
- **Field-level webhook diffs are an underrated technical selling point** for any partner or in-house engineering team evaluating both platforms side by side. Jobber's blunt "object updated" events push real cost onto integrators (extra API calls just to figure out what changed), and that cost compounds against their points-based rate limiting. Worth a short technical one-pager for solutions engineers.
- **The Partner Bridge Program's invite-only structure creates an opening for us with smaller integration vendors** who can't get a foot in the door with Jobber without a business-development conversation. A self-serve partner tier with clear published terms is something we should keep prioritizing in outbound to niche vertical-software vendors (route-optimization tools, niche CRMs, industry-specific compliance software) who might otherwise default to whichever platform is easiest to build against.
- **Marketplace sync-direction ambiguity is a support-ticket generator for Jobber, and a marketing angle for us.** The absence of a visible "two-way vs. one-way sync" indicator in their marketplace grid means customers likely discover sync gaps only after they've already committed to a connector. A comparison chart or interactive marketplace filter on our own site emphasizing sync direction transparency could be a differentiator worth testing.
- **We should double-check our own deprecation policy is externally documented as clearly as we think it is,** given how much friction Jobber's undocumented breaking-change notice period apparently causes for their partner developers. This is an easy area to look better in simply by publishing what we already do internally.

## Questions this raises

- Is the points-based rate-limiting model on Jobber's Nexus API something prospects actually hit in practice, or is it mostly a theoretical ceiling that rarely matters for typical small-crew usage patterns?
- How much of the "invite-only" partner program framing is genuinely selective versus just an under-resourced partner