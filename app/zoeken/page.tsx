import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { StoreCard } from "@/components/store-card"
import { searchProducts, searchStores, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Zoeken | Oranjemarkt" }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = (q ?? "").trim()

  const [products, matchedStores, user, favoriteIds] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    query ? searchStores(query) : Promise.resolve([]),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader
        title={query ? `Zoekresultaten voor "${query}"` : "Zoeken"}
        subtitle={query ? `${products.length} producten · ${matchedStores.length} kramen` : "Typ een zoekterm in de balk bovenaan."}
      />

      {matchedStores.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Kramen</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {matchedStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Producten</h2>
        <ProductsGrid
          products={products}
          favoriteIds={favoriteIds}
          isLoggedIn={!!user}
          emptyMessage={query ? "Geen producten gevonden voor deze zoekterm." : "Begin met zoeken hierboven."}
        />
      </section>
    </SiteShell>
  )
}
