import { compBySlug, caps, off, stats, leader, fmtDate, firstSentence, TOTAL } from "@/lib/model"
import type { View } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"
import { StatusPill } from "./StatusPill"
import { MaturityDots } from "./MaturityDots"
import { Badge } from "./ui/badge"

function Tile({ n, label, dim = false }: { n: number; label: string; dim?: boolean }) {
  return (
    <div className="min-w-[118px] rounded-[10px] border bg-card px-[18px] py-3.5">
      <div className={cn("text-[25px] font-bold leading-none tracking-[-0.03em]", dim ? "text-muted-foreground" : "text-navy")}>{n}</div>
      <div className="mt-1.5 text-[11.5px] font-medium text-muted-foreground">{label}</div>
    </div>
  )
}

export function CompetitorProfile({
  slug,
  onView,
  onCapability,
}: {
  slug: string
  onView: (v: View) => void
  onCapability: (slug: string, from?: string) => void
}) {
  const c = compBySlug[slug]
  if (!c) return null
  const s = stats(slug)
  const posture = c.is_fieldpulse ? "Not yet assessed" : c === leader ? "Pace-setter" : "Fast follower"

  return (
    <div>
      <button className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-cobalt" onClick={() => onView({ t: "overview" })}>
        ← Overview
      </button>

      <header className="mb-6">
        <div className="flex items-center gap-3">
          <LogoMark c={c} size={38} />
          <h1 className="text-[27px] font-bold tracking-[-0.03em]">{c.name}</h1>
          <Badge variant={c === leader ? "default" : "secondary"} className={cn("text-[9.5px] uppercase tracking-[0.05em]", c.is_fieldpulse && "text-muted-foreground")}>
            {posture}
          </Badge>
        </div>
        <p className="mt-2.5 max-w-[72ch] text-[13.5px] font-medium text-muted-foreground">
          {c.is_fieldpulse
            ? "FieldPulse’s own position, shown honestly."
            : `How ${c.name} stacks up across the ${TOTAL} AI capabilities. Click any row for the full comparison and sources.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {c.is_fieldpulse ? (
            <Tile n={TOTAL} label="capabilities to assess" dim />
          ) : (
            <>
              <Tile n={s.shipped} label={`of ${TOTAL} shipped`} />
              <Tile n={s.ml} label="market-leading" />
              <Tile n={s.none + s.na} label="gaps" />
            </>
          )}
        </div>
      </header>

      <div className="mb-1 rounded-r-[10px] border border-l-[3px] border-l-cobalt bg-card px-[18px] py-[15px] text-[13.5px] font-medium leading-[1.65]">
        {c.summary}
      </div>

      <div className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Capabilities</div>
      <div className="overflow-hidden rounded-xl border bg-card">
        {caps.map((cap, i) => {
          const o = off(slug, cap.slug)
          const note = c.is_fieldpulse ? "Not yet assessed internally. Shown for an honest gap read, never inflated." : firstSentence(o.assessment)
          return (
            <div
              key={cap.slug}
              className="group reveal grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-7 gap-y-3.5 border-t px-[18px] py-4 first:border-t-0 hover:bg-[#fafafe]"
              style={{ animationDelay: `${i * 30}ms` }}
              onClick={() => onCapability(cap.slug, slug)}
            >
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight">
                  {cap.title}
                  <span className="text-cobalt opacity-0 transition group-hover:opacity-100">→</span>
                </span>
                <p className="mt-1.5 line-clamp-2 max-w-[74ch] text-[12.5px] font-medium leading-[1.5] text-muted-foreground">{note}</p>
              </div>
              <div className="flex flex-col items-end gap-2 whitespace-nowrap text-right">
                <StatusPill o={o} />
                {o.depth && <MaturityDots depth={o.depth} />}
                {!c.is_fieldpulse && <span className="text-[11px] font-medium text-muted-foreground">Verified {fmtDate(o.as_of)}</span>}
                {o.needs_verification && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ann before:h-1.5 before:w-1.5 before:rounded-full before:border-[1.5px] before:border-ann before:content-['']">
                    Needs verification
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
