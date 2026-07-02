import { useEffect, useState } from "react"
import { capBySlug, ORDER, off, score, summarize, shortTitle } from "@/lib/model"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showOverall, setShowOverall] = useState(false)

  // Each capability starts fresh: all rows collapsed, overall summary hidden.
  useEffect(() => {
    setExpanded(new Set())
    setShowOverall(false)
  }, [capSlug])

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })

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
                <div className="mb-5">
                  <button
                    className="flex w-full items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-cobalt hover:underline"
                    onClick={() => setShowOverall((v) => !v)}
                    aria-expanded={showOverall}
                  >
                    Overall summary
                    <span className="ml-auto flex items-center gap-1 text-[10px]">
                      {showOverall ? "Show less" : "Show more"}
                      <ChevronDown className={cn("size-3.5 transition-transform", showOverall && "rotate-180")} />
                    </span>
                  </button>
                  <p className="mt-2 rounded-r-[10px] border-l-[3px] border-l-cobalt bg-muted/40 px-4 py-3 text-[12.5px] font-medium leading-[1.65] text-muted-foreground">
                    {showOverall ? cap.overall : summarize(cap.overall)}
                  </p>
                </div>
              )}

              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">All four players, ranked by depth</div>
              <div className="flex flex-col gap-2.5">
                {ranked.map((c, i) => {
                  const o = off(c.slug, cap.slug)
                  const isFrom = c.slug === from
                  const isLead = i === 0 && score(o) > 0
                  const isOpen = expanded.has(c.slug)
                  const hasDetail = !c.is_fieldpulse && !!o.assessment
                  const preview = c.is_fieldpulse
                    ? "Not yet assessed internally, shown for an honest gap read, never inflated."
                    : summarize(o.assessment)
                  const sources = o.sources.length ? o.sources : o.primary_source ? [{ title: o.primary_source, url: o.primary_source }] : []

                  return (
                    <div
                      key={c.slug}
                      className={cn(
                        "rounded-xl border bg-card",
                        isFrom ? "border-[#bfc9ec]" : isLead ? "shadow-[inset_3px_0_0_var(--live)]" : "",
                        c.is_fieldpulse && "bg-[#f6f7fb]"
                      )}
                    >
                      <button
                        className={cn("flex w-full flex-col gap-2 px-4 py-3 text-left", hasDetail ? "cursor-pointer" : "cursor-default")}
                        onClick={hasDetail ? () => toggle(c.slug) : undefined}
                        aria-expanded={hasDetail ? isOpen : undefined}
                      >
                        <div className="flex w-full items-center gap-2.5">
                          <span className="w-4 shrink-0 text-[12px] font-bold text-muted-foreground">{i + 1}</span>
                          <LogoMark c={c} size={24} />
                          <span className={cn("text-[14px] font-bold tracking-tight", c.is_fieldpulse && "text-muted-foreground")}>{c.name}</span>
                          <span className="ml-auto flex flex-wrap items-center justify-end gap-3.5">
                            <StatusPill o={o} />
                            {o.depth && <MaturityDots depth={o.depth} />}
                            {hasDetail && (
                              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                            )}
                          </span>
                        </div>
                        {!isOpen && (
                          <p className="text-[12.5px] font-medium leading-[1.5] text-muted-foreground">{preview}</p>
                        )}
                      </button>

                      {isOpen && hasDetail && (
                        <div className="border-t px-4 pb-4 pt-3">
                          <p className="text-[13.5px] font-medium leading-[1.65] text-foreground/80">{o.assessment}</p>
                          {sources.length > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                              {sources.map((sc, idx) => (
                                <a
                                  key={idx}
                                  href={sc.url}
                                  target="_blank"
                                  rel="noopener"
                                  className="flex items-baseline gap-1.5 text-[11.5px] font-semibold text-cobalt hover:underline before:text-muted-foreground before:content-['↗']"
                                >
                                  {shortTitle(sc.title)}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
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
