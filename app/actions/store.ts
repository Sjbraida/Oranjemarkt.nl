"use server"

import { db } from "@/lib/db"
import { stores } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateStoreSettings(input: {
  name?: string
  category?: string
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

  await db
    .update(stores)
    .set({
      name: input.name?.trim() || s.name,
      category: input.category ?? s.category,
      location: input.location ?? s.location,
      description: input.description ?? s.description,
      image: input.image?.trim() || s.image,
      bannerImage: input.bannerImage ?? s.bannerImage,
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
