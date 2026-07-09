import { lazy, Suspense, useState } from "react"
import type { View } from "@/lib/nav"
import { Sidebar } from "@/components/Sidebar"
import { Overview } from "@/components/Overview"
import { CompetitorProfile } from "@/components/CompetitorProfile"
import { WhatsNew } from "@/components/WhatsNew"
import { CapabilityDrawer } from "@/components/CapabilityDrawer"

// Lazy so the chat's heavy deps (streamdown → shiki + mermaid, the ai sdk) don't weigh
// down the dashboard's initial load; they fetch only when the Ask intel view opens.
const ChatView = lazy(() => import("@/components/ChatView").then((m) => ({ default: m.ChatView })))

export default function App() {
  const [view, setView] = useState<View>({ t: "overview" })
  const [cap, setCap] = useState<{ slug: string; from?: string } | null>(null)

  const goto = (v: View) => { setView(v); window.scrollTo(0, 0) }
  const openCapability = (slug: string, from?: string) => setCap({ slug, from })

  return (
    <div className="grid min-h-screen grid-cols-[252px_1fr] max-[920px]:grid-cols-1">
      <Sidebar view={view} onView={goto} onCapability={(slug) => openCapability(slug)} />
      <main className="px-11 pb-20 pt-9 max-[920px]:px-[18px]">
        {view.t === "overview" && <Overview onView={goto} onCapability={openCapability} />}
        {view.t === "whatsnew" && <WhatsNew />}
        {view.t === "competitor" && <CompetitorProfile slug={view.slug} onView={goto} onCapability={openCapability} />}
        {view.t === "chat" && (
          <Suspense fallback={<div className="text-[13px] font-medium text-muted-foreground">Loading…</div>}>
            <ChatView />
          </Suspense>
        )}
      </main>
      <CapabilityDrawer capSlug={cap?.slug ?? null} from={cap?.from} onOpenChange={(open) => { if (!open) setCap(null) }} />
    </div>
  )
}
