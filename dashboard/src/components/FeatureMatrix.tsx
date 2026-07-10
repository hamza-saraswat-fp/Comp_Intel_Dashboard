import type { Capability } from "@/data"
import { rivals, fp, off } from "@/lib/model"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"

// Shape carries the meaning; marks stay monochrome (status is the only colored
// field). yes = filled check, partial = diagonal half disc, no = minus,
// unknown = dotted ring.
function Glyph({ value }: { value: string }) {
  const base = "inline-block size-[15px] align-middle"
  if (value === "yes")
    return (
      <svg viewBox="0 0 16 16" className={cn(base, "text-foreground")} role="img" aria-label="yes">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path
          d="M4.7 8.3l2.1 2.2 4.5-4.9"
          fill="none"
          stroke="var(--background)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  if (value === "partial")
    return (
      <svg viewBox="0 0 16 16" className={cn(base, "text-foreground")} role="img" aria-label="partial">
        <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 1.4a6.6 6.6 0 000 13.2z" fill="currentColor" transform="rotate(-45 8 8)" />
      </svg>
    )
  if (value === "no")
    return (
      <svg viewBox="0 0 16 16" className={cn(base, "text-muted-foreground")} role="img" aria-label="no">
        <line x1="4.6" y1="8" x2="11.4" y2="8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 16 16" className={cn(base, "text-muted-foreground")} role="img" aria-label="unknown">
      <circle
        cx="8"
        cy="8"
        r="6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="1.5 2.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

const LEGEND: [string, string][] = [
  ["yes", "Yes"],
  ["partial", "Partial"],
  ["no", "No"],
  ["unknown", "Unknown"],
]

const scoreVal = (v?: string) => (v === "yes" ? 1 : v === "partial" ? 0.5 : 0)
const fmtCount = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

export function FeatureMatrix({ cap }: { cap: Capability }) {
  const defs = cap.features.slice().sort((a, b) => a.sort_order - b.sort_order)
  if (!defs.length) return null
  const players = [...rivals, fp] // competitors, then FieldPulse

  const mark = (slug: string, key: string) => off(slug, cap.slug)?.features.find((f) => f.key === key)
  const total = (slug: string) => defs.reduce((s, d) => s + scoreVal(mark(slug, d.key)?.value), 0)

  // Leading competitor (FieldPulse excluded, and only when a real leader exists).
  // Neutral tint only, per the "status is the only colored field" rule.
  const leadSlug = rivals.reduce(
    (best, p) => {
      const t = total(p.slug)
      return t > best.t ? { slug: p.slug, t } : best
    },
    { slug: "", t: 0 }
  ).slug

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border bg-muted/30 px-3 py-2">
        {LEGEND.map(([v, label]) => (
          <span key={v} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Glyph value={v} />
            {label}
          </span>
        ))}
      </div>

      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="pb-2 pr-2 align-bottom text-[11px] font-semibold text-muted-foreground">Feature</th>
            {players.map((p) => {
              const isLead = !p.is_fieldpulse && p.slug === leadSlug
              return (
                <th key={p.slug} className={cn("px-1 pb-2 align-bottom", isLead && "rounded-t-md bg-muted/50")}>
                  <div className="flex flex-col items-center gap-1">
                    <LogoMark c={p} size={20} />
                    <span
                      className={cn(
                        "max-w-[64px] text-center text-[10px] font-bold leading-tight",
                        p.is_fieldpulse && "text-muted-foreground"
                      )}
                    >
                      {p.name}
                    </span>
                    <span className="text-[9.5px] font-bold tabular-nums text-muted-foreground">
                      {p.is_fieldpulse ? "n/a" : `${fmtCount(total(p.slug))}/${defs.length}`}
                    </span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {defs.map((d, ri) => (
            <tr key={d.key}>
              <td className="border-t py-2.5 pr-2 text-[12.5px] font-medium leading-tight">{d.title}</td>
              {players.map((p) => {
                const m = mark(p.slug, d.key)
                const isLead = !p.is_fieldpulse && p.slug === leadSlug
                const isLast = ri === defs.length - 1
                return (
                  <td
                    key={p.slug}
                    className={cn(
                      "border-t px-1 text-center align-middle",
                      isLead && "bg-muted/50",
                      isLead && isLast && "rounded-b-md",
                      m?.note && "cursor-help"
                    )}
                    title={m?.note ?? undefined}
                  >
                    <Glyph value={m ? m.value : "unknown"} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
