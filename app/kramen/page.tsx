import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { StoreCard } from "@/components/store-card"
import { getAllStores, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Alle kramen | Oranjemarkt" }

export default async function KramenPage() {
  const [stores, user, favoriteIds] = await Promise.all([
    getAllStores(),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Alle kramen" subtitle={`${stores.length} kramen op Oranjemarkt`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </SiteShell>
  )
}
