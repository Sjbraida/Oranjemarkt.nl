"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star, Clock, MapPin, AtSign, Link as LinkIcon, Globe, PackageOpen, Loader2 } from "lucide-react"
import { ProductCard, type ProductCardData } from "@/components/product-card"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { submitReview } from "@/app/actions/reviews"
import type { Review } from "@/lib/store-extras"

function ReviewForm({
  storeId,
  myReview,
}: {
  storeId: number
  myReview: { rating: number; text: string } | null
}) {
  const router = useRouter()
  const [rating, setRating] = useState(myReview?.rating ?? 5)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState(myReview?.text ?? "")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = () => {
    setError(null)
    startTransition(async () => {
      try {
        await submitReview({ storeId, rating, text })
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Er ging iets mis.")
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">{myReview ? "Wijzig je review" : "Schrijf een review"}</h3>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${value} sterren`}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  value <= (hover || rating) ? "fill-primary text-primary" : "text-muted-foreground",
                )}
              />
            </button>
          )
        })}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Deel je ervaring met deze winkel…"
        className="mt-3 w-full resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
      />
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button className="mt-3 gap-2 font-semibold" onClick={onSubmit} disabled={pending || !text.trim()}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {myReview ? "Review bijwerken" : "Review plaatsen"}
      </Button>
    </div>
  )
}

type StoreMeta = {
  memberSince: string
  openingHours: { day: string; hours: string }[]
  socials: { platform: string; handle: string }[]
}

const BASE_TABS = ["Alle producten", "Uitgelicht", "Nieuw", "Aanbiedingen", "Reviews", "Over de winkel"] as const
type Tab = (typeof BASE_TABS)[number]

function Grid({
  products,
  favoriteIds,
  isLoggedIn,
  empty,
}: {
  products: ProductCardData[]
  favoriteIds: number[]
  isLoggedIn: boolean
  empty: string
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} favorited={favoriteIds.includes(p.id)} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  )
}

export function StoreTabs({
  storeId,
  products,
  favoriteIds,
  isLoggedIn,
  reviews,
  rating,
  reviewCount,
  canReview,
  myReview,
  description,
  location,
  meta,
}: {
  storeId: number
  products: ProductCardData[]
  favoriteIds: number[]
  isLoggedIn: boolean
  reviews: Review[]
  rating: number
  reviewCount: number
  canReview: boolean
  myReview: { rating: number; text: string } | null
  description: string | null
  location: string
  meta: StoreMeta
}) {
  const [tab, setTab] = useState<Tab>("Alle producten")
  const safeRating = Number(rating) || 0

  const featured = products.filter((p) => p.featured)
  // Uitgelichte producten bovenaan tonen in "Alle producten".
  const allSorted = [...products].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  const newest = products.slice(0, 10)
  const deals = products.filter((p) => p.discount)

  // De "Uitgelicht"-tab alleen tonen wanneer er uitgelichte producten zijn.
  const tabs = BASE_TABS.filter((t) => t !== "Uitgelicht" || featured.length > 0)

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const count =
            t === "Alle producten"
              ? products.length
              : t === "Uitgelicht"
                ? featured.length
                : t === "Nieuw"
                  ? newest.length
                  : t === "Aanbiedingen"
                    ? deals.length
                    : t === "Reviews"
                      ? reviewCount
                      : null
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {count !== null && <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          )
        })}
      </div>

      {tab === "Alle producten" && (
        <Grid products={allSorted} favoriteIds={favoriteIds} isLoggedIn={isLoggedIn} empty="Deze winkel heeft nog geen producten." />
      )}
      {tab === "Uitgelicht" && (
        <Grid products={featured} favoriteIds={favoriteIds} isLoggedIn={isLoggedIn} empty="Deze winkel heeft nog geen uitgelichte producten." />
      )}
      {tab === "Nieuw" && (
        <Grid products={newest} favoriteIds={favoriteIds} isLoggedIn={isLoggedIn} empty="Nog geen nieuwe producten." />
      )}
      {tab === "Aanbiedingen" && (
        <Grid products={deals} favoriteIds={favoriteIds} isLoggedIn={isLoggedIn} empty="Momenteel geen aanbiedingen." />
      )}

      {tab === "Reviews" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 text-center lg:sticky lg:top-24 lg:self-start">
            <p className="text-5xl font-bold text-foreground">{safeRating.toFixed(1)}</p>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("h-5 w-5", i < Math.round(safeRating) ? "fill-primary text-primary" : "text-muted-foreground")}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{`Gebaseerd op ${reviewCount} reviews`}</p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            {canReview && <ReviewForm storeId={storeId} myReview={myReview} />}
            {reviews.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                Nog geen reviews. Wees de eerste!
              </div>
            )}
            <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <UserAvatar src={r.authorImage} name={r.author} className="h-10 w-10" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{r.author}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <span className="flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </li>
            ))}
            </ul>
          </div>
        </div>
      )}

      {tab === "Over de winkel" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Over ons</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {description ||
                "Deze winkel heeft nog geen beschrijving toegevoegd, maar biedt een zorgvuldig geselecteerd assortiment aan met snelle levering en persoonlijke service."}
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {location}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{`Lid sinds ${meta.memberSince}`}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Openingstijden
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {meta.openingHours.map((o) => (
                <li key={o.day} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{o.day}</span>
                  <span className="font-medium text-foreground">{o.hours}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 font-semibold text-foreground">Volg ons</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {meta.socials.map((s) => {
                const Icon = s.platform === "instagram" ? AtSign : s.platform === "facebook" ? LinkIcon : Globe
                return (
                  <span key={s.platform} className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {s.handle}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
