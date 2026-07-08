"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, X, Loader2, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { subscribeToPlan } from "@/app/actions/subscriptions"
import type { PlanKey } from "@/lib/plans"

export type PlanCard = {
  key: PlanKey
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlight: boolean
}

const STORE_TYPES = [
  { value: "kraam", label: "Kraam" },
  { value: "winkel", label: "Winkel" },
  { value: "bedrijf", label: "Bedrijf" },
] as const

const CATEGORIES = [
  "Eten & Drinken",
  "Kleding & Mode",
  "Sieraden",
  "Kunst & Ambacht",
  "Wonen & Interieur",
  "Boeken & Media",
  "Speelgoed",
  "Elektronica",
  "Algemeen",
]

export function SubscribePlans({
  plans,
  isLoggedIn,
  hasStore,
  currentPlan,
  defaults,
}: {
  plans: PlanCard[]
  isLoggedIn: boolean
  hasStore: boolean
  currentPlan: string | null
  defaults: { name: string; category: string; type: string; location: string; description: string }
}) {
  const router = useRouter()
  const [openPlan, setOpenPlan] = useState<PlanCard | null>(null)
  const [form, setForm] = useState(defaults)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function choose(plan: PlanCard) {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=/verkoop`)
      return
    }
    setError(null)
    setForm(defaults)
    setOpenPlan(plan)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!openPlan) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await subscribeToPlan({
        plan: openPlan.key,
        storeName: form.name,
        category: form.category,
        type: form.type,
        location: form.location,
        description: form.description,
      })
      router.push(`/dashboard?welkom=1`)
      router.refresh()
      void res
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis")
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.key
          return (
            <div
              key={plan.key}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6",
                plan.highlight ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-border",
              )}
            >
              {plan.highlight && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                  Meest gekozen
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success px-3 py-1 text-[11px] font-bold text-background">
                  Jouw huidige plan
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-end gap-1.5">
                <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                <span className="pb-1 text-xs text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-5 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => choose(plan)}
                variant={plan.highlight ? "default" : "outline"}
                disabled={isCurrent}
                className={cn(
                  "mt-6 w-full font-semibold",
                  !plan.highlight && "border-border bg-transparent hover:bg-sidebar-accent",
                )}
              >
                {isCurrent ? "Actief" : hasStore ? "Wissel naar dit plan" : plan.cta}
              </Button>
            </div>
          )
        })}
      </div>

      {openPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            aria-label="Sluiten"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !submitting && setOpenPlan(null)}
          />
          <form
            onSubmit={submit}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Store className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {hasStore ? "Wissel naar" : "Open je kraam:"} {openPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenPlan(null)}
                aria-label="Sluiten"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {openPlan.price} {openPlan.period}. Geen commissie over je verkopen.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Winkelnaam</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Bijv. De Kaasboer"
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Categorie</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Soort verkoper</label>
                <div className="grid grid-cols-3 gap-2">
                  {STORE_TYPES.map((t) => {
                    const active = form.type === t.value
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        aria-pressed={active}
                        className={
                          active
                            ? "rounded-lg border-2 border-primary bg-primary/10 px-2 py-2 text-sm font-semibold text-primary transition-colors"
                            : "rounded-lg border border-border bg-background px-2 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40"
                        }
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Locatie</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Bijv. Amsterdam"
                  className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Korte beschrijving</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Waar staat jouw kraam om bekend?"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={submitting} className="mt-5 h-12 w-full gap-2 font-semibold">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Bezig met activeren…
                </>
              ) : openPlan.price === "€0" ? (
                "Start gratis"
              ) : (
                `Activeer ${openPlan.name}`
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Betaling wordt later gekoppeld. Je winkel wordt direct aangemaakt.
            </p>
          </form>
        </div>
      )}

      {!isLoggedIn && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Al een account?{" "}
          <Link href="/sign-in?redirect=/verkoop" className="font-semibold text-primary">
            Log in
          </Link>{" "}
          om je kraam te openen.
        </p>
      )}
    </>
  )
}
