// Deterministic, seedable helpers to enrich stores/products with realistic
// metadata (reviews, sales, opening hours, socials) without a dedicated schema.
// Everything is derived from stable seeds so it never shifts between renders.

function seeded(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const DUTCH_NAMES = [
  "Sanne de Vries",
  "Daan Jansen",
  "Emma Bakker",
  "Lucas Visser",
  "Julia Smit",
  "Sem Meijer",
  "Noa de Boer",
  "Finn Mulder",
  "Tess van Dijk",
  "Bram Peters",
  "Lieke Hendriks",
  "Thijs Dekker",
]

const REVIEW_SNIPPETS = [
  "Snelle levering en topkwaliteit. Zeker een aanrader!",
  "Precies zoals beschreven, netjes verpakt. Dankjewel!",
  "Fijne verkoper, reageert snel op berichten.",
  "Product ziet er nog beter uit in het echt. Blij mee!",
  "Alles perfect verlopen, kom hier zeker terug.",
  "Goede prijs-kwaliteitverhouding en vriendelijk contact.",
  "Super tevreden, aanrader voor iedereen die twijfelt.",
  "Nette winkel met een breed assortiment. 5 sterren!",
]

export type Review = {
  id: number
  author: string
  initials: string
  rating: number
  date: string
  text: string
}

export function getStoreReviews(storeId: number, count = 6): Review[] {
  const rand = seeded(storeId * 97 + 13)
  const reviews: Review[] = []
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const name = DUTCH_NAMES[Math.floor(rand() * DUTCH_NAMES.length)]
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    const rating = rand() > 0.25 ? 5 : 4
    const daysAgo = Math.floor(rand() * 120) + 1
    const date = new Date(now - daysAgo * 86400000).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    reviews.push({
      id: i,
      author: name,
      initials,
      rating,
      date,
      text: REVIEW_SNIPPETS[Math.floor(rand() * REVIEW_SNIPPETS.length)],
    })
  }
  return reviews
}

const MONTHS = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
]

export function getStoreMeta(storeId: number, reviews: number) {
  const rand = seeded(storeId * 41 + 7)
  const sales = Math.floor(reviews * (2 + rand() * 4)) + 40
  const year = 2019 + Math.floor(rand() * 5)
  const month = MONTHS[Math.floor(rand() * 12)]
  const responseMinutes = Math.floor(rand() * 55) + 5
  return {
    sales,
    memberSince: `${month} ${year}`,
    responseTime: `${responseMinutes} min`,
    openingHours: [
      { day: "Maandag t/m vrijdag", hours: "09:00 – 18:00" },
      { day: "Zaterdag", hours: "10:00 – 17:00" },
      { day: "Zondag", hours: "Gesloten" },
    ],
    socials: [
      { platform: "instagram", handle: "@" + slugHandle(storeId) },
      { platform: "facebook", handle: slugHandle(storeId) },
      { platform: "website", handle: slugHandle(storeId) + ".nl" },
    ],
  }
}

function slugHandle(storeId: number) {
  return "oranjemarkt" + ((storeId % 90) + 10)
}

export type SellerOrder = {
  id: string
  product: string
  buyer: string
  amount: number
  status: "Nieuw" | "Verzonden" | "Geleverd"
  date: string
}

const ORDER_STATUS: SellerOrder["status"][] = ["Nieuw", "Verzonden", "Geleverd"]

export function getSellerOrders(seed: number, products: { name: string; price: number }[], count = 8): SellerOrder[] {
  if (products.length === 0) return []
  const rand = seeded(seed * 53 + 3)
  const now = Date.now()
  const orders: SellerOrder[] = []
  for (let i = 0; i < count; i++) {
    const p = products[Math.floor(rand() * products.length)]
    const buyer = DUTCH_NAMES[Math.floor(rand() * DUTCH_NAMES.length)]
    const daysAgo = Math.floor(rand() * 30)
    orders.push({
      id: "OM-" + (10248 + i),
      product: p.name,
      buyer,
      amount: p.price,
      status: ORDER_STATUS[Math.floor(rand() * 3)],
      date: new Date(now - daysAgo * 86400000).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
    })
  }
  return orders
}

export type SellerMessage = {
  id: number
  name: string
  initials: string
  preview: string
  time: string
  unread: boolean
}

const MSG_PREVIEWS = [
  "Is dit product nog beschikbaar?",
  "Kunt u iets van de prijs af doen?",
  "Wanneer wordt mijn bestelling verzonden?",
  "Bedankt, snelle levering!",
  "Heeft u dit ook in een andere maat?",
  "Kan ik het ophalen in de winkel?",
]

export function getSellerMessages(seed: number, count = 5): SellerMessage[] {
  const rand = seeded(seed * 71 + 9)
  const msgs: SellerMessage[] = []
  for (let i = 0; i < count; i++) {
    const name = DUTCH_NAMES[Math.floor(rand() * DUTCH_NAMES.length)]
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    const mins = Math.floor(rand() * 600)
    const time = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} u`
    msgs.push({
      id: i,
      name,
      initials,
      preview: MSG_PREVIEWS[Math.floor(rand() * MSG_PREVIEWS.length)],
      time,
      unread: i < 3,
    })
  }
  return msgs
}

export function getSellerStats(seed: number, orders: SellerOrder[]) {
  const rand = seeded(seed * 29 + 5)
  const revenue = orders.reduce((s, o) => s + o.amount, 0)
  const views = Math.floor(rand() * 4000) + 1200
  const conversion = ((orders.length / views) * 100).toFixed(1)
  // 7-day revenue sparkline
  const week = Array.from({ length: 7 }).map(() => Math.floor(rand() * 400) + 50)
  return { revenue, views, conversion, orderCount: orders.length, week }
}

export { hashString }
