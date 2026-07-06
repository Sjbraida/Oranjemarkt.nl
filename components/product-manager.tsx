"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, Plus, X, Loader2, Copy, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import { categories } from "@/components/categories-section"
import {
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  setProductStatus,
  type ProductInput,
} from "@/app/actions/products"

export type ManagedProduct = {
  id: number
  slug: string
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  description: string
  stock: number
  status: "draft" | "published"
}

// Gebruik dezelfde "hallen" als de rest van de bazaar zodat elk product een hal krijgt.
// De waarde is de kale label (zoals opgeslagen), de weergave toont het halnummer.
const CATEGORY_OPTIONS = categories.map((c) => ({ value: c.label, label: `Hal ${c.hall} – ${c.label}` }))

const EMPTY: ProductInput = {
  name: "",
  price: 0,
  oldPrice: null,
  category: "Overig",
  description: "",
  image: "",
  stock: 1,
  status: "published",
}

export function ProductManager({
  products,
  defaultCategory,
}: {
  products: ManagedProduct[]
  defaultCategory: string
}) {
  const [editing, setEditing] = useState<ManagedProduct | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  function openNew() {
    setEditing(null)
    setCreating(true)
  }

  function runAction(id: number, fn: () => Promise<unknown>) {
    setPendingId(id)
    startTransition(async () => {
      try {
        await fn()
      } finally {
        setPendingId(null)
      }
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{`Producten (${products.length})`}</h2>
        <Button onClick={openNew} className="gap-2 font-semibold">
          <Plus className="h-4 w-4" />
          Nieuw product
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {products.map((p, i) => (
          <div
            key={p.id}
            className={cn("flex items-center gap-4 bg-card p-3", i !== products.length - 1 && "border-b border-border")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image || "/placeholder.svg"} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-foreground">{p.name}</p>
                {p.status === "draft" && (
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    Concept
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {p.category} · voorraad {p.stock}
              </p>
            </div>
            <span className="font-semibold text-primary">{formatPrice(p.price)}</span>
            <div className="flex gap-1">
              <Link
                href={`/product/${p.slug}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
                aria-label="Bekijk"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <button
                onClick={() => {
                  setCreating(false)
                  setEditing(p)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
                aria-label="Bewerk"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => runAction(p.id, () => setProductStatus(p.id, p.status === "published" ? "draft" : "published"))}
                disabled={isPending && pendingId === p.id}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
                aria-label={p.status === "published" ? "Depubliceren" : "Publiceren"}
              >
                {p.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => runAction(p.id, () => duplicateProduct(p.id))}
                disabled={isPending && pendingId === p.id}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
                aria-label="Dupliceer"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`"${p.name}" verwijderen?`)) runAction(p.id, () => deleteProduct(p.id))
                }}
                disabled={isPending && pendingId === p.id}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Verwijder"
              >
                {isPending && pendingId === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">Nog geen producten. Voeg je eerste product toe.</p>
            <Button onClick={openNew} className="mt-4 gap-2 font-semibold">
              <Plus className="h-4 w-4" />
              Nieuw product
            </Button>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <ProductDialog
          product={editing}
          defaultCategory={defaultCategory}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function ProductDialog({
  product,
  defaultCategory,
  onClose,
}: {
  product: ManagedProduct | null
  defaultCategory: string
  onClose: () => void
}) {
  const [form, setForm] = useState<ProductInput>(
    product
      ? {
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          category: product.category,
          description: product.description,
          image: product.image,
          stock: product.stock,
          status: product.status,
        }
      : { ...EMPTY, category: defaultCategory || "Overig" },
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (product) await updateProduct(product.id, form)
      else await createProduct(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis")
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button aria-label="Sluiten" className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <form onSubmit={submit} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{product ? "Product bewerken" : "Nieuw product"}</h3>
          <button type="button" onClick={onClose} aria-label="Sluiten" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Productnaam" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="Bijv. Handgemaakte kaars" />
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Prijs (€)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
            <NumField label="Oude prijs (€)" value={form.oldPrice ?? 0} onChange={(v) => setForm({ ...form, oldPrice: v || null })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Categorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <NumField label="Voorraad" value={form.stock ?? 1} onChange={(v) => setForm({ ...form, stock: v })} />
          </div>
          <Field
            label="Afbeelding-URL"
            value={form.image ?? ""}
            onChange={(v) => setForm({ ...form, image: v })}
            placeholder="/mijn-product.jpg of https://…"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Beschrijving</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Beschrijf je product…"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
            >
              <option value="published">Gepubliceerd</option>
              <option value="draft">Concept</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent font-semibold">
            Annuleren
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1 gap-2 font-semibold">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? "Opslaan" : "Toevoegen"}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
      />
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
        required={required}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
      />
    </div>
  )
}
