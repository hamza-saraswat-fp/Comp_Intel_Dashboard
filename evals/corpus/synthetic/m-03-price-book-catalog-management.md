---
type: Teardown
slug: m-03-price-book-catalog-management
topic: Price book & catalog management
competitors: [dispatchowl, crewnimbus, jobsprocket]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Price book & catalog management: how DispatchOwl, CrewNimbus, and JobSprocket structure their pricing data

Price book and catalog tooling is one of those "invisible until it's broken" surfaces in field service software. Nobody buys a platform because of how it stores line items, but almost every churn conversation we've had this quarter traces back to a tech quoting the wrong price, a franchise owner unable to roll out a rate change across locations, or an office manager burning an afternoon re-typing a supplier price sheet into a system that has no bulk import path. We pulled apart the price book experiences of three adjacent competitors — DispatchOwl, CrewNimbus, and JobSprocket — to understand how they model services, materials, and pricing tiers, and where the seams show. This teardown focuses specifically on catalog structure, bulk data tooling, tiered/package pricing, the technician-facing catalog experience, and multi-location controls, since these are the areas prospects most often ask us to differentiate against.

All three vendors sit in the small-to-mid-market field service category, selling primarily into trades like HVAC, plumbing, electrical, and residential cleaning. None of them are enterprise dispatch suites, but each has clearly invested differently in the catalog layer depending on their go-to-market motion: DispatchOwl leans on operations-heavy shops that import large supplier catalogs, CrewNimbus targets multi-location franchise groups, and JobSprocket optimizes for solo operators and small crews who want something simple on a phone screen.

## At a glance

| Dimension | DispatchOwl | CrewNimbus | JobSprocket |
|---|---|---|---|
| Catalog data model | Flat "Owl Catalog" table with custom fields | Hierarchical "Price Grid" (category → sub-category → item) | Simple flat list, grouped by tags rather than categories |
| Bulk import/export | Strong CSV + XLSX mapping tool | CSV import, no export of margin data | CSV import only, capped row count on lower plans |
| Tiered/package pricing (Good-Better-Best) | Manual, via linked items | Native package builder | Not supported; workaround via bundles |
| Photos & attachments per item | Yes, one image per SKU | Yes, multiple images + spec sheets | Yes, multiple images, tech-facing flip view |
| Multi-location catalog inheritance | Limited — duplicate catalogs per location | Native parent/child catalog inheritance | Not supported |
| Margin/cost visibility for techs | Configurable by role | Configurable by role | Always hidden from techs |
| QuickBooks / accounting sync of catalog items | Yes, one-way | Yes, two-way | Yes, one-way, manual trigger |
| Entry point pricing for catalog features | Included from Growth plan ($89/mo) | Included from Core plan ($69/mo) | Included from Standard plan ($65/mo) |
| Top-tier catalog ceiling | Unlimited SKUs, custom fields on Pro ($249/mo) | Unlimited SKUs, franchise inheritance on Enterprise (custom) | Capped at 4,500 SKUs even on Premium ($145/mo) |

## 1 · Catalog structure & data model

**DispatchOwl** stores everything in a single flat table called the Owl Catalog, accessible from Settings → Catalog → Items. Every row is either a "Service," "Material," or "Fee," distinguished by a type flag rather than a folder structure. Users can create custom fields (SKU, vendor part number, warranty term, tax code) and these fields apply globally across all items regardless of type, which is efficient but leads to a cluttered item-edit screen once a shop has added more than a handful of custom attributes. There's no true category tree — instead, DispatchOwl relies on tags, and the catalog browser lets you filter by tag combinations. Larger contractors we spoke with found this workable but said the tag-based filtering breaks down once a catalog exceeds roughly 900–1,200 items, because tags aren't mutually exclusive and searches start returning noisy result sets.

**CrewNimbus** takes the opposite approach with its Price Grid, a genuinely hierarchical structure: Category → Sub-category → Item, mirroring how a lot of trade associations already organize flat-rate books (e.g., Drain Cleaning → Main Line → Hydro-jet Service). Each level can carry its own default labor rate, default tax code, and default markup percentage, which cascades down unless overridden at the item level. This is the strongest data model of the three for shops migrating from a printed flat-rate book, because the category hierarchy maps almost directly onto existing binder tabs. The tradeoff is setup time — building out a full three-level tree before go-live takes CrewNimbus's onboarding team measurably longer than DispatchOwl's flatter model, according to two implementation partners we interviewed.

**JobSprocket** keeps things deliberately simple: one flat item list, organized with color-coded tags rather than categories, and a search bar that's the primary navigation method. There is no parent/child relationship between items at all. This works fine for the solo-operator segment JobSprocket targets — a plumber with 80 line items doesn't need a category tree — but multiple reviewers on trade forums noted that once a shop crosses into the several-hundred-item range, JobSprocket's catalog becomes a scrolling wall with no structural way to organize it beyond tag filters, which some users described as "fine until it isn't."

## 2 · Bulk import, export & data hygiene tooling

