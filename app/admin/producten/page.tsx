import { getAllProductsAdmin } from "@/lib/admin-queries"
import { AdminProducts } from "@/components/admin/admin-products"

export const metadata = { title: "Producten & diensten | Admin" }

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Producten &amp; diensten</h1>
        <p className="text-sm text-muted-foreground">{products.length} item(s) op het platform.</p>
      </div>
      <AdminProducts products={products} />
    </div>
  )
}
