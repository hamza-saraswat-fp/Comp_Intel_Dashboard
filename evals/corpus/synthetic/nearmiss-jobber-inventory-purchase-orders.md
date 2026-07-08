---
type: Teardown
slug: nearmiss-jobber-inventory-purchase-orders
topic: Inventory & purchase orders
competitors: [jobber]
as_of: 2026-07-07
eval_scale: M
synthetic: true
---

> SYNTHETIC EVAL FIXTURE — generated distractor content, not real research.

# Jobber Inventory & Purchase Orders: A Field Teardown

Inventory and purchase-order tooling is one of the areas where field service platforms differentiate least on flash and most on plumbing — bin counts, reorder math, vendor sync, and whether a technician can actually find a part before a customer notices they left the truck twice. This teardown walks through how Jobber's parts and purchasing stack is currently packaged, what it claims to automate, and where the seams show. We pulled screenshots, pricing pages, help-center articles, and a handful of community forum threads to reconstruct the current state of the offering. As with all of our competitor research, this document is meant to inform FieldPulse's own roadmap conversations, not to serve as a courtroom-grade audit of a competitor's claims.

Jobber markets its purchasing layer as an add-on module called **StockSync**, bundled into its top two subscription tiers and available as a paid add-on for the entry tier. The module wraps a parts catalog, a purchase-order composer, a vendor directory, and a set of low-stock triggers. It is not a standalone warehouse management system, and Jobber is fairly transparent in its own materials that StockSync is aimed at trades businesses running a handful of trucks and a single home-base storeroom rather than distributors with multiple depots.

## At a glance

| Dimension | Jobber Foundation | Jobber Momentum | Jobber Summit |
|---|---|---|---|
| Monthly price (per-company, annual billing) | $89 | $135 | $215 |
| Parts catalog | Add-on, capped at roughly 350 SKUs | Included, capped at roughly 1,800 SKUs | Included, uncapped |
| Purchase order composer | Not available | Manual PO Composer | PO Composer + Reorder Assist |
| Vendor directory (Vendor Hub) | Not available | Up to four vendor records | Unlimited vendor records |
| Warehouse / bin mapping | Not available | Single location only | Up to five named locations |
| Low-stock flags | Not available | Manual threshold per part | Automated threshold + seasonal buffer |
| Kit Builder (bundled parts/labor) | Not available | Not available | Included |
| Consignment tracking | Not available | Not available | Beta, invite-only |
| Vendor punch-out / catalog sync | Not available | Not available | Limited to two named suppliers |

Numbers above are drawn from the public pricing page and a demo walkthrough; Jobber's sales team has told at least one prospect we spoke with that pricing is negotiable above a certain fleet size, so treat these as list rates rather than floor rates.

## 1 · Parts & Materials Catalog

**Jobber**
- The parts catalog lives under a "Products & Services" tab that predates StockSync, and StockSync essentially bolts quantity fields and cost fields onto that existing list rather than replacing it. This shows in the UI: catalog items still default to a flat "service" type unless a user manually flips a toggle to "trackable part."
- Custom fields on parts are limited to five slots (SKU, cost, retail price, unit of measure, and one free-text field), which several trade contractors on community forums have complained is too thin for anyone tracking manufacturer part numbers alongside internal SKUs.
- Bulk import is CSV-based and works reasonably well for initial catalog load, but Jobber does not support scheduled re-imports, so vendor price updates require a manual re-upload each time a supplier changes a price sheet.
- Photos can be attached to parts, capped at three images per SKU, and there's no barcode-scan-to-create flow — barcodes can be attached to an existing catalog entry but not used to originate a new one from a phone camera.
- Kit Builder, available only on the Summit tier, lets an admin bundle a labor line and a set of parts into a single sellable unit for quoting, but changes to the underlying part cost do not automatically ripple into kits that were already added to open jobs; the help docs are explicit that a manual "resync" button must be pressed.
- Unit-of-measure conversions (e.g., ordering by the case but consuming by the each) are not supported natively — Jobber's support articles suggest creating two separate catalog entries and manually adjusting quantities, which is the kind of workaround that shows up in a lot of the reviews we read.

## 2 · Purchase Order Workflow

