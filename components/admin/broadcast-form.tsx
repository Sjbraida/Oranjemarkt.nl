"use client"

import { useState } from "react"
import { Megaphone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { adminBroadcastNotification } from "@/app/actions/admin"

export function BroadcastForm() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await adminBroadcastNotification({ title, body })
      setResult(`Melding verstuurd naar ${res.count} gebruiker(s).`)
      setTitle("")
      setBody("")
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Er ging iets mis")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
          <Megaphone className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">Platformmelding versturen</h3>
          <p className="text-xs text-muted-foreground">Stuur een melding naar alle gebruikers.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel (bijv. Onderhoud vanavond)"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Bericht (optioneel)"
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{result}</p>
          <Button type="submit" disabled={loading} className="gap-2 font-semibold">
            <Send className="h-4 w-4" />
            {loading ? "Versturen..." : "Versturen"}
          </Button>
        </div>
      </form>
    </div>
  )
}
