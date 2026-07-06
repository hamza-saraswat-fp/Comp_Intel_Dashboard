// Build the app's DataShape from Supabase at runtime (IAI-241).
//
// This replaces the old static data.ts seed. It fetches the three derived tables,
// maps them into the exact types the views already expect, and prepends the
// FieldPulse "honest gap" placeholder (which lives only in the UI, not the DB).
// The views/components are unchanged — they still read `DATA` + the model helpers.

import {
  type DataShape,
  type Competitor,
  type Capability,
  type Offering,
  type Source,
  type Detection,
  FIELDPULSE_COMPETITOR,
  FIELDPULSE_OFFERINGS,
} from '@/data'
import { q } from './supabase'

type CompetitorRow = { slug: string; name: string; summary: string }
type CapabilityRow = { slug: string; title: string; blurb: string; overall: string; sort_order: number }
type OfferingRow = {
  competitor: string
  capability: string
  status: string
  depth: string | null
  assessment: string
  primary_source: string | null
  sources: Source[] | null
  as_of: string | null
  needs_verification: boolean
}
type DetectionRow = {
  id: string
  competitor: string | null
  capability: string | null
  what: string
  kind: string
  significance: string
  source_url: string | null
  first_seen: string | null
  okf_path: string | null
}

export async function loadData(): Promise<DataShape> {
  const [competitorRows, capabilityRows, offeringRows, detectionRows] = await Promise.all([
    q<CompetitorRow>('competitors'),
    q<CapabilityRow>('capabilities'),
    q<OfferingRow>('offerings'),
    q<DetectionRow>('detections'),
  ])

  // FieldPulse first (the honest-gap column), then the real competitors.
  const competitors: Competitor[] = [
    FIELDPULSE_COMPETITOR,
    ...competitorRows.map((c) => ({ slug: c.slug, name: c.name, is_fieldpulse: false, summary: c.summary })),
  ]

  const capabilities: Capability[] = capabilityRows
    .map((c) => ({ slug: c.slug, title: c.title, blurb: c.blurb, overall: c.overall, sort_order: c.sort_order }))
    .sort((a, b) => a.sort_order - b.sort_order)

  const offerings: Offering[] = [
    ...offeringRows.map((o) => ({
      competitor: o.competitor,
      capability: o.capability,
      status: o.status,
      depth: o.depth,
      assessment: o.assessment,
      primary_source: o.primary_source,
      sources: o.sources ?? [],
      as_of: o.as_of,
      needs_verification: o.needs_verification,
    })),
    ...FIELDPULSE_OFFERINGS,
  ]

  // The "what's new" feed, newest first (the DB may return any order).
  const detections: Detection[] = detectionRows
    .map((d) => ({
      id: d.id,
      competitor: d.competitor,
      capability: d.capability,
      what: d.what,
      kind: d.kind,
      significance: d.significance,
      source_url: d.source_url,
      first_seen: d.first_seen,
      okf_path: d.okf_path,
    }))
    .sort((a, b) => (b.first_seen ?? '').localeCompare(a.first_seen ?? ''))

  // "As of" reflects the freshest research date across the real cells.
  const dates = offeringRows.map((o) => o.as_of).filter((d): d is string => !!d)
  const generated_at = dates.length ? dates.sort().at(-1)! : ''

  return { generated_at, competitors, capabilities, offerings, detections }
}
