"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Trash2, ExternalLink, Star, StarOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { adminDeleteStore, adminSetStoreFeatured } from "@/app/actions/admin"
import type { Role } from "@/lib/admin"

export type AdminStore = {
  id: number
  slug: string
  name: string
  category: string
  location: string
  plan: string
  productCount: number
  rating: number
  ownerName: string | null
  ownerEmail: string | null
}

const PLAN_LABELS: Record<string, string> = {
  gratis: "Gratis",
  kraam: "Kraam",
  winkel: "Winkel",
  premium: "Premium",
}

export function AdminStores({ stores, role }: { stores: AdminStore[]; role: Role }) {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState<number | null>(null)
  const [featured, setFeatured] = useState<Record<number, boolean>>({})

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.ownerEmail ?? "").toLowerCase().includes(query.toLowerCase()) ||
      s.location.toLowerCase().includes(query.toLowerCase()),
  )

  const handleDelete = async (id: number) => {
    if (!confirm("Deze kraam en alle bijbehorende producten verwijderen?")) return
    setBusy(id)
    try {
      await adminDeleteStore(id)
    } finally {
      setBusy(null)
    }
  }

  const toggleFeatured = async (id: number, next: boolean) => {
    setFeatured((f) => ({ ...f, [id]: next }))
    await adminSetStoreFeatured(id, next)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op kraam, eigenaar of plaats"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {filtered.length === 0 ? (
          <p className="bg-card p-8 text-center text-sm text-muted-foreground">Geen kramen gevonden.</p>
        ) : (
          filtered.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "flex flex-wrap items-center gap-3 bg-card px-4 py-3",
                i !== filtered.length - 1 && "border-b border-border",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.ownerName ?? "Onbekend"} · {s.location}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {PLAN_LABELS[s.plan] ?? s.plan}
              </span>
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {s.rating.toFixed(1)}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">{s.productCount} prod.</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFeatured(s.id, !(featured[s.id] ?? false))}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  aria-label="Uitlichten"
                  title="Uitlichten op homepage"
                >
                  {featured[s.id] ? <Star className="h-4 w-4 fill-primary text-primary" /> : <StarOff className="h-4 w-4" />}
                </button>
                <Link
                  href={`/kraam/${s.slug}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  aria-label="Bekijk kraam"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                {role === "superadmin" && (
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={busy === s.id}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                    aria-label="Verwijder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {role !== "superadmin" && (
        <p className="text-xs text-muted-foreground">Alleen een superadmin kan kramen verwijderen.</p>
      )}
    </div>
  )
}
