import { useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { Star } from "lucide-react"
import type { Offering } from "@/data"
import { ORDER, caps, off, stats, leader, rivals, TOTAL, summarize, fp } from "@/lib/model"
import type { View } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"
import { StatusPill } from "./StatusPill"
import { Separator } from "./ui/separator"

const stub = (status: string, depth: string | null = null): Offering => ({
  competitor: "", capability: "", status, depth, assessment: "", primary_source: null, sources: [], as_of: null, needs_verification: false,
})

// Hover peek: a quick, click-free read of one player's assessment for a capability.
// Rendered through a portal to <body> so the fixed popover escapes the table's
// overflow clip and the rows' transform (the reveal animation), which would
// otherwise become its containing block and mis-place it. No popover dependency.
function CellPeek({ label, text, children }: { label: string; text: string; children: ReactNode }) {
  const [box, setBox] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  if (!text) return <>{children}</>
  const left = box ? Math.min(box.left, window.innerWidth - 280) : 0
  const nearBottom = box ? box.bottom > window.innerHeight - 140 : false
  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) setBox(ref.current.getBoundingClientRect())
      }}
      onMouseLeave={() => setBox(null)}
    >
      {children}
      {box &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 w-[264px] rounded-lg border bg-popover px-3.5 py-2.5 shadow-[0_10px_30px_-12px_rgba(0,3,77,0.28)]"
            style={nearBottom ? { left, bottom: window.innerHeight - box.top + 8 } : { left, top: box.bottom + 8 }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">{label}</div>
            <p className="mt-1 text-[12px] font-medium leading-[1.5] text-foreground/80">{text}</p>
          </div>,
          document.body
        )}
    </div>
  )
}

export function Overview({
  onView,
  onCapability,
}: {
  onView: (v: View) => void
  onCapability: (slug: string, from?: string) => void
}) {
  const rest = rivals.slice(1).map((c) => c.name)
  const restStr = rest.length === 2 ? `${rest[0]} and ${rest[1]}` : rest.join(", ")
  const ls = stats(leader.slug)
  // Derived landscape TL;DR: computed from live data as a placeholder. Note for Hamza:
  // replace with one authoritative summary line in data.ts when ready.
  const landscape = `Across ${TOTAL} capabilities, ${leader.name} ships AI in ${ls.shipped} and leads outright in ${ls.ml}, including the only true ML dispatch. ${restStr} keep pace on most but ship no AI dispatch. ${fp.name} is not yet assessed internally, shown as an honest gap.`

  return (
    <div>
      <header className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground">AI competitive landscape</div>
        <h1 className="mt-2.5 max-w-[54ch] text-[clamp(19px,2vw,25px)] font-bold leading-[1.32] tracking-[-0.022em]">
          <span className="text-cobalt">{leader.name} sets the AI pace</span>, the only player shipping true ML dispatch. {restStr} are close behind on nearly everything else.
        </h1>
        <p className="mt-3 max-w-[72ch] text-[13px] font-medium leading-[1.6] text-foreground/70">{landscape}</p>
        <p className="mt-3 text-[12px] font-medium text-muted-foreground">
          {ORDER.length} players · {TOTAL} capabilities · click any capability to compare all four
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b">
              <th className="w-[28%] px-[18px] py-[15px] text-left align-bottom text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Capability</th>
              {ORDER.map((c) => {
                const s = stats(c.slug)
                const tally = c.is_fieldpulse ? "pending" : `${s.shipped} live${s.ml ? ` · ${s.ml} leading` : ""}`
                return (
                  <th key={c.slug} className="border-l px-[18px] py-[15px] text-left align-bottom">
                    <button className="group flex items-center gap-2" onClick={() => onView({ t: "competitor", slug: c.slug })}>
                      <LogoMark c={c} size={22} />
                      <span className={cn("text-[13px] font-bold tracking-tight group-hover:text-cobalt", c.is_fieldpulse && "text-navy")}>{c.name}</span>
                    </button>
                    <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{tally}</div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {caps.map((cap, i) => (
              <tr
                key={cap.slug}
                className="group reveal cursor-pointer border-t hover:bg-[#fafafe]"
                style={{ animationDelay: `${i * 34}ms` }}
                onClick={() => onCapability(cap.slug)}
              >
                <td className="px-[18px] py-[18px]">
                  <span className="inline-flex items-center gap-2 text-[15px] font-semibold leading-snug tracking-tight">
                    {cap.title}
                    <span className="font-bold text-cobalt opacity-0 transition group-hover:opacity-100">→</span>
                  </span>
                </td>
                {ORDER.map((c) => {
                  const o = off(c.slug, cap.slug)
                  const peek = c.is_fieldpulse
                    ? "Not yet assessed internally, shown for an honest gap read."
                    : summarize(o.assessment, 170)
                  return (
                    <td key={c.slug} className="border-l px-[18px] py-[18px]">
                      <CellPeek label={c.name} text={peek}>
                        <StatusPill o={o} overview />
                      </CellPeek>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 px-1">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Status</span>
        <StatusPill o={stub("shipped")} overview />
        <StatusPill o={stub("beta")} overview />
        <StatusPill o={stub("announced")} overview />
        <StatusPill o={stub("none")} overview />
        <StatusPill o={stub("not_researched")} overview />
        <Separator orientation="vertical" className="h-3.5" />
        <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-foreground">
          <Star className="size-3.5 shrink-0 fill-navy stroke-navy" />
          Leading
        </span>
      </div>
    </div>
  )
}
