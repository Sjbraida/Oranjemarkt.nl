"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { updateStoreSettings } from "@/app/actions/store"

export type StoreSettings = {
  slug: string
  name: string
  category: string
  location: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  image: string
  bannerImage: string | null
}

export function StoreSettingsForm({ store }: { store: StoreSettings }) {
  const [form, setForm] = useState({
    name: store.name,
    category: store.category,
    location: store.location,
    description: store.description ?? "",
    phone: store.phone ?? "",
    email: store.email ?? "",
    website: store.website ?? "",
    instagram: store.instagram ?? "",
    facebook: store.facebook ?? "",
    image: store.image ?? "",
    bannerImage: store.bannerImage ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await updateStoreSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-xl">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Winkelinstellingen</h2>
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <ImageUpload
          label="Bannerafbeelding"
          value={form.bannerImage}
          onChange={(url) => setForm({ ...form, bannerImage: url })}
          aspect="3 / 1"
          hint="Aanbevolen: breedbeeld (3:1), bijv. 1500×500px. Wordt netjes bijgesneden in het kader."
        />
        <div className="max-w-[10rem]">
          <ImageUpload
            label="Logo / winkelfoto"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            aspect="1 / 1"
            hint="Vierkant"
          />
        </div>
        <Field label="Winkelnaam" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Categorie" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
        <Field label="Locatie" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Beschrijving</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefoon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          <Field label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} />
          <Field label="Facebook" value={form.facebook} onChange={(v) => setForm({ ...form, facebook: v })} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Link href={`/kramen/${store.slug}`} className="flex items-center gap-1 text-sm font-medium text-primary">
            Bekijk publieke pagina
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Button type="submit" disabled={saving} className="gap-2 font-semibold">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {saved ? "Opgeslagen" : "Opslaan"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
      />
    </div>
  )
}
