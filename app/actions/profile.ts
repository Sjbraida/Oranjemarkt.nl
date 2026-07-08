"use server"

import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function updateProfile(input: { name?: string; image?: string }) {
  const currentUser = await requireUser()

  const rows = await db.select().from(userTable).where(eq(userTable.id, currentUser.id)).limit(1)
  if (rows.length === 0) throw new Error("Gebruiker niet gevonden")
  const u = rows[0]

  await db
    .update(userTable)
    .set({
      name: input.name?.trim() || u.name,
      // Leeg tekstveld ("") betekent bewust wissen; undefined laat de huidige waarde staan.
      image: input.image === undefined ? u.image : input.image.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, u.id))

  revalidatePath("/profiel")
  revalidatePath("/", "layout")
  return { ok: true }
}
