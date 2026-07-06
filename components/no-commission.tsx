import Link from "next/link"
import { BadgePercent, Wallet, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const points = [
  { icon: Wallet, title: "Houd 100% van je omzet", text: "Wij pakken nooit een deel van jouw verkopen af." },
  { icon: BadgePercent, title: "Alleen een abonnement", text: "Betaal een vast bedrag per maand, of start gratis." },
  { icon: TrendingUp, title: "Groei zonder afrekenen", text: "Meer verkopen betekent meer winst — voor jou." },
]

export function NoCommission() {
  return (
    <section className="overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-card to-secondary p-8 md:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
            <BadgePercent className="h-3.5 w-3.5" />
            0% commissie
          </span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Geen commissie over jouw verkopen.
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Bij OranjeMarkt betaal je alleen voor je abonnement of promoties. Elke euro die je verdient, is en blijft
            van jou.
          </p>
          <Button render={<Link href="/verkoop" />} size="lg" className="mt-6 gap-2 font-semibold">
            Bekijk de abonnementen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:max-w-md">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-background/40 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
