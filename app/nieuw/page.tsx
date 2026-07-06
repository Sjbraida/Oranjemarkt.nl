import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { getNewestProducts, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Nieuwe producten | OranjeMarkt" }

export default async function NieuwPage() {
  const [productsList, user, favoriteIds] = await Promise.all([
    getNewestProducts(30),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Nieuwe producten" subtitle="Vers binnengekomen in de bazaar" />
      <ProductsGrid products={productsList} favoriteIds={favoriteIds} isLoggedIn={!!user} />
    </SiteShell>
  )
}
