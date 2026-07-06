"use server"

import { db } from "@/lib/db"
import { cartItems, orders, orderItems, products, stores, notifications } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { SHIPPING_FLAT, FREE_SHIPPING_THRESHOLD, VAT_RATE, type ShippingDetails } from "@/lib/shipping"

/**
 * Creates a real order from the user's cart: snapshots line items, records
 * seller notifications, decrements stock, and empties the cart.
 * Payment capture is stubbed (status starts at "betaald") so a provider can be
 * plugged in later without changing this flow.
 */
export async function placeOrder(details: ShippingDetails) {
  const user = await requireUser()

  const lines = await db
    .select({
      cartId: cartItems.id,
      quantity: cartItems.quantity,
      productId: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
      storeId: products.storeId,
      stock: products.stock,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id))

  if (lines.length === 0) throw new Error("Je winkelwagen is leeg")

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = Number(((subtotal / (1 + VAT_RATE)) * VAT_RATE).toFixed(2))
  const total = Number((subtotal + shipping).toFixed(2))

  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      status: "betaald",
      subtotal,
      shipping,
      tax,
      total,
      paymentMethod: details.paymentMethod,
      shippingName: details.name,
      shippingAddress: details.address,
      shippingPostal: details.postal,
      shippingCity: details.city,
    })
    .returning({ id: orders.id })

  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: order.id,
      productId: l.productId,
      storeId: l.storeId,
      name: l.name,
      price: l.price,
      quantity: l.quantity,
      image: l.image,
    })),
  )

  // Decrement stock (never below 0)
  for (const l of lines) {
    await db
      .update(products)
      .set({ stock: Math.max(0, l.stock - l.quantity) })
      .where(eq(products.id, l.productId))
  }

  // Notify each seller
  const storeIds = [...new Set(lines.map((l) => l.storeId))]
  const storeRows = await db.select().from(stores).where(inArray(stores.id, storeIds))
  const notif = storeRows
    .filter((s) => s.ownerId)
    .map((s) => ({
      userId: s.ownerId as string,
      type: "order",
      title: "Nieuwe bestelling ontvangen",
      body: `Order #${order.id} bevat producten uit ${s.name}.`,
      href: "/dashboard?sectie=bestellingen",
    }))
  if (notif.length > 0) await db.insert(notifications).values(notif)

  // Empty cart
  await db.delete(cartItems).where(eq(cartItems.userId, user.id))

  revalidatePath("/winkelwagen")
  revalidatePath("/dashboard")
  revalidatePath("/account")
  return { orderId: order.id, total }
}

export async function updateOrderStatus(orderId: number, status: string) {
  const user = await requireUser()
  // Only a seller who has items in this order may update it
  const owned = await db
    .select({ ownerId: stores.ownerId })
    .from(orderItems)
    .innerJoin(stores, eq(orderItems.storeId, stores.id))
    .where(and(eq(orderItems.orderId, orderId), eq(stores.ownerId, user.id)))
    .limit(1)
  if (owned.length === 0) throw new Error("Niet toegestaan")

  await db.update(orders).set({ status }).where(eq(orders.id, orderId))
  revalidatePath("/dashboard")
  return { ok: true }
}
