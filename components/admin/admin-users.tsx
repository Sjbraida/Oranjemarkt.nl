"use client"

import { useState } from "react"
import { Search, Ban, ShieldCheck, Crown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { adminSetUserRole, adminSetUserBanned } from "@/app/actions/admin"
import { SUPERADMIN_EMAIL, type Role } from "@/lib/roles"

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  banned: boolean
}

const ROLE_LABELS: Record<string, string> = {
  user: "Gebruiker",
  admin: "Admin",
  superadmin: "Superadmin",
}

export function AdminUsers({ users, currentRole }: { users: AdminUserRow[]; currentRole: Role }) {
  const [query, setQuery] = useState("")
  const [rows, setRows] = useState(users)
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = rows.filter(
    (u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()),
  )

  const changeRole = async (id: string, role: string) => {
    setBusy(id)
    try {
      await adminSetUserRole(id, role as Role)
      setRows((r) => r.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Er ging iets mis")
    } finally {
      setBusy(null)
    }
  }

  const toggleBan = async (id: string, banned: boolean) => {
    setBusy(id)
    try {
      await adminSetUserBanned(id, banned)
      setRows((r) => r.map((u) => (u.id === id ? { ...u, banned } : u)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Er ging iets mis")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op naam of e-mail"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {filtered.length === 0 ? (
          <p className="bg-card p-8 text-center text-sm text-muted-foreground">Geen gebruikers gevonden.</p>
        ) : (
          filtered.map((u, i) => {
            const isMainSuper = u.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
            return (
              <div
                key={u.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 bg-card px-4 py-3",
                  i !== filtered.length - 1 && "border-b border-border",
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
                    {u.name}
                    {u.role === "superadmin" && <Crown className="h-3 w-3 text-primary" />}
                    {u.banned && (
                      <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                        Geblokkeerd
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>

                {currentRole === "superadmin" && !isMainSuper ? (
                  <select
                    value={u.role}
                    disabled={busy === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="user">Gebruiker</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                ) : (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {ROLE_LABELS[u.role] ?? u.role}
                  </span>
                )}

                {!isMainSuper && (
                  <button
                    onClick={() => toggleBan(u.id, !u.banned)}
                    disabled={busy === u.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      u.banned
                        ? "border-border text-foreground hover:bg-secondary"
                        : "border-border text-destructive hover:bg-destructive/10",
                    )}
                  >
                    {u.banned ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    {u.banned ? "Deblokkeer" : "Blokkeer"}
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
      {currentRole !== "superadmin" && (
        <p className="text-xs text-muted-foreground">Alleen een superadmin kan rollen wijzigen.</p>
      )}
    </div>
  )
}
