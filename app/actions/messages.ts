"use server"

import { db } from "@/lib/db"
import { conversations, messages, stores, notifications } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/** Ensures a conversation exists between the current user (buyer) and a store. */
export async function startConversation(storeId: number) {
  const user = await requireUser()
  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.buyerId, user.id), eq(conversations.storeId, storeId)))
    .limit(1)
  if (existing.length > 0) return { conversationId: existing[0].id }

  const [conv] = await db
    .insert(conversations)
    .values({ buyerId: user.id, storeId })
    .returning({ id: conversations.id })
  revalidatePath("/berichten")
  return { conversationId: conv.id }
}

export async function sendMessage(conversationId: number, body: string) {
  const user = await requireUser()
  const text = body.trim()
  if (!text) throw new Error("Leeg bericht")

  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1)
  if (conv.length === 0) throw new Error("Gesprek niet gevonden")
  const c = conv[0]

  const store = await db.select().from(stores).where(eq(stores.id, c.storeId)).limit(1)
  const isBuyer = c.buyerId === user.id
  const isSeller = store[0]?.ownerId === user.id
  if (!isBuyer && !isSeller) throw new Error("Niet toegestaan")

  await db.insert(messages).values({
    conversationId,
    senderId: user.id,
    senderRole: isSeller ? "seller" : "buyer",
    body: text,
  })
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId))

  // Notify the other party
  const recipientId = isSeller ? c.buyerId : store[0]?.ownerId
  if (recipientId && recipientId !== user.id) {
    await db.insert(notifications).values({
      userId: recipientId,
      type: "message",
      title: "Nieuw bericht",
      body: text.slice(0, 80),
      href: "/berichten",
    })
  }

  revalidatePath("/berichten")
  return { ok: true }
}

/** Buyer makes an offer on a product; delivered to the seller as a message. */
export async function sendOffer(storeId: number, productName: string, offer: number, askingPrice: number) {
  const user = await requireUser()
  const { conversationId } = await startConversation(storeId)
  const body = `Bod op "${productName}": € ${offer.toFixed(2)} (vraagprijs € ${askingPrice.toFixed(2)}). Ga je akkoord?`

  await db.insert(messages).values({
    conversationId,
    senderId: user.id,
    senderRole: "buyer",
    body,
  })
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId))

  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1)
  if (store[0]?.ownerId && store[0].ownerId !== user.id) {
    await db.insert(notifications).values({
      userId: store[0].ownerId,
      type: "offer",
      title: "Nieuw bod ontvangen",
      body: body.slice(0, 80),
      href: "/berichten",
    })
  }
  revalidatePath("/berichten")
  return { conversationId }
}

/** Marks all messages in a conversation (sent by the other party) as read. */
export async function markConversationRead(conversationId: number) {
  const user = await requireUser()
  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1)
  if (conv.length === 0) return { ok: true }
  const store = await db.select().from(stores).where(eq(stores.id, conv[0].storeId)).limit(1)
  const allowed = conv[0].buyerId === user.id || store[0]?.ownerId === user.id
  if (!allowed) throw new Error("Niet toegestaan")

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        sql`${messages.senderId} <> ${user.id}`,
        sql`${messages.readAt} IS NULL`,
      ),
    )
  revalidatePath("/berichten")
  return { ok: true }
}

export async function deleteConversation(conversationId: number) {
  const user = await requireUser()
  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1)
  if (conv.length === 0) return { ok: true }
  const store = await db.select().from(stores).where(eq(stores.id, conv[0].storeId)).limit(1)
  const allowed = conv[0].buyerId === user.id || store[0]?.ownerId === user.id
  if (!allowed) throw new Error("Niet toegestaan")

  await db.delete(messages).where(eq(messages.conversationId, conversationId))
  await db.delete(conversations).where(eq(conversations.id, conversationId))
  revalidatePath("/berichten")
  return { ok: true }
}
