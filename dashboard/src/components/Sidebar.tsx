import { LayoutGrid, Bell, Layers } from "lucide-react"
import { DATA } from "@/data"
import { ORDER, caps, fmtDate } from "@/lib/model"
import type { View } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"

const navCls = (active: boolean) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] font-medium transition-colors",
    active ? "bg-accent font-semibold text-navy" : "text-muted-foreground hover:bg-[#f0f1f8] hover:text-foreground"
  )

export function Sidebar({
  view,
  onView,
  onCapability,
}: {
  view: View
  onView: (v: View) => void
  onCapability: (slug: string) => void
}) {
  return (
    <aside className="sticky top-0 flex h-screen w-[252px] flex-col overflow-y-auto border-r bg-sidebar p-3.5 max-[920px]:static max-[920px]:h-auto">
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-1">
        <img src="/fp-icon.svg" alt="FieldPulse" className="h-[30px] w-[30px] rounded-md" />
        <div>
          <div className="text-[14.5px] font-bold leading-tight tracking-tight">Competitor Intel</div>
          <div className="text-[11px] font-medium text-muted-foreground">AI capability watch</div>
        </div>
      </div>

      <button className={navCls(view.t === "overview")} onClick={() => onView({ t: "overview" })}>
        <LayoutGrid className="size-[15px] opacity-70" /> Overview
      </button>
      <button className={navCls(view.t === "whatsnew")} onClick={() => onView({ t: "whatsnew" })}>
        <Bell className="size-[15px] opacity-70" /> What&rsquo;s new
      </button>

      <div className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground">Competitors</div>
      {ORDER.map((c) => (
        <button
          key={c.slug}
          className={navCls(view.t === "competitor" && view.slug === c.slug)}
          onClick={() => onView({ t: "competitor", slug: c.slug })}
        >
          <LogoMark c={c} size={22} /> {c.name}
        </button>
      ))}

      <div className="px-2.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground">Capability lens</div>
      {caps.map((cap) => (
        <button key={cap.slug} className={navCls(false)} onClick={() => onCapability(cap.slug)}>
          <Layers className="size-[15px] shrink-0 opacity-70" />
          <span className="truncate">{cap.title.replace(/^AI\s+/, "").replace(/\s*\(emerging\)$/, "")}</span>
        </button>
      ))}

      <div className="mt-auto px-2.5 pb-1 pt-4 text-[10.5px] font-medium leading-relaxed text-muted-foreground">
        As of {fmtDate(DATA.generated_at)}
        <br />
        Sourced from the OKF knowledge base
      </div>
    </aside>
  )
}
