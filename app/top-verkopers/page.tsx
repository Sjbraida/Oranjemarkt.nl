import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { StoreCard } from "@/components/store-card"
import { getTopRatedStores, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Top verkopers | OranjeMarkt" }

export default async function TopVerkopersPage() {
  const [topStores, user, favoriteIds] = await Promise.all([
    getTopRatedStores(12),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Top verkopers" subtitle="De best beoordeelde kramen van OranjeMarkt" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topStores.map((store, i) => (
          <div key={store.id} className="relative">
            <span
              className={
                i < 3
                  ? "absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-sm font-bold text-gold-foreground shadow-lg"
                  : "absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-card text-sm font-bold text-muted-foreground shadow-lg ring-1 ring-border"
              }
            >
              {i + 1}
            </span>
            <StoreCard store={store} />
          </div>
        ))}
      </div>
    </SiteShell>
  )
}
