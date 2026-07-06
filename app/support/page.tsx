import Link from "next/link"
import { redirect } from "next/navigation"
import { LifeBuoy, ChevronRight } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { getCurrentUser, getFavoriteProductIds } from "@/lib/queries"
import { getMyTickets } from "@/lib/admin-queries"
import { NewTicketForm } from "@/components/support/new-ticket-form"
import { cn } from "@/lib/utils"

export const metadata = { title: "Support | Oranjemarkt" }

const STATUS_STYLES: Record<string, string> = {
  open: "bg-primary/15 text-primary",
  in_behandeling: "bg-secondary text-foreground",
  gesloten: "bg-secondary text-muted-foreground",
}

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_behandeling: "In behandeling",
  gesloten: "Gesloten",
}

export default async function SupportPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in?redirect=/support")

  const [favoriteIds, tickets] = await Promise.all([getFavoriteProductIds(), getMyTickets(user.id)])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Hulp & support" subtitle="Stel je vraag aan het Oranjemarkt-team." />

      <div className="mb-6">
        <NewTicketForm />
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
          <LifeBuoy className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Je hebt nog geen support-tickets. Maak er een aan om te starten.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {tickets.map((t, i) => (
            <Link
              key={t.id}
              href={`/support/${t.id}`}
              className={cn(
                "flex items-center gap-3 bg-card px-4 py-3.5 transition-colors hover:bg-secondary/40",
                i !== tickets.length - 1 && "border-b border-border",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
                  {t.subject}
                  {Number(t.unread) > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                      {t.unread}
                    </span>
                  )}
                </p>
                <p className="truncate text-xs capitalize text-muted-foreground">
                  {t.category} · {new Date(t.updatedAt).toLocaleDateString("nl-NL")}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  STATUS_STYLES[t.status] ?? "bg-secondary text-muted-foreground",
                )}
              >
                {STATUS_LABELS[t.status] ?? t.status}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </SiteShell>
  )
}
