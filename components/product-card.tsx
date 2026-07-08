import Link from "next/link"
import { Star } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { FavoriteButton } from "@/components/favorite-button"

export type ProductCardData = {
  id: number
  slug: string
  name: string
  price: number
  oldPrice: number | null
  discount: number | null
  image: string
  featured?: boolean
}

export function ProductCard({
  product,
  favorited,
  isLoggedIn,
}: {
  product: ProductCardData
  favorited: boolean
  isLoggedIn: boolean
}) {
  return (
    <article
      className={
        product.featured
          ? "group relative overflow-hidden rounded-xl border border-primary/50 bg-card ring-1 ring-primary/30 transition-colors hover:border-primary"
          : "group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
      }
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {product.discount ? (
            <span className="absolute left-2 top-2 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
              {`-${product.discount}%`}
            </span>
          ) : null}
          {product.featured ? (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              <Star className="h-2.5 w-2.5 fill-current" />
              Uitgelicht
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-3">
          <h3 className="truncate text-sm font-medium text-foreground">{product.name}</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            ) : null}
          </div>
        </div>
      </Link>
      <FavoriteButton
        productId={product.id}
        initialFavorited={favorited}
        isLoggedIn={isLoggedIn}
        className="absolute right-2 top-2"
      />
    </article>
  )
}
