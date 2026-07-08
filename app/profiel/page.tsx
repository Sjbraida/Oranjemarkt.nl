import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart, Store, MapPin, Star, Package } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/profile-card"
import { getCurrentUser, getFavoriteProductIds, getTopRatedStores } from "@/lib/queries"

export const metadata = { title: "Mijn profiel | OranjeMarkt" }

export default async function ProfielPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const [favoriteIds, topStores] = await Promise.all([getFavoriteProductIds(), getTopRatedStores(1)])
  const store = topStores[0] ?? null

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })
    : "onlangs"

  const quickLinks = [
    { label: "Mijn bestellingen", href: "/bestellingen", icon: Package, desc: "Bekijk je aankopen" },
    { label: "Favorieten", href: "/favorieten", icon: Heart, desc: `${favoriteIds.length} opgeslagen` },
  ]

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Mijn profiel" subtitle="Je persoonlijke gegevens en snelkoppelingen" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:col-span-2">
          <ProfileCard name={user.name} email={user.email} image={user.image ?? null} memberSince={memberSince} />

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              render={<Link href="/dashboard" />}
              variant="outline"
              className="border-border bg-transparent font-semibold hover:bg-sidebar-accent"
            >
              Naar dashboard
            </Button>
          </div>

          {/* Quick links */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {quickLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <l.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary">{l.label}</p>
                  <p className="text-sm text-muted-foreground">{l.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Store summary */}
        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">Mijn kraam</h3>
            </div>
            {store ? (
              <>
                <p className="text-lg font-semibold text-foreground">{store.name}</p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {store.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gold" /> {store.rating} · {store.followers} volgers
                  </span>
                </div>
                <Button
                  render={<Link href={`/kramen/${store.slug}`} />}
                  variant="outline"
                  className="mt-5 w-full border-border bg-transparent font-semibold hover:bg-sidebar-accent"
                >
                  Bekijk mijn winkel
                </Button>
                <Button
                  render={<Link href="/dashboard?sectie=instellingen" />}
                  className="mt-3 w-full font-semibold"
                >
                  Banner &amp; winkelfoto bewerken
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Je hebt nog geen kraam geopend.</p>
                <Button render={<Link href="/verkoop" />} className="mt-4 w-full font-semibold">
                  Open een kraam
                </Button>
              </>
            )}
          </div>
        </aside>
      </div>
    </SiteShell>
  )
}
