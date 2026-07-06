"use server"

import { db } from "@/lib/db"
import { reviews, stores } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function syncStoreRating(storeId: number) {
  const rows = await db
    .select({ avg: sql<number>`coalesce(avg(${reviews.rating}), 0)`, count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.storeId, storeId))
  await db
    .update(stores)
    .set({ rating: Number(Number(rows[0]?.avg ?? 0).toFixed(1)), reviews: Number(rows[0]?.count ?? 0) })
    .where(eq(stores.id, storeId))
}

export async function submitReview(input: { storeId: number; rating: number; text: string }) {
  const user = await requireUser()
  if (input.rating < 1 || input.rating > 5) throw new Error("Ongeldige beoordeling")
  const text = input.text.trim()
  if (!text) throw new Error("Schrijf een korte review")

  await db
    .insert(reviews)
    .values({
      storeId: input.storeId,
      userId: user.id,
      authorName: user.name,
      rating: input.rating,
      text,
    })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.storeId],
      set: { rating: input.rating, text, authorName: user.name, createdAt: new Date() },
    })

  await syncStoreRating(input.storeId)

  const store = await db.select({ slug: stores.slug }).from(stores).where(eq(stores.id, input.storeId)).limit(1)
  if (store[0]) revalidatePath(`/kramen/${store[0].slug}`)
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function deleteReview(storeId: number) {
  const user = await requireUser()
  await db.delete(reviews).where(and(eq(reviews.userId, user.id), eq(reviews.storeId, storeId)))
  await syncStoreRating(storeId)
  const store = await db.select({ slug: stores.slug }).from(stores).where(eq(stores.id, storeId)).limit(1)
  if (store[0]) revalidatePath(`/kramen/${store[0].slug}`)
  return { ok: true }
}
