"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, CalendarDays, Loader2, Check, Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { UserAvatar } from "@/components/user-avatar"
import { updateProfile } from "@/app/actions/profile"

type ProfileCardProps = {
  name: string
  email: string
  image: string | null
  memberSince: string
}

export function ProfileCard({ name, email, image, memberSince }: ProfileCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name, image: image ?? "" })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await updateProfile({ name: form.name, image: form.image })
      setSaved(true)
      setEditing(false)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {editing ? (
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="max-w-[10rem]">
            <ImageUpload
              label="Profielfoto"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              aspect="1 / 1"
              hint="Vierkant"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Naam</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-11 w-full max-w-sm rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="gap-2 font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Opslaan
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm({ name, image: image ?? "" })
                setEditing(false)
                setError(null)
              }}
              className="gap-2 border-border bg-transparent font-semibold hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4" />
              Annuleren
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <UserAvatar src={image} name={name} className="h-20 w-20" />
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">{name}</h2>
              <p className="text-sm text-muted-foreground">Lid van de digitale bazaar</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-4">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">E-mailadres</p>
                <p className="text-sm font-medium text-foreground">{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Lid sinds</p>
                <p className="text-sm font-medium capitalize text-foreground">{memberSince}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={() => setEditing(true)} className="gap-2 font-semibold">
              <Camera className="h-4 w-4" />
              Profiel bewerken
            </Button>
            {saved && <span className="ml-3 text-sm font-medium text-primary">Opgeslagen</span>}
          </div>
        </>
      )}
    </div>
  )
}
