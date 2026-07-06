import { redirect } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { MessagesView, type InboxConversation } from "@/components/messages-view"
import { getCurrentUser, getFavoriteProductIds, getInbox } from "@/lib/queries"

export const metadata = { title: "Berichten | OranjeMarkt" }

export default async function MessagesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const [favoriteIds, inbox] = await Promise.all([getFavoriteProductIds(), getInbox()])

  const conversations: InboxConversation[] = inbox.map((c) => ({
    id: c.id,
    name: c.counterpartName,
    viewerIsSeller: c.viewerIsSeller,
    storeSlug: c.storeSlug ?? null,
    preview: c.preview,
    unread: c.unread,
    updatedAt: c.updatedAt.toISOString(),
    messages: c.messages.map((m) => ({
      id: m.id,
      mine: m.mine,
      body: m.body,
      time: new Date(m.createdAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
    })),
  }))

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Berichten" subtitle="Chat direct met kopers en verkopers" />
      <MessagesView conversations={conversations} />
    </SiteShell>
  )
}
