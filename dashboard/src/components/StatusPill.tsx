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

export function StatusPill({ o, overview = false }: { o: Offering; overview?: boolean }) {
  const lead = o.status === "shipped" && o.depth === "market_leading"
  let label: string
  if (overview) {
    label = o.status === "shipped" ? "Live" : o.status === "not_researched" ? "—" : LABEL[o.status]
  } else {
    label = o.status === "not_researched" ? "Not assessed" : LABEL[o.status]
  }

  let dot: ReactNode
  if (o.status === "shipped") {
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
    <span className={cn("inline-flex items-center gap-2 text-[12.5px] font-semibold", muted ? "font-medium text-muted-foreground" : "text-foreground")}>
      {dot}
      <span>{label}</span>
      {overview && lead && <Star className="size-3.5 shrink-0 fill-navy stroke-navy" aria-label="Leading" />}
    </span>
  )
}
