"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Store,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  Tag,
  Package,
  MessageSquare,
  Heart,
  Settings,
  Plus,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const mainNav = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Categorieën", icon: LayoutGrid, href: "/categorieen" },
  { label: "Alle kramen", icon: Store, href: "/kramen" },
  { label: "Nieuwe producten", icon: Sparkles, href: "/nieuw" },
  { label: "Top verkopers", icon: TrendingUp, href: "/top-verkopers" },
  { label: "Aanbiedingen", icon: Tag, href: "/aanbiedingen", badge: "Nieuw" },
]

const accountNav = [
  { label: "Mijn winkel", icon: Store, href: "/dashboard" },
  { label: "Producten", icon: Package, href: "/dashboard?sectie=producten" },
  { label: "Bestellingen", icon: Tag, href: "/dashboard?sectie=bestellingen" },
  { label: "Berichten", icon: MessageSquare, href: "/berichten" },
  { label: "Statistieken", icon: BarChart3, href: "/dashboard?sectie=overzicht" },
  { label: "Favorieten", icon: Heart, href: "/favorieten" },
  { label: "Instellingen", icon: Settings, href: "/dashboard?sectie=instellingen" },
]

export function AppSidebar({
  favoritesCount = 0,
  messagesCount = 0,
}: {
  favoritesCount?: number
  messagesCount?: number
}) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border bg-sidebar px-4 py-6 lg:flex">
      <nav className="flex flex-col gap-1">
        {mainNav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/20 text-primary",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold tracking-widest text-primary">MIJN ORANJEMARKT</p>
        {accountNav.map((item) => {
          const count =
            item.label === "Favorieten" ? favoritesCount : item.label === "Berichten" ? messagesCount : undefined
          const active = pathname === item.href && item.href !== "/account"
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              {count ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      <Button render={<Link href="/verkoop" />} className="w-full gap-2 font-semibold">
        <Plus className="h-4 w-4" />
        Kraam huren
      </Button>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Start jouw eigen kraam</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Bereik duizenden kopers en groei jouw business op Oranjemarkt.
        </p>
        <Button
          render={<Link href="/verkoop" />}
          variant="outline"
          className="mt-3 w-full justify-between gap-2 border-border bg-transparent text-xs font-medium hover:bg-sidebar-accent"
        >
          Ontdek de voordelen
          <ArrowRight className="h-4 w-4" />
        </Button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/promo-stall.png" alt="Marktkraam met producten" className="mt-4 w-full rounded-lg object-cover" />
      </div>
    </aside>
  )
}
