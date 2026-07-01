import { capBySlug, ORDER, off, score } from "@/lib/model"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"
import { StatusPill } from "./StatusPill"
import { MaturityDots } from "./MaturityDots"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet"

export function CapabilityDrawer({
  capSlug,
  from,
  onOpenChange,
}: {
  capSlug: string | null
  from?: string
  onOpenChange: (open: boolean) => void
}) {
  const cap = capSlug ? capBySlug[capSlug] : null
  const ranked = cap ? ORDER.slice().sort((a, b) => score(off(b.slug, cap.slug)) - score(off(a.slug, cap.slug))) : []

  return (
    <Sheet open={!!cap} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto p-0">
        {cap && (
          <>
            <SheetHeader className="gap-2 border-b p-6 pb-5">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Capability</div>
              <SheetTitle className="text-[20px] tracking-[-0.02em]">{cap.title}</SheetTitle>
              <SheetDescription className="text-[12.5px] leading-[1.55]">{cap.blurb}</SheetDescription>
            </SheetHeader>

            <div className="p-6">
              {cap.overall && (
                <div className="mb-5 rounded-[10px] border bg-muted/40 p-4 text-[12.5px] font-medium leading-[1.65]">{cap.overall}</div>
              )}
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">All four players, ranked by depth</div>
              <div className="flex flex-col gap-3">
                {ranked.map((c, i) => {
                  const o = off(c.slug, cap.slug)
                  const isFrom = c.slug === from
                  const isLead = i === 0 && score(o) > 0
                  const sources = o.sources.length ? o.sources : o.primary_source ? [{ title: o.primary_source, url: o.primary_source }] : []
                  return (
                    <div
                      key={c.slug}
                      className={cn(
                        "reveal rounded-xl border bg-card p-4",
                        isFrom ? "border-[#bfc9ec] shadow-[inset_3px_0_0_var(--cobalt)]" : isLead ? "shadow-[inset_3px_0_0_var(--live)]" : "",
                        c.is_fieldpulse && "bg-[#f6f7fb]"
                      )}
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                        <span className="w-4 text-[12px] font-bold text-muted-foreground">{i + 1}</span>
                        <LogoMark c={c} size={26} />
                        <span className="text-[14px] font-bold tracking-tight">{c.name}</span>
                        <span className="ml-auto flex flex-wrap items-center gap-3.5">
                          <StatusPill o={o} />
                          {o.depth && <MaturityDots depth={o.depth} />}
                        </span>
                      </div>
                      {c.is_fieldpulse ? (
                        <p className="text-[12.5px] font-medium leading-[1.6] text-muted-foreground">
                          Not yet assessed internally, flagged for verification. Shown for an honest gap read, never inflated.
                        </p>
                      ) : (
                        <>
                          <p className="mb-2.5 text-[12.5px] font-medium leading-[1.6] text-muted-foreground">{o.assessment}</p>
                          {sources.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {sources.map((sc, idx) => (
                                <a
                                  key={idx}
                                  href={sc.url}
                                  target="_blank"
                                  rel="noopener"
                                  className="flex items-baseline gap-1.5 text-[11.5px] font-semibold text-cobalt hover:underline before:text-muted-foreground before:content-['↗']"
                                >
                                  {sc.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
