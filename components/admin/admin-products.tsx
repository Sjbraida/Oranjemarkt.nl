"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Pencil, Trash2, ExternalLink, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { adminUpdateProduct, adminDeleteProduct } from "@/app/actions/admin"

export type AdminProduct = {
  id: number
  slug: string
  name: string
  price: number
  image: string
  category: string
  stock: number
  status: string
  storeName: string | null
  storeSlug: string | null
}

export function AdminProducts({ products }: { products: AdminProduct[] }) {
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.storeName ?? "").toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()),
  )

  const handleDelete = async (id: number) => {
    if (!confirm("Dit product definitief verwijderen?")) return
    setBusy(id)
    try {
      await adminDeleteProduct(id)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op product, kraam of categorie"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden grid-cols-[1fr_140px_90px_80px_110px] gap-3 border-b border-border bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-muted-foreground md:grid">
          <span>Product</span>
          <span>Kraam</span>
          <span>Prijs</span>
          <span>Voorraad</span>
          <span className="text-right">Acties</span>
        </div>
        {filtered.length === 0 ? (
          <p className="bg-card p-8 text-center text-sm text-muted-foreground">Geen producten gevonden.</p>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "grid grid-cols-1 gap-3 bg-card px-4 py-3 md:grid-cols-[1fr_140px_90px_80px_110px] md:items-center",
                i !== filtered.length - 1 && "border-b border-border",
              )}
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image || "/placeholder.svg"} alt="" className="h-10 w-10 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      p.status === "published" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {p.status === "published" ? "Gepubliceerd" : "Concept"} · {p.category}
                  </span>
                </div>
              </div>
              <span className="truncate text-sm text-muted-foreground">{p.storeName ?? "—"}</span>
              <span className="text-sm font-semibold text-foreground">{formatPrice(p.price)}</span>
              <span className="text-sm text-muted-foreground">{p.stock}</span>
              <div className="flex items-center gap-1 md:justify-end">
                {p.storeSlug && (
                  <Link
                    href={`/product/${p.slug}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                    aria-label="Bekijk product"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                <button
                  onClick={() => setEditing(p)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  aria-label="Bewerk"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={busy === p.id}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10"
                  aria-label="Verwijder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && <EditModal product={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function EditModal({ product, onClose }: { product: AdminProduct; onClose: () => void }) {
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(String(product.price))
  const [stock, setStock] = useState(String(product.stock))
  const [status, setStatus] = useState(product.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminUpdateProduct({
        id: product.id,
        name,
        price: Number.parseFloat(price) || product.price,
        stock: Number.parseInt(stock) || 0,
        status,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button className="absolute inset-0 bg-foreground/50" aria-label="Sluiten" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Product bewerken</h3>
          <button onClick={onClose} aria-label="Sluiten" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Naam</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Prijs (€)</label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Voorraad</label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="published">Gepubliceerd</option>
              <option value="draft">Concept</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="bg-transparent font-semibold">
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 font-semibold">
            <Check className="h-4 w-4" />
            {saving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </div>
    </div>
  )
}
