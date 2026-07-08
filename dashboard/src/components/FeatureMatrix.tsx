import type { Capability } from "@/data"
import { rivals, fp, off } from "@/lib/model"
import { LogoMark } from "./LogoMark"

// Shape carries the meaning; color stays neutral (status is the only colored field).
function Glyph({ value }: { value: string }) {
  if (value === "yes")
    return <span aria-label="yes" className="inline-block size-2.5 rounded-full bg-foreground" />
  if (value === "partial")
    return (
      <span
        aria-label="partial"
        className="inline-block size-2.5 rounded-full border border-foreground"
        style={{ background: "linear-gradient(90deg, var(--foreground) 50%, transparent 50%)" }}
      />
    )
  if (value === "no")
    return <span aria-label="no" className="inline-block h-px w-2.5 bg-muted-foreground/60" />
  return (
    <span aria-label="unknown" className="inline-block size-2.5 rounded-full border border-dashed border-muted-foreground/50" />
  )
}

export function FeatureMatrix({ cap }: { cap: Capability }) {
  const defs = cap.features.slice().sort((a, b) => a.sort_order - b.sort_order)
  if (!defs.length) return null
  const players = [...rivals, fp] // competitors, then FieldPulse

  const mark = (slug: string, key: string) => off(slug, cap.slug)?.features.find((f) => f.key === key)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="pb-2 pr-2 align-bottom text-[11px] font-semibold text-muted-foreground">Feature</th>
            {players.map((p) => (
              <th key={p.slug} className="px-1 pb-2 text-center align-bottom">
                <LogoMark c={p} size={18} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {defs.map((d) => (
            <tr key={d.key}>
              <td className="border-t py-2 pr-2 text-[12.5px] font-medium leading-tight">{d.title}</td>
              {players.map((p) => {
                const m = mark(p.slug, d.key)
                return (
                  <td key={p.slug} className="border-t px-1 text-center align-middle" title={m?.note ?? undefined}>
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
