"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Store, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Categorieën", icon: LayoutGrid, href: "/categorieen" },
  { label: "Kramen", icon: Store, href: "/kramen" },
  { label: "Berichten", icon: MessageSquare, href: "/berichten" },
  { label: "Account", icon: User, href: "/dashboard" },
]

export function MobileNav({ messagesCount = 0 }: { messagesCount?: number }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const showBadge = item.label === "Berichten" && messagesCount > 0
          return (
            <li key={item.label} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {messagesCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
