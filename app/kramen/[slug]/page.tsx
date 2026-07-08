import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, MapPin, Package, Users, ShoppingBag, Clock, BadgeCheck, Sparkles, ImageIcon } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { StoreTabs } from "@/components/store-tabs"
import { FollowButton } from "@/components/follow-button"
import { ChatDialog } from "@/components/chat-dialog"
import { ShareButton } from "@/components/share-button"
import { getStoreMeta } from "@/lib/store-extras"
import { getPlan } from "@/lib/plans"
import {
  getStoreBySlug,
  getProductsByStore,
  getCurrentUser,
  getFavoriteProductIds,
  getStoreReviews,
  getStoreRating,
  getMyReviewForStore,
  isFollowing,
  getFollowerCount,
  getPublicUser,
} from "@/lib/queries"

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = await getStoreBySlug(slug)
  if (!store) notFound()

  const [storeProducts, user, favoriteIds, dbReviews, ratingInfo, myReview, following, followerCount, seller] =
    await Promise.all([
      getProductsByStore(store.id),
      getCurrentUser(),
      getFavoriteProductIds(),
      getStoreReviews(store.id),
      getStoreRating(store.id),
      getMyReviewForStore(store.id),
      isFollowing(store.id),
      getFollowerCount(store.id),
      getPublicUser(store.ownerId),
    ])

  const plan = getPlan(store.plan)
  const isOwner = !!user && user.id === store.ownerId
  // Een eigen banner is een betaalde functie. Zonder pakket blijft de banner echt leeg.
  const hasBanner = plan.banner && !!store.bannerImage

  const reviews = dbReviews.map((r) => ({
    id: r.id,
    author: r.authorName,
    authorImage: r.authorImage,
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }),
    text: r.text,
  }))
  const meta = getStoreMeta(store.id, ratingInfo.count)
  const isPremium = store.badge?.toUpperCase() === "PREMIUM"
  // A buyer who is not the store owner may leave a review.
  const canReview = !!user && user.id !== store.ownerId

  const stats = [
    { icon: Star, label: "Beoordeling", value: ratingInfo.count > 0 ? ratingInfo.average.toFixed(1) : "–" },
    { icon: ShoppingBag, label: "Verkopen", value: `${meta.sales}` },
    { icon: Package, label: "Producten", value: `${store.productCount}` },
    { icon: Users, label: "Volgers", value: String(followerCount) },
    { icon: Clock, label: "Reactietijd", value: meta.responseTime },
  ]

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative aspect-[3/1] max-h-64 w-full">
          {hasBanner ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.bannerImage || "/placeholder.svg"}
                alt={`Banner van ${store.name}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            </>
          ) : (
            // Geen pakket / geen banner: echt lege banner. De eigenaar ziet een oproep om te abonneren.
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary/60 text-center">
              {isOwner ? (
                <>
                  <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
                  <p className="text-sm font-medium text-muted-foreground">Nog geen winkelbanner</p>
                  <Link
                    href="/verkoop"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    Abonneer voor een eigen banner
                  </Link>
                </>
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground/50" aria-hidden />
              )}
            </div>
          )}
          {store.badge && (
            <span
              className={
                isPremium
                  ? "absolute left-4 top-4 flex items-center gap-1 rounded-md bg-background/85 px-2.5 py-1 text-xs font-bold text-primary backdrop-blur"
                  : "absolute left-4 top-4 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground"
              }
            >
              {isPremium && <BadgeCheck className="h-3.5 w-3.5" />}
              {store.badge}
            </span>
          )}
        </div>

        <div className="relative px-5 pb-5">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background px-1 text-center text-[10px] font-bold leading-tight text-primary shadow-lg">
                {seller?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seller.image || "/placeholder.svg"} alt={`Profielfoto van ${seller.name}`} className="h-full w-full object-cover" />
                ) : store.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.image || "/placeholder.svg"} alt={`Logo van ${store.name}`} className="h-full w-full object-cover" />
                ) : (
                  store.logoText
                )}
              </span>
              <div className="mb-1">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  {store.name}
                  {isPremium && <BadgeCheck className="h-5 w-5 text-primary" />}
                </h1>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-primary">{store.category}</span>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {store.location}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FollowButton storeId={store.id} initialFollowing={following} isLoggedIn={!!user} />
              <ChatDialog
              storeId={store.id}
              sellerName={store.name}
              sellerImage={seller?.image ?? store.image}
              triggerLabel="Chat"
              isLoggedIn={!!user}
            />
              <ShareButton
                title={store.name}
                text={`Bekijk ${store.name} op Oranjemarkt`}
                url={`/kramen/${store.slug}`}
                label="Deel winkel"
              />
            </div>
          </div>

          {store.description ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">{store.description}</p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-background/40 p-3 text-center">
                <Icon className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1.5 text-lg font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StoreTabs
        storeId={store.id}
        products={storeProducts}
        favoriteIds={favoriteIds}
        isLoggedIn={!!user}
        reviews={reviews}
        rating={ratingInfo.average}
        reviewCount={ratingInfo.count}
        canReview={canReview}
        myReview={myReview ? { rating: myReview.rating, text: myReview.text } : null}
        description={store.description}
        location={store.location}
        meta={meta}
      />
    </SiteShell>
  )
}
