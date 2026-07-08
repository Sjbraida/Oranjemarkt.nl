// Eén bron van waarheid voor wat elk pakket biedt en afdwingt.
// Elk voordeel dat hier staat, wordt daadwerkelijk in de site gebruikt.

export type PlanCapabilities = {
  name: string
  price: number
  /** Maximaal aantal gepubliceerde producten. */
  maxProducts: number
  /** Verkoopstatistieken zichtbaar in dashboard. */
  stats: boolean
  /** Eigen bannerafbeelding op de kraampagina. */
  banner: boolean
  /** Aantal producten dat als "uitgelicht" gemarkeerd mag worden (0 = niet mogelijk). */
  featuredProducts: number
  /** Sorteerprioriteit in kramen-overzicht en zoekresultaten (hoger = eerder). */
  searchPriority: number
  /** Kraam wordt automatisch uitgelicht op de homepage. */
  homepagePromotion: boolean
  /** Premium-badge op kraam en kaarten. */
  premiumBadge: boolean
  /** AI-hulp voor het schrijven van productbeschrijvingen in het dashboard. */
  aiAssist: boolean
}

export const PLANS = {
  gratis: {
    name: "Kraam huren",
    price: 0,
    maxProducts: 10,
    stats: false,
    banner: false,
    featuredProducts: 0,
    searchPriority: 0,
    homepagePromotion: false,
    premiumBadge: false,
    aiAssist: false,
  },
  kraam: {
    name: "Kraam",
    price: 9.95,
    maxProducts: 100,
    stats: true,
    banner: true,
    featuredProducts: 0,
    searchPriority: 1,
    homepagePromotion: false,
    premiumBadge: false,
    aiAssist: false,
  },
  winkel: {
    name: "Winkel",
    price: 24.95,
    maxProducts: 1000,
    stats: true,
    banner: true,
    featuredProducts: 8,
    searchPriority: 2,
    homepagePromotion: false,
    premiumBadge: false,
    aiAssist: false,
  },
  premium: {
    name: "Premium",
    price: 49.95,
    maxProducts: 100000,
    stats: true,
    banner: true,
    featuredProducts: 20,
    searchPriority: 3,
    homepagePromotion: true,
    premiumBadge: true,
    aiAssist: true,
  },
} as const satisfies Record<string, PlanCapabilities>

export type PlanKey = keyof typeof PLANS

/** Veilige lookup: valt terug op het gratis plan bij een onbekende sleutel. */
export function getPlan(plan: string | null | undefined): PlanCapabilities {
  if (plan && plan in PLANS) return PLANS[plan as PlanKey]
  return PLANS.gratis
}

/** True als een plansleutel geldig is. */
export function isPlanKey(plan: string | null | undefined): plan is PlanKey {
  return !!plan && plan in PLANS
}

/** Toont het maximum als tekst ("Onbeperkt" bij zeer hoge limieten). */
export function formatMaxProducts(max: number): string {
  return max >= 100000 ? "Onbeperkt" : String(max)
}
