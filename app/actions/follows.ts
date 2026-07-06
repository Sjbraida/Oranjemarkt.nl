"use server"

import { db } from "@/lib/db"
import { follows, stores } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function syncFollowerCount(storeId: number) {
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(follows)
    .where(eq(follows.storeId, storeId))
  await db
    .update(stores)
    .set({ followers: String(Number(rows[0]?.c ?? 0)) })
    .where(eq(stores.id, storeId))
}

export async function toggleFollow(storeId: number) {
  const user = await requireUser()
  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.userId, user.id), eq(follows.storeId, storeId)))
    .limit(1)

  let following: boolean
  if (existing.length > 0) {
    await db.delete(follows).where(and(eq(follows.userId, user.id), eq(follows.storeId, storeId)))
    following = false
  } else {
    await db.insert(follows).values({ userId: user.id, storeId }).onConflictDoNothing()
    following = true
  }

  await syncFollowerCount(storeId)
  const store = await db.select({ slug: stores.slug }).from(stores).where(eq(stores.id, storeId)).limit(1)
  if (store[0]) revalidatePath(`/kramen/${store[0].slug}`)
  return { following }
}
