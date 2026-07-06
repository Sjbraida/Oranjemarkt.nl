import Link from "next/link"
import { Users, Store, Package, ShoppingBag, Euro, LifeBuoy, TrendingUp, ArrowRight } from "lucide-react"
import { getAdminStats, getAdminRevenueSeries } from "@/lib/admin-queries"
import { formatPrice } from "@/lib/format"
import { BroadcastForm } from "@/components/admin/broadcast-form"

export default async function AdminDashboardPage() {
  const [stats, series] = await Promise.all([getAdminStats(), getAdminRevenueSeries()])

  const cards = [
    { icon: Euro, label: "Totale omzet", value: formatPrice(stats.revenue) },
    { icon: ShoppingBag, label: "Bestellingen", value: stats.orders.toLocaleString("nl-NL") },
    { icon: Users, label: "Gebruikers", value: stats.users.toLocaleString("nl-NL") },
    { icon: Store, label: "Kramen", value: stats.stores.toLocaleString("nl-NL") },
    { icon: Package, label: "Producten", value: stats.products.toLocaleString("nl-NL") },
    { icon: LifeBuoy, label: "Open tickets", value: stats.openTickets.toLocaleString("nl-NL") },
  ]

  const maxRev = Math.max(...series.map((s) => s.revenue), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platformbreed overzicht van Oranjemarkt.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
              <c.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-lg font-bold text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">Omzet (laatste 14 dagen)</h3>
          {series.length === 0 ? (
            <div className="mt-5 flex h-44 flex-col items-center justify-center gap-2 text-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nog geen omzet in deze periode.</p>
            </div>
          ) : (
            <div className="mt-5 flex h-44 items-end justify-between gap-1">
              {series.map((s) => (
                <div key={s.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                    style={{ height: `${Math.max((s.revenue / maxRev) * 100, s.revenue > 0 ? 6 : 0)}%` }}
                    title={`${s.day}: ${formatPrice(s.revenue)}`}
                  />
                  <span className="text-[9px] text-muted-foreground">{s.day.slice(8)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <BroadcastForm />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/producten", label: "Producten beheren", icon: Package },
          { href: "/admin/kramen", label: "Kramen beheren", icon: Store },
          { href: "/admin/verkoop", label: "Verkoop bekijken", icon: Euro },
          { href: "/admin/support", label: "Support-chat", icon: LifeBuoy },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-foreground">
              <q.icon className="h-5 w-5 text-primary" />
              {q.label}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}
