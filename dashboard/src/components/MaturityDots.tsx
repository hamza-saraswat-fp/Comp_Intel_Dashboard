import { cn } from "@/lib/utils"

export function MaturityDots({ depth }: { depth: string | null }) {
  if (!depth) return null
  const n = depth === "market_leading" ? 3 : depth === "strong" ? 2 : 1
  const label = depth === "market_leading" ? "Market-leading" : depth === "strong" ? "Strong" : "Basic"
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex gap-[3px]">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn("h-[5px] w-[5px] rounded-full border", i <= n ? "border-mat bg-mat" : "border-mat-empty")} />
        ))}
      </span>
      <span className="text-[11.5px] font-medium text-muted-foreground">{label}</span>
    </span>
  )
}
