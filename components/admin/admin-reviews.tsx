"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Trash2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminDeleteReview } from "@/app/actions/admin"

export type AdminReview = {
  id: number
  rating: number
  text: string
  authorName: string
  storeName: string | null
  storeSlug: string | null
  createdAt: Date | string
}

export function AdminReviews({ reviews }: { reviews: AdminReview[] }) {
  const [rows, setRows] = useState(reviews)
  const [busy, setBusy] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Deze review verwijderen?")) return
    setBusy(id)
    try {
      await adminDeleteReview(id)
      setRows((r) => r.filter((rev) => rev.id !== id))
    } finally {
      setBusy(null)
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Geen reviews om te modereren.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-3.5 w-3.5", i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40")}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{r.authorName}</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {r.storeSlug ? (
                  <Link href={`/kraam/${r.storeSlug}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                    {r.storeName} <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <span>{r.storeName ?? "Onbekende kraam"}</span>
                )}
                · {new Date(r.createdAt).toLocaleDateString("nl-NL")}
              </p>
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              disabled={busy === r.id}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10"
              aria-label="Verwijder review"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
