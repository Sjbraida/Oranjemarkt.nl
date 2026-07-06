import { ProductCard, type ProductCardData } from "@/components/product-card"

export function ProductsGrid({
  products,
  favoriteIds,
  isLoggedIn,
  emptyMessage = "Geen producten gevonden.",
}: {
  products: ProductCardData[]
  favoriteIds: number[]
  isLoggedIn: boolean
  emptyMessage?: string
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          favorited={favoriteIds.includes(product.id)}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </div>
  )
}
