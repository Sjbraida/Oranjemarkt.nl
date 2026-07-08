"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  Settings,
  TrendingUp,
  Users,
  Heart,
  Star,
  Euro,
  Check,
  Crown,
  ArrowUpRight,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { ProductManager, type ManagedProduct } from "@/components/product-manager"
import { StoreSettingsForm } from "@/components/store-settings-form"
import { UserAvatar } from "@/components/user-avatar"
import { type PlanCapabilities, formatMaxProducts } from "@/lib/plans"

type StoreInfo = {
  id: number
  name: string
  slug: string
  category: string
  type: string
  location: string
  rating: number
  followers: string
  logoText: string
  description: string | null
  plan: string
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  image: string
  bannerImage: string | null
}
type Order = { id: string; product: string; buyer: string; date: string; amount: number; status: string }
  type MessagePreview = { id: number; name: string; image: string | null; preview: string; time: string; unread: boolean }
type Stats = {
  revenue: number
  orderCount: number
  itemsSold: number
  followers: number
  favorites: number
  rating: number
  reviewCount: number
  publishedCount: number
  week: number[]
}

const SECTIONS = [
  { id: "overzicht", label: "Overzicht", icon: LayoutDashboard },
  { id: "producten", label: "Producten", icon: Package },
  { id: "bestellingen", label: "Bestellingen", icon: ShoppingBag },
  { id: "berichten", label: "Berichten", icon: MessageSquare },
  { id: "abonnement", label: "Abonnement", icon: CreditCard },
  { id: "instellingen", label: "Instellingen", icon: Settings },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

const PLAN_LABELS: Record<string, string> = {
  gratis: "Kraam huren (gratis)",
  kraam: "Kraam",
  winkel: "Winkel",
  premium: "Premium",
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase()
  const styles: Record<string, string> = {
    nieuw: "bg-primary/15 text-primary",
    betaald: "bg-primary/15 text-primary",
    verzonden: "bg-[var(--info,#3b82f6)]/15 text-[var(--info,#3b82f6)]",
    geleverd: "bg-[var(--success)]/15 text-[var(--success)]",
    geannuleerd: "bg-destructive/15 text-destructive",
  }
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", styles[key] ?? "bg-secondary text-muted-foreground")}>
      {status}
    </span>
  )
}

