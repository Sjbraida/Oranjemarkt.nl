import Link from "next/link"
import { Check, Star, ArrowRight, Store, Package, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

const reasons = ["Eigen kraam", "Onbeperkt producten", "Volgers & reviews", "Chat met klanten", "Geen opstartkosten"]

const steps = [
  { icon: Store, title: "1. Kraam huren", text: "Kies een abonnement en start jouw eigen kraam." },
  { icon: Package, title: "2. Producten plaatsen", text: "Voeg eenvoudig je producten toe aan je kraam." },
  {
    icon: TrendingUp,
    title: "3. Verkopen & groeien",
    text: "Verkoop, bouw je reputatie op en groei jouw klantenkring.",
  },
]

export type TopSeller = { slug: string; name: string; rating: number; logoText: string }

export function RightColumn({ topSellers }: { topSellers: TopSeller[] }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Waarom Oranjemarkt */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground">Waarom Oranjemarkt?</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-center gap-2.5 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-muted-foreground">{reason}</span>
            </li>
          ))}
        </ul>
        <Button render={<Link href="/sign-up" />} className="mt-5 w-full justify-between gap-2 font-semibold">
          Kies jouw kraam
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Top verkopers */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">Top verkopers</h3>
          <Link href="/kramen" className="text-xs font-medium text-primary hover:underline">
            Bekijk alle
          </Link>
        </div>
        <ul className="mt-4 flex flex-col gap-4">
          {topSellers.map((seller, i) => (
            <li key={seller.slug}>
              <Link href={`/kramen/${seller.slug}`} className="flex items-center gap-3 group">
                <span className="w-3 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary px-1 text-center text-[8px] font-bold leading-tight text-primary">
                  {seller.logoText}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary">
                  {seller.name}
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">{seller.rating}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Zo werkt Oranjemarkt */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground">Zo werkt Oranjemarkt</h3>
        <ul className="mt-4 flex flex-col gap-4">
          {steps.map((step) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{step.title}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{step.text}</span>
              </div>
            </li>
          ))}
        </ul>
        <Button
          render={<Link href="/sign-up" />}
          variant="outline"
          className="mt-5 w-full border-border bg-transparent font-semibold hover:bg-sidebar-accent"
        >
          Meer informatie
        </Button>
      </div>
    </div>
  )
}
