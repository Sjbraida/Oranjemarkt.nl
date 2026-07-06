// Client-veilige rol-definities (geen database-imports).

// De superadmin-e-mail is altijd superadmin, ongeacht de databasewaarde.
export const SUPERADMIN_EMAIL = "salimbraida@gmail.com"

export type Role = "user" | "admin" | "superadmin"

export function isAdminRole(role?: Role | null): boolean {
  return role === "admin" || role === "superadmin"
}
