import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { getProductsByCategory, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const category = decodeURIComponent(name)

  const [products, user, favoriteIds] = await Promise.all([
    getProductsByCategory(category),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title={category} subtitle={`${products.length} producten in deze categorie`} />
      <ProductsGrid
        products={products}
        favoriteIds={favoriteIds}
        isLoggedIn={!!user}
        emptyMessage="Nog geen producten in deze categorie."
      />
    </SiteShell>
  )
}
