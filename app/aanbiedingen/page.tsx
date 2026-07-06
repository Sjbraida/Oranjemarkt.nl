import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { getDealProducts, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Aanbiedingen | Oranjemarkt" }

export default async function AanbiedingenPage() {
  const [products, user, favoriteIds] = await Promise.all([
    getDealProducts(),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Aanbiedingen" subtitle="De beste deals van Oranjemarkt" />
      <ProductsGrid
        products={products}
        favoriteIds={favoriteIds}
        isLoggedIn={!!user}
        emptyMessage="Er zijn op dit moment geen aanbiedingen."
      />
    </SiteShell>
  )
}
