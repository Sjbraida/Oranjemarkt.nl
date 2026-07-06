"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/format"
import { adminUpdateOrderStatus } from "@/app/actions/admin"

export type AdminOrder = {
  id: number
  status: string
  total: number
  buyerName: string | null
  city: string | null
  paymentMethod: string | null
  createdAt: Date | string
  itemCount: number
}

const STATUSES = ["nieuw", "betaald", "verzonden", "geleverd", "geannuleerd"]

const STATUS_STYLES: Record<string, string> = {
  nieuw: "bg-primary/15 text-primary",
  betaald: "bg-primary/15 text-primary",
  verzonden: "bg-secondary text-foreground",
  geleverd: "bg-secondary text-foreground",
  geannuleerd: "bg-destructive/15 text-destructive",
}

export function AdminOrders({ orders }: { orders: AdminOrder[] }) {
  const [rows, setRows] = useState(orders)
  const [busy, setBusy] = useState<number | null>(null)

  const changeStatus = async (id: number, status: string) => {
    setBusy(id)
    try {
      await adminUpdateOrderStatus(id, status)
      setRows((r) => r.map((o) => (o.id === id ? { ...o, status } : o)))
    } finally {
      setBusy(null)
    }
  }

  if (rows.length === 0) {
    return <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Nog geen bestellingen.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {rows.map((o, i) => (
        <div
          key={o.id}
          className={cn(
            "flex flex-wrap items-center gap-3 bg-card px-4 py-3",
            i !== rows.length - 1 && "border-b border-border",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              #{o.id} · {o.buyerName ?? "Onbekend"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {o.itemCount} artikel(en) · {o.city ?? "—"} · {new Date(o.createdAt).toLocaleDateString("nl-NL")}
            </p>
          </div>
          <span className="text-sm font-semibold text-foreground">{formatPrice(o.total)}</span>
          <select
            value={o.status}
            disabled={busy === o.id}
            onChange={(e) => changeStatus(o.id, e.target.value)}
            className={cn(
              "rounded-full border-0 px-2.5 py-1 text-xs font-semibold capitalize outline-none",
              STATUS_STYLES[o.status] ?? "bg-secondary text-muted-foreground",
            )}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-background text-foreground">
                {s}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
