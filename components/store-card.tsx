import Link from "next/link"
import { Star, Crown } from "lucide-react"

export type StoreCardData = {
  id: number
  slug: string
  name: string
  category: string
  location: string
  rating: number
  reviews: number
  productCount: number
  followers: string
  badge: string | null
  logoText: string
  image: string
}

export function StoreCard({ store }: { store: StoreCardData }) {
  const isPremium = store.badge?.toUpperCase() === "PREMIUM"
  return (
    <Link
      href={`/kramen/${store.slug}`}
      className="block overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={store.image || "/placeholder.svg"} alt={store.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
        {store.badge && (
          <span
            className={
              isPremium
                ? "absolute left-3 top-3 flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-bold tracking-wide text-primary-foreground"
                : "absolute left-3 top-3 rounded-md bg-secondary px-2 py-1 text-[10px] font-bold text-primary"
            }
          >
            {isPremium && <Crown className="h-3 w-3" />}
            {store.badge}
          </span>
        )}
        <span className="absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center rounded-full bg-background/85 px-1 text-center text-[8px] font-bold leading-tight text-primary backdrop-blur">
          {store.logoText}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground">{store.name}</h3>
          <span className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-foreground">{store.rating}</span>
            <span className="text-xs text-muted-foreground">({store.reviews})</span>
          </span>
        </div>
        <p className="text-sm font-medium text-primary">{store.category}</p>
        <p className="text-xs text-muted-foreground">{store.location}</p>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{store.productCount} producten</span>
          <span>{store.followers} volgers</span>
        </div>
      </div>
    </Link>
  )
}
