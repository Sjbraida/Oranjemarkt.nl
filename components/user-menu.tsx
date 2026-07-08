"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, LayoutDashboard, User, Heart, LogOut, Package, LifeBuoy, ShieldAlert } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserInfo = { name: string; email: string; image?: string | null }

export function UserMenu({ user, isAdmin = false }: { user: UserInfo; isAdmin?: boolean }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-1 py-1 outline-none transition-colors hover:border-border focus-visible:border-border">
        <UserAvatar src={user.image} name={user.name} className="h-9 w-9" />
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[11px] text-muted-foreground">Mijn account</span>
          <span className="text-sm font-semibold text-foreground">{user.name}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span>{user.name}</span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profiel" />}>
          <User className="mr-2 h-4 w-4" /> Profiel
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/bestellingen" />}>
          <Package className="mr-2 h-4 w-4" /> Mijn bestellingen
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/favorieten" />}>
          <Heart className="mr-2 h-4 w-4" /> Favorieten
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/support" />}>
          <LifeBuoy className="mr-2 h-4 w-4" /> Hulp &amp; support
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin" />} className="font-semibold text-primary focus:text-primary">
              <ShieldAlert className="mr-2 h-4 w-4" /> Admin portaal
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Uitloggen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
