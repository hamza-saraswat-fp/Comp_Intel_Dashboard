// Data types + the FieldPulse placeholder. The real content is fetched from
// Supabase at runtime (see lib/loadData.ts) and installed via setData() before the
// app renders; the OKF markdown in knowledge/ remains the single source of truth.
// FieldPulse is an honest-gap placeholder shown only in the UI (it is not a
// researched competitor in the DB), so it lives here as a constant.

export interface Source { title: string; url: string }
export interface Offering { competitor: string; capability: string; status: string; depth: string | null; assessment: string; primary_source: string | null; sources: Source[]; as_of: string | null; needs_verification: boolean }
export interface Competitor { slug: string; name: string; is_fieldpulse: boolean; summary: string }
export interface Capability { slug: string; title: string; blurb: string; overall: string; sort_order: number }
export interface Detection { id: string; competitor: string | null; capability: string | null; what: string; kind: string; significance: string; source_url: string | null; first_seen: string | null; okf_path: string | null }
export interface DataShape { generated_at: string; competitors: Competitor[]; capabilities: Capability[]; offerings: Offering[]; detections: Detection[] }

// The 7 capability slugs, in display order — used to synthesize FieldPulse's row.
const CAPABILITY_SLUGS = [
  "customer-contact-agent",
  "in-product-copilot",
  "dispatch-scheduling",
  "marketing-content",
  "reputation-reviews",
  "back-office-automation",
  "agentic-workflow",
] as const

export const FIELDPULSE_COMPETITOR: Competitor = {
  slug: "fieldpulse",
  name: "FieldPulse",
  is_fieldpulse: true,
  summary: "Not yet assessed internally. FieldPulse is shown here as an honest gap read and will be filled in once confirmed with the team.",
}

// FieldPulse shows as "not yet assessed" across every capability (never inflated).
export const FIELDPULSE_OFFERINGS: Offering[] = CAPABILITY_SLUGS.map((capability) => ({
  competitor: "fieldpulse",
  capability,
  status: "not_researched",
  depth: null,
  assessment: "",
  primary_source: null,
  sources: [],
  as_of: null,
  needs_verification: true,
}))

// Populated by setData() in main.tsx before the first render (from loadData()).
// Views read this live binding at render time; only Sidebar reads DATA directly
// (for generated_at), the rest go through lib/model.ts.
export let DATA: DataShape = { generated_at: "", competitors: [], capabilities: [], offerings: [], detections: [] }
export function setData(next: DataShape): void { DATA = next }
