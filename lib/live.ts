import "server-only"
import { db } from "@/lib/db"
import { stores, orderItems, orders, storePresence } from "@/lib/db/schema"
import { and, eq, gte, sql } from "drizzle-orm"

// Platform-commissie die Oranjemarkt rekent over de omzet van een kraam.
export const COMMISSION_RATE = 0.07

// Een bezoeker telt als "live" als de laatste heartbeat binnen dit venster viel.
export const PRESENCE_WINDOW_SECONDS = 45

export type StoreLiveStat = {
  storeId: number
  visitors: number
  revenueToday: number
  commissionToday: number
}

export type LiveSnapshot = {
  updatedAt: string
  totalVisitors: number
  totalRevenueToday: number
  totalCommissionToday: number
  activeStores: number
  stores: StoreLiveStat[]
}

/** Registreer/ververs een heartbeat voor een bezoeker op een kraam. */
export async function recordPresence(storeId: number, token: string) {
  await db
    .insert(storePresence)
    .values({ storeId, token, lastSeen: new Date() })
    .onConflictDoUpdate({
      target: [storePresence.storeId, storePresence.token],
      set: { lastSeen: new Date() },
    })
}

/** Ruim verouderde heartbeats op zodat de tellingen zuiver blijven. */
async function pruneStalePresence() {
  await db
    .delete(storePresence)
    .where(sql`${storePresence.lastSeen} < now() - interval '10 minutes'`)
}

/** Live bezoekers per kraam (distinct tokens binnen het venster). */
async function getLiveVisitorsByStore(): Promise<Map<number, number>> {
  const rows = await db
    .select({
      storeId: storePresence.storeId,
      visitors: sql<number>`count(distinct ${storePresence.token})`,
    })
    .from(storePresence)
    .where(gte(storePresence.lastSeen, sql`now() - (${PRESENCE_WINDOW_SECONDS} || ' seconds')::interval`))
    .groupBy(storePresence.storeId)

  const map = new Map<number, number>()
  for (const r of rows) map.set(r.storeId, Number(r.visitors))
  return map
}

/** Omzet van vandaag per kraam op basis van bestelregels. */
async function getRevenueTodayByStore(): Promise<Map<number, number>> {
  const rows = await db
    .select({
      storeId: orderItems.storeId,
      revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(gte(orders.createdAt, sql`date_trunc('day', now())`)))
    .groupBy(orderItems.storeId)

  const map = new Map<number, number>()
  for (const r of rows) map.set(r.storeId, Number(r.revenue))
  return map
}

/** Volledige live snapshot voor alle kramen. */
export async function getLiveSnapshot(): Promise<LiveSnapshot> {
  await pruneStalePresence()

  const [allStores, visitorsMap, revenueMap] = await Promise.all([
    db.select({ id: stores.id }).from(stores),
    getLiveVisitorsByStore(),
    getRevenueTodayByStore(),
  ])

  const statsList: StoreLiveStat[] = allStores.map((s) => {
    const visitors = visitorsMap.get(s.id) ?? 0
    const revenueToday = revenueMap.get(s.id) ?? 0
    return {
      storeId: s.id,
      visitors,
      revenueToday,
      commissionToday: revenueToday * COMMISSION_RATE,
    }
  })

  const totalVisitors = statsList.reduce((sum, s) => sum + s.visitors, 0)
  const totalRevenueToday = statsList.reduce((sum, s) => sum + s.revenueToday, 0)
  const activeStores = statsList.filter((s) => s.visitors > 0).length

  return {
    updatedAt: new Date().toISOString(),
    totalVisitors,
    totalRevenueToday,
    totalCommissionToday: totalRevenueToday * COMMISSION_RATE,
    activeStores,
    stores: statsList,
  }
}
