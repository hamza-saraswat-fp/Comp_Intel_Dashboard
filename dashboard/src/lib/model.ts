import { DATA, type Offering, type Competitor, type Capability } from "@/data"

export const caps: Capability[] = DATA.capabilities.slice().sort((a, b) => a.sort_order - b.sort_order)
export const TOTAL = caps.length
export const capBySlug: Record<string, Capability> = Object.fromEntries(caps.map((c) => [c.slug, c]))
export const compBySlug: Record<string, Competitor> = Object.fromEntries(DATA.competitors.map((c) => [c.slug, c]))

const offMap: Record<string, Offering> = {}
DATA.offerings.forEach((o) => { offMap[o.competitor + "::" + o.capability] = o })
export const off = (c: string, cap: string): Offering => offMap[c + "::" + cap]

export interface Stats { shipped: number; beta: number; announced: number; none: number; na: number; ml: number }
export function stats(slug: string): Stats {
  const s: Stats = { shipped: 0, beta: 0, announced: 0, none: 0, na: 0, ml: 0 }
  caps.forEach((cap) => {
    const o = off(slug, cap.slug)
    if (!o) return
    if (o.status === "shipped") s.shipped++
    else if (o.status === "beta") s.beta++
    else if (o.status === "announced") s.announced++
    else if (o.status === "none") s.none++
    else s.na++
    if (o.depth === "market_leading") s.ml++
  })
  return s
}

export const fp: Competitor = DATA.competitors.find((c) => c.is_fieldpulse)!
export const rivals: Competitor[] = DATA.competitors
  .filter((c) => !c.is_fieldpulse)
  .sort((a, b) => {
    const sa = stats(a.slug), sb = stats(b.slug)
    return sb.shipped - sa.shipped || sb.ml - sa.ml
  })
export const ORDER: Competitor[] = [fp, ...rivals]
export const leader: Competitor = rivals[0]

export function score(o: Offering): number {
  if (o.status === "shipped") return o.depth === "market_leading" ? 4 : o.depth === "strong" ? 3 : 2
  if (o.status === "beta") return 2
  if (o.status === "announced") return 1
  if (o.status === "none") return 0
  return -1
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export function fmtDate(s: string | null): string {
  if (!s) return ""
  const p = s.split("-")
  return `${MONTHS[+p[1] - 1]} ${+p[2]}, ${p[0]}`
}
export function firstSentence(s: string): string {
  if (!s) return ""
  const m = s.match(/^.*?[.!?](?=\s|$)/)
  return m ? m[0] : s
}
