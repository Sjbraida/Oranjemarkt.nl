"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MessageSquare, X, Send, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { startConversation, sendMessage, getStoreThread } from "@/app/actions/messages"

type Message = { id: number; mine: boolean; text: string }

// Standaardvragen die kopers met één tik kunnen versturen.
function quickQuestions(productName?: string): string[] {
  if (productName) {
    return [
      `Is "${productName}" nog beschikbaar?`,
      `Wat zijn de verzendkosten voor "${productName}"?`,
      "Kan ik het ophalen op de markt?",
    ]
  }
  return [
    "Zijn jullie dit weekend op de markt?",
    "Wat zijn de verzendkosten?",
    "Kan ik bestellen en ophalen?",
  ]
}

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
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justSent, setJustSent] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Laad de echte gespreksgeschiedenis wanneer de chat opent.
  useEffect(() => {
    if (!open || !isLoggedIn || !storeId) return
    let active = true
    setLoading(true)
    getStoreThread(storeId)
      .then((res) => {
        if (active) setMessages(res.messages)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, isLoggedIn, storeId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open, loading])

  const submit = async (raw: string) => {
    const text = raw.trim()
    if (!text || sending || !storeId) return
    setError(null)
    setJustSent(false)

    // Toon het bericht van de koper meteen (optimistisch).
    const tempId = Date.now()
    setMessages((m) => [...m, { id: tempId, mine: true, text }])
    setInput("")

    setSending(true)
    try {
      const { conversationId } = await startConversation(storeId)
      await sendMessage(conversationId, text)
      setJustSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Versturen mislukt.")
      // Rol de optimistische toevoeging terug bij fout.
      setMessages((m) => m.filter((msg) => msg.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  const questions = quickQuestions(productName)

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
          <div className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:h-[560px] sm:max-w-sm sm:rounded-2xl">
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
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Stel je vraag aan {sellerName}</p>
                    <p className="mt-1 text-sm text-muted-foreground text-pretty">
                      {productName
                        ? `Vraag naar beschikbaarheid, verzending of ophalen van "${productName}".`
                        : "Vraag naar producten, verzending of openingstijden."}
                    </p>
                  </div>
                  {isLoggedIn && (
                    <div className="flex w-full flex-col gap-2">
                      {questions.map((q) => (
                        <button
                          key={q}
                          onClick={() => submit(q)}
                          disabled={sending}
                          className="min-h-11 rounded-xl border border-border bg-background px-4 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-60"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                      <p
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
                          m.mine
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-secondary text-foreground",
                        )}
                      >
                        {m.text}
                      </p>
                    </div>
                  ))}
                  {justSent && (
                    <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                      Verstuurd.{" "}
                      <Link href="/berichten" className="font-medium text-primary hover:underline">
                        Bekijk in berichten
                      </Link>
                    </p>
                  )}
                  {error && <p className="text-center text-xs text-destructive">{error}</p>}
                </>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2 border-t border-border p-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                      e.preventDefault()
                      submit(input)
                    }
                  }}
                  placeholder="Typ een bericht…"
                  className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  onClick={() => submit(input)}
                  disabled={sending || !input.trim()}
                  aria-label="Verstuur"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
