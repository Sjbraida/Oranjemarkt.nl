import Link from "next/link"
import { Sparkles, Megaphone, ArrowUpToLine, ImageIcon, BadgeCheck, BadgePercent } from "lucide-react"
import { SiteShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { SubscribePlans, type PlanCard } from "@/components/subscribe-plans"
import { getCurrentUser, getFavoriteProductIds, getMyStore, getActiveSubscription } from "@/lib/queries"

export const metadata = {
  title: "Kraam huren & abonnementen | OranjeMarkt",
  description: "Start gratis of kies een abonnement. Geen commissie over je verkopen op OranjeMarkt.",
}

const plans: PlanCard[] = [
  {
    key: "gratis",
    name: "Kraam huren",
    price: "€0",
    period: "gratis voor altijd",
    description: "Perfect om te beginnen op de bazaar.",
    features: ["Tot 10 producten", "Live chat met kopers", "Reviews ontvangen", "Eigen winkelpagina"],
    cta: "Start gratis",
    highlight: false,
  },
  {
    key: "kraam",
    name: "Kraam",
    price: "€9,95",
    period: "per maand",
    description: "Voor de groeiende verkoper.",
    features: [
      "Tot 100 producten",
      "Verkoopstatistieken",
      "Eigen winkelbanner",
      "Hogere positie in zoekresultaten",
    ],
    cta: "Kies Kraam",
    highlight: false,
  },
  {
    key: "winkel",
    name: "Winkel",
    price: "€24,95",
    period: "per maand",
    description: "De favoriet van serieuze ondernemers.",
    features: [
      "Tot 1.000 producten",
      "8 uitgelichte producten",
      "Kortingsacties",
      "Prioriteit in zoekresultaten",
      "Alles uit Kraam",
    ],
    cta: "Kies Winkel",
    highlight: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: "€49,95",
    period: "per maand",
    description: "Alles onbeperkt, maximaal bereik.",
    features: [
      "Onbeperkt producten",
      "20 uitgelichte producten",
      "Automatische homepage-promotie",
      "Premium-badge op je winkel",
      "AI schrijft je productbeschrijvingen",
      "Hoogste positie in zoekresultaten",
    ],
    cta: "Kies Premium",
    highlight: false,
  },
]

const extras = [
  { icon: Sparkles, title: "Product promoten", price: "€1,99", note: "eenmalig" },
  { icon: ArrowUpToLine, title: "Winkel bovenaan", price: "€9,99", note: "per week" },
  { icon: ImageIcon, title: "Homepage banner", price: "€49,99", note: "per week" },
  { icon: BadgeCheck, title: "Verificatie", price: "€19,95", note: "eenmalig" },
]

export default async function VerkoopPage() {
  const [user, favoriteIds] = await Promise.all([getCurrentUser(), getFavoriteProductIds()])
  const [store, subscription] = await Promise.all([
    user ? getMyStore() : Promise.resolve(null),
    user ? getActiveSubscription(user.id) : Promise.resolve(null),
  ])

  return (
    <SiteShell user={user} favoritesCount={favoriteIds.length}>
      {/* Hero */}
      <section className="mb-10 flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <BadgePercent className="h-3.5 w-3.5" />
          Geen commissie over jouw verkopen
        </span>
        <h1 className="max-w-2xl text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Open jouw eigen digitale kraam
        </h1>
        <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Kies het abonnement dat bij je past. Betaal alleen voor je plan of promoties — nooit een percentage van je
          omzet.
        </p>
      </section>

      {/* Plans */}
      <SubscribePlans
        plans={plans}
        isLoggedIn={!!user}
        hasStore={!!store}
        currentPlan={subscription?.plan ?? (store ? store.plan : null)}
        defaults={{
          name: store?.name ?? "",
          category: store?.category ?? "Algemeen",
          type: store?.type ?? "kraam",
          location: store?.location ?? "",
          description: store?.description ?? "",
        }}
      />

      {/* Extra verdienmodel */}
      <section className="mt-12">
        <div className="mb-5 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Extra zichtbaarheid</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {extras.map((e) => (
            <div key={e.title} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <e.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-gold">{e.price}</span> {e.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* No commission reassurance */}
      <section className="mt-12 rounded-2xl border border-gold/25 bg-gradient-to-br from-card to-secondary p-8 text-center">
        <h2 className="text-balance text-2xl font-extrabold text-foreground">Jij verkoopt, jij verdient.</h2>
        <p className="mx-auto mt-2 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          Verkopers betalen alleen hun abonnement of promoties. OranjeMarkt neemt nooit commissie over jouw verkopen.
        </p>
        <Button
          render={<Link href={store ? "/dashboard" : user ? "/verkoop" : "/sign-up?redirect=/verkoop"} />}
          size="lg"
          className="mt-6 font-semibold"
        >
          {store ? "Naar je dashboard" : "Open jouw kraam"}
        </Button>
      </section>
    </SiteShell>
  )
}
