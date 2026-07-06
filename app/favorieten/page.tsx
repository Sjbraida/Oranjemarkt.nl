import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { ProductsGrid } from "@/components/products-grid"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getFavoriteProducts, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Favorieten | Oranjemarkt" }

export default async function FavoritesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const [products, favoriteIds] = await Promise.all([getFavoriteProducts(), getFavoriteProductIds()])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Mijn favorieten" subtitle={`${products.length} bewaarde producten`} />
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-12 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Je hebt nog geen favorieten bewaard.</p>
          <Button render={<Link href="/" />}>Ontdek producten</Button>
        </div>
      ) : (
        <ProductsGrid products={products} favoriteIds={favoriteIds} isLoggedIn />
      )}
    </SiteShell>
  )
}
