import { DATA } from "@/data"
import { compBySlug, capBySlug, fmtDate } from "@/lib/model"
import { LogoMark } from "@/components/LogoMark"

const KIND_LABEL: Record<string, string> = {
  new: "New feature",
  expansion: "Expansion",
  rebrand: "Rebrand",
  "announcement-only": "Announcement only",
}

// Significance drives the accent: significant moves wear a filled brand-accent
// dot, routine ones stay quiet with a hollow gray one. Shape reinforces color.
const SIG: Record<string, { color: string; label: string; filled: boolean }> = {
  high: { color: "var(--cobalt)", label: "High", filled: true },
  med: { color: "var(--ann)", label: "Med", filled: true },
  low: { color: "var(--none)", label: "Low", filled: false },
}

function EmptyState() {
  return (
    <div className="reveal max-w-[620px] rounded-xl border border-dashed bg-card px-8 py-12 text-center">
      <div className="mx-auto mb-4 h-2.5 w-2.5 rounded-full bg-live shadow-[0_0_0_5px_rgba(23,147,106,0.14)]" />
      <h3 className="mb-2 text-[15px] font-bold">Monitoring is live</h3>
      <p className="mx-auto max-w-[46ch] text-[13px] font-medium leading-[1.6] text-muted-foreground">
        No competitor AI moves have been flagged yet. When the monitor detects a change on a competitor&rsquo;s site, it lands here with its date, capability, and source.
      </p>
    </div>
  )
}

export function WhatsNew() {
  const feed = DATA.detections
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-0.03em]">What's new</h1>
        <p className="mt-2.5 max-w-[72ch] text-[13.5px] font-medium text-muted-foreground">
          Competitor AI moves, newest first. Significant launches will wear the accent; routine updates stay quiet.
        </p>
      </header>

      {feed.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="max-w-[720px] space-y-2.5">
          {feed.map((d) => {
            const comp = d.competitor ? compBySlug[d.competitor] : undefined
            const cap = d.capability ? capBySlug[d.capability] : undefined
            const sig = SIG[d.significance] ?? SIG.low
            return (
              <li key={d.id} className="reveal rounded-xl border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {comp && <LogoMark c={comp} size={20} />}
                    <span className="text-[13.5px] font-bold text-navy">{comp?.name ?? "Unknown"}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: sig.color }}>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={sig.filled ? { backgroundColor: sig.color } : { border: `1.5px solid ${sig.color}` }}
                      />
                      {sig.label}
                    </span>
                  </div>
                  <time className="shrink-0 text-[12px] font-medium tabular-nums text-muted-foreground">
                    {fmtDate(d.first_seen)}
                  </time>
                </div>

                <p className="mt-1.5 text-[13.5px] leading-[1.55]">{d.what}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] font-medium text-muted-foreground">
                  <span className="rounded-full bg-accent px-2 py-[2px] font-semibold text-accent-foreground">
                    {cap?.title ?? "Uncategorized"}
                  </span>
                  <span>{KIND_LABEL[d.kind] ?? d.kind}</span>
                  {d.source_url && (
                    <a
                      href={d.source_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-cobalt underline decoration-1 underline-offset-2"
                    >
                      Source
                    </a>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
