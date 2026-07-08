"use client"

import Link from "next/link"
import { Store, Users, BadgeCheck } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import type { HomeStats } from "@/lib/live"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function HeroSection({ initialStats }: { initialStats: HomeStats }) {
  const { data } = useSWR<HomeStats>("/api/home-stats", fetcher, {
    fallbackData: initialStats,
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  })

  const stats = data ?? initialStats

  // Op mobiel: kramen → bezoekers → abonnementen. Op desktop: kramen → abonnementen → bezoekers.
  const items = [
    {
      icon: Store,
      value: stats.activeStores.toLocaleString("nl-NL"),
      label: "Actieve kramen",
      live: false,
      mdOrder: "md:order-1",
    },
    {
      icon: Users,
      value: stats.liveVisitors.toLocaleString("nl-NL"),
      label: "Bezoekers nu online",
      live: true,
      mdOrder: "md:order-3",
    },
    {
      icon: BadgeCheck,
      value: stats.activeSubscriptions.toLocaleString("nl-NL"),
      label: "Actieve abonnementen",
      live: false,
      mdOrder: "md:order-2",
    },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bazaar.png"
        alt="Luxe overdekte marktboulevard met verlichte winkels"
        className="absolute inset-0 h-full w-full object-cover object-[center_28%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/30" />
      <div className="relative flex min-h-[380px] flex-col justify-center gap-6 p-8 md:max-w-xl md:p-12">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          De digitale bazaar van Nederland
        </span>
        <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl">
          Welkom op <span className="text-primary">OranjeMarkt</span>
        </h1>
        <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
          Huur jouw digitale kraam en verkoop aan heel Nederland. Duizenden zelfstandige winkels onder één dak.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/kramen" />} size="lg" className="font-semibold">
            Bekijk kramen
          </Button>
          <Button
            render={<Link href="/verkoop" />}
            size="lg"
            variant="outline"
            className="border-border bg-background/40 font-semibold backdrop-blur hover:bg-background/70"
          >
            Open een kraam
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
          {items.map((s) => (
            <div key={s.label} className={`flex items-center gap-2.5 ${s.mdOrder}`}>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-card/70 text-primary backdrop-blur">
                <s.icon className="h-4 w-4" />
                {s.live && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                )}
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold text-foreground">{s.value}</span>
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
