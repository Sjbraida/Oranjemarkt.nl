import { SectionHeader } from "@/components/section-header"
import { ProductCard, type ProductCardData } from "@/components/product-card"

export function NewestProducts({
  products,
  favoriteIds,
  isLoggedIn,
}: {
  products: ProductCardData[]
  favoriteIds: number[]
  isLoggedIn: boolean
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Nieuwste producten" href="/aanbiedingen" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            favorited={favoriteIds.includes(product.id)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </section>
  )
}
