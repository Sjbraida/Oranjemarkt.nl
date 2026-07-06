"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { favorites } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function toggleFavorite(productId: number) {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    .limit(1)

  let favorited: boolean
  if (existing.length > 0) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    favorited = false
  } else {
    await db.insert(favorites).values({ userId, productId }).onConflictDoNothing()
    favorited = true
  }

  revalidatePath("/")
  revalidatePath("/favorieten")
  return { favorited }
}
