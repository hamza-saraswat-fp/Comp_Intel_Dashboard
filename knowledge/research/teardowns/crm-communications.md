---
type: Teardown
slug: crm-communications
topic: CRM & customer communications
competitors: [jobber, housecall-pro, servicetitan]
as_of: 2026-07-07
author: fable-deep-research
---

# Competitor Teardown — CRM & Customer Communications
*Jobber · Housecall Pro · ServiceTitan | Prepared for FieldPulse · July 2026*

This teardown examines how our three primary FSM competitors manage customers and customer communication at the UI/workflow level: what a customer record actually holds, how two-way messaging and automated notifications work, what their client portals and booking intake flows do, and — critically — where AI now sits inside the front-office comms flow. It complements the AI capability matrix (`knowledge/capabilities/`): where the matrix says *what exists and how mature it is*, this document describes *how the workflow actually runs*.

**Sourcing note.** Tier 1 sources are the vendors' own help centers and feature pages, fetched July 7, 2026. One caveat: `help.getjobber.com` blocked all direct automated fetches (HTTP 403, ~15 attempts), so Jobber help-center facts are sourced from search-result snippets quoting those articles verbatim, cross-checked against Jobber's own marketing pages and launch PR. Every claim carries its real source URL; anything we could not corroborate is marked **(unverified)**. ServiceTitan and Housecall Pro help centers fetched cleanly.

## At a glance

| Capability | Jobber | Housecall Pro | ServiceTitan |
|---|---|---|---|
| Record model | Client → Properties (0-many) | Customer → multiple service addresses | Customer (billing) ↔ Location (service site), strictly separated |
| Custom fields | Yes — 6 types, scopable to client/property/quote/job/invoice/team | **None** — explicitly unsupported | Yes — 3 types, on 8 record types, surfaceable on Call Booking screen |
| Two-way SMS inbox | Message center, dedicated number — Grow plan+ | "Chat" inbox (customers + employees + community), dedicated Texting Number | "Chat" under Calls; techs reply-only on mobile |
| Automated notifications | Visit reminders, quote/invoice follow-ups (max 2 each), on-my-way, booking confirmations | 6 types incl. on-my-way w/ live GPS link; 160-char SMS editor | 5 categories incl. dispatch notification w/ live tech map + ETA |
| Client portal | Client Hub (all plans, magic-link) | Customer Portal (7-day magic link) | New Customer Portal (branded subdomain, memberships/equipment/agreements) |
| Online booking → CRM | Request or Booking form → auto-creates "lead" client | Online Booking widget + Lead Form → Lead in Job Inbox/Pipeline | Scheduling Pro (paid Pro) → Dispatch Board / Calls > Bookings |
| AI receptionist | Receptionist (calls + texts + webchat), $29/mo add-on incl. 30 conversations; included in Plus | CSR AI (calls + webchat; SMS "coming soon"), paid add-on, price undisclosed | AI Voice Agent (books via Adaptive Capacity) + Marketing Pro SMS Agent; Contact Center Pro in Early Access |
| Native call recording | Only inside AI Receptionist; else 3rd-party (CallRail etc.) | Voice VoIP product + campaign call tracking numbers | Deep native: tracking numbers, auto-recording, Call Booking screen, Voice Intelligence analysis |

---

## 1 · Customer records & data model

