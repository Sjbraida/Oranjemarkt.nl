"use server"

import { db } from "@/lib/db"
import { cartItems, products } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function addToCart(productId: number, quantity = 1) {
  const user = await requireUser()
  const prod = await db.select().from(products).where(eq(products.id, productId)).limit(1)
  if (prod.length === 0) throw new Error("Product niet gevonden")

  await db
    .insert(cartItems)
    .values({ userId: user.id, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId],
      set: { quantity: sql`${cartItems.quantity} + ${quantity}` },
    })

  revalidatePath("/winkelwagen")
  return { ok: true }
}

export async function setCartQuantity(cartItemId: number, quantity: number) {
  const user = await requireUser()
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, user.id)))
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, user.id)))
  }
  revalidatePath("/winkelwagen")
  return { ok: true }
}

export async function removeFromCart(cartItemId: number) {
  const user = await requireUser()
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, user.id)))
  revalidatePath("/winkelwagen")
  return { ok: true }
}

export async function clearCart() {
  const user = await requireUser()
  await db.delete(cartItems).where(eq(cartItems.userId, user.id))
  revalidatePath("/winkelwagen")
  return { ok: true }
}
