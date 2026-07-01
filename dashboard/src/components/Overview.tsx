import type { Offering } from "@/data"
import { ORDER, caps, off, stats, leader, rivals, TOTAL } from "@/lib/model"
import type { View } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"
import { StatusPill } from "./StatusPill"
import { MaturityDots } from "./MaturityDots"
import { Separator } from "./ui/separator"

const stub = (status: string, depth: string | null = null): Offering => ({
  competitor: "", capability: "", status, depth, assessment: "", primary_source: null, sources: [], as_of: null, needs_verification: false,
})

export function Overview({
  onView,
  onCapability,
}: {
  onView: (v: View) => void
  onCapability: (slug: string, from?: string) => void
}) {
  const rest = rivals.slice(1).map((c) => c.name)
  const restStr = rest.length === 2 ? `${rest[0]} and ${rest[1]}` : rest.join(", ")

  return (
    <div>
      <header className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground">AI competitive landscape</div>
        <h1 className="mt-2.5 max-w-[54ch] text-[clamp(19px,2vw,25px)] font-bold leading-[1.32] tracking-[-0.022em]">
          <span className="text-cobalt">{leader.name} sets the AI pace</span>, the only player shipping true ML dispatch. {restStr} are close behind on nearly everything else.
        </h1>
        <p className="mt-3.5 text-[12px] font-medium text-muted-foreground">
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
                {ORDER.map((c) => (
                  <td key={c.slug} className="border-l px-[18px] py-[18px]">
                    <StatusPill o={off(c.slug, cap.slug)} overview />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 px-1">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Status</span>
        <StatusPill o={stub("shipped", "market_leading")} overview />
        <StatusPill o={stub("shipped", "strong")} overview />
        <StatusPill o={stub("beta")} overview />
        <StatusPill o={stub("announced")} overview />
        <StatusPill o={stub("none")} overview />
        <StatusPill o={stub("not_researched")} overview />
        <Separator orientation="vertical" className="h-3.5" />
        <span className="text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground">Depth</span>
        <MaturityDots depth="market_leading" />
      </div>
    </div>
  )
}
