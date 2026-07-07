import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { KramenLive } from "@/components/kramen-live"
import { getAllStores, getCurrentUser, getFavoriteProductIds } from "@/lib/queries"
import { getLiveSnapshot } from "@/lib/live"

export const metadata = { title: "Alle kramen | Oranjemarkt" }

// Altijd verse live cijfers bij het laden van de pagina.
export const dynamic = "force-dynamic"

export default async function KramenPage() {
  const [stores, user, favoriteIds, snapshot] = await Promise.all([
    getAllStores(),
    getCurrentUser(),
    getFavoriteProductIds(),
    getLiveSnapshot(),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Alle kramen" subtitle={`${stores.length} kramen op Oranjemarkt`} />
      <KramenLive stores={stores} initialSnapshot={snapshot} />
    </SiteShell>
  )
}
