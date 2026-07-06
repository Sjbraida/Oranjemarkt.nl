import { db } from "@/lib/db"
import {
  user,
  stores,
  products,
  orders,
  orderItems,
  reviews,
  subscriptions,
  supportTickets,
  supportMessages,
} from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { requireAdmin } from "@/lib/admin"

// --- Platformbrede statistieken -------------------------------------------

export async function getAdminStats() {
  await requireAdmin()
  const [userAgg, storeAgg, productAgg, orderAgg, ticketAgg] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(user),
    db.select({ c: sql<number>`count(*)` }).from(stores),
    db.select({ c: sql<number>`count(*)` }).from(products),
    db
      .select({
        orderCount: sql<number>`count(*)`,
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
      })
      .from(orders),
    db
      .select({ c: sql<number>`count(*)` })
      .from(supportTickets)
      .where(eq(supportTickets.status, "open")),
  ])
  return {
    users: Number(userAgg[0]?.c ?? 0),
    stores: Number(storeAgg[0]?.c ?? 0),
    products: Number(productAgg[0]?.c ?? 0),
    orders: Number(orderAgg[0]?.orderCount ?? 0),
    revenue: Number(orderAgg[0]?.revenue ?? 0),
    openTickets: Number(ticketAgg[0]?.c ?? 0),
  }
}

/** Omzet per dag over de laatste 14 dagen (platformbreed). */
export async function getAdminRevenueSeries() {
  await requireAdmin()
  const rows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(sql`${orders.createdAt} > now() - interval '14 days'`)
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
  return rows.map((r) => ({ day: r.day, revenue: Number(r.revenue) }))
}

// --- Producten -------------------------------------------------------------

export async function getAllProductsAdmin() {
  await requireAdmin()
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      image: products.image,
      category: products.category,
      stock: products.stock,
      status: products.status,
      storeId: products.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(stores, eq(products.storeId, stores.id))
    .orderBy(desc(products.createdAt))
}

// --- Kramen ----------------------------------------------------------------

export async function getAllStoresAdmin() {
  await requireAdmin()
  return db
    .select({
      id: stores.id,
      slug: stores.slug,
      name: stores.name,
      category: stores.category,
      location: stores.location,
      plan: stores.plan,
      productCount: stores.productCount,
      rating: stores.rating,
      ownerId: stores.ownerId,
      ownerName: user.name,
      ownerEmail: user.email,
      createdAt: stores.createdAt,
    })
    .from(stores)
    .leftJoin(user, eq(stores.ownerId, user.id))
    .orderBy(desc(stores.createdAt))
}

// --- Gebruikers ------------------------------------------------------------

export async function getAllUsersAdmin() {
  await requireAdmin()
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
}

// --- Verkoop / bestellingen ------------------------------------------------

export async function getAllOrdersAdmin() {
  await requireAdmin()
  return db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      buyerName: orders.shippingName,
      city: orders.shippingCity,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
      itemCount: sql<number>`(select coalesce(sum(${orderItems.quantity}), 0) from ${orderItems} where ${orderItems.orderId} = ${orders.id})`,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
}

// --- Moderatie: reviews ----------------------------------------------------

export async function getAllReviewsAdmin() {
  await requireAdmin()
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      text: reviews.text,
      authorName: reviews.authorName,
      storeId: reviews.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .leftJoin(stores, eq(reviews.storeId, stores.id))
    .orderBy(desc(reviews.createdAt))
}

// --- Abonnementen (voor verkoopoverzicht) ----------------------------------

export async function getActiveSubscriptionsAdmin() {
  await requireAdmin()
  return db
    .select({
      id: subscriptions.id,
      plan: subscriptions.plan,
      status: subscriptions.status,
      price: subscriptions.price,
      storeId: subscriptions.storeId,
      storeName: stores.name,
      createdAt: subscriptions.createdAt,
    })
    .from(subscriptions)
    .leftJoin(stores, eq(subscriptions.storeId, stores.id))
    .where(eq(subscriptions.status, "active"))
    .orderBy(desc(subscriptions.createdAt))
}

// --- Support ---------------------------------------------------------------

/** Alle tickets (admin-weergave) met naam van de gebruiker en ongelezen-teller. */
export async function getSupportTicketsAdmin() {
  await requireAdmin()
  return db
    .select({
      id: supportTickets.id,
      subject: supportTickets.subject,
      category: supportTickets.category,
      status: supportTickets.status,
      priority: supportTickets.priority,
      userId: supportTickets.userId,
      userName: user.name,
      userEmail: user.email,
      updatedAt: supportTickets.updatedAt,
      unread: sql<number>`(select count(*) from ${supportMessages} where ${supportMessages.ticketId} = ${supportTickets.id} and ${supportMessages.senderRole} = 'user' and ${supportMessages.readByAdmin} = false)`,
    })
    .from(supportTickets)
    .leftJoin(user, eq(supportTickets.userId, user.id))
    .orderBy(desc(supportTickets.updatedAt))
}

/** Tickets van de ingelogde gebruiker. */
export async function getMyTickets(userId: string) {
  return db
    .select({
      id: supportTickets.id,
      subject: supportTickets.subject,
      category: supportTickets.category,
      status: supportTickets.status,
      updatedAt: supportTickets.updatedAt,
      unread: sql<number>`(select count(*) from ${supportMessages} where ${supportMessages.ticketId} = ${supportTickets.id} and ${supportMessages.senderRole} = 'admin' and ${supportMessages.readByUser} = false)`,
    })
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.updatedAt))
}

export async function getTicketById(ticketId: number) {
  const rows = await db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1)
  return rows[0] ?? null
}

export async function getTicketMessages(ticketId: number) {
  return db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.ticketId, ticketId))
    .orderBy(supportMessages.createdAt)
}

/** Aantal openstaande support-tickets met ongelezen gebruikersberichten (voor badge). */
export async function getAdminUnreadSupportCount() {
  const admin = await requireAdmin().catch(() => null)
  if (!admin) return 0
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(supportMessages)
    .where(and(eq(supportMessages.senderRole, "user"), eq(supportMessages.readByAdmin, false)))
  return Number(rows[0]?.c ?? 0)
}
