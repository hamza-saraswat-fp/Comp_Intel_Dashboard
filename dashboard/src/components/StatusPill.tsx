import type { ReactNode } from "react"
import { Star } from "lucide-react"
import type { Offering } from "@/data"
import { cn } from "@/lib/utils"

const LABEL: Record<string, string> = {
  shipped: "Live",
  beta: "Beta",
  announced: "Announced",
  none: "None",
  not_researched: "Not assessed",
}

// Soft status tints (fill + accessible text) on the active states only.
// none / not assessed stay quiet with no fill, so color tracks presence.
const TINT: Record<string, { bg: string; fg: string }> = {
  shipped: { bg: "rgba(23,147,106,0.12)", fg: "#0f6e56" },
  beta: { bg: "rgba(63,99,196,0.12)", fg: "#2d4aa0" },
  announced: { bg: "rgba(184,121,26,0.14)", fg: "#8a5a13" },
}

export function StatusPill({ o, overview = false }: { o: Offering; overview?: boolean }) {
  const lead = o.status === "shipped" && o.depth === "market_leading"
  const tint = TINT[o.status]
  let label: string
  if (overview) {
    label = o.status === "shipped" ? "Live" : o.status === "not_researched" ? "—" : LABEL[o.status]
  } else {
    label = o.status === "not_researched" ? "Not assessed" : LABEL[o.status]
  }

  // In the overview, the market-leader's glyph is the star itself (it replaces
  // the live dot). It stays in the pill's own green so the chip reads as one
  // color; the star shape, not a clashing hue, marks the leader.
  let dot: ReactNode
  if (overview && lead) {
    dot = <Star className="size-3.5 shrink-0" style={{ fill: tint.fg, stroke: tint.fg }} aria-label="Leading" />
  } else if (o.status === "shipped") {
    dot = <span className="h-2.5 w-2.5 rounded-full bg-live" />
  } else if (o.status === "beta") {
    dot = <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-beta" style={{ boxShadow: "inset -5.5px 0 0 var(--beta)" }} />
  } else if (o.status === "announced") {
    dot = <span className="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-ann" />
  } else {
    dot = <span className={cn("h-0.5 w-3 rounded", o.status === "none" ? "bg-none" : "bg-na")} />
  }

  const muted = o.status === "none" || o.status === "not_researched"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[12.5px] font-semibold",
        tint ? "rounded-full px-2.5 py-[3px]" : muted ? "font-medium text-muted-foreground" : "text-foreground"
      )}
      style={tint ? { backgroundColor: tint.bg, color: tint.fg } : undefined}
    >
      {dot}
      <span>{label}</span>
    </span>
  )
}
