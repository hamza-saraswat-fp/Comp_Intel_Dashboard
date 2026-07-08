---
type: Teardown
slug: price-book-catalog
topic: Price book & catalog management
competitors: [jobber, housecall-pro, servicetitan]
as_of: 2026-07-07
author: fable-deep-research
---

# Competitor Teardown — Price Book & Catalog Management
*Jobber · Housecall Pro · ServiceTitan | Prepared for FieldPulse · July 2026*

Price book / catalog management is the layer every other workflow sits on top of — quotes, invoices, technician upsells, and job costing all draw from whatever list of products and services a contractor has built. The three competitors profiled here have converged on the same basic building blocks (a list of sellable items, organized into categories, with cost/price/markup fields) but have taken sharply different bets on how much of that list should be pre-built for the contractor versus built by hand, and how "smart" the pricing math gets. Jobber treats it as a simple default price list bolted onto quoting. Housecall Pro splits it into a Services/Materials price book with an increasingly aggressive vendor-integration strategy (Profit Rhino, Sherwin-Williams, Reece). ServiceTitan has turned it into a standalone product line — Pricebook, Pricebook Pro, and Pricebook Connect — with an AI layer (Titan Intelligence) doing content curation, material matching, and proposal generation on top.

**Sourcing note:** This teardown draws primarily from each vendor's official help center (`help.getjobber.com`, `help.housecallpro.com`, `help.servicetitan.com`) plus public feature and blog pages. `help.getjobber.com` blocks automated fetchers (HTTP 403) for direct page retrieval; where that happened, the underlying claims were instead sourced from search-engine-indexed snippets of the same help-center articles (URLs cited inline) and cross-checked against Jobber's public feature pages. No fact in this document was fabricated — anything that could not be corroborated is explicitly marked "(unverified)" or omitted. Pricing figures for add-ons and plans should be treated as directional; all three vendors change pricing frequently and gate features by plan tier in ways that shift over time.

---

## At a glance

| | **Jobber** | **Housecall Pro** | **ServiceTitan** |
|---|---|---|---|
| **What it's called** | Products & Services List | Price Book (Services + Materials) | Pricebook (Services, Materials, Equipment, Categories) |
| **Core philosophy** | A default price list for quotes/jobs/invoices — simple, flat | A structured price book split by item type, with growing vendor-catalog integrations | A full pricing *system* — content, math, and automation as a product line |
| **Managed/pre-built content** | None natively; Home Depot catalog search inside quotes | Profit Rhino flat-rate content (add-on, ~$199/mo) covering HVAC, plumbing, drain cleaning, electrical | Pricebook Pro (add-on): Titan Intelligence–curated multi-trade content, Smart Start setup, monthly updates |
| **Flat-rate pricing engine** | Not a formal feature — manual unit price + markup | Flat Rate Pricing: break-even labor rate + tiered material markups + per-service toggle | Dynamic Pricing: formula-driven (billable hours × labor rate + material/equipment × markup + surcharges), rule-based |
| **Markup tools** | Per-item markup % (unit cost → unit price), select plans only | Tiered material markup by cost bracket | Bulk markup by GM%, %, flat $, or multiplier; Pricing Builder rules |
| **Member/contract pricing** | Not identified | Not identified as a named feature | Client Specific Pricing (rate sheets, overrides Dynamic Pricing) + membership pricing |
| **Bulk edit / import-export** | CSV import/export with "update existing items" option | Service Price Adjuster Tool | Native bulk-edit UI + Pricebook Excel (XLSX) template; supports full pricebook replace |
| **Images / rich content** | Line-item images on quotes (select plans; quote-only, not PDF) | "Add Images to Price Book"; Visual Price Book cross-platform | Images, PDFs, and videos attached to every item; Pricebook Pro ships pro photography |
| **Good-better-best** | Not a named feature | Sales Proposal Tool (add-on, ~$40/mo) | Smart Proposals (Titan Intelligence, auto-generated from 2 yrs of invoice/opportunity data) |
| **Vendor catalog sync** | Home Depot live catalog search (in-quote only, not price book) | Reece (plumbing, monthly auto-sync), Sherwin-Williams (paint, 100 preloaded SKUs) | Pricebook Connect: Ferguson, Winsupply, others — nightly cost auto-updates, mapped items |
| **AI angle** | Jobber AI drafts quotes from past jobs/templates; flags upsells | Marketing AI for service descriptions | Titan Intelligence: Smart Start, generic material mapping (1,600 materials), Price Insights, Smart Proposals |
| **Pricing model for catalog features** | Bundled into Grow/Connect plans; markup+images gated to "select plans" | Price Book Management bundled in Essentials+; Flat Rate add-on ~$149/mo; Profit Rhino ~$199/mo | Pricebook Pro is a paid add-on (est. $200–500+/mo, not publicly listed); base Pricebook included |

