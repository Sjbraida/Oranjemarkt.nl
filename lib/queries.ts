import { db } from "@/lib/db"
import {
  user,
  stores,
  products,
  favorites,
  subscriptions,
  orders,
  orderItems,
  reviews,
  follows,
  cartItems,
  conversations,
  messages,
  notifications,
} from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { and, desc, eq, inArray, ilike, isNotNull, sql } from "drizzle-orm"
import { headers } from "next/headers"

export async function getCurrentUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.id ?? null
}

export async function getFeaturedStores() {
  return db.select().from(stores).where(eq(stores.featured, true)).orderBy(desc(stores.rating))
}

export async function getTopStores(limit = 5) {
  return db.select().from(stores).orderBy(desc(stores.rating)).limit(limit)
}

export async function getAllStores() {
  return db.select().from(stores).orderBy(desc(stores.rating))
}

export async function getStoreBySlug(slug: string) {
  const rows = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getNewestProducts(limit = 12) {
  return db.select().from(products).orderBy(desc(products.createdAt)).limit(limit)
}

export async function getProductBySlug(slug: string) {
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getProductsByStore(storeId: number) {
  return db.select().from(products).where(eq(products.storeId, storeId)).orderBy(desc(products.createdAt))
}

export async function getAllProducts() {
  return db.select().from(products).orderBy(desc(products.createdAt))
}

export async function getProductsByCategory(category: string) {
  return db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.createdAt))
}

export async function getDealProducts() {
  return db.select().from(products).where(isNotNull(products.discount)).orderBy(desc(products.discount))
}

export async function searchProducts(query: string) {
  return db
    .select()
    .from(products)
    .where(ilike(products.name, `%${query}%`))
    .orderBy(desc(products.createdAt))
}

export async function searchStores(query: string) {
  return db
    .select()
    .from(stores)
    .where(ilike(stores.name, `%${query}%`))
    .orderBy(desc(stores.rating))
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function getFavoriteProductIds(): Promise<number[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []
  const rows = await db
    .select({ productId: favorites.productId })
    .from(favorites)
    .where(eq(favorites.userId, session.user.id))
  return rows.map((r) => r.productId)
}

export async function getFavoriteProducts() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return []
  const favRows = await db
    .select({ productId: favorites.productId })
    .from(favorites)
    .where(eq(favorites.userId, session.user.id))
  const ids = favRows.map((r) => r.productId)
  if (ids.length === 0) return []
  return db.select().from(products).where(inArray(products.id, ids))
}

export async function isFavorited(productId: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return false
  const rows = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, session.user.id), eq(favorites.productId, productId)))
    .limit(1)
  return rows.length > 0
}

// --- Store ownership & subscriptions --------------------------------------

export async function getStoreByOwner(userId: string) {
  const rows = await db.select().from(stores).where(eq(stores.ownerId, userId)).limit(1)
  return rows[0] ?? null
}

export async function getMyStore() {
  const userId = await getCurrentUserId()
  if (!userId) return null
  return getStoreByOwner(userId)
}

export async function getActiveSubscription(userId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)
  return rows[0] ?? null
}

// --- Products (owner scoped, published for public) ------------------------

export async function getPublishedProductsByStore(storeId: number) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.status, "published")))
    .orderBy(desc(products.createdAt))
}

export async function getProductById(id: number) {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1)
  return rows[0] ?? null
}

// --- Reviews ---------------------------------------------------------------

export async function getStoreReviews(storeId: number) {
  return db.select().from(reviews).where(eq(reviews.storeId, storeId)).orderBy(desc(reviews.createdAt))
}

export async function getStoreRating(storeId: number) {
  const rows = await db
    .select({ avg: sql<number>`coalesce(avg(${reviews.rating}), 0)`, count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.storeId, storeId))
  return { average: Number(rows[0]?.avg ?? 0), count: Number(rows[0]?.count ?? 0) }
}

export async function getMyReviewForStore(storeId: number) {
  const userId = await getCurrentUserId()
  if (!userId) return null
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.storeId, storeId)))
    .limit(1)
  return rows[0] ?? null
}

// --- Follows ---------------------------------------------------------------

export async function isFollowing(storeId: number) {
  const userId = await getCurrentUserId()
  if (!userId) return false
  const rows = await db
    .select()
    .from(follows)
    .where(and(eq(follows.userId, userId), eq(follows.storeId, storeId)))
    .limit(1)
  return rows.length > 0
}

export async function getFollowerCount(storeId: number) {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.storeId, storeId))
  return Number(rows[0]?.count ?? 0)
}

// --- Cart ------------------------------------------------------------------

export type CartLine = {
  id: number
  productId: number
  quantity: number
  name: string
  slug: string
  price: number
  image: string
  storeId: number
  storeName: string
  stock: number
}

export async function getCartLines(): Promise<CartLine[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []
  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      slug: products.slug,
      price: products.price,
      image: products.image,
      storeId: products.storeId,
      stock: products.stock,
      storeName: stores.name,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .leftJoin(stores, eq(products.storeId, stores.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(desc(cartItems.createdAt))
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    quantity: r.quantity,
    name: r.name,
    slug: r.slug,
    price: r.price,
    image: r.image,
    storeId: r.storeId,
    storeName: r.storeName ?? "Onbekende winkel",
    stock: r.stock,
  }))
}