**DispatchOwl** has clearly invested the most engineering effort here, and it shows in sales conversations — reps lead with it. The import tool (Settings → Catalog → Import) accepts CSV or XLSX, offers column mapping with saved mapping templates (useful for shops that re-import a supplier's price list on a recurring basis), and includes a validation pass that flags duplicate SKUs, missing tax codes, and price fields that look like they were pasted with currency symbols still attached. Export is similarly full-featured: you can export the entire catalog, or a filtered subset by tag, and the export includes internal fields like cost and margin, which admins can restrict by role. One partner we spoke with runs a quarterly reconciliation where they export the DispatchOwl catalog, diff it against a supplier's updated price sheet in a spreadsheet, and re-import only the changed rows using the saved mapping template — a workflow DispatchOwl explicitly designed for.

**CrewNimbus** supports CSV import with column mapping, but the mapping tool is noticeably less forgiving — it expects headers to roughly match its internal field names and doesn't offer a fuzzy-matching assist the way DispatchOwl's does. There is presently no bulk export path that includes cost or margin fields; the only export available is a customer-facing price list PDF, which is useful for handing to a franchisee but useless for someone trying to do a data audit or migrate away. Support documentation confirms this is a known gap and points users toward the API for anyone needing a full data export, which requires developer involvement most small shops don't have in-house.

**JobSprocket** offers CSV import only, no XLSX, and — more notably — caps the number of rows that can be imported in a single file depending on plan tier: 250 rows on the Basic plan, 900 rows on Standard, and 2,200 rows on Premium. Shops with larger catalogs report having to split a single supplier price sheet into multiple files and import them sequentially, which is workable but tedious and a recurring complaint in review threads. There is no bulk export at all beyond a "print catalog" function that generates a static PDF; JobSprocket's help center is explicit that catalog data is not intended to be extracted in bulk, framing this as a simplicity choice rather than a limitation, though it reads to us as a retention lever more than a design philosophy.

## 3 · Tiered pricing, packages & margin controls

Good-Better-Best packaging — presenting a customer with three tiers of the same job at escalating price points — is one of the more requested catalog capabilities among trades that sell replacement work (water heaters, HVAC systems, roofing). The three vendors handle this very differently.

**DispatchOwl** has no native package builder. Shops that want tiered options build them manually by creating three separate catalog items (e.g., "Water Heater – Standard," "Water Heater – Premium," "Water Heater – Elite") and linking them via a shared tag so they surface together on an estimate. This works, but it means updating a package requires editing each linked item individually rather than editing one package object, and there's no guardrail preventing someone from adding "Water Heater – Standard" to an estimate without its sibling tiers, undermining the psychological anchoring that Good-Better-Best is supposed to create.

**CrewNimbus** ships an actual package builder (Price Grid → Packages), letting an admin group three to four catalog items into a single sellable package with configurable tier labels, an optional "recommended" badge on the middle tier, and a combined total that can either sum the underlying item prices or be manually overridden with a package-level price. This is presented to the technician as a single package card during estimate-building rather than three separate line items, and CrewNimbus's marketing leans hard into close-rate lift from this feature, citing internal customer data (unverified by us) suggesting packaged estimates close at meaningfully higher rates than single-tier quotes. Margin visibility on packages is configurable by role, so a technician can see the customer-facing price without seeing the underlying cost stack.

**JobSprocket** has no package concept and, per its own roadmap page, does not plan to add one in the near term, describing its target customer as "usually quoting one clear scope, not choosing between options." Shops that want tiered pricing work around this with the platform's "bundle" feature, which groups items for invoicing purposes but displays them as a flat list to the customer rather than as distinct selectable tiers — functionally closer to a kit than a Good-Better-Best presentation. Margin is uniformly hidden from techs system-wide on JobSprocket with no role-based override, which several office managers described as a feature (it removes the temptation to negotiate on the fly) and others described as a limitation (senior techs who are trusted to adjust pricing can't see what they're working with).

## 4 · Mobile & technician-facing catalog experience

Because pricing decisions increasingly happen on-site, how the catalog renders on a phone matters as much as the desktop admin experience.

**DispatchOwl**'s mobile app surfaces the catalog as a searchable list within the estimate-builder flow. Techs can filter by the same tags used on desktop, and the search is fast, but there are no item photos visible in the mobile catalog browser — the image field exists in the data model but currently only renders on the customer-facing PDF, not in the technician's in-app view. Several techs in a trade-forum thread we reviewed flagged this as a missed opportunity, since a photo would help confirm they're selecting the right part variant in the field.

**CrewNimbus**'s mobile catalog inherits the category tree from desktop, so techs navigate Category → Sub-category → Item exactly as configured by the office, which several franchise owners praised for consistency across crews — a tech in one location sees the same structure as a tech in another. Photos and attached spec sheets do render on mobile, and the package cards from section three above display natively as swipeable tiers during estimate building, which is arguably CrewNimbus's strongest single feature relative to the other two vendors.

**JobSprocket** has invested specifically in a tech-facing "flip catalog" view — a full-screen, photo-forward card interface that a technician swipes through, closer to a retail product browser than a data table. Each card shows the item photo large, the customer-facing price prominently, and a short description, with cost/margin never shown regardless of role. Several small-shop owners described this as the best-looking mobile catalog UI of the group, though the lack of a category tree means that on catalogs beyond a couple hundred items, technicians are mostly relying on search rather than browsing.

## 5 · Multi-location, franchise & permission controls

**DispatchOwl** does not have a true multi-location catalog architecture. Each location is technically a separate account or a separate "division" depending on plan tier, and catalogs must be duplicated and maintained independently — there's a "copy catalog to another location" one-time export/import action, but no ongoing inheritance, meaning a price change at headquarters does not propagate automatically. Operators running more than a couple of locations described this as the single biggest catalog-related friction point in their DispatchOwl deployment.

**CrewNimbus** was clearly built with multi-location franchise groups in mind, and this section is where it separates itself most from the other two. A franchise headquarters account maintains a master Price Grid, and individual location accounts inherit from it by default, with an admin-configurable setting for which fields locations are allowed to override locally (commonly labor rate, to account for regional wage differences, while keeping material pricing locked). Changes pushed from headquarters propagate to all non-overridden fields across locations automatically. This is the feature CrewNimbus's sales team demos first for any prospect describing themselves as a franchise or multi-location operator.

**JobSprocket** has no multi-location catalog concept at all; the product is architected around a single business unit, and its own documentation recommends that operators running multiple distinct legal entities or locations simply run separate JobSprocket accounts, each with its own catalog maintained independently — effectively the same manual duplication problem as DispatchOwl, without even the one-time copy/export shortcut.

## What it means for FieldPulse

A few things stood out that are directly relevant to how we should be talking about our own price book in competitive conversations.

First, the "flat list vs. hierarchy" split maps cleanly onto customer segment, and we should be asking that segmentation question earlier in discovery calls rather than leading with feature comparisons. A prospect coming from a printed flat-rate binder wants CrewNimbus's category tree; a solo operator with eighty items wants JobSprocket's simplicity. Our own catalog structure needs a clear answer for both without forcing a hierarchy on shops that don't want one.

Second, bulk data tooling is an underrated retention and expansion lever. DispatchOwl's saved-mapping-template workflow for recurring supplier price updates is a genuinely sticky feature — it turns a quarterly chore into a five-minute task — and it's the kind of thing that shows up in renewal conversations even though it never appears in a demo script. We should validate whether our own import tool supports mapping templates and delta-only re-imports, since that gap (which CrewNimbus also has) is one of the few clean wins available against a category leader.

Third, package/tiered pricing is a genuine differentiator worth protecting, not a checkbox feature. CrewNimbus's close-rate marketing claims are unverified, but directionally plausible and clearly resonating with franchise buyers — we should make sure our own Good-Better-Best presentation is a first-class object rather than something achieved through tag-linked workaround items, because that's exactly the DispatchOwl pattern that showed up as a complaint in the field.

Fourth, the margin-visibility-by-role question keeps surfacing as a values-laden decision rather than a purely technical one. JobSprocket's hard "never show cost to techs" stance and CrewNimbus/DispatchOwl's configurable-by-role approach represent genuinely different beliefs about how much trust to extend to field staff. We likely want configurability rather than a hard stance, since we've heard convincing arguments on both sides from prospects in the same trade.

Fifth, multi-location catalog inheritance is a wedge worth building deliberately, not organically. CrewNimbus's franchise-first architecture is its clearest structural advantage, and it's exactly the kind of thing that's expensive to retrofit later. If we're targeting any multi-location or franchise segment, the catalog inheritance model needs architectural attention now rather than after a few large accounts have already built workarounds.

## Questions this raises

- How many of our current customers are actively working around a flat catalog structure with tags, and would they use a category tree if we offered one without forcing existing customers to migrate?
- Do we have a delta-import path for recurring supplier price updates, and if not, how many support tickets per month trace back to manual re-entry of price sheets?
- Is our package/tiered pricing object modeled as a first-class entity, or would a customer audit reveal it's actually built from linked individual items the way DispatchOwl's is?
- What percentage of our multi-location accounts have asked for catalog inheritance versus manually maintaining separate catalogs per location, and how much support time does that manual duplication currently consume?
- Should margin visibility be a per-role toggle by default, or an account-level policy set once by an admin — and which of those two patterns do CrewNimbus and DispatchOwl actually default new accounts to versus what they show in sales demos?
- How does our mobile catalog handle photos today, and would a "flip view" style browser meaningfully change close rates for trades that sell visually distinct product tiers (water heaters, HVAC units) versus trades that mostly sell labor (drain cleaning, electrical troubleshooting)?

## Source pages

- https://help.dispatchowl.example.com/catalog/owl-catalog-overview
- https://help.dispatchowl.example.com/catalog/bulk-import-mapping-templates
- https://help.dispatchowl.example.com/catalog/exporting-catalog-data
- https://help.dispatchowl.example.com/plans/growth-plan-features
- https://help.crewn