**Jobber**
- PO Composer generates a purchase order from either a job's parts list or a manual line-item entry, and can be emailed directly to a vendor contact from within the PO record. This is the single most-praised piece of the module in the review threads we sampled, mostly because it removes the need to retype job-specific parts into a separate purchasing tool.
- Approval routing is binary: a PO is either in "Draft" or "Sent" status on Momentum, and Summit adds a third status, "Pending Approval," which can be configured to require sign-off above a dollar threshold (default is set at $2,500 in the demo org we reviewed, and it's adjustable).
- There is no multi-step approval chain — a single approver either approves or rejects; there's no ability to route a large PO through, say, an office manager and then an owner.
- Receiving against a PO updates on-hand quantity for the parts catalog, but partial receipts are handled awkwardly: the interface allows marking a line "partially received" but does not let a user split that line into two POs, so open balances on partially-filled orders have to be tracked by memory or a side spreadsheet, per several support-forum threads.
- PO history is visible per vendor and per job, but there is no rollup view across a date range that shows total committed spend by category — a limitation multiple bookkeeping-focused reviewers flagged when trying to reconcile against accounting software.
- Reorder Assist (Summit only) will auto-draft a PO when a part crosses its low-stock threshold, but it drafts one PO per vendor per day rather than consolidating parts across multiple low-stock triggers into a single order unless those triggers fire within the same batch window.
- There is no support for blanket or standing purchase orders (e.g., a pre-approved recurring order with a fixed vendor for consumables), which is a common ask from larger trade shops.

## 3 · Vendor & Supplier Management

**Jobber**
- Vendor Hub stores a name, address, primary contact, phone, email, and a free-text "terms" field. There is no structured field for payment terms (net-fifteen, net-thirty, etc.) — it's just a text box, so nothing downstream (like an aging report) can key off it.
- Vendor-specific pricing is supported at a basic level: a part can have a "preferred vendor" and a "vendor cost" attached, but only one vendor cost per part — multi-vendor price comparison isn't part of the workflow, so a shop juggling two suppliers for the same part has to pick a default and manually check the alternate.
- Vendor catalog sync (punch-out style ordering where a PO pulls live pricing from a supplier's own system) is limited in the current release to two named national suppliers, and Jobber's own release notes describe this as an early-access feature that "may change materially" before wider rollout.
- There is no vendor scorecard or on-time-delivery tracking; the only vendor-level reporting is a simple list of total dollars ordered per vendor over a selected date range.
- Vendor communication is one-directional from Jobber's side — a PO can be emailed out, but there is no vendor-facing portal where a supplier can confirm receipt, update an ETA, or upload a packing slip; all of that happens over email or phone and gets logged manually as a note.
- Insurance certificate and W-nine tracking for vendors (useful for shops that also treat subcontractors as vendors) is not present; a few reviewers mentioned using a separate document-storage tool for this.

## 4 · Warehouse & Multi-Location Tracking

**Jobber**
- On the Momentum tier, inventory is tracked at a single implicit location — effectively "the shop." There is no concept of a named warehouse, so multi-yard operations have to either ignore location entirely or upgrade to Summit.
- Summit introduces named locations (capped at five) and lets a part's on-hand quantity be split across those locations, but transfers between locations are logged as a simple quantity move rather than a formal transfer order with its own approval or in-transit status.
- Bin- or shelf-level mapping inside a location does not exist; the most granular field available is a single free-text "location note" per part, which several long-time users described as a workaround rather than a real feature.
- Truck/van stock is handled by treating each vehicle as a "location" in the Summit location list, which works structurally but means truck restocking looks identical in the UI to a warehouse-to-warehouse transfer — there's no van-specific restock workflow, min/max par levels per truck, or restock checklist tied to a route.
- Cycle counts can be logged as a manual quantity adjustment with a required reason code, but there is no scheduled cycle-count workflow (e.g., "count bin twelve every first Monday") — it has to be manually initiated each time.
- Consignment tracking is in closed beta and, per the help article we found, is invite-only and not documented publicly beyond a single paragraph noting it exists.

## 5 · Reporting & Cost Visibility

**Jobber**
- The built-in inventory report shows on-hand quantity, cost basis, and retail value per part, exportable to CSV. It does not break this out by location on the Momentum tier (since there's only one implicit location), and on Summit it can be filtered by location but not compared side-by-side in one export.
- Margin reporting ties parts cost to invoiced jobs at a job level, but there is no rollup that shows margin trend over time by part category — a gap flagged by a handful of HVAC and plumbing-focused reviewers who wanted to see whether copper fitting margins were eroding month over month.
- There's no built-in shrinkage or variance report comparing expected on-hand (based on POs received minus parts consumed on jobs) against actual counted on-hand; that comparison has to be done manually outside the platform.
- Reorder Assist includes a very basic forecasting model described in the help center as using "recent usage" to project need, but the lookback window is not configurable and the documentation doesn't specify the exact formula, which a few technically-minded users have asked about without a clear public answer.
- Dashboards can be shared read-only with a bookkeeper role, but there's no scheduled email digest for inventory value or low-stock counts — a user has to log in and check manually or set up a third-party automation to poll the reporting API.
- API access to inventory and PO data exists but is documented as "read mostly" — write access for creating POs via API is listed as a roadmap item without a committed timeline in the developer docs we reviewed.

## What it means for FieldPulse

A few threads worth pulling on for our own roadmap:

- **The single-location default is a real wedge.** Jobber's Momentum tier — likely the tier most small-to-mid trade shops actually buy — has no concept of multiple locations at all. Any FieldPulse plan that supports named locations and simple transfers out of the gate, even at a lower tier than Jobber's top tier, is a clean differentiator worth calling out in competitive battlecards.
- **Partial PO receiving is a recurring pain point.** The inability to split a partially-received line into a follow-up PO shows up repeatedly in review language. If FieldPulse's PO receiving flow already supports splitting open balances into a new order automatically, that's a feature we should be foregrounding in sales conversations rather than treating as a background capability.
- **Vendor catalog sync being early-access and narrow (two suppliers) suggests punch-out integrations are still immature industry-wide.** This might be a lower near-term priority for us to build broadly, but worth a narrow, well-chosen supplier partnership rather than a wide, shallow one.
- **Truck stock is being shoehorned into a generic "location" object.** A dedicated van/truck restock workflow — par levels, restock checklists tied to a route or technician — is something none of the competitors we've reviewed in this space seem to have nailed. This could be a genuine wedge feature rather than a me-too checkbox.
- **Reporting gaps around shrinkage/variance and category-level margin trend are notable.** These are exactly the kind of "boring but valuable" reports that tend to come up in bookkeeper and office-manager interviews, and they seem to be underserved across the board, not just by Jobber.
- **The five-custom-field cap on parts** is a small thing but worth checking against our own catalog schema — trade contractors dealing with both manufacturer part numbers and internal SKUs may need more structured fields than Jobber currently allows.

## Questions this raises

- How many of our target accounts are running multi-truck operations today, and how painful is the "everything is one location" limitation actually proving to be for Jobber's existing customers versus a theoretical concern?
- Is a dedicated van-restock workflow (par levels, restock checklists per route) something we should prioritize before broader warehouse/bin-level tracking, given neither seems well-served industry-wide?
- Should our PO approval routing support multi-step chains out of the gate, or is single-approver-with-threshold (Jobber's Summit-tier approach) actually sufficient for our target segment?
- Do we have enough signal on how much demand exists for vendor punch-out/catalog sync to justify building it now versus waiting for the category to mature further?
- What would a lightweight shrinkage/variance report look like for us, and is there enough usage data already flowing through jobs and POs to build it without asking users for extra manual counts?
- Is the "kit doesn't auto-resync when part cost changes" behavior we saw in Jobber's Kit Builder a trap we should explicitly design around, or is it a low-frequency enough event not to matter much in practice?

## Source pages

- https://help.jobber.example.com/articles/stocksync-overview
- https://help.jobber.example.com/articles/po-composer-getting-started
- https://help.jobber.example.com/articles/vendor-hub-setup
- https://help.jobber.example.com/articles/reorder-assist-faq
- https://help.jobber.example.com/articles/kit-builder-limitations
- https://pricing.jobber.example.com/plans/foundation-momentum-summit
- https://community.jobber.example.com/t/partial-po-receiving-workaround
- https://community.jobber.example.com/t/multi-location-inventory-wishlist
- https://releasenotes.jobber.example.com/2026-summer-catalog-sync-beta
- https://developer.jobber.example.com/docs/inventory-api-reference