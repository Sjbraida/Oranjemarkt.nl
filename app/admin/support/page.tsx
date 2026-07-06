import Link from "next/link"
import { LifeBuoy, ChevronRight } from "lucide-react"
import { getSupportTicketsAdmin } from "@/lib/admin-queries"
import { cn } from "@/lib/utils"

export const metadata = { title: "Support | Admin" }

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

export default async function AdminSupportPage() {
  const tickets = await getSupportTicketsAdmin()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">{tickets.length} ticket(s) van gebruikers.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <LifeBuoy className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Nog geen support-tickets.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {tickets.map((t, i) => (
            <Link
              key={t.id}
              href={`/admin/support/${t.id}`}
              className={cn(
                "flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-secondary/40",
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
                <p className="truncate text-xs text-muted-foreground">
                  {t.userName ?? "Onbekend"} · {t.category} · {new Date(t.updatedAt).toLocaleDateString("nl-NL")}
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
    </div>
  )
}
