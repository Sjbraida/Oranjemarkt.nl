import Link from "next/link"
import { redirect } from "next/navigation"
import { Package, MapPin, CreditCard } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { getCurrentUser, getFavoriteProductIds, getMyOrders } from "@/lib/queries"

export const metadata = { title: "Mijn bestellingen | OranjeMarkt" }

const STATUS_STYLES: Record<string, string> = {
  betaald: "bg-[var(--success)]/15 text-[var(--success)]",
  verzonden: "bg-primary/15 text-primary",
  geleverd: "bg-primary/15 text-primary",
  nieuw: "bg-secondary text-foreground",
  geannuleerd: "bg-destructive/10 text-destructive",
}

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in?redirect=/bestellingen")

  const [favoriteIds, orders] = await Promise.all([getFavoriteProductIds(), getMyOrders()])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader
        title="Mijn bestellingen"
        subtitle={orders.length > 0 ? `${orders.length} ${orders.length === 1 ? "bestelling" : "bestellingen"}` : "Je hebt nog niets besteld"}
      />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-12 text-center">
          <Package className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Je hebt nog geen bestellingen geplaatst.</p>
          <Button render={<Link href="/" />}>Ontdek producten</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="font-bold text-foreground">Bestelling #{o.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    STATUS_STYLES[o.status] ?? "bg-secondary text-foreground"
                  }`}
                >
                  {o.status}
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-3">
                {o.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image || "/placeholder.svg"}
                      alt={it.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{it.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {it.quantity} × {formatPrice(it.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-foreground">{formatPrice(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    {o.shippingName}
                    <br />
                    {o.shippingAddress}, {o.shippingPostal} {o.shippingCity}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:items-end">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="h-4 w-4 text-primary" />
                    {o.paymentMethod === "ideal" ? "iDEAL" : o.paymentMethod === "applepay" ? "Apple Pay" : "Creditcard"}
                  </span>
                  <span className="text-muted-foreground">
                    Verzending: {o.shipping === 0 ? "Gratis" : formatPrice(o.shipping)}
                  </span>
                  <span className="text-base font-bold text-primary">Totaal: {formatPrice(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SiteShell>
  )
}
