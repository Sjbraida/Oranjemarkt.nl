import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { FeaturedStores } from "@/components/featured-stores"
import { NewestProducts } from "@/components/newest-products"
import { NoCommission } from "@/components/no-commission"
import { RightColumn } from "@/components/right-column"
import { PhonePreview } from "@/components/phone-preview"
import { SiteShell } from "@/components/site-shell"
import {
  getFeaturedStores,
  getTopStores,
  getNewestProducts,
  getFavoriteProductIds,
  getCurrentUser,
} from "@/lib/queries"

export default async function Page() {
  const [featured, topStores, newest, favoriteIds, user] = await Promise.all([
    getFeaturedStores(),
    getTopStores(5),
    getNewestProducts(6),
    getFavoriteProductIds(),
    getCurrentUser(),
  ])

  const isLoggedIn = !!user

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <div className="flex gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <HeroSection />
          <CategoriesSection />
          <FeaturedStores stores={featured} />
          <NoCommission />
          <NewestProducts products={newest} favoriteIds={favoriteIds} isLoggedIn={isLoggedIn} />
        </div>
        <div className="hidden w-80 shrink-0 xl:block">
          <RightColumn
            topSellers={topStores.map((s) => ({
              slug: s.slug,
              name: s.name,
              rating: s.rating,
              logoText: s.logoText,
            }))}
          />
        </div>
        <PhonePreview />
      </div>
    </SiteShell>
  )
}