### Jobber — "Clients" with properties, tags, and transferable custom fields
- A client's phone numbers, emails, payment terms, lead source, tags, and custom-field values sit at the top of the client page; clients support **multiple contacts** (Main/Work/Personal types) and a designated **billing contact** whose email pre-populates on quotes/invoices and payment receipts ([Client Basics](https://help.getjobber.com/hc/en-us/articles/115009450867-Client-Basics), [product update](https://productupdates.getjobber.com/91774-add-multiple-client-contacts-and-send-the-right-info-to-the-right-people)).
- **Properties** are where work happens; a client can have zero, one, or many ([Properties](https://help.getjobber.com/hc/en-us/articles/115010161128-Properties)).
- **Custom fields** come in six types (True/False, Numeric, Area, Dropdown, Text, Link), scoped independently to clients, properties, quotes, jobs, invoices, or team members. Fields are internal by default but can be made **client-facing**, and can be marked **transferable** so a value follows the workflow (client → job → invoice) ([Custom Fields](https://help.getjobber.com/hc/en-us/articles/115009735928-Custom-Fields)).
- **Tags** group/segment clients, filter the client list, and drive Campaign segmentation ("contains / does not contain tag" stacked with status, city, and "never booked a job" filters) ([Tags](https://help.getjobber.com/hc/en-us/articles/115009557647-Tags), [Campaigns](https://help.getjobber.com/hc/en-us/articles/19885016029207-Campaigns-Marketing-Tools)).
- History: an account-wide **Activity Feed** logs quote approvals, payments, visit completions, and note edits with actor attribution ([Activity Feed](https://help.getjobber.com/hc/en-us/articles/360037055533-Activity-Feed)). Notes and attachments live on the client profile (max 500 MB/file, 50 per batch), and a **Files and Media Library** tab shows every file tied to the client with source, timestamp, address, and uploader ([Notes and Attachments](https://help.getjobber.com/hc/en-us/articles/360000110368-Notes-and-Attachments), [Files and Media Library](https://help.getjobber.com/hc/en-us/articles/39800675084439-Files-and-Media-Library)). [View screenshots →](https://www.getjobber.com/features/field-service-crm/)

### Housecall Pro — rich profile, no custom fields
- Customer profile fields: first/last name, display name, email, mobile/home/work numbers, company, role, bill-to, referral info, plus a **Homeowner/Business** classification and a red **"Do Not Service"** flag. Only name + mobile number are required (mobile specifically so the customer can receive text notifications) ([Customer Profile Overview](https://help.housecallpro.com/en/articles/9764383-customer-profile-overview), [Adding New Customers](https://help.housecallpro.com/en/articles/2813289-adding-new-customers)).
- **Multiple service addresses** per profile, each with location-specific notes. The **Property Profile** app tracks equipment per address (item type, make/model, serial, install date); equipment only shows on a job if the job's service address matches the address the item is linked to ([Property Profile](https://help.housecallpro.com/en/articles/3703307-property-profile)).
- **Custom fields do not exist.** The help center states directly: *"Currently, Housecall Pro is not set up to allow for custom fields… including custom fields on the customer profile."* Users are told to "vote" for the feature via support chat ([Custom Fields](https://help.housecallpro.com/en/articles/361372-custom-fields)). This is the single clearest data-model gap among the three.
- **Tags** (customer, job, and estimate variants) are internal-only; they drive email-marketing targeting ("if tagged with / unless tagged with") and review-request exclusion (e.g., a "Don't Send Review" tag) ([Tags Overview](https://help.housecallpro.com/en/articles/8490475-tags-overview)).
- The profile shows a combined feed of messages, jobs, and invoices; two tiers of attachments (profile-level and address-level); pinnable priority notes; tasks; a **Lead Source** field; and "Referred by" linking to another customer's profile with parent–child billing support ([Customer Profile Overview](https://help.housecallpro.com/en/articles/9764383-customer-profile-overview), [Adding New Customers](https://help.housecallpro.com/en/articles/2813289-adding-new-customers)).

### ServiceTitan — Customer vs. Location, an enterprise data model
- ServiceTitan strictly separates the **Customer record** (billing-responsible party, person icon) from **Location records** (service sites, house icon). The customer header shows Customer ID, Residential/Commercial tag, billing address, **Membership status**, and "customer since" year; a summary block shows **Lifetime Revenue, Avg. Job Total, Balance Due, and Credit Available** ([Customer and Location Records overview](https://help.servicetitan.com/docs/customer-and-location-records-overview)).
- Customer-record left nav spans notes, locations, memberships, invoices, payments, payment methods, statements, jobs, appointments, projects, tasks, leads, **calls**, **marketing activity** (a table of every email/SMS sent, referenceable live on a call), opportunities, estimates, forms, and media. **Equipment lives only on Location records** ([same source](https://help.servicetitan.com/docs/customer-and-location-records-overview)).
- **Custom fields** (Text, Dropdown up to 1,000 options, Numeric) attach to customers, locations, jobs, projects, POs, equipment, employees, and technicians; job custom fields can be surfaced **on the Call Booking screen** and marked required ([Use custom fields](https://help.servicetitan.com/docs/use-custom-fields)).
- Notes are pinnable and duplicable across related records; media and attachments have dedicated sections with a broad supported-type list (heic/tiff images, mov/mp4 video, Office docs, pdf, csv, vcf…) ([Add notes, media, and file attachments](https://help.servicetitan.com/docs/add-notes-media-and-file-attachments-in-servicetitan)).
- Roadmap note: ServiceTitan is building dedicated **CRM: Residential** (speed-to-lead + centralized follow-up queue; GA targeted spring 2026 **(unverified — search-snippet only)**) and **CRM: Commercial** (private preview) modules ([May 2026 product updates](https://www.servicetitan.com/blog/product-updates-may-2026)).

**Read:** ServiceTitan's record is a financial/operational dossier (lifetime revenue, credit, memberships, calls); Jobber's is the most flexible per-record schema for SMBs (6 custom-field types, client-facing/transferable); Housecall Pro's is polished but schema-frozen — no custom fields at all.

---

## 2 · Messaging & automated notifications

### Jobber
- **Two-way text messaging** runs through a Jobber-provided **dedicated phone number**; all conversations land in the **message center** drawer in the top nav. MMS (images/files) works both directions; no per-message fees — but it's gated to the **Grow plan ($149/mo annual) and up**, US/UK/Canada only ([Two-Way Text Messaging](https://help.getjobber.com/hc/en-us/articles/360051087154-Two-Way-Text-Messaging), [Pricing](https://www.getjobber.com/pricing/)).
- Templates are managed centrally in **Emails and Text Messages Settings** — per notification category, tabbed email/SMS editors; SMS templates cap at **160 characters**, plain text ([Emails and Text Messages Settings](https://help.getjobber.com/hc/en-us/articles/9335574672151-Emails-and-Text-Messages-Settings)).
- Automated touches: **on-my-way texts** from the mobile app (tech picks minutes-away; client can reply if two-way texting is on) ([On My Way Texts](https://help.getjobber.com/hc/en-us/articles/7448087796631-On-My-Way-Text-Messages-in-the-Jobber-App)); **assessment/visit reminders** on a schedule or manual ([Assessment and Visit Reminders](https://help.getjobber.com/hc/en-us/articles/360033608974-Assessment-and-Visit-Reminders)); **quote follow-ups** (up to 2, on "awaiting response") and **invoice follow-ups** (up to 2, past-due with pay link) on Connect plan+; and a **job follow-up** feedback/survey message on completion ([Automations](https://help.getjobber.com/hc/en-us/articles/24244124296471-Automations)).
- Every outbound email/text — including automated notifications, booking confirmations, and on-my-way texts — is logged with delivery/open status in the **Client Communications Report** ([Client Communications Report](https://help.getjobber.com/hc/en-us/articles/115016068927-Client-Communications-Report)).
- AI assist: a **Rewrite** button in message fields (quotes, campaigns) polishes drafted text with tone options ([Jobber AI feature page](https://www.getjobber.com/features/ai/)).

### Housecall Pro
- The **Housecall Pro Inbox** ("Chat") unifies three workspaces: **Customers** (SMS via a registered business **Texting Number**), **Employees**, and **Community**. Point of contact, office staff, and assigned field techs are auto-added to customer threads; techs are auto-removed when the job completes. Threads support attachments, voice messages, @mentions, and yellow-highlighted **internal notes** invisible to the customer ([Messaging Within Your Inbox](https://help.housecallpro.com/en/articles/5981299-messaging-within-your-housecall-pro-inbox), [Texting Number](https://help.housecallpro.com/en/articles/887351-texting-number)).
- Notable leak in the funnel: from mobile, tapping the email icon sends **from the tech's personal email**, and the native call/text icons bypass HCP entirely — only the in-app SMS path stays in the unified thread ([mobile comms options](https://help.housecallpro.com/en/articles/4793277-what-are-my-options-for-communicating-with-my-customers-from-the-mobile-app)).
- **Six automated notification types**: Job/Estimate Scheduled (text+email, re-sent on time/staff changes), On My Way (text-only), Job/Estimate Finished (text-only), Review Request, Marketing Campaigns, Payment/Receipt. Channel logic is automatic (SMS-only if no email on file, etc.) ([Customer Notifications Overview](https://help.housecallpro.com/en/articles/357613-customer-notifications-overview)).
- The three SMS types are individually editable (Settings > Notifications > Customer) with live preview and merge variables (customer first name, tech name, job date/time, invoice number); on-my-way texts can include the **technician's photo** ([Customize SMS Notifications](https://help.housecallpro.com/en/articles/12417565-customize-sms-notifications)). On-my-way can also carry a **live GPS tracking link** (via the Vehicle GPS Tracking app card's "Share location with customer" setting) **(unverified — snippet-sourced)** ([Vehicle GPS Tracking](https://help.housecallpro.com/en/articles/6060351-vehicle-gps-tracking-overview)).
- **SMS Job Reminders** are off by default; default timing 9:00 AM one day before, adjustable, 160-char cap, jobs only ([SMS Job Reminders](https://help.housecallpro.com/en/articles/8688152-setting-up-sms-job-reminders)). An **after-hours auto-reply** answers inbound texts outside business hours ([Customize SMS Notifications](https://help.housecallpro.com/en/articles/12417565-customize-sms-notifications)).

### ServiceTitan
- **Chat** (Calls > Chat) is the message hub: open/closed tabs, unread threads bolded; **all messages to a customer — including automated dispatch notifications — funnel into the same thread**, and jobs can be booked directly from a chat ([send/receive texts](https://help.servicetitan.com/docs/how-to-send-and-receive-text-messages-in-servicetitan)).
- Technicians on ServiceTitan Mobile **cannot initiate texts** — they can only reply within existing threads on their own jobs (Job > Chat), gated by per-tech permissions ("View customer chats", "Allow full access to customer chats") ([technician two-way chat](https://help.servicetitan.com/docs/manage-technician-two-way-chat-in-servicetitan-and-servicetitan-mobile)).
- **Customer Notifications** (Settings > Customer Notifications) covers five categories: **Booking Confirmations, Reminders, Dispatch Notifications, Arrival Notifications, Job Completion Surveys** — branded SMS/email templates with tokens, mutable by job type/business unit/commercial work, plus after-hours chat autoresponders ([Customer Notifications Home](https://help.servicetitan.com/docs/customer-notifications)).
- The **dispatch ("on my way") notification** is the flagship: it can include tech name, star rating (shown only if 4+ stars), photo, ETA/distance, an **interactive live map**, and a "Track Now" link (Tech Tracking URL token; requires native GPS on tech devices). Each notification type is configured for text **or** email — running both means setting each up separately. Notifications can be capped at one/day per site ([Enable dispatch notifications](https://help.servicetitan.com/how-to/enable-dispatch-notifications)).
- Compliance is built in: STOP/END/CANCEL etc. auto-opts a number out, and ServiceTitan formally distinguishes transactional vs. marketing messages ([send/receive texts](https://help.servicetitan.com/docs/how-to-send-and-receive-text-messages-in-servicetitan)).

**Read:** all three now treat automated lifecycle texts as core plumbing. Differentiators are at the edges: ServiceTitan's rideshare-style live tracking map and single-thread funneling; HCP's tech-photo/GPS texture but leaky mobile side-channels; Jobber's clean template system but plan-gated two-way SMS (a real objection-handle for FieldPulse sales against the $29–99/mo tiers).

---

## 3 · Client portal & online booking

### Jobber — Client Hub + Request/Booking forms
- **Client Hub** (all plans) lets clients approve quotes or request changes (business notified), pay invoices/deposits **with optional tip**, view past/upcoming appointments **including photos of assigned team members**, request new work, and share referral links. Access is passwordless via a secure emailed link ([Client Hub feature page](https://www.getjobber.com/features/client-hub/), [Client Hub Settings](https://help.getjobber.com/hc/en-us/articles/115009571307-Client-Hub-Settings)). [View screenshots →](https://www.getjobber.com/features/client-hub/)
- Intake has two modes: a **Request form** (info-collection; lands as a Request to vet) vs. a **Booking form** (client self-schedules against live availability windows and team calendars). Adding a "booking question" flips a request form into self-scheduling ([Requests and Bookings Settings](https://help.getjobber.com/hc/en-us/articles/39026037947543-Requests-and-Bookings-Settings), [Online Booking](https://help.getjobber.com/hc/en-us/articles/13808363916951-Online-Booking)).
- A completed booking **auto-schedules a one-off job on the calendar** — no manual conversion. New submitters are **auto-added to the client list labeled "lead"**, with form responses mapping to the lead source field ([Online Booking](https://help.getjobber.com/hc/en-us/articles/13808363916951-Online-Booking)). Online booking is included from the $29/mo Core plan ([Pricing](https://www.getjobber.com/pricing/)).

### Housecall Pro — Customer Portal + Online Booking + Lead Form
- The **Customer Portal** covers upcoming/past appointments, estimate view/approve/decline, invoice payment (card or ACH), saved payment methods, a "Send a Message" request channel, and referral links. Access is a **7-day magic link** (auto-resent on expiry), auto-included in job/invoice/estimate emails ([Using the Customer Portal](https://help.housecallpro.com/en/articles/8448657-using-the-customer-portal)).
- **Online Booking** is a 24/7 widget (website, social, email signature, and **Reserve with Google**) writing straight to the live schedule — "new jobs are instantly added to your team's schedule with real-time availability updates" — with optional required deposits and Price-Book-driven dynamic pricing ([Online Booking page](https://www.housecallpro.com/features/online-booking/)).
- The separate **Lead Form** (Settings > Booking > Lead Form) captures configurable fields (all become required); submission creates a **Lead**, fires a text alert to the business, and lands in the **Job Inbox** and the **Pipeline** "New Lead" column ([Lead Form](https://help.housecallpro.com/en/articles/10028154-lead-form)).

### ServiceTitan — New Customer Portal + Scheduling Pro
- The **New Customer Portal** runs on a branded subdomain (`https://[host].myservicetitan.com`) and exposes invoices (multi-invoice payment; billing-access users only; requires ServiceTitan Payments for card processing), estimates as "Open Proposals" (e-sign + deposit), **service agreements** (optional e-signature), **memberships** ("Contracts" for commercial customers), **equipment history**, and self-scheduling via an embedded Scheduling Pro / Web Scheduler 2.0 widget. Any customer whose email is on a record can self-register, or admins can force invite-only ([Set up the New Customer Portal](https://help.servicetitan.com/docs/set-up-and-customize-the-new-customer-portal), [Customer Portal feature page](https://www.servicetitan.com/features/customer-portal-software)).
- Self-service booking is **Scheduling Pro** — a paid Pro product, embeddable on the website, Google Business Profile (Reserve with Google), and social; bookings flow to the **Dispatch Board** or Calls > Bookings with requested services and customer info attached ([Scheduling Pro](https://www.servicetitan.com/features/pro/scheduling)).

**Read:** portal capability now correlates with segment: Jobber/HCP portals are transactional (approve, pay, rebook) while ServiceTitan's is an account center (agreements, memberships, equipment). Note the packaging asymmetry — Jobber ships booking on its cheapest plan; ServiceTitan monetizes self-scheduling as a Pro add-on.

---

## 4 · AI in the front office (receptionists, CSR AI, virtual agents)

*Focus here is where AI sits in the comms workflow — capability/maturity labels live in the AI matrix.*

### Jobber — Receptionist, powered by Jobber AI
- **Where it sits:** in front of the phone line, SMS, and Jobber-site webchat, 24/7. It answers, asks about the job in natural language, collects contact details, and **books the visit during the call**, feeding new leads directly into the Jobber workflow ([AI Receptionist page](https://www.getjobber.com/features/ai-receptionist/), [launch PR, Aug 18 2025](https://www.prnewswire.com/news-releases/jobber-launches-ai-powered-receptionist-to-answer-calls-and-texts-for-busy-home-service-businesses-302531125.html)).
- **CRM tie-in:** with "identify clients" enabled, it matches caller ID against existing clients, greets known callers by name via a templated "Known callers" greeting, and can proactively state the caller's next appointment **(help-center content via search snippet — help.getjobber.com 403s)** ([Receptionist article](https://help.getjobber.com/hc/en-us/articles/25315927533847-Receptionist-powered-by-Jobber-AI)).
- **Fallback paths:** if it takes a message instead of booking, it creates a **follow-up task on the schedule with a conversation summary**; it can text the owner or **live-transfer the call on configured keywords**; humans can take over text threads mid-conversation ([AI Receptionist page](https://www.getjobber.com/features/ai-receptionist/), [launch PR](https://www.prnewswire.com/news-releases/jobber-launches-ai-powered-receptionist-to-answer-calls-and-texts-for-busy-home-service-businesses-302531125.html)).
- **Record-keeping:** every conversation is saved — transcript, AI summary, outcome, collected client info, and (for calls) **audio recording** — in a Receptionist dashboard ([Receptionist in the Jobber App](https://help.getjobber.com/hc/en-us/articles/38642097101591-Receptionist-in-the-Jobber-App)).
- **Packaging:** Jobber's own pricing page lists the add-on at **$29/mo**; the help center describes **30 conversations/mo included, $0.79 per additional**; included with unlimited usage on the Plus plan ([Pricing](https://www.getjobber.com/pricing/), [Receptionist article](https://help.getjobber.com/hc/en-us/articles/25315927533847-Receptionist-powered-by-Jobber-AI)). Third-party reviews still cite a flat **$99/mo** — likely the launch-era price **(unverified; re-check before quoting externally)** ([myquoteiq](https://myquoteiq.com/jobber-pricing-breakdown-2026/), [fieldcamp](https://fieldcamp.ai/reviews/jobber/)). 200,000+ conversations handled as of launch ([PR](https://www.prnewswire.com/news-releases/jobber-launches-ai-powered-receptionist-to-answer-calls-and-texts-for-busy-home-service-businesses-302531125.html)).

### Housecall Pro — CSR AI (the paid member of the "AI Team")
- **Where it sits:** answers **calls and website chats** 24/7; native **SMS handling is "coming soon"** per the help center. It asks clarifying questions, quotes from the business's own **Price Book line items** ("CSR AI will check the descriptions and prices of your available services"), and **books jobs/estimates directly to the calendar** against real availability; if it can't complete a booking, the business gets a notification to follow up ([CSR AI Overview](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview), [CSR AI page](https://www.housecallpro.com/features/ai-team/csr-ai/)).
- **Plumbing:** activation is via a **dedicated forwarding number** — the business forwards its line at the carrier level; permissions (book/reschedule/cancel), escalation rules, after-hours behavior, a knowledge base, and voice/tone customization live under Settings > Team & Permissions > AI Team ([CSR AI Overview](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview)).
- **Record-keeping:** call summaries, booking details, and customer info auto-log to the call log and calendar; chat threads persist in the Inbox. The AI-disclosure/recording notice **cannot be disabled**. Caller-ID lookup against existing customer records is implied ("references your customer database") but the mechanics are **(unverified)** ([CSR AI Overview](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview), [FAQs](https://help.housecallpro.com/en/articles/12001958-csr-ai-best-practices-and-faqs)).
- **Packaging:** the only paid member of the five-agent **AI Team** (Analyst, Coach, Help, Marketing AI are free/default-on). No public price — the pricing page lists it with no dollar figure; the product page sells a "**42x ROI**" claim instead ([AI Team Overview](https://help.housecallpro.com/en/articles/9311875-ai-team-overview), [Pricing](https://www.housecallpro.com/pricing/)). **Marketing AI** touches comms only as a "Write it for me" drafting assist for campaign emails and review replies — human sends ([Marketing AI Overview](https://help.housecallpro.com/en/articles/10630035-marketing-ai-overview)).

### ServiceTitan — AI Voice Agent + SMS Agent + Contact Center Pro
- **AI Voice Agent — where it sits:** in front of (or alongside) the phone platform, handling overflow/after-hours or full lines. It **recognizes returning customers and VIP members and pulls their history** ("The Voice Agent knows if the customer is an existing customer, or a VIP member. It knows their history"), then books **straight to the Dispatch Board using real-time Adaptive Capacity** — the same engine behind the human CSR's availability button — factoring job type, location, and required skill sets. It transfers to a human when needed, confirms/reschedules appointments, texts via ServiceTitan tracking numbers, and can make **outbound calls to new leads**. Every call gets a transcript, AI summary, and automatic classification ([AI Voice Agent page](https://www.servicetitan.com/features/pro/contact-center/voice-agents)). Vendor-cited pilot numbers: 90% capacity-adjusted booking rate, ~5-min average talk time, ~20-min setup ([same page](https://www.servicetitan.com/features/pro/contact-center/voice-agents)).
- **Marketing Pro SMS Agent — where it sits:** on the lead funnel. New leads on the Leads/Follow Ups or Bookings/Calls pages get an **instant AI SMS response, even after hours** (speed-to-lead); it runs outbound follow-ups (including unsold estimates), answers inbound texts, books against Adaptive Capacity, and **hands off to the Voice Agent or a manual task**. Included with Marketing Pro ([AI-powered agents page](https://www.servicetitan.com/features/pro/marketing/ai-powered-agents)). A related **Speed to Lead** flow (instant personalized SMS → AI back-and-forth → auto-booked job) underpins the upcoming CRM: Residential module **(unverified — release-hub page 404'd; snippet only)** ([release note](https://help.servicetitan.com/release-hub/docs/convert-new-leads-into-booked-jobs-faster-with-speed-to-lead)).
- **Contact Center Pro — where it sits:** above all of it, as the omnichannel front-office layer (Early Access; requires Enterprise Hub): every call in one inbox fully native to ServiceTitan, calls auto-linked to jobs, advanced routing, queue monitoring, and **AI Manager Assist** — call transcripts/summaries, **sentiment analysis** "at a glance," **Second Chance Leads** flagging unbooked calls worth a follow-up, and coaching identification ([Contact Center Pro](https://www.servicetitan.com/features/pro/contact-center), [help doc](https://help.servicetitan.com/v1/docs/contact-center-pro), [Manager Assist](https://www.servicetitan.com/features/pro/contact-center/manager-assist)). Whether the separately documented **Voice Intelligence (Vi) call summary** (moment tagging, role-scoped coaching) is the same system as Manager Assist is ambiguous in the docs **(unverified)** ([Vi call summary](https://help.servicetitan.com/v1/docs/evaluate-employees-using-the-voice-intelligence-call-summary)).
- **Packaging:** none of Voice Agent / Contact Center Pro / Manager Assist has public pricing; all route to a Pro Account Manager ([Contact Center Pro help doc](https://help.servicetitan.com/v1/docs/contact-center-pro)).

**Read (workflow lens):** the shared pattern is *AI answers → looks up the caller in the CRM → books against real availability → logs transcript/summary to the record → escalates to a human on rules*. The differences that matter: ServiceTitan's agents share one scheduling brain (Adaptive Capacity) across human CSRs, voice AI, and SMS AI; Jobber is furthest along on *transparent SMB packaging* ($29/mo, conversation-metered); HCP's CSR AI still lacks native SMS and hides its price. Nobody yet ships AI that *drafts replies inside the human two-way inbox* — the assist features (Jobber Rewrite, HCP Write-it-for-me) live in quotes/campaigns/review replies, not the SMS thread.

---

## 5 · Calls & intake

### ServiceTitan — the call IS the CRM front door
- The **Call Booking screen** is the distinctive workflow: an inbound call pops a **green call bubble**; the CSR clicks it to link the call to their profile (unclicked calls are still recorded but flagged "abandoned" for manager review). Caller ID **auto-populates the customer record before pickup** — CSRs greet by name and see **property age and size** on screen. The CSR books via dropdowns (Job Type, Business Unit; Campaign auto-attributed from the tracking number dialed), pulls **"Get Adaptive Availability"** for live slots, and **Book Job** pushes straight to the Dispatch Board ([Call Booking Home](https://help.servicetitan.com/docs/call-booking), [Call Booking feature page](https://www.servicetitan.com/features/call-booking-software), [Adaptive Capacity overview](https://help.servicetitan.com/docs/adaptive-capacity-overview-learn-how-it-works)). [View screenshots →](https://www.servicetitan.com/features/call-booking-software)
- **Tracking numbers** (Settings > Phones > Phone Numbers) are virtual numbers tied to marketing campaigns; every call through one is auto-recorded, auto-attributed, and pulls up the matching customer record; "Lead"-flagged calls roll into CSR conversion/booking metrics — a closed loop from ad spend to booked job ([Add or edit tracking numbers](https://help.servicetitan.com/docs/add-or-edit-tracking-numbers)).
- Recording behavior is granular: auto-pause on the payment screen, Virtual Agent calls always recorded, internal calls never; ServiceTitan and Contact Center Pro keep **separate recording settings** ([Call tracking and recording overview](https://help.servicetitan.com/how-to/call-tracking-and-recording-overview-in-contact-center-pro-and-servicetitan)). Techs can replay the original CSR call from the job before walking in ([Call Booking feature page](https://www.servicetitan.com/features/call-booking-software)).

### Housecall Pro — Voice as an add-on phone system
- **Voice** (HCP's VoIP product) ties calls to CRM: reps see customer details and job history **before answering** (screen-pop), calls route to available techs with queue visibility, and call logs/notes/**recordings** stay attached to the record; includes IVR menus, custom voicemail, call analytics, and intake forms ([Voice Solutions page](https://www.housecallpro.com/features/voice-solutions/)). All-calls-recorded-by-default and admin recording controls are **(unverified — snippet-sourced)** ([Voice Settings Overview](https://help.housecallpro.com/en/articles/6750234-voice-settings-overview)).
- Separate **Call Tracking** assigns per-channel tracking numbers (Google Business Profile, Facebook, Yelp…) that forward to the main line, with SHAKEN/STIR + CNAM registration required; the docs don't spell out auto-attachment of tracked calls to specific customer records ([Set Up Call Tracking](https://help.housecallpro.com/en/articles/6750286-set-up-call-tracking-for-the-first-time)). Voice/Call Tracking pricing is not published ([Voice page](https://www.housecallpro.com/features/voice-solutions/)).

### Jobber — no native telephony outside the Receptionist
- Jobber has **no native call recording or call tracking in the core CRM**. Call tracking/lead attribution is delegated to integrations — **CallRail** (inbound calls create/sync leads with source and a timestamped call record on the client profile) and phone systems like Ooma ([CallRail product update](https://productupdates.getjobber.com/45324-track-inbound-phone-calls-and-lead-sources-with-callrail), [CallRail integration page](https://www.callrail.com/integrations/jobber)).
- The exception: calls handled by the **AI Receptionist** are natively recorded, transcribed, and summarized — but only those. A regular inbound call that never touches Receptionist leaves no native trace ([Receptionist in the Jobber App](https://help.getjobber.com/hc/en-us/articles/38642097101591-Receptionist-in-the-Jobber-App)).

**Read:** call-centric intake is ServiceTitan's moat — the phone, the marketing attribution, the CSR workflow, and now the AI agents all share one spine. HCP is building a lighter version (Voice + tracking numbers). Jobber has effectively decided the AI Receptionist *is* its phone system.

---

## What it means for FieldPulse

1. **Custom fields are a live differentiator against Housecall Pro.** HCP's help center flatly says custom fields don't exist — on customer profiles or anywhere else. Any FieldPulse story about flexible customer data (custom fields, asset tracking, tags) lands hardest against HCP mid-market deals; against Jobber it's parity (they have 6 field types with client-facing/transferable options), and against ServiceTitan it's table stakes.
2. **AI receptionists are now packaging wars, not capability wars.** All three run the same loop (answer → CRM lookup → real-availability booking → transcript on the record). The competitive texture is price/transparency: Jobber $29/mo metered and self-serve, HCP undisclosed, ServiceTitan enterprise-negotiated. FieldPulse positioning should attack the *packaging* (transparent, included, or metered) rather than claim a capability gap that no longer exists.
3. **The "on-my-way" message is quietly becoming a live-tracking surface.** ServiceTitan ships a rideshare-style map + ETA + tech rating; HCP offers GPS links and tech photos. If FieldPulse's dispatch notification is still a static text, that's a visible demo-stage gap.
4. **Watch the two-way SMS gate.** Jobber holds two-way texting hostage to its $149/mo Grow plan; ServiceTitan blocks techs from initiating texts. A frictionless, all-plans unified inbox is a cheap FieldPulse talking point with real workflow substance.
5. **ServiceTitan is packaging "CRM" as a product again.** CRM: Residential (speed-to-lead + follow-up queue, spring 2026) and CRM: Commercial signal ST pushing AI-native lead management down-market into FieldPulse-adjacent deals — worth a monitor rule on the ST release hub.
6. **Portal expectations are segment-specific.** FieldPulse doesn't need ST's membership/equipment portal to win SMB, but quote-approval + payment + booking in one passwordless link (Jobber/HCP pattern) is the floor buyers now assume.

## Questions this raises

- **Jobber Receptionist pricing:** is $29/mo (30 conversations, $0.79 overage) the actual current price, and when did it drop from the $99/mo launch price? (Affects any battlecard math; verify at next pricing-page diff.)
- **HCP CSR AI:** has native SMS handling shipped yet (help center said "coming soon"), and what does CSR AI actually cost? Does it do true caller-ID matching against the customer list?
- **ServiceTitan:** what are Contact Center Pro's GA timing and pricing, and are Manager Assist and Voice Intelligence one system or two? Did CRM: Residential hit spring-2026 GA?
- **Inbox AI:** which vendor first puts AI drafting/suggested replies *inside* the two-way customer SMS thread (vs. quotes/campaigns)? None do today — likely the next shoe to drop.
- **FieldPulse internal:** do we have parity on (a) communications audit log equivalent to Jobber's Client Communications Report, (b) live-map dispatch notifications, (c) portal payment + booking in one link?

## Source pages

**Jobber** (help.getjobber.com articles cited via search snippets due to 403s; marketing pages fetched directly)
- https://help.getjobber.com/hc/en-us/articles/115009450867-Client-Basics
- https://help.getjobber.com/hc/en-us/articles/115009735928-Custom-Fields
- https://help.getjobber.com/hc/en-us/articles/115010161128-Properties
- https://help.getjobber.com/hc/en-us/articles/115009557647-Tags
- https://help.getjobber.com/hc/en-us/articles/19885016029207-Campaigns-Marketing-Tools
- https://help.getjobber.com/hc/en-us/articles/360037055533-Activity-Feed
- https://help.getjobber.com/hc/en-us/articles/360000110368-Notes-and-Attachments
- https://help.getjobber.com/hc/en-us/articles/39800675084439-Files-and-Media-Library
- https://help.getjobber.com/hc/en-us/articles/360051087154-Two-Way-Text-Messaging
- https://help.getjobber.com/hc/en-us/articles/1500010708402-Two-Way-Text-Messaging-in-the-Jobber-App
- https://help.getjobber.com/hc/en-us/articles/9335574672151-Emails-and-Text-Messages-Settings
- https://help.getjobber.com/hc/en-us/articles/115016068927-Client-Communications-Report
- https://help.getjobber.com/hc/en-us/articles/7448087796631-On-My-Way-Text-Messages-in-the-Jobber-App
- https://help.getjobber.com/hc/en-us/articles/360033608974-Assessment-and-Visit-Reminders
- https://help.getjobber.com/hc/en-us/articles/24244124296471-Automations
- https://help.getjobber.com/hc/en-us/articles/1500011237822-What-Do-Your-Clients-See-in-Client-Hub
- https://help.getjobber.com/hc/en-us/articles/115009571307-Client-Hub-Settings
- https://help.getjobber.com/hc/en-us/articles/39026037947543-Requests-and-Bookings-Settings
- https://help.getjobber.com/hc/en-us/articles/13808363916951-Online-Booking
- https://help.getjobber.com/hc/en-us/articles/25315927533847-Receptionist-powered-by-Jobber-AI
- https://help.getjobber.com/hc/en-us/articles/38642097101591-Receptionist-in-the-Jobber-App
- https://help.getjobber.com/hc/en-us/articles/25315900454423-Jobber-AI-Voice-and-Chat-Beta
- https://help.getjobber.com/hc/en-us/articles/20621046897559-Reviews-Marketing-Tools
- https://www.getjobber.com/features/field-service-crm/
- https://www.getjobber.com/features/client-hub/
- https://www.getjobber.com/features/collect-requests-and-bookings/
- https://www.getjobber.com/features/ai-receptionist/
- https://www.getjobber.com/features/ai/
- https://www.getjobber.com/pricing/
- https://productupdates.getjobber.com/91774-add-multiple-client-contacts-and-send-the-right-info-to-the-right-people
- https://productupdates.getjobber.com/45324-track-inbound-phone-calls-and-lead-sources-with-callrail
- https://www.callrail.com/integrations/jobber
- https://www.prnewswire.com/news-releases/jobber-launches-ai-powered-receptionist-to-answer-calls-and-texts-for-busy-home-service-businesses-302531125.html
- https://myquoteiq.com/jobber-pricing-breakdown-2026/ *(secondary)*
- https://fieldcamp.ai/reviews/jobber/ *(secondary)*

**Housecall Pro**
- https://help.housecallpro.com/en/articles/9764383-customer-profile-overview
- https://help.housecallpro.com/en/articles/2813289-adding-new-customers
- https://help.housecallpro.com/en/articles/361372-custom-fields
- https://help.housecallpro.com/en/articles/8490475-tags-overview
- https://help.housecallpro.com/en/articles/3703307-property-profile
- https://help.housecallpro.com/en/articles/5981299-messaging-within-your-housecall-pro-inbox
- https://help.housecallpro.com/en/articles/887351-texting-number
- https://help.housecallpro.com/en/articles/4793277-what-are-my-options-for-communicating-with-my-customers-from-the-mobile-app
- https://help.housecallpro.com/en/articles/357613-customer-notifications-overview
- https://help.housecallpro.com/en/articles/12417565-customize-sms-notifications
- https://help.housecallpro.com/en/articles/8688152-setting-up-sms-job-reminders
- https://help.housecallpro.com/en/articles/6060351-vehicle-gps-tracking-overview *(snippet-sourced)*
- https://help.housecallpro.com/en/articles/8448657-using-the-customer-portal
- https://help.housecallpro.com/en/articles/10028154-lead-form
- https://help.housecallpro.com/en/articles/9311875-ai-team-overview
- https://help.housecallpro.com/en/articles/9740104-csr-ai-overview
- https://help.housecallpro.com/en/articles/12001958-csr-ai-best-practices-and-faqs
- https://help.housecallpro.com/en/articles/10630035-marketing-ai-overview
- https://help.housecallpro.com/en/articles/2637765-reviews-app
- https://help.housecallpro.com/en/articles/6750286-set-up-call-tracking-for-the-first-time
- https://help.housecallpro.com/en/articles/6750234-voice-settings-overview *(snippet-sourced)*
- https://www.housecallpro.com/features/ai-team/csr-ai/
- https://www.housecallpro.com/features/online-booking/
- https://www.housecallpro.com/features/voice-solutions/
- https://www.housecallpro.com/pricing/

**ServiceTitan**
- https://help.servicetitan.com/docs/customer-and-location-records-overview
- https://help.servicetitan.com/docs/use-custom-fields
- https://help.servicetitan.com/docs/add-notes-media-and-file-attachments-in-servicetitan
- https://help.servicetitan.com/docs/customer-notifications
- https://help.servicetitan.com/how-to/enable-dispatch-notifications
- https://help.servicetitan.com/docs/how-to-send-and-receive-text-messages-in-servicetitan
- https://help.servicetitan.com/docs/manage-technician-two-way-chat-in-servicetitan-and-servicetitan-mobile
- https://help.servicetitan.com/docs/set-up-and-customize-the-new-customer-portal
- https://help.servicetitan.com/docs/call-booking
- https://help.servicetitan.com/docs/adaptive-capacity-overview-learn-how-it-works
- https://help.servicetitan.com/docs/add-or-edit-tracking-numbers
- https://help.servicetitan.com/how-to/call-tracking-and-recording-overview-in-contact-center-pro-and-servicetitan
- https://help.servicetitan.com/docs/manage-review-requests
- https://help.servicetitan.com/docs/titan-intelligence-overview
- https://help.servicetitan.com/v1/docs/contact-center-pro
- https://help.servicetitan.com/v1/docs/evaluate-employees-using-the-voice-intelligence-call-summary
- https://help.servicetitan.com/release-hub/docs/convert-new-leads-into-booked-jobs-faster-with-speed-to-lead *(404 on fetch; snippet-sourced)*
- https://www.servicetitan.com/features/customer-portal-software
- https://www.servicetitan.com/features/call-booking-software
- https://www.servicetitan.com/features/pro/scheduling
- https://www.servicetitan.com/features/pro/contact-center
- https://www.servicetitan.com/features/pro/contact-center/voice-agents
- https://www.servicetitan.com/features/pro/contact-center/manager-assist
- https://www.servicetitan.com/features/pro/marketing/ai-powered-agents
- https://www.servicetitan.com/blog/product-updates-may-2026 *(snippet-sourced)*

*Review requests, noted for comms-flow completeness: Jobber Reviews is a $39/mo add-on triggered on visit complete / job closed / invoice paid-in-full with up to two auto follow-ups and per-client opt-out ([Reviews Marketing Tools](https://help.getjobber.com/hc/en-us/articles/20621046897559-Reviews-Marketing-Tools)); HCP review requests are on by default on job Finished (or invoice-paid), split across Google/Facebook/HCP page, suppressible by tag ([Reviews app](https://help.housecallpro.com/en/articles/2637765-reviews-app)); ServiceTitan review requests live in Marketing Pro Reputation, trigger on job completion, resendable up to 5 times, matched back to tech and job ([Manage review requests](https://help.servicetitan.com/docs/manage-review-requests)).*
