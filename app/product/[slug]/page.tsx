import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, ChevronRight, ShieldCheck, Truck, RotateCcw, BadgeCheck } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { FavoriteButton } from "@/components/favorite-button"
import { ChatDialog } from "@/components/chat-dialog"
import { ProductGallery } from "@/components/product-gallery"
import { ProductPurchase } from "@/components/product-purchase"
import { ProductsGrid } from "@/components/products-grid"
import { resolveHall, HallIcon } from "@/components/categories-section"
import { formatPrice } from "@/lib/format"
import {
  getProductBySlug,
  getCurrentUser,
  getFavoriteProductIds,
  isFavorited,
  getProductsByStore,
  getStoreReviews,
  getStoreRating,
} from "@/lib/queries"
import { db } from "@/lib/db"
import { stores } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const guarantees = [
  { icon: ShieldCheck, title: "Veilig betalen", desc: "Kopersbescherming inbegrepen" },
  { icon: Truck, title: "Snelle levering", desc: "Verzending binnen 1-2 dagen" },
  { icon: RotateCcw, title: "Retour mogelijk", desc: "14 dagen bedenktijd" },
]

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const storeRows = await db.select().from(stores).where(eq(stores.id, product.storeId)).limit(1)
  const store = storeRows[0] ?? null

  const [favorited, user, favoriteIds, related, dbReviews, ratingInfo] = await Promise.all([
    isFavorited(product.id),
    getCurrentUser(),
    getFavoriteProductIds(),
    getProductsByStore(product.storeId),
    getStoreReviews(product.storeId),
    getStoreRating(product.storeId),
  ])

  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 5)
  const reviews = dbReviews.slice(0, 4).map((r) => ({
    id: r.id,
    author: r.authorName,
    initials: r.authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }),
    text: r.text,
  }))
  const avgRating = ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : "–"
  const hall = resolveHall(product.category).hall

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/categorie/${encodeURIComponent(product.category)}`} className="hover:text-foreground">
          {hall ? `Hal ${hall} · ${product.category}` : product.category}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery image={product.image} name={product.name} discount={product.discount} />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/categorie/${encodeURIComponent(product.category)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <HallIcon className="h-3.5 w-3.5" />
              {hall ? `Hal ${hall} · ${product.category}` : product.category}
            </Link>
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">{avgRating}</span>
              <span className="text-muted-foreground">{`(${reviews.length})`}</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice ? (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
                <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-sm font-semibold text-destructive">
                  {`Bespaar ${formatPrice(product.oldPrice - product.price)}`}
                </span>
              </>
            ) : null}
          </div>

          {product.description ? (
            <p className="leading-relaxed text-muted-foreground text-pretty">{product.description}</p>
          ) : null}

          <ProductPurchase
            productId={product.id}
            storeId={product.storeId}
            price={product.price}
            productName={product.name}
            stock={product.stock ?? 0}
            isLoggedIn={!!user}
          />

          <div className="flex flex-wrap gap-3">
            <FavoriteButton
              productId={product.id}
              initialFavorited={favorited}
              isLoggedIn={!!user}
              variant="labeled"
              className="flex-1"
            />
            {store ? (
              <ChatDialog
                storeId={product.storeId}
                sellerName={store.name}
                productName={product.name}
                triggerClassName="flex-1"
                isLoggedIn={!!user}
              />
            ) : null}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-3">
            {guarantees.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-1.5 text-xs font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {store ? (
            <Link
              href={`/kramen/${store.slug}`}
              className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary px-1 text-center text-[8px] font-bold leading-tight text-primary">
                {store.logoText}
              </span>
              <div className="flex flex-col">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  {store.name}
                  {store.badge?.toUpperCase() === "PREMIUM" && <BadgeCheck className="h-4 w-4 text-primary" />}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  {store.rating} · {store.location}
                </span>
              </div>
              <span className="ml-auto text-sm font-medium text-primary">Bekijk winkel</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Beoordelingen van deze kraam</h2>
          {store && (
            <Link href={`/kramen/${store.slug}`} className="text-sm font-medium text-primary hover:underline">
              Alle reviews
            </Link>
          )}
        </div>
        {reviews.length === 0 && (
          <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Deze kraam heeft nog geen reviews.
          </p>
        )}
        <ul className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">
                  {r.initials}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Meer van deze kraam</h2>
          <ProductsGrid products={relatedProducts} favoriteIds={favoriteIds} isLoggedIn={!!user} />
        </section>
      ) : null}
    </SiteShell>
  )
}
