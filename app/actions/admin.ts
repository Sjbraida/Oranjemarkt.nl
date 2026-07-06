"use server"

import { db } from "@/lib/db"
import { products, stores, user, reviews, orders, notifications } from "@/lib/db/schema"
import { requireAdmin, requireSuperadmin, SUPERADMIN_EMAIL, type Role } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// --- Producten -------------------------------------------------------------

export async function adminUpdateProduct(input: {
  id: number
  name?: string
  price?: number
  stock?: number
  status?: string
  category?: string
}) {
  await requireAdmin()
  const rows = await db.select().from(products).where(eq(products.id, input.id)).limit(1)
  if (rows.length === 0) throw new Error("Product niet gevonden")
  const p = rows[0]
  await db
    .update(products)
    .set({
      name: input.name?.trim() || p.name,
      price: input.price ?? p.price,
      stock: input.stock ?? p.stock,
      status: input.status || p.status,
      category: input.category || p.category,
    })
    .where(eq(products.id, input.id))
  revalidatePath("/admin/producten")
  return { ok: true }
}

export async function adminDeleteProduct(id: number) {
  await requireAdmin()
  await db.delete(products).where(eq(products.id, id))
  revalidatePath("/admin/producten")
  return { ok: true }
}

// --- Kramen ----------------------------------------------------------------

export async function adminDeleteStore(id: number) {
  await requireSuperadmin()
  // Verwijder eerst de producten van deze kraam.
  await db.delete(products).where(eq(products.storeId, id))
  await db.delete(stores).where(eq(stores.id, id))
  revalidatePath("/admin/kramen")
  return { ok: true }
}

export async function adminSetStoreFeatured(id: number, featured: boolean) {
  await requireAdmin()
  await db.update(stores).set({ featured }).where(eq(stores.id, id))
  revalidatePath("/admin/kramen")
  return { ok: true }
}

// --- Gebruikers & rollen ---------------------------------------------------

export async function adminSetUserRole(userId: string, role: Role) {
  // Alleen de superadmin mag rollen wijzigen.
  await requireSuperadmin()
  const rows = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (rows.length === 0) throw new Error("Gebruiker niet gevonden")
  // De vaste superadmin mag niet gedegradeerd worden.
  if (rows[0].email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() && role !== "superadmin") {
    throw new Error("De hoofd-superadmin kan niet worden gewijzigd")
  }
  await db.update(user).set({ role }).where(eq(user.id, userId))
  revalidatePath("/admin/gebruikers")
  return { ok: true }
}

export async function adminSetUserBanned(userId: string, banned: boolean) {
  await requireAdmin()
  const rows = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (rows.length === 0) throw new Error("Gebruiker niet gevonden")
  // Nooit de superadmin of andere admins verbannen zonder superadmin-rechten.
  if (rows[0].email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()) {
    throw new Error("Deze gebruiker kan niet worden geblokkeerd")
  }
  if (rows[0].role === "admin" || rows[0].role === "superadmin") {
    await requireSuperadmin()
  }
  await db.update(user).set({ banned }).where(eq(user.id, userId))
  revalidatePath("/admin/gebruikers")
  return { ok: true }
}

// --- Moderatie -------------------------------------------------------------

export async function adminDeleteReview(id: number) {
  await requireAdmin()
  await db.delete(reviews).where(eq(reviews.id, id))
  revalidatePath("/admin/moderatie")
  return { ok: true }
}

// --- Bestellingen ----------------------------------------------------------

export async function adminUpdateOrderStatus(id: number, status: string) {
  await requireAdmin()
  await db.update(orders).set({ status }).where(eq(orders.id, id))
  revalidatePath("/admin/verkoop")
  return { ok: true }
}

// --- Broadcast-meldingen ---------------------------------------------------

export async function adminBroadcastNotification(input: { title: string; body?: string; href?: string }) {
  await requireAdmin()
  const title = input.title.trim()
  if (!title) throw new Error("Titel is verplicht")

  const allUsers = await db.select({ id: user.id }).from(user).where(eq(user.banned, false))
  if (allUsers.length === 0) return { ok: true, count: 0 }

  await db.insert(notifications).values(
    allUsers.map((u) => ({
      userId: u.id,
      type: "systeem",
      title,
      body: input.body?.trim() || null,
      href: input.href?.trim() || null,
    })),
  )
  revalidatePath("/admin")
  return { ok: true, count: allUsers.length }
}