export async function getCartCount() {
  const userId = await getCurrentUserId()
  if (!userId) return 0
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)` })
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
  return Number(rows[0]?.total ?? 0)
}

// --- Orders ----------------------------------------------------------------

export async function getMyOrders() {
  const userId = await getCurrentUserId()
  if (!userId) return []
  const os = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
  if (os.length === 0) return []
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        os.map((o) => o.id),
      ),
    )
  return os.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) }))
}

export async function getStoreOrderItems(storeId: number) {
  return db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      name: orderItems.name,
      price: orderItems.price,
      quantity: orderItems.quantity,
      image: orderItems.image,
      status: orders.status,
      createdAt: orders.createdAt,
      buyerName: orders.shippingName,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orderItems.storeId, storeId))
    .orderBy(desc(orders.createdAt))
}

// --- Conversations & messages ---------------------------------------------

export async function getConversationsForUser() {
  const userId = await getCurrentUserId()
  if (!userId) return []
  // conversations where the user is the buyer OR the store owner
  const rows = await db
    .select({
      id: conversations.id,
      buyerId: conversations.buyerId,
      storeId: conversations.storeId,
      updatedAt: conversations.updatedAt,
      storeName: stores.name,
      storeLogo: stores.logoText,
      storeOwnerId: stores.ownerId,
      storeSlug: stores.slug,
    })
    .from(conversations)
    .leftJoin(stores, eq(conversations.storeId, stores.id))
    .orderBy(desc(conversations.updatedAt))
  return rows.filter((r) => r.buyerId === userId || r.storeOwnerId === userId)
}

/** Rich inbox for the current user across both buyer and seller roles. */
export async function getInbox() {
  const userId = await getCurrentUserId()
  if (!userId) return []
  const convos = await getConversationsForUser()
  if (convos.length === 0) return []

  const ids = convos.map((c) => c.id)
  const allMessages = await db
    .select()
    .from(messages)
    .where(inArray(messages.conversationId, ids))
    .orderBy(messages.createdAt)

  // Buyer display names for conversations where the viewer is the seller.
  const buyerIds = Array.from(new Set(convos.map((c) => c.buyerId)))
  const buyerRows = buyerIds.length
    ? await db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.id, buyerIds))
    : []
  const buyerName = new Map(buyerRows.map((b) => [b.id, b.name]))

  return convos.map((c) => {
    const viewerIsSeller = c.storeOwnerId === userId
    const thread = allMessages.filter((m) => m.conversationId === c.id)
    const last = thread[thread.length - 1]
    const unread = thread.some((m) => m.senderId !== userId && m.readAt === null)
    const counterpartName = viewerIsSeller ? (buyerName.get(c.buyerId) ?? "Koper") : (c.storeName ?? "Verkoper")
    return {
      id: c.id,
      viewerIsSeller,
      counterpartName,
      storeSlug: c.storeSlug,
      preview: last?.body ?? "Nog geen berichten",
      updatedAt: c.updatedAt,
      unread,
      messages: thread.map((m) => ({
        id: m.id,
        mine: m.senderId === userId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    }
  })
}

export async function getMessages(conversationId: number) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
}

export async function getConversationById(id: number) {
  const rows = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1)
  return rows[0] ?? null
}

export async function getUnreadMessageCount() {
  const userId = await getCurrentUserId()
  if (!userId) return 0
  // Unread = message in one of my conversations, not sent by me, no readAt.
  const convos = await getConversationsForUser()
  if (convos.length === 0) return 0
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(
      and(
        inArray(
          messages.conversationId,
          convos.map((c) => c.id),
        ),
        sql`${messages.senderId} <> ${userId}`,
        sql`${messages.readAt} IS NULL`,
      ),
    )
  return Number(rows[0]?.count ?? 0)
}

// --- Notifications ---------------------------------------------------------

export async function getNotifications() {
  const userId = await getCurrentUserId()
  if (!userId) return []
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(30)
}

export async function getUnreadNotificationCount() {
  const userId = await getCurrentUserId()
  if (!userId) return 0
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
  return Number(rows[0]?.count ?? 0)
}

// --- Seller dashboard stats (live) ----------------------------------------

export async function getSellerStats(storeId: number) {
  const [prodCount, publishedCount, orderAgg, revAgg, followerCount, favCount] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(products).where(eq(products.storeId, storeId)),
    db
      .select({ c: sql<number>`count(*)` })
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.status, "published"))),
    db
      .select({
        orderCount: sql<number>`count(distinct ${orderItems.orderId})`,
        revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
        itemsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .where(eq(orderItems.storeId, storeId)),
    getStoreRating(storeId),
    getFollowerCount(storeId),
    db
      .select({ c: sql<number>`count(*)` })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(products.storeId, storeId)),
  ])
  return {
    productCount: Number(prodCount[0]?.c ?? 0),
    publishedCount: Number(publishedCount[0]?.c ?? 0),
    orderCount: Number(orderAgg[0]?.orderCount ?? 0),
    revenue: Number(orderAgg[0]?.revenue ?? 0),
    itemsSold: Number(orderAgg[0]?.itemsSold ?? 0),
    rating: revAgg.average,
    reviewCount: revAgg.count,
    followers: followerCount,
    favorites: Number(favCount[0]?.c ?? 0),
  }
}
