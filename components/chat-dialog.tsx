"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MessageSquare, X, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { startConversation, sendMessage } from "@/app/actions/messages"

type Message = { id: number; from: "user" | "seller"; text: string }

export function ChatDialog({
  sellerName,
  productName,
  triggerLabel = "Chat met verkoper",
  triggerClassName,
  fullWidthTrigger = false,
  storeId,
  isLoggedIn,
}: {
  sellerName: string
  productName?: string
  triggerLabel?: string
  triggerClassName?: string
  fullWidthTrigger?: boolean
  storeId?: number
  isLoggedIn?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      from: "seller",
      text: `Hoi! Je spreekt met ${sellerName}. Waarmee kan ik je helpen${
        productName ? ` met "${productName}"` : ""
      }?`,
    },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentToInbox, setSentToInbox] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setError(null)

    // Optimistically render the buyer's message.
    setMessages((m) => [...m, { id: Date.now(), from: "user", text }])
    setInput("")

    if (!storeId) return

    setSending(true)
    try {
      const { conversationId } = await startConversation(storeId)
      await sendMessage(conversationId, text)
      setSentToInbox(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Versturen mislukt.")
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary",
          fullWidthTrigger && "w-full",
          triggerClassName,
        )}
      >
        <MessageSquare className="h-5 w-5" />
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:p-6" role="dialog" aria-modal="true">
          <button
            aria-label="Sluit chat"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:h-[520px] sm:max-w-sm sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                  {sellerName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{sellerName}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                    Doorgaans snel online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                  <p
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                      m.from === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-secondary text-foreground",
                    )}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {sentToInbox && (
                <p className="text-center text-xs text-muted-foreground">
                  Bericht verstuurd.{" "}
                  <Link href="/berichten" className="font-medium text-primary hover:underline">
                    Bekijk in je berichten
                  </Link>
                </p>
              )}
              {error && <p className="text-center text-xs text-destructive">{error}</p>}
            </div>

            {isLoggedIn ? (
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
                  disabled={sending}
                  aria-label="Verstuur"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
              </div>
            ) : (
              <div className="border-t border-border p-4 text-center">
                <p className="mb-2 text-sm text-muted-foreground">Log in om een bericht te sturen.</p>
                <Link
                  href="/sign-in"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
                >
                  Inloggen
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
