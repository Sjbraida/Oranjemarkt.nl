"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Store,
  Users,
  Euro,
  LifeBuoy,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import type { Role } from "@/lib/roles"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/producten", label: "Producten & diensten", icon: Package },
  { href: "/admin/kramen", label: "Kramen", icon: Store },
  { href: "/admin/verkoop", label: "Verkoop", icon: Euro },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/moderatie", label: "Moderatie", icon: ShieldAlert },
  { href: "/admin/gebruikers", label: "Gebruikers", icon: Users, superadmin: true },
]

export function AdminShell({
  children,
  role,
  name,
  supportBadge = 0,
}: {
  children: React.ReactNode
  role: Role
  name: string
  supportBadge?: number
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const items = NAV.filter((n) => !n.superadmin || role === "superadmin")

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  const NavLinks = () => (
    <>
      {items.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href)
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-3">
              <n.icon className="h-[18px] w-[18px]" />
              {n.label}
            </span>
            {n.href === "/admin/support" && supportBadge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                {supportBadge}
              </span>
            )}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">Admin portaal</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {role === "superadmin" && <Crown className="h-3 w-3 text-primary" />}
                {role === "superadmin" ? "Superadmin" : "Admin"} · {name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Naar site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Uitloggen</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border p-4 lg:block">
          <nav className="flex flex-col gap-1">
            <NavLinks />
          </nav>
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button className="absolute inset-0 bg-foreground/40" aria-label="Sluiten" onClick={() => setOpen(false)} />
            <nav className="absolute left-0 top-[57px] flex w-64 flex-col gap-1 border-r border-border bg-card p-4 pb-8 shadow-xl">
              <NavLinks />
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-[18px] w-[18px]" />
                Naar site
              </Link>
            </nav>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
