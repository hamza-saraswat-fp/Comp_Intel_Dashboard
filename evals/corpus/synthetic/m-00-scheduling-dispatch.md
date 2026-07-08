---
type: Teardown
slug: m-00-scheduling-dispatch
topic: Scheduling & dispatch
competitors: [fieldrocket, servicegrove, tradehalo]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Scheduling & Dispatch Teardown: FieldRocket vs. ServiceGrove vs. TradeHalo

Scheduling and dispatch is the feature area where most field service buyers make or break a purchase decision inside the first demo. It's also the area where vendors differentiate the least on paper and the most in the details — how a board scrolls, whether a reschedule cascades correctly, how many clicks it takes to swap a technician mid-route. This teardown looks at three mid-market competitors — FieldRocket, ServiceGrove, and TradeHalo — across their scheduling boards, route intelligence, mobile dispatch experience, packaging, and platform extensibility. All three sell into the same buyer profile as FieldPulse: HVAC, plumbing, electrical, and multi-trade shops running somewhere between a handful and several dozen trucks.

The findings below come from public help documentation, recorded demo walkthroughs, pricing pages, and community forum threads referenced at the end of this document. Where vendors don't publish specifics (which is often, particularly around route optimization internals), that's noted explicitly rather than guessed at.

## At a glance

| | FieldRocket | ServiceGrove | TradeHalo |
|---|---|---|---|
| Core dispatch model | Single drag-drop board, color-coded by crew | Dual view: Grid + Map toggle | Timeline board with AI auto-balance |
| Route optimization | Manual + "SmartSlot" suggestion engine | RouteSense engine, opt-in per job | Auto-Balance runs continuously in background |
| Mobile app | Native iOS/Android, offline caching | Native iOS/Android, web-first fallback | Native iOS/Android, tablet-optimized |
| Entry price | $84/user/mo (Starter) | $145/mo flat, up to four users | $58/user/mo (Ignite) |
| Top plan (named) | $118/user/mo (Crew) | $310/mo, up to ten users (Grove Pro) | $95/user/mo (Momentum) |
| Enterprise tier | Custom (Command) | Custom (Grove Enterprise) | Custom (Apex) |
| Notable strength | Board speed and keyboard shortcuts | Map-based dispatch for dense urban routes | Continuous auto-rebalancing during the day |
| Notable gap | No native map view on the dispatch board | RouteSense requires manual opt-in per job | Auto-Balance can override dispatcher intent silently |

## 1 · Scheduling board & dispatch UX

The scheduling board is the surface dispatchers stare at for most of their shift, so small friction compounds fast. All three vendors have converged on a similar visual grammar — a horizontal timeline with technicians as rows and time as columns — but they diverge sharply in how editable that board actually is.

**FieldRocket**
- The Dispatch Board is a single unified view: no separate map, no toggle. Jobs are colored by crew, and unassigned jobs sit in a persistent sidebar labeled "Unscheduled," which dispatchers described in forum threads as the fastest way they've found to spot orphaned work orders.
- Drag-and-drop is snappy in demo recordings — jobs can be dragged between technician rows and the board re-renders without a visible reload, which several reviewers called out as noticeably faster than a prior tool they'd used.
- Keyboard shortcuts exist for common actions (reassign, extend duration, mark en route) but are undocumented outside a single help article buried under "Power user tips," which suggests the feature is real but under-marketed.
- There is no native map overlay on the dispatch board itself. To see technician locations geographically, dispatchers must switch to a separate "Live Map" screen, which is a different route entirely in the app and does not share filters with the board.
- Recurring jobs and multi-day jobs render as a single collapsed bar rather than expanding across the timeline, which one integrator's blog post flagged as confusing for crews doing multi-day installs.

