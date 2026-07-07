"use client"

import useSWR from "swr"
import { Users, TrendingUp, Store as StoreIcon } from "lucide-react"
import { StoreCard, type StoreCardData, type StoreLive } from "@/components/store-card"
import { formatPrice } from "@/lib/format"

type LiveSnapshot = {
  updatedAt: string
  totalVisitors: number
  totalRevenueToday: number
  totalCommissionToday: number
  activeStores: number
  stores: { storeId: number; visitors: number; revenueToday: number; commissionToday: number }[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function KramenLive({
  stores,
  initialSnapshot,
}: {
  stores: StoreCardData[]
  initialSnapshot: LiveSnapshot
}) {
  const { data } = useSWR<LiveSnapshot>("/api/kramen/live", fetcher, {
    fallbackData: initialSnapshot,
    refreshInterval: 5000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  const snapshot = data ?? initialSnapshot
  const liveMap = new Map<number, StoreLive>()
  for (const s of snapshot.stores) {
    liveMap.set(s.storeId, {
      visitors: s.visitors,
      revenueToday: s.revenueToday,
      commissionToday: s.commissionToday,
    })
  }

  // Sorteer kramen met live bezoekers naar boven zodat "actieve" kramen bovenaan staan.
  const sorted = [...stores].sort((a, b) => (liveMap.get(b.id)?.visitors ?? 0) - (liveMap.get(a.id)?.visitors ?? 0))

  const metrics = [
    { icon: Users, label: "Bezoekers nu online", value: String(snapshot.totalVisitors) },
    { icon: StoreIcon, label: "Actieve kramen", value: String(snapshot.activeStores) },
    { icon: TrendingUp, label: "Omzet vandaag", value: formatPrice(snapshot.totalRevenueToday) },
    { icon: TrendingUp, label: "Commissie vandaag", value: formatPrice(snapshot.totalCommissionToday) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="Live marktactiviteit"
        className="rounded-2xl border border-border bg-card p-4 sm:p-5"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Live marktactiviteit</h2>
          <span className="ml-auto text-xs text-muted-foreground">Realtime bijgewerkt</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-background/50 p-3">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-xl font-bold tabular-nums text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground text-pretty">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((store) => (
          <StoreCard key={store.id} store={store} live={liveMap.get(store.id)} />
        ))}
      </div>
    </div>
  )
}
