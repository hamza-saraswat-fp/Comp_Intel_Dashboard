# Detections — the "what's new" feed

Dated records of competitor AI features the monitor (`comp_intel_monitor`) detected, landed here as **reviewed PRs** (IAI-231). Each `<date>-<slug>.md` is `type: Detection` and is projected into the Supabase `detections` table.

`capability` may be empty — an **uncategorized** detection (fits none of the 7 capabilities) still gets a record here, flagged for triage; it is never force-fit into the matrix.
