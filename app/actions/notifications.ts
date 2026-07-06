"use server"

import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function markAllNotificationsRead() {
  const user = await requireUser()
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id))
  revalidatePath("/")
  return { ok: true }
}

export async function markNotificationRead(id: number) {
  const user = await requireUser()
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)))
  return { ok: true }
}
