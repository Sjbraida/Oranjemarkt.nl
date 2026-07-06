import { redirect } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { CartView } from "@/components/cart-view"
import { getCurrentUser, getFavoriteProductIds, getCartLines } from "@/lib/queries"

export const metadata = { title: "Winkelwagen | OranjeMarkt" }

export default async function CartPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in?redirect=/winkelwagen")

  const [favoriteIds, lines] = await Promise.all([getFavoriteProductIds(), getCartLines()])

  const count = lines.reduce((s, l) => s + l.quantity, 0)

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader
        title="Winkelwagen"
        subtitle={count > 0 ? `${count} ${count === 1 ? "artikel" : "artikelen"} klaar om af te rekenen` : "Je winkelwagen is leeg"}
      />
      <CartView
        initialLines={lines.map((l) => ({
          id: l.id,
          slug: l.slug,
          name: l.name,
          price: l.price,
          image: l.image,
          storeName: l.storeName,
          stock: l.stock,
          qty: l.quantity,
        }))}
        defaultName={user.name ?? ""}
      />
    </SiteShell>
  )
}