**ServiceGrove**
- ServiceGrove ships two coexisting views of the same schedule: Grid View (the traditional timeline) and Map View (technicians as pins on a live map with job markers). Dispatchers can toggle between them with a single control at the top of the screen, and filters persist across the toggle.
- Map View is clearly the more developed experience — pins update in near real time, and clicking a pin surfaces a compact job card without navigating away. Grid View, by contrast, has a noticeably older visual style, with smaller touch targets that a UX-focused review site flagged as harder to use on tablets.
- Dragging a job in Grid View triggers a confirmation modal by default ("Move this job to Alex R.? Yes / Cancel"), which several users on a community forum described as helpful for new dispatchers but tedious at volume. It can be disabled in account settings, but that setting is not obvious and isn't mentioned in the main onboarding checklist.
- ServiceGrove's board supports "job pinning," which locks a job in place so bulk-reschedule actions skip over it — a feature FieldRocket lacks and TradeHalo handles differently (see below).
- Multi-technician jobs (two or more techs on one job) render cleanly across both views, which is a genuine strength — this is a common failure point for competing boards.

**TradeHalo**
- TradeHalo's board is a timeline called "Halo Timeline," but its defining feature is that it isn't purely manual: an always-on assistant called Auto-Balance continuously reshuffles unscheduled and lower-priority jobs across the day as conditions change (a cancellation, a job running long, a technician calling in late).
- In the demo walkthrough, Auto-Balance visibly moved three jobs between technicians mid-session without an explicit dispatcher action, replacing them with a small "rebalanced" tag and a one-line explanation ("moved to reduce drive time"). This is presented as a feature, but forum threads show a meaningful subset of dispatchers found it disorienting, especially in the first weeks of use.
- There is a toggle to pause Auto-Balance per-job (functionally similar to ServiceGrove's pinning) but it defaults to on for every new job, meaning dispatchers who don't know about the setting may find jobs moving without realizing why.
- The timeline supports color-coding by job type or by crew, which is configurable — a nice touch not present in FieldRocket's crew-only coloring.
- TradeHalo does not currently offer a standalone map view integrated into the same screen as the timeline; live technician locations are shown in a separate "Field View" panel that requires a screen change.

## 2 · Route optimization & travel-time intelligence

This is the section where marketing language and actual mechanics diverge most across vendors. None of the three publish their routing algorithm in detail, so most of what follows is inferred from documented behavior, help-center wording, and demo output.

**FieldRocket**
- SmartSlot is FieldRocket's suggestion engine: when a dispatcher opens the "unscheduled" panel and clicks a job, SmartSlot recommends up to five candidate technician/time-slot pairings ranked by estimated drive time and technician availability. It does not auto-assign; the dispatcher must accept a suggestion.
- Help documentation describes the ranking as factoring in "estimated drive time, skill match, and existing schedule density," but doesn't define how those are weighted relative to one another, and support staff on a community call declined to elaborate beyond that description.
- SmartSlot appears to be job-by-job rather than fleet-wide: it doesn't seem to re-optimize the whole day when a new job is slotted in, which means dispatchers doing high job-volume days may need to re-run suggestions repeatedly rather than getting a single optimized plan.
- There's no user-facing metric showing "time saved" or "miles saved" from using SmartSlot, which makes it hard for a shop owner to justify the feature internally when comparing plans.
- Route optimization is bundled into the Crew and Command tiers only; Starter customers get the dispatch board without SmartSlot suggestions at all.

**ServiceGrove**
- RouteSense is ServiceGrove's optimization engine, and it is explicitly opt-in per job rather than always-on. A dispatcher marks a job "optimize" and RouteSense recalculates the technician's remaining stops for that day to minimize total drive distance.
- Because it's opt-in per job rather than a fleet-wide setting, RouteSense's real-world value depends heavily on dispatcher habits — a shop that forgets to mark jobs for optimization gets none of the benefit, and there's no bulk "optimize all remaining jobs today" button as of this writing.
- ServiceGrove's help center publishes an example case study claiming a regional plumbing customer reduced daily windshield time by roughly 22% after adopting RouteSense company-wide, though the case study doesn't specify fleet size, season, or measurement window, so it should be treated as directional rather than verified.
- RouteSense is available starting at Grove Pro; Grove Basic customers see manual drag-and-drop only, with no optimization suggestions of any kind.
- Map View makes the output of RouteSense visually legible — recalculated routes redraw on the map with the new stop order highlighted — which is arguably the single best routing visualization among the three vendors.

**TradeHalo**
- Auto-Balance, described above as a scheduling feature, is really TradeHalo's routing engine wearing a scheduling hat: it continuously re-evaluates the whole fleet's remaining stops, not just one technician's day, and moves jobs across technicians as well as within a single technician's route.
- This fleet-wide, continuous approach is the most ambitious of the three, and in demo recordings it produced visibly tighter clustering of jobs by geography than either FieldRocket's SmartSlot suggestions or a non-optimized ServiceGrove board.
- The tradeoff is control: because Auto-Balance runs in the background by default, dispatchers who want to guarantee a specific technician keeps a specific job (a favorite customer relationship, a technician who already has parts in the truck) have to remember to pin it, and the default-on behavior means new customers can be caught off guard.
- TradeHalo's help documentation is more forthcoming than the other two about the weighting factors used: it lists "drive time, job priority flag, technician skill tags, and time-window commitments" as inputs, in that stated order, though it doesn't quantify the weights.
- Auto-Balance is included at every plan tier including Ignite, which is a genuine differentiator — TradeHalo doesn't gate routing intelligence behind its higher tiers the way FieldRocket and ServiceGrove do.

## 3 · Mobile technician experience

Dispatch quality is only half the story; the technician-facing mobile app determines whether the schedule dispatchers build actually survives contact with the field.

**FieldRocket**
- The FieldRocket mobile app caches the day's schedule locally and continues functioning with intermittent connectivity, syncing status changes (en route, on site, complete) once signal returns. Reviewers on an HVAC contractor forum specifically praised this for rural service areas.
- Technicians see only their own schedule by default; there's a permission toggle to let senior techs view teammates' schedules, but it's off by default and requires an admin to enable per user, which several shops found more restrictive than expected during onboarding.
- Job detail screens support photo attachments, signature capture, and a notes field, but there's no built-in checklist or form builder — technicians type free-text notes, which several reviews flagged as a gap compared to more form-driven competitors outside this teardown's scope.
- Push notifications for schedule changes are reliable in testing, arriving within roughly a minute of a dispatcher reassignment, though the notification text is generic ("Your schedule has changed") rather than specifying what changed.

**ServiceGrove**
- ServiceGrove's mobile app is native but leans on a web-based fallback for certain screens (notably the customer history view), which means those specific screens require a live connection and don't cache offline. This was flagged in a support forum thread as a pain point in basements and rural properties with weak signal.
- The app mirrors Map View from the dispatcher board, so technicians can see their own route plotted geographically with turn-by-turn handoff into a third-party maps app — a nice touch that neither FieldRocket nor TradeHalo currently replicates natively.
- Technicians can message dispatch directly from the job screen through an in-app thread, which several reviewers called out as reducing phone-call volume between field and office meaningfully.
- Job completion requires a mandatory signature or a documented "customer unavailable" override; there's no way to close a job silently without one of the two, which shop owners cited as a positive for accountability.

**TradeHalo**
- TradeHalo's mobile app is explicitly tablet-optimized, with a layout that rescales cleanly on larger screens — useful for install crews who mount a tablet in a van rather than relying on a phone.
- Because Auto-Balance can reassign jobs during the day, the technician app needs to communicate schedule changes clearly, and it mostly does: a banner notification explains what moved and why ("Job #4471 removed — reassigned to reduce drive time"), which is more transparent than FieldRocket's generic push text.
- However, a recurring complaint in review threads is that technicians sometimes see a job appear and disappear from their queue more than once in a single morning as Auto-Balance re-evaluates, which a few reviewers described as feeling "twitchy" compared to a stable, dispatcher-controlled schedule.
- The technician app includes a lightweight checklist builder that admins can attach to specific job types (e.g., a five-step safety check before an install begins), which is a meaningful edge over FieldRocket's free-text-only notes.
- Offline support exists but is described in the help center as "best effort," with a caveat that checklist submissions may delay syncing until connectivity returns — less confidence-inspiring language than FieldRocket's offline messaging.

## 4 · Pricing & packaging

Packaging shapes which features a shop actually gets in practice, independent of what the marketing site emphasizes.

**FieldRocket**
- Three named tiers: Starter at $84 per user per month (dispatch board, no route suggestions), Crew at $118 per user per month (adds SmartSlot and the Live Map screen), and Command, which is custom-quoted and adds multi-location support and role-based permission granularity.
- There is no flat-rate option — pricing is strictly per user across all tiers, which several smaller shops on a forum thread noted makes FieldRocket comparatively expensive once a shop grows past a modest technician count, since dispatchers and admins are billed as users too.
- FieldRocket offers a limited trial (documentation describes it as a "hands-on evaluation period" without stating an exact duration on the public pricing page, which is itself notable — most competitors state trial length explicitly).
- Annual billing is available at a stated discount, though the discount percentage is only disclosed after entering a sales conversation rather than published on the pricing page.

**ServiceGrove**
- ServiceGrove breaks from per-user pricing entirely: Grove Basic is a flat $145 per month covering up to four users, Grove Pro is $310 per month covering up to ten users, and Grove Enterprise is custom for larger fleets with negotiated user counts.
- This flat-banded structure benefits shops near the top of a band (e.g., a shop with four users on Basic effectively pays less per seat than a shop with two) but creates an awkward cliff for a shop with, say, five users, which must jump the entire tier to Grove Pro rather than adding a single seat.
- RouteSense, Map View, and job pinning are only available starting at Grove Pro — Grove Basic customers get Grid View dispatch only, with no map and no optimization, which is a meaningfully stripped-down entry offer relative to its two competitors here.
- ServiceGrove publishes its pricing openly on its marketing site including the user-band cutoffs, which is more transparent than FieldRocket's custom-quote-heavy approach.

**TradeHalo**
- TradeHalo's entry tier, Ignite, is priced at $58 per user per month and — notably — includes Auto-Balance routing from day one, which undercuts both FieldRocket's and ServiceGrove's entry price while including more routing capability out of the gate.
- Momentum, at $95 per user per month, adds the checklist builder, multi-technician job support, and priority support response commitments.
- Apex is custom-quoted and adds multi-location dispatch, custom reporting exports, and a dedicated onboarding specialist for the first stretch of usage.
- TradeHalo's pricing page states a stated free-trial window of three weeks with no credit card required, which is more specific and buyer-friendly than FieldRocket's vaguely worded trial language, though it's still shorter than what some competitors elsewhere in the market advertise.
- Because Auto-Balance is bundled at every tier, TradeHalo's overall packaging reads as the most feature-dense at the entry level, even though its per-user price sits between the other two vendors' entry points once ServiceGrove's flat-rate math is normalized to a per-seat basis.

## 5 · Integrations & platform extensibility

Scheduling tools rarely operate in isolation — dispatch quality is often bottlenecked by whether the calendar can talk to accounting, communications, and parts systems.

**FieldRocket**
- FieldRocket documents a public API for jobs, customers, and technician status, with rate limits described in its developer portal, and maintains prebuilt connectors for two mainstream accounting platforms and one popular calendar suite.
- There is no native marketplace of third-party apps; integrations are either built by FieldRocket directly or done through the open API by an integrator, which a couple of reviewers on a developer forum noted makes lightweight integrations (like a simple webhook to a Slack-equivalent channel) more effort than they'd expect.
- Zapier-style automation is supported through a documented set of triggers ("job created," "job completed," "technician assigned") but the trigger list is shorter than what ServiceGrove exposes.

**ServiceGrove**
- ServiceGrove has invested more visibly in a partner ecosystem: a small but curated app marketplace lists connectors for accounting, a couple of parts-ordering platforms, and a review-request tool, each with its own setup wizard inside the ServiceGrove admin panel.
- The public API documentation is more thorough than FieldRocket's, including sample payloads and a sandbox environment for testing integrations before going live — a detail several integrator blog posts called out favorably.
- However, RouteSense and Map View data (technician location history, optimized route sequences) are not exposed through the public API as of this writing, meaning shops that want to build custom routing analytics externally can't easily pull that specific data out.

**TradeHalo**
- TradeHalo's platform story centers on its own ecosystem rather than broad third-party openness: Auto-Balance, the checklist builder, and technician messaging are all deeply wired into each other internally, but the public API surface is comparatively narrow, covering jobs and customers but not exposing Auto-Balance's internal recommendation data or reasoning.
- A support forum thread indicates a broader developer API is "on the roadmap" without a committed timeframe, which is language worth treating skeptically until it ships.
- TradeHalo does integrate natively with two mainstream accounting platforms and offers webhook support for job status changes, which covers the basics most shops need even without a full marketplace.

## What it means for FieldPulse

Taken together, these three products triangulate around a common tension: automation versus control. FieldRocket keeps the dispatcher fully in charge but under-invests in geographic visualization and offers no optimization at its entry tier. ServiceGrove builds the best map-based dispatch experience of the three but gates its most useful features (RouteSense, pinning, Map View itself) behind its second tier, and its flat-rate banding creates awkward seat-count cliffs. TradeHalo pushes hardest on continuous, always-on optimization and bundles it even into its cheapest plan, but the default-on behavior of Auto-Balance appears to generate real dispatcher trust issues in the first weeks of adoption, based on recurring forum complaints.

For FieldPulse, this suggests a positioning opportunity rather than a feature-parity race. None of the three vendors here have solved the "explain the recommendation" problem well — FieldRocket doesn't quantify SmartSlot's suggestions, ServiceGrove's opt-in model puts the burden entirely on the dispatcher to remember to use it, and TradeHalo's Auto-Balance explains itself only after the fact, once a job has already moved. A scheduling experience that surfaces *why* before a change happens rather than after, with an easy accept/reject step rather than either full manual control or full automatic reassignment, would sit in a meaningfully different spot on this map.

Packaging is another opening. All three vendors gate meaningful routing or visualization capability behind a middle or top tier (FieldRocket gates SmartSlot behind Crew, ServiceGrove gates RouteSense and Map View behind Grove Pro), which leaves small shops on entry tiers with materially weaker dispatch tooling than what's shown in marketing demos. TradeHalo is the exception in bundling routing everywhere, and it's notable that its entry price is also the lowest of the three — that combination is likely a meaningful part of its growth story and worth taking seriously as a competitive threat rather than dismissing the automation concerns as purely a downside.

Finally, the offline and connectivity story is uneven across all three. FieldRocket's caching approach reads as the most robust based on available documentation and reviews; ServiceGrove's partial web-fallback screens and TradeHalo's "best effort" offline language for checklist syncing both suggest room for a competitor to win rural and low-connectivity accounts on reliability alone.

## Questions this raises

- How much of TradeHalo's Auto-Balance friction is a genuine product design flaw versus an onboarding and change-management gap that better in-app education could fix?
- Does ServiceGrove plan to close the Grid View versus Map View feature gap, or is Grid View being quietly deprecated in favor of a map-first future?
- Is FieldRocket's lack of published trial length and annual discount pricing a deliberate sales-qualification tactic, or a sign the offer varies more than competitors' and can't be standardized on a public page?
- Would a dispatcher-facing "confidence score" alongside any auto-suggested or auto-assigned job (rather than a binary accept/silent-move) meaningfully reduce the trust issues seen in TradeHalo's reviews, and is that a testable, buildable differentiator?
- How defensible is TradeHalo's low entry price once its underlying routing costs (compute for continuous fleet-wide recalculation) scale with customer volume — is this pricing sustainable or an initial land-grab number?
- Do any of the three vendors expose enough API surface around routing and optimization data for a shop to build genuinely independent reporting, or is that a shared gap worth exploiting?

## Source pages

- https://help.fieldrocket.example.com/dispatch-board/overview
- https://help.fieldrocket.example.com/smartslot/how-suggestions-work
- https://www.fieldrocket.example.com/pricing
- https://community.fieldrocket.example.com/t/keyboard-shortcuts-power-users
- https://help.servicegrove.example.com/grid-vs-map-view
- https://help.servicegrove.example.com/routesense/opt-in-optimization
- https://www.servicegrove.example.com/pricing
- https://help.servicegrove.example.com/case-studies/regional-plumbing-windshield-time
- https://developer.servicegrove.example.com/api/sandbox
- https://help.tradehalo.example.com/auto-balance/how-it-works
- https://help.tradehalo.example.com/mobile-app/offline-support
- https://www.tradehalo.example.com/pricing
- https://community.tradehalo.example.com/t/auto-balance-moved-my-jobs
- https://developer.tradehalo.example.com/api/roadmap