---

## 1 · Catalog structure & data model

**Jobber — Products & Services List**
Jobber's catalog is a single flat list under **Settings → Products & Services**, explicitly framed in its own help copy as "your default price list" — default products/services so name, description, and unit price are pre-filled whenever you add a line item to a quote, job, or invoice ([Products & Services List](https://help.getjobber.com/hc/en-us/articles/115009735848-Products-Services-List)). Each entry has an **Item type** (Product or Service), Name, Description, **Unit cost ($)**, **Markup** (%), and **Unit price ($)** — cost and markup roll up into price automatically. There's no formal category/subcategory tree, no separate materials-vs-services split, and no equipment tier — it's one list, differentiated only by the Product/Service type field. Image and markup fields are gated to "select plans" rather than available account-wide.

**Housecall Pro — Price Book**
HCP splits its catalog into two first-class object types: **Services** and **Materials**, each with its own guide in the help center ([Price Book collection](https://help.housecallpro.com/en/collections/2795406-price-book); [Services Guide](https://help.housecallpro.com/en/articles/5090568-price-book-services-guide); [Materials Guide](https://help.housecallpro.com/en/articles/5456326-price-book-materials-guide)). Materials can be flagged to auto-attach to jobs for job-costing purposes without being customer-visible — i.e., a materials line can track internal cost without appearing on the estimate the customer sees. The price book supports hierarchical organization (move, copy, reorganize items into groups) and ships with a "Miscellaneous" bucket concept (inherited from Profit Rhino content, see §2) for diagnostic fees, permits, and disposal charges. HCP also has a dedicated **mobile** price book experience with its own feature set ([Price Book Mobile - Key Features](https://help.housecallpro.com/en/articles/6467989-price-book-mobile-key-features)).

**ServiceTitan — Pricebook**
ServiceTitan's data model is the most granular of the three: four core object types — **Services** ("items you sell on an invoice"), **Materials** ("parts and components to complete services"), **Equipment** ("large installed items at customer locations"), and **Categories** (organizational groupings with subcategories) ([Pricebook Home](https://help.servicetitan.com/docs/pricebook); [Create and manage categories and subcategories](https://help.servicetitan.com/how-to/pricebook-category-setup)). Beyond the four core types, the pricebook extends to discounts and fees, "Other Direct Costs," sold-hours (labor units), and non-service revenue/cost items like memberships, permits, and dispatch fees. Every item can carry attached images, PDFs, and videos; equipment items carry "equipment types" for tracking replacement opportunities and conversion-opportunity tags. Permissions are role-scoped: office staff get full edit rights on services/materials/equipment/categories, while technicians in the field mobile app get view-only pricing with the ability to add configurable sub-items (see §3) but not edit the book itself.

**Read on this:** ServiceTitan's category/subcategory + 4-object-type model is materially more sophisticated than Jobber's flat list and slightly more structured than HCP's two-type split, largely because ServiceTitan is built for larger commercial/multi-trade operations where technicians and dispatch/purchasing all need to query the same catalog differently.

---

## 2 · Flat-rate pricing & managed content

This is where the three vendors diverge hardest — and where the competitive moat is being built via *content*, not just software.

**Jobber**
Jobber has no formal flat-rate pricing *engine*. Pricing is manual: you set unit cost, apply a markup %, and the system derives unit price. There is no managed/pre-built content library equivalent to Profit Rhino or Pricebook Pro. The closest thing to "managed content" is the **Home Depot integration**, which lets you search Home Depot's full catalog (3M+ products) from inside a quote and pull in live pricing and stock availability from stores within 50 miles of the business address — but this is a point-of-sale material lookup *inside the quote builder*, not a price-book population tool; items pulled from Home Depot don't automatically get saved back into the Products & Services list ([Jobber and The Home Depot Integration](https://help.getjobber.com/hc/en-us/articles/34516153918103-Jobber-and-The-Home-Depot-Integration)). Jobber's quote templates do auto-check for Home Depot price changes whenever an existing template is opened or reused, which is a small but real freshness mechanic.

*[View screenshots →](https://help.getjobber.com/hc/en-us/articles/34516153918103-Jobber-and-The-Home-Depot-Integration)*

**Housecall Pro**
HCP's **Flat Rate Pricing** is a purpose-built calculation engine, not just a field. It walks a contractor through establishing a **break-even labor rate** (total annual labor costs + total overhead ÷ average billable hours per week) and then applies **tiered material markups** — you define cost brackets (e.g., $0–$50, $50–$200) and assign a markup % to each bracket, and HCP auto-applies the right markup to any material whose cost falls in that range ([Flat Rate Pricing Overview](https://help.housecallpro.com/en/articles/5461788-flat-rate-pricing-overview)). At the service level, a **"Calculate Flat Rate Price" toggle** generates the price from labor + materials + service cost and displays both markup and gross margin back to the user — pricing math is transparent, not a black box. Flat Rate Pricing is priced as a distinct add-on (roughly $149/month per public pricing breakdowns, unverified against HCP's own pricing page at time of writing).

The managed-content layer sits on top via **Profit Rhino**: HCP's help center describes a **~$199/month** flat fee (regardless of how many trade books you load) that imports Profit Rhino's pre-built price books as "Flat Rate Services and Materials" directly into the HCP Price Book ([Profit Rhino with Housecall Pro: A Complete Guide](https://help.housecallpro.com/en/articles/8754493-profit-rhino-with-housecall-pro-a-complete-guide)). Coverage spans **HVAC, Plumbing, Drain Cleaning, and Electrical**, and each book ships with service/material images, descriptions, national-average labor times and material costs, and a "Miscellaneous" bucket (diagnostic fees, permits, disposal fees). Content updates land **quarterly**. Setup is white-glove — books stay hidden until an HCP rep completes onboarding on a call. Separately, HCP also supports **Measurement-Based Pricing** (per-square-foot, per-linear-foot, per-quantity), currently scoped to Sherwin-Williams partner professionals for painting/pressure-washing work, plus an advanced "Production Rate Estimates" layer that derives labor hours and material quantities from industry-standard coverage rates ([Measurement-Based Pricing](https://help.housecallpro.com/en/articles/14058981-measurement-based-pricing)).

*[View screenshots →](https://help.housecallpro.com/en/articles/5461788-flat-rate-pricing-overview)*

**ServiceTitan**
ServiceTitan runs the deepest managed-content stack, split across two products that are easy to conflate:

- **Pricebook Pro** is the *content* product: "a catalog of pre-created services with pre-attached generic materials and equipment," described as a "multi-trade resource" with high-resolution images, sold-hours, and industry-best-practice service definitions ([Pricebook Pro overview](https://help.servicetitan.com/docs/pricebook-pro-overview); [feature page](https://www.servicetitan.com/features/pro/pricebook)). Setup uses **Smart Start**, powered by Titan Intelligence — new users answer a few questions (industry, state), and the system aggregates usage data by trade, size, and region ("wisdom of the crowd") to auto-populate a few hundred relevant services, cutting setup from what ServiceTitan claims is weeks down to roughly a day ([ServiceTitan's Mission to Scrap the Traditional Pricebook with Titan Intelligence](https://www.servicetitan.com/blog/pricebook-with-titan-intelligence)). Content refreshes **monthly**. Materials shipped with Pricebook Pro are explicitly "generic" — the help docs flag they're for cost-estimation only, "not intended for inventory, replenishment, or purchasing."
- **Pricebook Connect** is the *vendor-data* product: a marketplace layer where manufacturer/distributor catalogs (Ferguson, Winsupply, and others) live, syncing **nightly** cost updates and letting Pricebook Pro's generic items be mapped to real, purchasable vendor SKUs ([Pricebook Pro vs. Pricebook Connect](https://help.servicetitan.com/how-to/pricebook-pro-and-pricebook-connect-key-differences)). Detail in §5.

The AI layer (Titan Intelligence) also powers **Price Insights** — daily-refreshed regional pricing benchmarks computed from two years of anonymized ServiceTitan customer invoice data, letting a contractor see how their pricing compares to market averages without ServiceTitan prescribing a number.

*[View screenshots →](https://www.servicetitan.com/features/pro/pricebook)*

---

## 3 · Pricing controls (markup, member pricing, bulk updates)

**Jobber**
Markup is a single per-item percentage field (Unit cost → Markup % → Unit price), visible and editable on the Products & Services List and adjustable again at the line-item level when building a quote — Jobber's **Markups on Quotes** feature lets you add markup while building a quote and see estimated margin live, so pricing decisions happen in the quote builder as much as in the catalog ([Markups on Quotes](https://help.getjobber.com/hc/en-us/articles/1500012369781-Markups-on-Quotes)). This is a Grow-plan feature. There's no evidence of a member/contract pricing system, dynamic pricing, or pricing-rule engine in Jobber — pricing logic is intentionally simple. Bulk changes go through **CSV import**: download the sample template from the Import Products & Services section, edit unit cost/unit price/description/taxable status/category in the spreadsheet, re-upload, and check "Update existing items" to overwrite matching records by name. The Category column doubles as the Product/Service type selector and is case-sensitive (only first letter capitalized) — a small but real gotcha for anyone scripting imports.

**Housecall Pro**
Markup logic lives entirely inside Flat Rate Pricing's tiered material-markup brackets (§2) — there's no separate freestanding markup engine described beyond that. Bulk price changes run through the **Service Price Adjuster Tool**, which the help center groups under "Making Changes" alongside reorganization and image tools — a purpose-built bulk-price-change utility distinct from a raw CSV import/export flow (specific mechanics of the tool were not independently verified beyond its existence in the help-center table of contents; treat the operational detail as **(unverified)**). No member/contract pricing feature was identified in HCP's documentation.

**ServiceTitan**
This is ServiceTitan's most differentiated area. Two systems stack together under a feature ServiceTitan calls **Pricing Builder**:

- **Dynamic Pricing** automates *residential flat-rate* pricing using the formula `(Billable Hours × Labor Rate) + (Material Cost × Markup) + (Equipment Cost × Markup) + Surcharges`. It deliberately **ignores** the static Price, Member Price, and Add-On Price fields sitting in the pricebook and instead computes live from cost + rules. Rules bundle billable rates, markup tables (by gross margin %, straight %, flat dollar amount, or multiplier), and optional after-hours/surcharge modifiers ([Dynamic Pricing Overview](https://help.servicetitan.com/v1/docs/dynamic-pricing-overview); [Introducing Pricing Builder](https://www.servicetitan.com/blog/introducing-pricing-builder)). After-hours pricing only shows on invoices, not estimates, since job timing isn't locked in upfront. Membership discounts apply *after* the dynamic calculation completes, pulling from the customer's individual membership settings — this is how "member pricing" actually threads through the system rather than being a static price-book field.
- **Client Specific Pricing** sits above Dynamic Pricing in the override hierarchy — a client-specific rate sheet (labor rates by type, material/equipment markup or discount, fees) beats dynamic pricing whenever both apply. Rate sheets cascade customer → service location → estimate/invoice → project, with more specific levels overriding defaults, and are aimed squarely at commercial contract pricing, national accounts, and one-off negotiated jobs ([Client Specific Pricing Overview](https://help.servicetitan.com/docs/client-specific-pricing-overview)).
- If materials/equipment costs are wired to auto-update from a vendor feed (Pricebook Connect, §5), Dynamic Pricing recalculates service prices automatically overnight — "a pricebook that starts to manage itself" per ServiceTitan's own framing.

Bulk editing in the native UI is broad: images/videos, names/codes (prepend/append), categories/upgrades/recommendations, descriptions, primary/replenishment vendor, sold hours, price (set or increase/decrease by $/%), price rounding, GL/accounting fields, taxable status, service links, and active/inactive status can all be changed across a filtered/selected set of items at once ([Bulk edit pricebook items](https://help.servicetitan.com/docs/bulk-edit-pricebook-items)). Access is restricted to admins/managers. For changes too complex for the bulk-edit UI, ServiceTitan supports a full **Pricebook Excel (XLSX) template** — export, edit offline (Categories/Services/Materials/Equipment tabs), and reimport, with an option to fully replace ("deactivate existing pricebook") rather than merge — an irreversible operation ServiceTitan flags explicitly ([Import and export your pricebook](https://help.servicetitan.com/docs/import-and-export-your-pricebook); [Pricebook Excel template](https://help.servicetitan.com/how-to/pricebook-excel-template)).

---

## 4 · Catalog → estimate/invoice flow

**Jobber**
Products & Services items are the seed data for quote/job/invoice line items — selecting an item pre-fills name, description, and unit price, which the user can still override per line. **Markups on Quotes** and **Line Item Images on Quotes** both operate at quote-build time on top of the catalog data, and both are gated to specific plans (Grow) ([Line Item Images on Quotes](https://help.getjobber.com/hc/en-us/articles/360049503713-Line-Item-Images-on-Quotes)). One notable constraint: line-item images show on the digital/web quote view but **do not appear on PDF exports** — a real gap if a customer or crew needs a printable version with visuals. **Jobber AI** adds a layer on top of the whole flow — it can draft entire quotes automatically from a customer's request, using the business's past jobs and templates as reference, then auto-sends follow-up reminders on pending quotes and flags high-value quotes for review ([Jobber AI feature page](https://www.getjobber.com/features/ai/)).

**Housecall Pro**
Price Book services/materials feed directly into Estimates, and the **Sales Proposal Tool** (a distinct paid add-on, ~$40/month per third-party pricing breakdowns, unverified against HCP's own pricing page) layers a **good-better-best presentation** on top — letting a rep present a customer with tiered service options at different price points inside one proposal. Materials flagged as job-cost-only (§1) flow into job costing without surfacing on the customer-facing estimate, which is HCP's mechanism for keeping internal margin data separate from what the customer sees.

**ServiceTitan**
Two distinct integration points stand out. First, **Configurable Services**: when a technician adds a service with attached configurable materials to an *estimate* (not supported on the invoice page), a selection drawer opens showing material/equipment variants — e.g., a generic "Capacitor" line resolves to a specific "Air Conditioner Dual Run Capacitor" SKU the tech actually used. Pricebook Pro users get Titan Intelligence-suggested vendor-specific variants here via **generic material mapping** (below); standard-tier users add variants manually. Total estimate price recalculates live based on the specific variant chosen, and the selected variation's name can print on the customer-facing invoice if enabled ([Configurable Services documentation](https://help.servicetitan.com/v1/docs/configurable-services-with-pricebook-pro)). Second, **Smart Proposals**: a Titan Intelligence feature that auto-generates a good-better-best proposal template per business by mining the contractor's own invoice/opportunity history over the trailing two years for the most frequently created estimate items — falling back to "industry expert" templates when a business lacks sufficient history ([Titan Intelligence blog](https://www.servicetitan.com/blog/pricebook-with-titan-intelligence)). This is the most automated good-better-best implementation of the three — HCP's is a manual tiered-proposal builder; ServiceTitan's is generated from the contractor's own transaction data.

---

## 5 · Integrations & industry content

**Jobber**
The one verified vendor-catalog integration is **The Home Depot** (US only, Core plan or higher): search Home Depot's full catalog (3M+ products) from inside a quote, view live pricing/stock at stores within 50 miles of the business address (falling back to online pricing if nothing's in range within that radius), and see stock counts for the nearest 20 stores in a side-drawer product detail view ([Jobber and The Home Depot Integration](https://help.getjobber.com/hc/en-us/articles/34516153918103-Jobber-and-The-Home-Depot-Integration)). This is scoped to *material lookup inside quote-building*, not a synced price-book population mechanism, and there's no evidence of trade-specific managed content (HVAC/plumbing/electrical flat-rate books) comparable to HCP's Profit Rhino or ServiceTitan's Pricebook Pro.

**Housecall Pro**
Beyond Profit Rhino (§2), HCP has been building out a **materials-vendor integration layer** distinct from managed flat-rate content:
- **Reece** (plumbing): available to Plumbing–HCP users with an active Reece account and Flat Rate Pricing enabled; pricing "syncs directly" into the HCP Price Book and **auto-updates monthly** with the latest Reece costs ([How to Use the Reece Integration](https://help.housecallpro.com/en/articles/10844040-how-to-use-the-reece-integration-by-housecall-pro)).
- **Sherwin-Williams** (paint): adds a dedicated, preloaded Sherwin-Williams category to the Price Book — **100 of Sherwin-Williams' most popular paints** loaded by default — plus browse access to the broader Sherwin-Williams catalog; notably you set your own pricing on these materials and don't need to sign into a separate Sherwin-Williams account ([Sherwin-Williams Catalog Integration](https://help.housecallpro.com/en/articles/13744992-how-to-use-the-sherwin-williams-catalog-integration-by-housecall-pro)). This integration also underpins HCP's Measurement-Based Pricing (§2), scoping that feature to Sherwin-Williams partner painting/pressure-washing pros.

The trade coverage across HCP's managed content is explicitly **HVAC, plumbing, drain cleaning, electrical** (via Profit Rhino) plus **painting/pressure-washing** (via Sherwin-Williams) — a materially broader industry-vertical spread than Jobber's single Home Depot integration, though narrower than ServiceTitan's "multi-trade" Pricebook Pro claim.

**ServiceTitan**
ServiceTitan's vendor layer is the most structurally distinct of the three because it separates *managed content* (Pricebook Pro) from *live vendor catalog sync* (**Pricebook Connect**) as two composable products (§2). Verified integrations include:
- **Ferguson**: product and pricing integration reachable at Pricebook → Pricebook Connect → Catalogs; vendor cost updates flow through **nightly**, and Auto Update can be toggled per field (equipment and material costs) so the pricebook self-updates without manual review ([Ferguson Product and Pricing Integration](https://help.servicetitan.com/shared/8694a7e5-b884-4275-ae80-89029922accf)).
- **Winsupply**: similar catalog presence, though the "Map to provider" auto-mapping option is explicitly unavailable for Ferguson and Winsupply — for those two, ServiceTitan instead offers an "Upload purchase history" path to seed the pricebook from past purchase records instead of live catalog mapping.
- The broader **Full Procurement Integration (P2P)** layer adds real-time product info, contractor-specific pricing, and electronic purchase orders on top of the catalog sync, tying pricebook data into actual purchasing workflows rather than stopping at estimate-time pricing ([Full Procurement Integration Home](https://help.servicetitan.com/docs/p2p-home)).

Cost syncs only for items a contractor has explicitly **mapped** to a vendor catalog entry — unmapped generic items don't get live cost updates, so the "self-managing pricebook" story depends on a contractor doing the mapping work up front (or Pricebook Pro's Titan Intelligence doing it automatically via generic material mapping, described next). **Generic material mapping** is the Titan Intelligence algorithm underpinning Configurable Services (§4): it reads the name/description text of every material already in a contractor's pricebook and matches it against **1,600 standardized Pricebook Pro materials**, surfacing the **top 10 most likely matches** in a quick-add list at estimate time with zero manual setup required, and the match quality improves as it learns from which suggestion technicians actually pick ([Titan Intelligence blog](https://www.servicetitan.com/blog/pricebook-with-titan-intelligence)).

---

## What it means for FieldPulse

- **The managed-content war is the real battleground, not the data model.** Jobber, HCP, and ServiceTitan all landed on structurally similar catalog objects (items with cost/price/markup, organized into some kind of grouping). The differentiation that actually matters to a contractor is *how much of the catalog gets built for them* — Profit Rhino and Pricebook Pro exist because building a flat-rate book from scratch is weeks of work most owner-operators never do well. If FieldPulse's price book is a blank list, that's a real onboarding-friction gap against HCP and ServiceTitan specifically, not against Jobber (which also ships blank).
- **Vendor cost sync (Ferguson/Reece-style) is becoming table stakes for trades with volatile material costs**, not a nice-to-have. Both HCP (Reece, monthly) and ServiceTitan (Ferguson, nightly) have shipped this; Jobber has not (Home Depot is quote-time lookup only, not price-book sync). Plumbing/HVAC contractors dealing with copper/refrigerant price swings will feel the absence of live cost sync directly in margin erosion between price-book update cycles.
- **ServiceTitan's Titan Intelligence generic-material-mapping (1,600 materials, top-10 suggestion, self-improving) is a genuinely different mechanism from "AI-generated description text."** It's solving a structural data problem — normalizing messy, contractor-specific material naming into a shared vendor-mappable taxonomy — which is exactly the kind of unglamorous plumbing (no pun intended) that makes vendor catalog sync actually work at scale. Worth studying as a pattern even if FieldPulse doesn't chase ServiceTitan's SKU count.
- **Good-better-best is trending toward automatic generation, not manual template building.** HCP's Sales Proposal Tool is a manual tiered-builder (paid add-on); ServiceTitan's Smart Proposals auto-generates GBB templates from the contractor's own 2-year invoice history. If FieldPulse builds a GBB/tiered-quote feature, the ServiceTitan pattern (derive tiers from what this specific business actually sells most) is more defensible long-term than a static template.
- **The "does markup show to the customer" and "is this cost-tracking-only" distinction is a real UX decision competitors have made differently and worth being deliberate about.** HCP explicitly supports materials that auto-attach to jobs for cost tracking but stay invisible to the customer on the estimate. That's a deliberate design choice (internal margin visibility vs. external quote cleanliness) that's easy to get wrong by accident.
- **Jobber is a useful low bar, not a benchmark.** Across every section here, Jobber's implementation is the simplest of the three — flat list, manual markup, CSV import, one vendor integration (Home Depot, quote-time only). That's consistent with Jobber's broader "simple tools, less setup burden" positioning for solo/small-crew operators, and it's the segment where FieldPulse most directly competes. Matching Jobber's simplicity is achievable; matching ServiceTitan's Pricebook Pro/Connect depth is a multi-year investment.

---

## Questions this raises

1. What does FieldPulse's current price book / catalog structure actually look like today — flat list (Jobber-style) or typed/categorized (HCP/ServiceTitan-style)? This teardown assumes no prior knowledge of FieldPulse's own implementation.
2. Is there appetite for a Profit-Rhino-style managed-content partnership (or building equivalent in-house content) for FieldPulse's core trades, versus staying "bring your own catalog" like Jobber?
3. Which trades in FieldPulse's customer base are most exposed to material-cost volatility, and would a live vendor-cost-sync integration (Ferguson/Reece-style) move the needle on retention or is it a "when we're bigger" problem?
4. Does FieldPulse want customer-facing good-better-best quoting at all, and if so, should it be a manual builder (HCP pattern, lower engineering cost) or a data-derived auto-generator (ServiceTitan pattern, higher cost, stickier)?
5. How does FieldPulse currently separate internal cost/margin data from customer-facing quote line items — is there an equivalent to HCP's "track but don't show" materials toggle?
6. Given ServiceTitan gates Pricebook Pro as a separate paid add-on (est. $200–500+/mo) rather than bundling it, is there a monetization opportunity in a similar "managed content as upsell" model for FieldPulse, or does that create adoption friction better avoided?

---

## Source pages

**Jobber**
- [Products & Services List](https://help.getjobber.com/hc/en-us/articles/115009735848-Products-Services-List) — help.getjobber.com (via search snippet; direct fetch 403'd)
- [Markups on Quotes](https://help.getjobber.com/hc/en-us/articles/1500012369781-Markups-on-Quotes) — help.getjobber.com (via search snippet)
- [Line Item Images on Quotes](https://help.getjobber.com/hc/en-us/articles/360049503713-Line-Item-Images-on-Quotes) — help.getjobber.com (via search snippet)
- [Jobber and The Home Depot Integration](https://help.getjobber.com/hc/en-us/articles/34516153918103-Jobber-and-The-Home-Depot-Integration) — help.getjobber.com (via search snippet)
- [The Grow Plan](https://help.getjobber.com/hc/en-us/articles/360050124513-The-Grow-Plan) — help.getjobber.com (via search snippet)
- [Jobber AI feature page](https://www.getjobber.com/features/ai/) — getjobber.com

**Housecall Pro**
- [Price Book collection](https://help.housecallpro.com/en/collections/2795406-price-book) — help.housecallpro.com (fetched directly)
- [Price Book: Services Guide](https://help.housecallpro.com/en/articles/5090568-price-book-services-guide) — help.housecallpro.com
- [Price Book: Materials Guide](https://help.housecallpro.com/en/articles/5456326-price-book-materials-guide) — help.housecallpro.com
- [Price Book Mobile - Key Features](https://help.housecallpro.com/en/articles/6467989-price-book-mobile-key-features) — help.housecallpro.com
- [Flat Rate Pricing Overview](https://help.housecallpro.com/en/articles/5461788-flat-rate-pricing-overview) — help.housecallpro.com (fetched directly)
- [Job Inputs and Flat Rate Services](https://help.housecallpro.com/en/articles/6973952-job-inputs-and-flat-rate-services) — help.housecallpro.com
- [Profit Rhino with Housecall Pro: A Complete Guide](https://help.housecallpro.com/en/articles/8754493-profit-rhino-with-housecall-pro-a-complete-guide) — help.housecallpro.com (fetched directly)
- [Measurement-Based Pricing](https://help.housecallpro.com/en/articles/14058981-measurement-based-pricing) — help.housecallpro.com (fetched directly)
- [How to Use the Reece Integration](https://help.housecallpro.com/en/articles/10844040-how-to-use-the-reece-integration-by-housecall-pro) — help.housecallpro.com (via search snippet)
- [How to Use the Sherwin-Williams Catalog Integration](https://help.housecallpro.com/en/articles/13744992-how-to-use-the-sherwin-williams-catalog-integration-by-housecall-pro) — help.housecallpro.com (via search snippet)
- [Price Book Software feature page](https://www.housecallpro.com/features/price-book/) — housecallpro.com
- [Housecall Pro Launches New Price Book Powered by Profit Rhino](https://profitrhino.com/housecallpro-launches-pricebook-powered-by-profitrhino/) — profitrhino.com

**ServiceTitan**
- [Pricebook Home](https://help.servicetitan.com/docs/pricebook) — help.servicetitan.com (fetched directly)
- [Pricebook Pro overview](https://help.servicetitan.com/docs/pricebook-pro-overview) — help.servicetitan.com (fetched directly)
- [ServiceTitan Pricebook Pro feature page](https://www.servicetitan.com/features/pro/pricebook) — servicetitan.com (fetched directly)
- [ServiceTitan's Mission to Scrap the Traditional Pricebook with Titan Intelligence](https://www.servicetitan.com/blog/pricebook-with-titan-intelligence) — servicetitan.com (fetched directly)
- [Dynamic Pricing Overview](https://help.servicetitan.com/v1/docs/dynamic-pricing-overview) — help.servicetitan.com (fetched directly)
- [Client specific pricing: overview and setup](https://help.servicetitan.com/docs/client-specific-pricing-overview) — help.servicetitan.com (fetched directly)
- [Use Configurable Services with Pricebook and Pricebook Pro](https://help.servicetitan.com/v1/docs/configurable-services-with-pricebook-pro) — help.servicetitan.com (fetched directly)
- [Bulk edit pricebook items](https://help.servicetitan.com/docs/bulk-edit-pricebook-items) — help.servicetitan.com (fetched directly)
- [Import and export your pricebook](https://help.servicetitan.com/docs/import-and-export-your-pricebook) — help.servicetitan.com (fetched directly)
- [Add and edit items with the Pricebook Excel template](https://help.servicetitan.com/how-to/pricebook-excel-template) — help.servicetitan.com
- [Create and manage categories and subcategories in Pricebook](https://help.servicetitan.com/how-to/pricebook-category-setup) — help.servicetitan.com
- [Pricebook Pro vs. Pricebook Connect: Key Differences](https://help.servicetitan.com/how-to/pricebook-pro-and-pricebook-connect-key-differences) — help.servicetitan.com (fetched directly)
- [Ferguson Product and Pricing Integration](https://help.servicetitan.com/shared/8694a7e5-b884-4275-ae80-89029922accf) — help.servicetitan.com
- [Pricebook Pro Onboarding Part 3: Add provider catalog items with Pricebook Connect](https://help.servicetitan.com/docs/add-provider-catalog-items-with-pricebook-connect) — help.servicetitan.com
- [Full Procurement Integration Home](https://help.servicetitan.com/docs/p2p-home) — help.servicetitan.com
- [ServiceTitan Introduces Pricing Builder](https://www.servicetitan.com/blog/introducing-pricing-builder) — servicetitan.com
- [New and Updated Pricebook Content Delivered Right to You (Pricebook Connect)](https://www.servicetitan.com/blog/pricebook-connect) — servicetitan.com
- [ServiceTitan | Ferguson Integration partner page](https://www.servicetitan.com/partners/ferguson) — servicetitan.com

**Cross-vendor / secondary**
- [Profit Rhino Flat Rate Integrations & Partners](https://profitrhino.com/profit-rhino-integrations-and-partners/) — profitrhino.com
- [How to set up dynamic pricing and automate your ServiceTitan Pricebook](https://winktoolbox.com/blog/how-to-set-up-dynamic-pricing-and-automate-your-servicetitan-pricebook) — winktoolbox.com (secondary, corroborating)
