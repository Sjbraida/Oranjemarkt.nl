"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createSupportTicket } from "@/app/actions/support"

const CATEGORIES = ["algemeen", "bestelling", "betaling", "account", "kraam", "klacht"]

export function NewTicketForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("algemeen")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await createSupportTicket({ subject, category, body })
      router.push(`/support/${res.ticketId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis")
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2 font-semibold">
        <Plus className="h-4 w-4" />
        Nieuw ticket
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Nieuw support-ticket</h3>
        <button onClick={() => setOpen(false)} aria-label="Sluiten" className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Onderwerp</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Waar gaat het over?" required className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Categorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Bericht</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Beschrijf je vraag of probleem..."
            rows={4}
            required
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent font-semibold">
            Annuleren
          </Button>
          <Button type="submit" disabled={loading} className="font-semibold">
            {loading ? "Versturen..." : "Ticket aanmaken"}
          </Button>
        </div>
      </form>
    </div>
  )
}
