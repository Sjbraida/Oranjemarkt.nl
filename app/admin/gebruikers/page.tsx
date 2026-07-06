import { redirect } from "next/navigation"
import { getAllUsersAdmin } from "@/lib/admin-queries"
import { getCurrentAdmin } from "@/lib/admin"
import { AdminUsers } from "@/components/admin/admin-users"

export const metadata = { title: "Gebruikers | Admin" }

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin()
  // Gebruikersbeheer is alleen voor superadmins.
  if (admin?.role !== "superadmin") redirect("/admin")

  const users = await getAllUsersAdmin()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gebruikers</h1>
        <p className="text-sm text-muted-foreground">{users.length} account(s). Beheer rollen en toegang.</p>
      </div>
      <AdminUsers users={users} currentRole={admin.role} />
    </div>
  )
}
