import "server-only"
import { db } from "@/lib/db"
import { stores, subscriptions, storePresence } from "@/lib/db/schema"
import { eq, gte, sql } from "drizzle-orm"

// Een bezoeker telt als "live" als de laatste heartbeat binnen dit venster viel.
export const PRESENCE_WINDOW_SECONDS = 60

// Alle site-brede aanwezigheid wordt opgeslagen onder deze sentinel-scope,
// zodat we losstaan van individuele kramen.
export const SITE_SCOPE = 0

export type HomeStats = {
  activeStores: number
  liveVisitors: number
  activeSubscriptions: number
}

/** Registreer/ververs een heartbeat voor een bezoeker (site-breed). */
export async function recordPresence(token: string) {
  await db
    .insert(storePresence)
    .values({ storeId: SITE_SCOPE, token, lastSeen: new Date() })
    .onConflictDoUpdate({
      target: [storePresence.storeId, storePresence.token],
      set: { lastSeen: new Date() },
    })
}

/** Ruim verouderde heartbeats op zodat de tellingen zuiver blijven. */
async function pruneStalePresence() {
  await db.delete(storePresence).where(sql`${storePresence.lastSeen} < now() - interval '10 minutes'`)
}

/** Aantal live bezoekers op de site (distinct tokens binnen het venster). */
async function getLiveVisitors(): Promise<number> {
  const rows = await db
    .select({ visitors: sql<number>`count(distinct ${storePresence.token})` })
    .from(storePresence)
    .where(gte(storePresence.lastSeen, sql`now() - (${PRESENCE_WINDOW_SECONDS} || ' seconds')::interval`))

  return Number(rows[0]?.visitors ?? 0)
}

/** Live statistieken voor de homepage-hero. */
export async function getHomeStats(): Promise<HomeStats> {
  await pruneStalePresence()

  const [storeAgg, subAgg, liveVisitors] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(stores),
    db
      .select({ c: sql<number>`count(*)` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active")),
    getLiveVisitors(),
  ])

  return {
    activeStores: Number(storeAgg[0]?.c ?? 0),
    liveVisitors,
    activeSubscriptions: Number(subAgg[0]?.c ?? 0),
  }
}
