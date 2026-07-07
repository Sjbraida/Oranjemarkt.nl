import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { getCurrentUser, getFavoriteProductIds } from "@/lib/queries"
import { getTicketById, getTicketMessages } from "@/lib/admin-queries"
import { markTicketRead } from "@/app/actions/support"
import { TicketChat } from "@/components/support/ticket-chat"

export const metadata = { title: "Support-ticket | Oranjemarkt" }

export default async function UserTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in?redirect=/support")

  const { id } = await params
  const ticketId = Number.parseInt(id)
  if (Number.isNaN(ticketId)) notFound()

  const ticket = await getTicketById(ticketId)
  // Gebruiker mag alleen eigen tickets zien.
  if (!ticket || ticket.userId !== user.id) notFound()

  const [favoriteIds, messages] = await Promise.all([getFavoriteProductIds(), getTicketMessages(ticketId)])
  await markTicketRead(ticketId, "user")

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <div className="mx-auto max-w-2xl space-y-4">
        <Link href="/support" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Terug naar support
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground text-balance">{ticket.subject}</h1>
          <p className="text-sm capitalize text-muted-foreground">Categorie: {ticket.category}</p>
        </div>
        <TicketChat
          ticketId={ticketId}
          initialMessages={messages}
          side="user"
          status={ticket.status}
          currentUserId={user.id}
        />
      </div>
    </SiteShell>
  )
}
