import Link from "next/link"
import { Sparkles, ArrowUpToLine, ImageIcon, BadgeCheck, Megaphone, TrendingUp, Eye, Users } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { getCurrentUser, getFavoriteProductIds } from "@/lib/queries"

export const metadata = {
  title: "Adverteren | OranjeMarkt",
  description: "Vergroot je bereik op OranjeMarkt. Promoot producten, zet je winkel bovenaan of boek een homepage banner.",
}

const options = [
  {
    icon: Sparkles,
    title: "Product promoten",
    price: "€1,99",
    note: "eenmalig",
    desc: "Zet één product in de kijker met een uitgelicht label en hogere positie in de resultaten.",
  },
  {
    icon: ArrowUpToLine,
    title: "Winkel bovenaan",
    price: "€9,99",
    note: "per week",
    desc: "Jouw volledige kraam bovenaan de zoekresultaten en categoriepagina's.",
  },
  {
    icon: ImageIcon,
    title: "Homepage banner",
    price: "€49,99",
    note: "per week",
    desc: "Een grote banner op de OranjeMarkt homepage — maximale zichtbaarheid voor heel Nederland.",
  },
  {
    icon: BadgeCheck,
    title: "Verificatie",
    price: "€19,95",
    note: "eenmalig",
    desc: "Krijg een geverifieerd-badge en win het vertrouwen van kopers.",
  },
]

const stats = [
  { icon: Eye, value: "2,4 mln", label: "weergaven per maand" },
  { icon: Users, value: "180K+", label: "actieve bezoekers" },
  { icon: TrendingUp, value: "+65%", label: "meer verkopen met promotie" },
]

export default async function AdverterenPage() {
  const [user, favoriteIds] = await Promise.all([getCurrentUser(), getFavoriteProductIds()])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      <PageHeader title="Adverteren op OranjeMarkt" subtitle="Vergroot je bereik en verkoop meer" />

      {/* Hero */}
      <section className="mb-8 flex flex-col items-center gap-4 rounded-2xl border border-primary/25 bg-gradient-to-br from-card to-secondary p-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Megaphone className="h-3.5 w-3.5" />
          Bereik duizenden kopers
        </span>
        <h1 className="max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Laat jouw winkel opvallen op de grootste digitale bazaar
        </h1>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Promoties zijn optioneel en betaal je los — nooit een percentage van je omzet. Kies wat bij je past en groei
          op je eigen tempo.
        </p>
      </section>

      {/* Stats */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Advertising options */}
      <div className="grid gap-5 md:grid-cols-2">
        {options.map((o) => (
          <div key={o.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <o.icon className="h-6 w-6" />
              </span>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-gold">{o.price}</p>
                <p className="text-xs text-muted-foreground">{o.note}</p>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{o.title}</h3>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{o.desc}</p>
            <Button render={<Link href="/dashboard?sectie=promoties" />} className="mt-5 w-full font-semibold">
              Nu boeken
            </Button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="mt-12 rounded-2xl border border-gold/25 bg-card p-8 text-center">
        <h2 className="text-balance text-2xl font-extrabold text-foreground">Nog geen kraam?</h2>
        <p className="mx-auto mt-2 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          Open eerst je eigen digitale kraam en start daarna met adverteren om nog meer kopers te bereiken.
        </p>
        <Button render={<Link href="/verkoop" />} size="lg" className="mt-6 font-semibold">
          Open jouw kraam
        </Button>
      </section>
    </SiteShell>
  )
}
