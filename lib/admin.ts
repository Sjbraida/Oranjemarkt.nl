import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"

// De superadmin-e-mail is altijd superadmin, ongeacht de databasewaarde.
// Zo raak je nooit de toegang kwijt.
export const SUPERADMIN_EMAIL = "salimbraida@gmail.com"

export type Role = "user" | "admin" | "superadmin"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: Role
  banned: boolean
}

/** Haalt de ingelogde gebruiker op inclusief rol uit de database. */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  // Veiligheidsnet: de vaste superadmin-e-mail is altijd superadmin.
  const isSuperEmail = row.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
  const role = (isSuperEmail ? "superadmin" : (row.role as Role)) ?? "user"

  return { id: row.id, name: row.name, email: row.email, role, banned: row.banned }
}

export function isAdminRole(role?: Role | null): boolean {
  return role === "admin" || role === "superadmin"
}

/** Werpt een fout als de gebruiker geen admin of superadmin is. */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin || !isAdminRole(admin.role)) {
    throw new Error("Forbidden")
  }
  return admin
}

/** Werpt een fout als de gebruiker geen superadmin is. */
export async function requireSuperadmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin || admin.role !== "superadmin") {
    throw new Error("Forbidden")
  }
  return admin
}
