"use server"

import { db } from "@/lib/db"
import { stores, subscriptions } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { PLANS, type PlanKey } from "@/lib/plans"

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48)
}

async function uniqueSlug(base: string) {
  let slug = base || "winkel"
  let n = 1
  while (true) {
    const existing = await db.select({ id: stores.id }).from(stores).where(eq(stores.slug, slug)).limit(1)
    if (existing.length === 0) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

/**
 * Activates a plan for the current user. Creates their store if they don't have
 * one yet, records the subscription, and updates the store's plan tier.
 * (Payment provider hookup is a later step; the flow is fully wired.)
 */
export async function subscribeToPlan(input: {
  plan: PlanKey
  storeName: string
  category: string
  location: string
  description?: string
}) {
  const user = await requireUser()
  const planDef = PLANS[input.plan]
  if (!planDef) throw new Error("Onbekend abonnement")

  const storeName = input.storeName.trim()
  if (!storeName) throw new Error("Winkelnaam is verplicht")

  // Find existing store for this owner
  const existing = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1)

  const logoText = storeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  let storeId: number
  let storeSlug: string

  if (existing.length > 0) {
    const s = existing[0]
    await db
      .update(stores)
      .set({
        name: storeName,
        category: input.category,
        location: input.location,
        description: input.description ?? s.description,
        logoText,
        plan: input.plan,
      })
      .where(eq(stores.id, s.id))
    storeId = s.id
    storeSlug = s.slug
  } else {
    const slug = await uniqueSlug(slugify(storeName))
    const inserted = await db
      .insert(stores)
      .values({
        slug,
        name: storeName,
        category: input.category,
        location: input.location,
        description: input.description ?? "",
        logoText,
        image: "/dutch-market-stall.jpg",
        ownerId: user.id,
        plan: input.plan,
        featured: false,
      })
      .returning({ id: stores.id, slug: stores.slug })
    storeId = inserted[0].id
    storeSlug = inserted[0].slug
  }

  // Deactivate previous subscriptions, then record the new one
  await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(eq(subscriptions.userId, user.id))
  await db.insert(subscriptions).values({
    userId: user.id,
    storeId,
    plan: input.plan,
    price: planDef.price,
    status: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  revalidatePath("/dashboard")
  revalidatePath("/verkoop")
  revalidatePath(`/kramen/${storeSlug}`)
  return { storeId, storeSlug }
}
