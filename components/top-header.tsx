import Link from "next/link"
import { MessageSquare, Heart, ShoppingCart } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/components/search-form"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"

type UserInfo = { name: string; email: string; image?: string | null } | null

const primaryNav = [
  { label: "Categorieën", href: "/categorieen" },
  { label: "Kramen", href: "/kramen" },
  { label: "Bedrijven", href: "/kramen" },
  { label: "Nieuwe producten", href: "/nieuw" },
  { label: "Top verkopers", href: "/top-verkopers" },
  { label: "Aanbiedingen", href: "/aanbiedingen" },
  { label: "Verkoop", href: "/verkoop" },
]

function IconAction({
  href,
  icon: Icon,
  label,
  count,
  mobile = false,
}: {
  href: string
  icon: typeof MessageSquare
  label: string
  count?: number
  mobile?: boolean
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "relative flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-foreground md:flex",
        mobile ? "flex" : "hidden",
      )}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {count !== undefined && count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </span>
      <span className="hidden text-[11px] font-medium md:block">{label}</span>
    </Link>
  )
}

export function TopHeader({
  user,
  favoritesCount = 0,
  cartCount = 0,
  messagesCount = 0,
  isAdmin = false,
}: {
  user?: UserInfo
  favoritesCount?: number
  cartCount?: number
  messagesCount?: number
  isAdmin?: boolean
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Inline search on tablet/desktop */}
        <div className="hidden min-w-0 flex-1 md:flex">
          <SearchForm />
        </div>

        {/* Spacer pushes actions right on mobile where search is on its own row */}
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-5">
          <IconAction href="/winkelwagen" icon={ShoppingCart} label="Winkelwagen" count={cartCount} mobile />
          <IconAction href="/berichten" icon={MessageSquare} label="Berichten" count={messagesCount} />
          <IconAction href="/favorieten" icon={Heart} label="Favorieten" count={favoritesCount} />
        </div>

        {user ? (
          <UserMenu user={user} isAdmin={isAdmin} />
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              render={<Link href="/sign-in" />}
              variant="outline"
              className="border-border bg-transparent font-semibold"
            >
              Inloggen
            </Button>
            <Button render={<Link href="/sign-up" />} className="hidden font-semibold sm:inline-flex">
              Registreren
            </Button>
          </div>
        )}
      </div>

      {/* Full-width search on mobile */}
      <div className="px-4 pb-3 md:hidden">
        <SearchForm />
      </div>

      <nav className="hidden items-center gap-1 border-t border-border px-6 lg:flex">
        {primaryNav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="relative px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/verkoop"
          className="ml-auto flex items-center gap-1.5 py-2.5 text-sm font-semibold text-gold transition-opacity hover:opacity-80"
        >
          Geen commissie · Alleen abonnement
        </Link>
      </nav>
    </header>
  )
}
