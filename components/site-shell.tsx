import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopHeader } from "@/components/top-header"
import { MobileNav } from "@/components/mobile-nav"
import { getCartCount, getUnreadMessageCount } from "@/lib/queries"

type UserInfo = { name: string; email: string; image?: string | null } | null

export async function SiteShell({
  user,
  favoritesCount = 0,
  children,
}: {
  user: UserInfo
  favoritesCount?: number
  children: React.ReactNode
}) {
  const [cartCount, messagesCount] = user
    ? await Promise.all([getCartCount(), getUnreadMessageCount()])
    : [0, 0]

  return (
    <div className="min-h-screen bg-background">
      <TopHeader
        user={user}
        favoritesCount={favoritesCount}
        cartCount={cartCount}
        messagesCount={messagesCount}
      />
      <div className="flex">
        <AppSidebar favoritesCount={favoritesCount} messagesCount={messagesCount} />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 md:px-6 lg:pb-6">{children}</main>
      </div>
      <MobileNav messagesCount={messagesCount} />
    </div>
  )
}
