import { useEffect, useRef, useState } from "react"
import { Chat, useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Streamdown } from "streamdown"
import { Sparkles, Send, Square, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// One transport for the app. The transport sends the chat id in the request body, which
// tells /api/chat which conversation to persist.
const transport = new DefaultChatTransport<UIMessage>({ api: "/api/chat" })

// Hold the active conversation at module scope so it survives leaving and returning to the
// Ask intel view (App unmounts this component when you navigate away).
let active: Chat<UIMessage> | null = null
function makeChat(id?: string, messages?: UIMessage[]): Chat<UIMessage> {
  return new Chat<UIMessage>({ id, messages, transport })
}
function getActive(): Chat<UIMessage> {
  if (!active) active = makeChat()
  return active
}

const SUGGESTED = [
  "What did Jobber ship recently in AI?",
  "Compare ServiceTitan and Housecall Pro on AI scheduling and dispatch.",
  "Which competitor leads on the AI customer contact agent, and how deep is it?",
  "How does Jobber price its AI receptionist?",
]

interface ChatMeta {
  id: string
  title: string | null
  updated_at: string
}

export function ChatView() {
  const [chat, setChat] = useState<Chat<UIMessage>>(getActive)
  const { messages, sendMessage, status, regenerate, stop } = useChat({ chat })
  const [input, setInput] = useState("")
  const [recent, setRecent] = useState<ChatMeta[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const busy = status === "submitted" || status === "streaming"

  function loadRecent() {
    fetch("/api/chats")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setRecent(Array.isArray(rows) ? rows : []))
      .catch(() => {})
  }
  useEffect(loadRecent, [])
  // Refresh the recent list whenever a turn finishes (title / order may have changed).
  useEffect(() => {
    if (status === "ready") loadRecent()
  }, [status])
  // Keep the conversation pinned to the latest message as it streams.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, status])

  function submit(text: string) {
    const t = text.trim()
    if (!t || busy) return
    setInput("")
    void sendMessage({ text: t })
  }

  function newChat() {
    const c = makeChat()
    active = c
    setChat(c)
    setInput("")
  }

  async function openChat(id: string) {
    try {
      const r = await fetch(`/api/chats?id=${encodeURIComponent(id)}`)
      if (!r.ok) return
      const row = (await r.json()) as { id: string; messages?: UIMessage[] } | null
      if (!row) return
      const c = makeChat(row.id, row.messages ?? [])
      active = c
      setChat(c)
      setInput("")
    } catch {
      /* ignore load failures; the user can start a new chat */
    }
  }

  return (
    <div className="reveal mx-auto flex h-[calc(100vh-7.5rem)] max-w-3xl flex-col">
      <div className="flex items-start justify-between gap-4 pb-3">
        <div>
          <h1 className="flex items-center gap-2 text-[20px] font-bold tracking-tight text-navy">
            <Sparkles className="size-[18px] text-cobalt" /> Ask intel
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-foreground">
            Ask about competitor AI, pricing, and workflows. Answers are grounded in the intel base and cite their sources.
          </p>
        </div>
        <button
          onClick={newChat}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold text-navy transition-colors hover:bg-accent"
        >
          <Plus className="size-[14px]" /> New chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-xl border bg-card px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent">
              <Sparkles className="size-[20px] text-cobalt" />
            </div>
            <h2 className="mt-3 text-[15px] font-semibold text-navy">What do you want to know?</h2>
            <p className="mt-1 max-w-md text-[12.5px] font-medium text-muted-foreground">
              I answer only from the competitor intel base, so I will not guess. Try one of these:
            </p>
            <div className="mt-4 grid w-full max-w-xl gap-2 sm:grid-cols-2">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => submit(q)}
                  className="rounded-lg border bg-background px-3 py-2.5 text-left text-[12.5px] font-medium text-foreground transition-colors hover:border-cobalt hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
            {recent.length > 0 && (
              <div className="mt-7 w-full max-w-xl text-left">
                <div className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-muted-foreground">
                  Recent
                </div>
                <div className="flex flex-col">
                  {recent.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openChat(c.id)}
                      className="truncate rounded-md px-2 py-1.5 text-left text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {c.title || "Untitled chat"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-navy px-3.5 py-2 text-[13px] font-medium text-white">
                    {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
                  </div>
                ) : (
                  <div className="max-w-full text-[13px] leading-relaxed text-foreground [&_a]:font-medium [&_a]:text-cobalt [&_a]:underline">
                    {m.parts.map((p, i) => (p.type === "text" ? <Streamdown key={i}>{p.text}</Streamdown> : null))}
                  </div>
                )}
              </div>
            ))}
            {status === "submitted" && (
              <div className="text-[12.5px] font-medium text-muted-foreground">Thinking…</div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-3 text-[12.5px] font-medium text-destructive">
                Something went wrong.
                <button onClick={() => void regenerate()} className="font-semibold underline">
                  Retry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="mt-3 flex items-end gap-2 rounded-xl border bg-card p-2 focus-within:border-cobalt"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit(input)
            }
          }}
          rows={1}
          placeholder="Ask about a competitor's AI, pricing, or workflow…"
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[13px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
        {busy ? (
          <button
            type="button"
            onClick={() => void stop()}
            aria-label="Stop"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy transition-colors hover:bg-accent"
          >
            <Square className="size-[15px]" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cobalt text-white transition-colors hover:bg-[#1f3480] disabled:opacity-40"
          >
            <Send className="size-[15px]" />
          </button>
        )}
      </form>
      <p className="pt-2 text-center text-[10.5px] font-medium text-muted-foreground">
        Answers come only from the competitor intel base and cite their sources. FieldPulse's own AI is not yet assessed.
      </p>
    </div>
  )
}
