"use server"

import { db } from "@/lib/db"
import { supportTickets, supportMessages } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { requireAdmin } from "@/lib/admin"
import { getTicketById } from "@/lib/admin-queries"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/** Gebruiker maakt een nieuw support-ticket aan met een eerste bericht. */
export async function createSupportTicket(input: { subject: string; category?: string; body: string }) {
  const user = await requireUser()
  const subject = input.subject.trim()
  const body = input.body.trim()
  if (!subject || !body) throw new Error("Vul een onderwerp en bericht in")

  const inserted = await db
    .insert(supportTickets)
    .values({
      userId: user.id,
      subject,
      category: input.category?.trim() || "algemeen",
    })
    .returning({ id: supportTickets.id })

  const ticketId = inserted[0].id
  await db.insert(supportMessages).values({
    ticketId,
    senderId: user.id,
    senderRole: "user",
    body,
  })

  revalidatePath("/support")
  revalidatePath("/admin/support")
  return { ok: true, ticketId }
}

/** Bericht toevoegen aan een ticket, door de gebruiker of een admin. */
export async function sendSupportMessage(input: { ticketId: number; body: string; asAdmin?: boolean }) {
  const body = input.body.trim()
  if (!body) throw new Error("Bericht mag niet leeg zijn")

  const ticket = await getTicketById(input.ticketId)
  if (!ticket) throw new Error("Ticket niet gevonden")

  let senderId: string
  let senderRole: "user" | "admin"

  if (input.asAdmin) {
    const admin = await requireAdmin()
    senderId = admin.id
    senderRole = "admin"
  } else {
    const user = await requireUser()
    // Gebruiker mag alleen in eigen ticket schrijven.
    if (ticket.userId !== user.id) throw new Error("Geen toegang tot dit ticket")
    senderId = user.id
    senderRole = "user"
  }

  await db.insert(supportMessages).values({
    ticketId: input.ticketId,
    senderId,
    senderRole,
    body,
    // Eigen bericht is direct "gelezen" door de afzender-kant.
    readByUser: senderRole === "user",
    readByAdmin: senderRole === "admin",
  })

  await db
    .update(supportTickets)
    .set({ updatedAt: new Date(), status: input.asAdmin ? "in_behandeling" : ticket.status })
    .where(eq(supportTickets.id, input.ticketId))

  revalidatePath(`/support/${input.ticketId}`)
  revalidatePath(`/admin/support/${input.ticketId}`)
  revalidatePath("/admin/support")
  return { ok: true }
}

/** Markeer berichten in een ticket als gelezen voor de openende kant. */
export async function markTicketRead(ticketId: number, side: "user" | "admin") {
  if (side === "admin") {
    await requireAdmin()
    await db
      .update(supportMessages)
      .set({ readByAdmin: true })
      .where(and(eq(supportMessages.ticketId, ticketId), eq(supportMessages.senderRole, "user")))
  } else {
    const user = await requireUser()
    const ticket = await getTicketById(ticketId)
    if (!ticket || ticket.userId !== user.id) return { ok: false }
    await db
      .update(supportMessages)
      .set({ readByUser: true })
      .where(and(eq(supportMessages.ticketId, ticketId), eq(supportMessages.senderRole, "admin")))
  }
  return { ok: true }
}

/** Admin wijzigt de status van een ticket. */
export async function updateTicketStatus(ticketId: number, status: string) {
  await requireAdmin()
  await db.update(supportTickets).set({ status, updatedAt: new Date() }).where(eq(supportTickets.id, ticketId))
  revalidatePath(`/admin/support/${ticketId}`)
  revalidatePath("/admin/support")
  return { ok: true }
}

/**
 * Verwijder één bericht uit een ticket.
 * Een admin mag elk bericht verwijderen; een gebruiker (koper) alleen zijn eigen bericht.
 */
export async function deleteSupportMessage(input: { messageId: number; asAdmin?: boolean }) {
  const rows = await db.select().from(supportMessages).where(eq(supportMessages.id, input.messageId)).limit(1)
  const message = rows[0]
  if (!message) throw new Error("Bericht niet gevonden")

  if (input.asAdmin) {
    await requireAdmin()
  } else {
    const user = await requireUser()
    // Gebruiker mag alleen zijn eigen (user-)bericht verwijderen.
    if (message.senderRole !== "user" || message.senderId !== user.id) {
      throw new Error("Je kunt alleen je eigen bericht verwijderen")
    }
  }

  await db.delete(supportMessages).where(eq(supportMessages.id, input.messageId))

  revalidatePath(`/support/${message.ticketId}`)
  revalidatePath(`/admin/support/${message.ticketId}`)
  revalidatePath("/admin/support")
  return { ok: true }
}

/**
 * Verwijder een volledig ticket met alle berichten.
 * Een admin mag elk ticket verwijderen; een gebruiker (koper) alleen zijn eigen ticket.
 */
export async function deleteSupportTicket(input: { ticketId: number; asAdmin?: boolean }) {
  const ticket = await getTicketById(input.ticketId)
  if (!ticket) throw new Error("Ticket niet gevonden")

  if (input.asAdmin) {
    await requireAdmin()
  } else {
    const user = await requireUser()
    if (ticket.userId !== user.id) throw new Error("Geen toegang tot dit ticket")
  }

  await db.delete(supportMessages).where(eq(supportMessages.ticketId, input.ticketId))
  await db.delete(supportTickets).where(eq(supportTickets.id, input.ticketId))

  revalidatePath("/support")
  revalidatePath("/admin/support")
  return { ok: true }
}
