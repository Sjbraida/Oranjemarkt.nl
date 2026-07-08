"use server"

import { db } from "@/lib/db"
import { stores, subscriptions } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { getPlan } from "@/lib/plans"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/** Bepaalt het actieve plan van een gebruiker: abonnement gaat vóór het store-plan. */
async function effectivePlan(userId: string, storePlan: string) {
  const subs = await db
    .select({ plan: subscriptions.plan })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)
  return getPlan(subs[0]?.plan ?? storePlan)
}

const STORE_TYPES = ["kraam", "winkel", "bedrijf"] as const

export async function updateStoreSettings(input: {
  name?: string
  category?: string
  type?: string
  location?: string
  description?: string
  image?: string
  bannerImage?: string
  phone?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
}) {
  const user = await requireUser()
  const rows = await db.select().from(stores).where(eq(stores.ownerId, user.id)).limit(1)
  if (rows.length === 0) throw new Error("Je hebt nog geen winkel")
  const s = rows[0]

  // Banner is een betaalde functie: negeer wijzigingen als het plan het niet toestaat.
  const plan = await effectivePlan(user.id, s.plan)
  const nextBanner = plan.banner ? (input.bannerImage ?? s.bannerImage) : s.bannerImage

  await db
    .update(stores)
    .set({
      name: input.name?.trim() || s.name,
      category: input.category ?? s.category,
      type: input.type && STORE_TYPES.includes(input.type as (typeof STORE_TYPES)[number]) ? input.type : s.type,
      location: input.location ?? s.location,
      description: input.description ?? s.description,
      image: input.image?.trim() || s.image,
      bannerImage: nextBanner,
      phone: input.phone ?? s.phone,
      email: input.email ?? s.email,
      website: input.website ?? s.website,
      instagram: input.instagram ?? s.instagram,
      facebook: input.facebook ?? s.facebook,
    })
    .where(eq(stores.id, s.id))

  revalidatePath("/dashboard")
  revalidatePath(`/kramen/${s.slug}`)
  return { ok: true }
}
