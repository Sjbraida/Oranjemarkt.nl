import Link from "next/link"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { categories } from "@/components/categories-section"
import { getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = { title: "Categorieën | OranjeMarkt" }

export default async function CategoriesPage() {
  const [user, favoriteIds] = await Promise.all([getCurrentUser(), getFavoriteProductIds()])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Alle categorieën" subtitle="Ontdek producten per categorie in de bazaar" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {categories.map(({ label, icon: Icon }) => (
          <Link
            key={label}
            href={`/categorie/${encodeURIComponent(label)}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </span>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </SiteShell>
  )
}
