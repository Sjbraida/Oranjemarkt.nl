import "server-only"
import { db } from "@/lib/db"
import { storePresence, orderItems } from "@/lib/db/schema"
import { sql } from "drizzle-orm"

// Een bezoeker telt als "nu actief" als de laatste heartbeat binnen dit venster viel.
export const ACTIVE_WINDOW_SECONDS = 45
// Platformcommissie op de omzet van een kraam.
export const COMMISSION_RATE = 0.1

export type LiveStoreStat = {
  storeId: number
  visitors: number
  revenue: number
  commission: number
}

/** Registreert (of verlengt) een heartbeat voor een bezoeker op een kraam. */
export async function recordPresence(storeId: number, token: string) {
  await db
    .insert(storePresence)
    .values({ storeId, token, lastSeen: new Date() })
    .onConflictDoUpdate({
      target: [storePresence.storeId, storePresence.token],
      set: { lastSeen: new Date() },
    })

  // Verouderde rijen opruimen zodat de tabel klein blijft.
  await db.delete(storePresence).where(sql`${storePresence.lastSeen} < now() - make_interval(mins => 2)`)
}

/**
 * Live cijfers per kraam: actieve bezoekers (echte heartbeats) plus omzet en
 * de daaruit opgebouwde platformcommissie.
 */
export async function getLiveStoreStats(): Promise<LiveStoreStat[]> {
  const [visitorRows, revenueRows] = await Promise.all([
    db
      .select({
        storeId: storePresence.storeId,
        visitors: sql<number>`count(distinct ${storePresence.token})`,
      })
      .from(storePresence)
      .where(sql`${storePresence.lastSeen} > now() - make_interval(secs => ${ACTIVE_WINDOW_SECONDS})`)
      .groupBy(storePresence.storeId),
    db
      .select({
        storeId: orderItems.storeId,
        revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .groupBy(orderItems.storeId),
  ])

  const map = new Map<number, LiveStoreStat>()
  for (const r of revenueRows) {
    const revenue = Number(r.revenue) || 0
    map.set(r.storeId, {
      storeId: r.storeId,
      visitors: 0,
      revenue,
      commission: revenue * COMMISSION_RATE,
    })
  }
  for (const v of visitorRows) {
    const existing = map.get(v.storeId)
    const visitors = Number(v.visitors) || 0
    if (existing) existing.visitors = visitors
    else map.set(v.storeId, { storeId: v.storeId, visitors, revenue: 0, commission: 0 })
  }

  return Array.from(map.values())
}
