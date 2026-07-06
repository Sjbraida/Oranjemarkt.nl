import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getTicketById, getTicketMessages } from "@/lib/admin-queries"
import { requireAdmin } from "@/lib/admin"
import { markTicketRead } from "@/app/actions/support"
import { TicketChat } from "@/components/support/ticket-chat"

export const metadata = { title: "Ticket | Admin" }

export default async function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const ticketId = Number.parseInt(id)
  if (Number.isNaN(ticketId)) notFound()

  const ticket = await getTicketById(ticketId)
  if (!ticket) notFound()

  const messages = await getTicketMessages(ticketId)
  // Markeer gebruikersberichten als gelezen door de admin.
  await markTicketRead(ticketId, "admin")

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/admin/support" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Terug naar tickets
      </Link>
      <div>
        <h1 className="text-xl font-bold text-foreground">{ticket.subject}</h1>
        <p className="text-sm capitalize text-muted-foreground">Categorie: {ticket.category}</p>
      </div>
      <TicketChat ticketId={ticketId} initialMessages={messages} side="admin" status={ticket.status} />
    </div>
  )
}
