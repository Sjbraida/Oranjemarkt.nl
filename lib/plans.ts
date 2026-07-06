export const PLANS = {
  gratis: { name: "Kraam huren", price: 0, maxProducts: 10 },
  kraam: { name: "Kraam", price: 9.95, maxProducts: 100 },
  winkel: { name: "Winkel", price: 24.95, maxProducts: 1000 },
  premium: { name: "Premium", price: 49.95, maxProducts: 100000 },
} as const

export type PlanKey = keyof typeof PLANS
