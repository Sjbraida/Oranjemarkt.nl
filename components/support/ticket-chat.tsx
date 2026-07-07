"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  sendSupportMessage,
  updateTicketStatus,
  deleteSupportMessage,
  deleteSupportTicket,
} from "@/app/actions/support"

export type TicketMessage = {
  id: number
  senderId: string
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
  currentUserId,
}: {
  ticketId: number
  initialMessages: TicketMessage[]
  side: "user" | "admin"
  status: string
  currentUserId: string
}) {
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(status)
  const [deletingTicket, setDeletingTicket] = useState(false)
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
      senderId: currentUserId,
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

  const canDeleteMessage = (m: TicketMessage) =>
    side === "admin" || (m.senderRole === "user" && m.senderId === currentUserId)

  const handleDeleteMessage = async (m: TicketMessage) => {
    if (!confirm("Dit bericht verwijderen?")) return
    const prev = messages
    setMessages((list) => list.filter((x) => x.id !== m.id))
    try {
      await deleteSupportMessage({ messageId: m.id, asAdmin: side === "admin" })
    } catch (err) {
      setMessages(prev)
      alert(err instanceof Error ? err.message : "Verwijderen mislukt")
    }
  }

  const handleDeleteTicket = async () => {
    if (!confirm("Dit hele ticket en alle berichten verwijderen?")) return
    setDeletingTicket(true)
    try {
      await deleteSupportTicket({ ticketId, asAdmin: side === "admin" })
      router.push(side === "admin" ? "/admin/support" : "/support")
      router.refresh()
    } catch (err) {
      setDeletingTicket(false)
      alert(err instanceof Error ? err.message : "Verwijderen mislukt")
    }
  }

  const isClosed = currentStatus === "gesloten"

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        {side === "admin" ? (
          <>
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <div className="flex items-center gap-2">
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
              <button
                onClick={handleDeleteTicket}
                disabled={deletingTicket}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Ticket verwijderen
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs font-medium text-muted-foreground">
              {STATUS_LABELS[currentStatus] ?? currentStatus}
            </span>
            <button
              onClick={handleDeleteTicket}
              disabled={deletingTicket}
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Ticket verwijderen
            </button>
          </>
        )}
      </div>

      <div className="flex max-h-[52vh] min-h-64 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderRole === side
          return (
            <div key={m.id} className={cn("group flex items-end gap-1.5", mine ? "justify-end" : "justify-start")}>
              {mine && canDeleteMessage(m) && (
                <button
                  onClick={() => handleDeleteMessage(m)}
                  aria-label="Bericht verwijderen"
                  title="Bericht verwijderen"
                  className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
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
              {!mine && canDeleteMessage(m) && (
                <button
                  onClick={() => handleDeleteMessage(m)}
                  aria-label="Bericht verwijderen"
                  title="Bericht verwijderen"
                  className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
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
