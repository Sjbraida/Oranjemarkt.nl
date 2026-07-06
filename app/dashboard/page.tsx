import { redirect } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { DashboardView } from "@/components/dashboard-view"
import {
  getCurrentUser,
  getFavoriteProductIds,
  getMyStore,
  getProductsByStore,
  getStoreOrderItems,
  getSellerStats,
  getActiveSubscription,
  getInbox,
} from "@/lib/queries"

export const metadata = { title: "Verkopersdashboard | Oranjemarkt" }

const VALID = ["overzicht", "producten", "bestellingen", "berichten", "promoties", "abonnement", "instellingen"] as const
type Section = (typeof VALID)[number]

function weeklyRevenue(items: { price: number; quantity: number; createdAt: Date | string }[]) {
  const days = Array(7).fill(0) as number[]
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setDate(start.getDate() - 6)
  for (const it of items) {
    const d = new Date(it.createdAt)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const idx = Math.floor((dayStart.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    if (idx >= 0 && idx < 7) days[idx] += it.price * it.quantity
  }
  return days
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sectie?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in?redirect=/dashboard")

  const store = await getMyStore()
  if (!store) redirect("/verkoop")

  const { sectie } = await searchParams
  const initialSection = (VALID.includes(sectie as Section) ? sectie : "overzicht") as Section

  const [favoriteIds, products, orderItems, stats, subscription, inbox] = await Promise.all([
    getFavoriteProductIds(),
    getProductsByStore(store.id),
    getStoreOrderItems(store.id),
    getSellerStats(store.id),
    getActiveSubscription(user.id),
    getInbox(),
  ])

  // Only conversations where the current user is the seller of this store.
  const previews = inbox
    .filter((c) => c.viewerIsSeller && c.storeSlug === store.slug)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.counterpartName,
      initials: c.counterpartName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      preview: c.preview,
      time: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "",
      unread: c.unread,
    }))

  const productList = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    category: p.category,
    description: p.description,
    stock: p.stock,
    status: p.status as "draft" | "published",
  }))

  const orders = orderItems.map((o) => ({
    id: `#${o.orderId}`,
    product: o.name,
    buyer: o.buyerName ?? "Koper",
    date: new Date(o.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
    amount: o.price * o.quantity,
    status: o.status,
  }))

  const dashStats = {
    revenue: stats.revenue,
    orderCount: stats.orderCount,
    itemsSold: stats.itemsSold,
    followers: stats.followers,
    favorites: stats.favorites,
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    publishedCount: stats.publishedCount,
    week: weeklyRevenue(orderItems),
  }

  const storeInfo = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    category: store.category,
    location: store.location,
    rating: store.rating,
    followers: store.followers,
    logoText: store.logoText,
    description: store.description,
    plan: store.plan,
    phone: store.phone,
    email: store.email,
    website: store.website,
    instagram: store.instagram,
    facebook: store.facebook,
    bannerImage: store.bannerImage,
  }

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader
        title={`Welkom terug, ${user.name}`}
        subtitle={`Beheer ${storeInfo.name} en je verkoop op Oranjemarkt`}
      />
      <DashboardView
        store={storeInfo}
        products={productList}
        orders={orders}
        messages={previews}
        stats={dashStats}
        subscription={subscription ? { plan: subscription.plan, price: subscription.price } : null}
        initialSection={initialSection}
      />
    </SiteShell>
  )
}