export function DashboardView({
  store,
  products,
  orders,
  messages,
  stats,
  subscription,
  plan,
  featuredUsed,
  initialSection = "overzicht",
}: {
  store: StoreInfo
  products: ManagedProduct[]
  orders: Order[]
  messages: MessagePreview[]
  stats: Stats
  subscription: { plan: string; price: number } | null
  plan: PlanCapabilities
  featuredUsed: number
  initialSection?: SectionId
}) {
  const [section, setSection] = useState<SectionId>(initialSection)
  const maxWeek = Math.max(...stats.week, 1)
  const days = ["M", "D", "W", "D", "V", "Z", "Z"]

  const statCards = [
    { icon: Euro, label: "Omzet (totaal)", value: formatPrice(stats.revenue) },
    { icon: ShoppingBag, label: "Bestellingen", value: `${stats.orderCount}` },
    { icon: Users, label: "Volgers", value: stats.followers.toLocaleString("nl-NL") },
    { icon: Heart, label: "Favorieten", value: stats.favorites.toLocaleString("nl-NL") },
  ]

  const currentPlan = subscription?.plan ?? store.plan

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              section === s.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <s.icon className="h-[18px] w-[18px]" />
            {s.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0">
        {section === "overzicht" && !plan.stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statCards.map((c) => (
                <div key={c.label} className="relative overflow-hidden rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <c.icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 select-none text-xl font-bold text-foreground blur-sm">€ ••••</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Lock className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">Verkoopstatistieken zijn een betaalde functie</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Upgrade naar een <span className="font-semibold text-foreground">Kraam</span>-abonnement of hoger om je
                omzet, bestellingen en bezoekersstatistieken live te volgen.
              </p>
              <Button onClick={() => setSection("abonnement")} className="mt-4 gap-2 font-semibold">
                Bekijk abonnementen
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {section === "overzicht" && plan.stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {statCards.map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {stats.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-3 text-xl font-bold text-foreground">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">Omzet deze week</h3>
                {stats.revenue === 0 ? (
                  <div className="mt-5 flex h-40 flex-col items-center justify-center gap-2 text-center">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Nog geen verkopen. Deel je kraam om te starten!</p>
                  </div>
                ) : (
                  <div className="mt-5 flex h-40 items-end justify-between gap-2">
                    {stats.week.map((v, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        <div
                          className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                          style={{ height: `${Math.max((v / maxWeek) * 100, v > 0 ? 6 : 0)}%` }}
                          title={formatPrice(v)}
                        />
                        <span className="text-xs text-muted-foreground">{days[i]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Recente bestellingen</h3>
                  {orders.length > 0 && (
                    <button onClick={() => setSection("bestellingen")} className="text-sm font-medium text-primary">
                      Alles
                    </button>
                  )}
                </div>
                {orders.length === 0 ? (
                  <p className="mt-6 text-sm text-muted-foreground">Nog geen bestellingen ontvangen.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {orders.slice(0, 4).map((o) => (
                      <li key={o.id} className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{o.product}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.buyer} · {o.date}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground">{formatPrice(o.amount)}</span>
                        <StatusBadge status={o.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {section === "producten" && (
          <ProductManager
            products={products}
            defaultCategory={store.category}
            plan={plan}
            featuredUsed={featuredUsed}
            onUpgrade={() => setSection("abonnement")}
          />
        )}

        {section === "bestellingen" && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Bestellingen</h2>
            {orders.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Je hebt nog geen bestellingen ontvangen.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                {orders.map((o, i) => (
                  <div
                    key={o.id + i}
                    className={cn("flex items-center gap-4 bg-card p-4", i !== orders.length - 1 && "border-b border-border")}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{o.product}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.id} · {o.buyer} · {o.date}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">{formatPrice(o.amount)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "berichten" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Berichten</h2>
              <Button render={<Link href="/berichten" />} variant="outline" className="gap-2 bg-transparent font-semibold">
                Open inbox
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {messages.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Nog geen berichten van kopers.</p>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-xl border border-border">
                {messages.map((m, i) => (
                  <li
                    key={m.id}
                    className={cn(
                      "flex items-center gap-3 bg-card p-4 transition-colors hover:bg-secondary/40",
                      i !== messages.length - 1 && "border-b border-border",
                    )}
                  >
                    <span className="relative">
                      <UserAvatar src={m.image} name={m.name} className="h-11 w-11" />
                      {m.unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate", m.unread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                        {m.name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{m.preview}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{m.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {section === "abonnement" && (
          <div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <Crown className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">
                <span className="font-semibold">Geen commissie.</span> Je houdt 100% van je verkoop. Betaal alleen een vast maandbedrag.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Jouw huidige abonnement</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{PLAN_LABELS[currentPlan] ?? currentPlan}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription && subscription.price > 0 ? `${formatPrice(subscription.price)} per maand` : "Gratis"}
                  </p>
                </div>
                <Button render={<Link href="/verkoop" />} className="gap-2 font-semibold">
                  Abonnement wijzigen
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {["Eigen winkelpagina", "Live chat met kopers", "Reviews & volgers", "Geen commissie"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {section === "instellingen" && (
          <StoreSettingsForm
            allowBanner={plan.banner}
            onUpgrade={() => setSection("abonnement")}
            store={{
              slug: store.slug,
              name: store.name,
              category: store.category,
              type: store.type,
              location: store.location,
              description: store.description,
              phone: store.phone,
              email: store.email,
              website: store.website,
              instagram: store.instagram,
              facebook: store.facebook,
              image: store.image,
              bannerImage: store.bannerImage,
            }}
          />
        )}
      </div>
    </div>
  )
}
