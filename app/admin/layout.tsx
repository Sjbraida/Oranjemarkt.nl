import { redirect } from "next/navigation"
import { getCurrentAdmin, isAdminRole } from "@/lib/admin"
import { getAdminUnreadSupportCount } from "@/lib/admin-queries"
import { AdminShell } from "@/components/admin/admin-shell"

export const metadata = { title: "Admin portaal | Oranjemarkt" }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()

  if (!admin) redirect("/sign-in?redirect=/admin")
  if (!isAdminRole(admin.role)) redirect("/")

  const supportBadge = await getAdminUnreadSupportCount()

  return (
    <AdminShell role={admin.role} name={admin.name} supportBadge={supportBadge}>
      {children}
    </AdminShell>
  )
}
