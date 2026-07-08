"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Send, Search, ChevronLeft, Store, MessagesSquare } from "lucide-react"
import { sendMessage, markConversationRead } from "@/app/actions/messages"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"

export type InboxMessage = { id: number; mine: boolean; body: string; time: string }
export type InboxConversation = {
  id: number
  name: string
  image: string | null
  viewerIsSeller: boolean
  storeSlug: string | null
  preview: string
  unread: boolean
  updatedAt: string
  messages: InboxMessage[]
}

function nowTime() {
  return new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
}

export function MessagesView({ conversations }: { conversations: InboxConversation[] }) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<number>(conversations[0]?.id ?? 0)
  // Local optimistic thread overlay keyed by conversation id.
  const [extra, setExtra] = useState<Record<number, InboxMessage[]>>({})
  const [input, setInput] = useState("")
  const [query, setQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)
  const readTracked = useRef<Set<number>>(new Set())

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]

  const thread = active ? [...active.messages, ...(extra[active.id] ?? [])] : []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [thread.length, activeId])

  // Mark the active conversation as read once.
  useEffect(() => {
    if (!active || !active.unread || readTracked.current.has(active.id)) return
    readTracked.current.add(active.id)
    startTransition(async () => {
      await markConversationRead(active.id)
      router.refresh()
    })
  }, [active, router])

  if (!active) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-card p-12 text-center">
        <MessagesSquare className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-semibold text-foreground">Je hebt nog geen berichten</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Start een gesprek vanaf een productpagina of kraam om hier je berichten te zien.
        </p>
        <Link
          href="/kramen"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Ontdek kramen
        </Link>
      </div>
    )
  }

  const send = () => {
    const text = input.trim()
    if (!text || !active || pending) return
    const optimistic: InboxMessage = { id: Date.now(), mine: true, body: text, time: nowTime() }
    setExtra((e) => ({ ...e, [active.id]: [...(e[active.id] ?? []), optimistic] }))
    setInput("")
    startTransition(async () => {
      try {
        await sendMessage(active.id, text)
        router.refresh()
      } catch {
        // Roll back optimistic message on failure.
        setExtra((e) => ({
          ...e,
          [active.id]: (e[active.id] ?? []).filter((m) => m.id !== optimistic.id),
        }))
      }
    })
  }

  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-[480px] overflow-hidden rounded-xl border border-border bg-card">
      {/* Conversation list */}
      <aside
        className={cn(
          "flex w-full flex-col border-r border-border md:w-80 md:shrink-0",
          mobileOpen ? "hidden md:flex" : "flex",
        )}
      >
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek gesprekken…"
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveId(c.id)
                setMobileOpen(true)
              }}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary",
                c.id === activeId && "bg-secondary",
              )}
            >
              <UserAvatar src={c.image} name={c.name} className="h-11 w-11" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {c.viewerIsSeller ? "Koper" : "Verkoper"}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{c.preview}</span>
              </span>
              {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </aside>

      {/* Active thread */}
      <section className={cn("flex min-w-0 flex-1 flex-col", mobileOpen ? "flex" : "hidden md:flex")}>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Terug naar gesprekken"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <UserAvatar src={active.image} name={active.name} className="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{active.name}</p>
            <p className="text-xs text-muted-foreground">
              {active.viewerIsSeller ? "Koper" : "Verkoper"}
            </p>
          </div>
          {!active.viewerIsSeller && active.storeSlug && (
            <Link
              href={`/kramen/${active.storeSlug}`}
              className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Bekijk kraam</span>
            </Link>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {thread.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nog geen berichten. Zeg hallo!</p>
          )}
          {thread.map((m) => (
            <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2",
                  m.mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-foreground",
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.mine ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) send()
            }}
            placeholder="Typ een bericht…"
            className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            onClick={send}
            disabled={pending || !input.trim()}
            aria-label="Verstuur"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
