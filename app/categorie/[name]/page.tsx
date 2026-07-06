import { Landmark } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { ProductsGrid } from "@/components/products-grid"
import { getCategory } from "@/components/categories-section"
import { getProductsByCategory, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const category = decodeURIComponent(name)
  const meta = getCategory(category)
  const Icon = meta?.icon ?? Landmark

  const [products, user, favoriteIds] = await Promise.all([
    getProductsByCategory(category),
    getCurrentUser(),
    getFavoriteProductIds(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      {/* Hal-koptekst */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-card to-secondary p-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-8 w-8" />
        </span>
        <div className="flex flex-col gap-1">
          {meta ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
              <Landmark className="h-3 w-3" />
              Hal {meta.hall}
            </span>
          ) : null}
          <h1 className="text-2xl font-bold text-foreground text-balance">{category}</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            {products.length} {products.length === 1 ? "product" : "producten"} in deze hal
          </p>
        </div>
      </div>
      <ProductsGrid
        products={products}
        favoriteIds={favoriteIds}
        isLoggedIn={!!user}
        emptyMessage="Nog geen producten in deze hal."
      />
    </SiteShell>
  )
}
