"use client"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sendSupportMessage, updateTicketStatus } from "@/app/actions/support"

export type TicketMessage = {
  id: number
  senderRole: string
  body: string
  createdAt: Date | string
}

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_behandeling: "In behandeling",
  gesloten: "Gesloten",
}

export function TicketChat({
  ticketId,
  initialMessages,
  side,
  status,
}: {
  ticketId: number
  initialMessages: TicketMessage[]
  side: "user" | "admin"
  status: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    // Optimistisch tonen.
    const optimistic: TicketMessage = {
      id: Date.now(),
      senderRole: side,
      body: text,
      createdAt: new Date(),
    }
    setMessages((m) => [...m, optimistic])
    setBody("")
    try {
      await sendSupportMessage({ ticketId, body: text, asAdmin: side === "admin" })
    } finally {
      setSending(false)
    }
  }

  const changeStatus = async (next: string) => {
    setCurrentStatus(next)
    await updateTicketStatus(ticketId, next)
  }

  const isClosed = currentStatus === "gesloten"

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      {side === "admin" && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <select
            value={currentStatus}
            onChange={(e) => changeStatus(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex max-h-[52vh] min-h-64 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderRole === side
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                  mine
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-foreground",
                )}
              >
                {side === "user" && m.senderRole === "admin" && (
                  <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    Oranjemarkt support
                  </span>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <span className={cn("mt-1 block text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {new Date(m.createdAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {isClosed ? (
        <p className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
          Dit ticket is gesloten.{side === "user" && " Maak een nieuw ticket aan als je verdere hulp nodig hebt."}
        </p>
      ) : (
        <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                handleSend(e)
              }
            }}
            placeholder="Typ een bericht..."
            rows={1}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" disabled={sending || !body.trim()} className="h-11 shrink-0 gap-2 font-semibold">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Versturen</span>
          </Button>
        </form>
      )}
    </div>
  )
}
