import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { StoreCard } from "@/components/store-card"
import { getStoresByType, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Alle winkels | Oranjemarkt" }

export default async function WinkelsPage() {
  const [stores, user, favoriteIds] = await Promise.all([
    getStoresByType("winkel"),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader
        title="Winkels"
        subtitle={`${stores.length} ${stores.length === 1 ? "winkel" : "winkels"} op Oranjemarkt`}
      />
      {stores.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Er zijn nog geen winkels. Open zelf een winkel via de knop &ldquo;Verkoop&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}
    </SiteShell>
  )
}
