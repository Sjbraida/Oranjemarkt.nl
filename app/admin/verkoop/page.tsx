import { getAllOrdersAdmin, getActiveSubscriptionsAdmin, getAdminStats } from "@/lib/admin-queries"
import { formatPrice } from "@/lib/format"
import { AdminOrders } from "@/components/admin/admin-orders"
import { Euro, ShoppingBag, CreditCard } from "lucide-react"

export const metadata = { title: "Verkoop | Admin" }

export default async function AdminSalesPage() {
  const [orders, subs, stats] = await Promise.all([
    getAllOrdersAdmin(),
    getActiveSubscriptionsAdmin(),
    getAdminStats(),
  ])

  const mrr = subs.reduce((sum, s) => sum + s.price, 0)

  const cards = [
    { icon: Euro, label: "Totale omzet", value: formatPrice(stats.revenue) },
    { icon: ShoppingBag, label: "Bestellingen", value: stats.orders.toLocaleString("nl-NL") },
    { icon: CreditCard, label: "Abonnementen (MRR)", value: formatPrice(mrr) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verkoop</h1>
        <p className="text-sm text-muted-foreground">Bestellingen en abonnementsinkomsten.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Bestellingen</h2>
        <AdminOrders orders={orders} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Actieve abonnementen</h2>
        {subs.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nog geen actieve abonnementen.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            {subs.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 bg-card px-4 py-3 ${i !== subs.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{s.storeName ?? "Onbekende kraam"}</p>
                  <p className="text-xs capitalize text-muted-foreground">{s.plan}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatPrice(s.price)}/mnd</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
