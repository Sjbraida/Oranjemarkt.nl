import { getAllStoresAdmin } from "@/lib/admin-queries"
import { getCurrentAdmin } from "@/lib/admin"
import { AdminStores } from "@/components/admin/admin-stores"

export const metadata = { title: "Kramen | Admin" }

export default async function AdminStoresPage() {
  const [stores, admin] = await Promise.all([getAllStoresAdmin(), getCurrentAdmin()])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kramen</h1>
        <p className="text-sm text-muted-foreground">{stores.length} kraam/kramen op het platform.</p>
      </div>
      <AdminStores stores={stores} role={admin?.role ?? "admin"} />
    </div>
  )
}
