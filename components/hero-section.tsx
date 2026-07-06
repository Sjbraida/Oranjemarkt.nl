import Link from "next/link"
import { Store, Users, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { icon: Store, value: "2.400+", label: "Actieve kramen" },
  { icon: Users, value: "180K", label: "Bezoekers p/m" },
  { icon: ShieldCheck, value: "0%", label: "Commissie" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bazaar.png"
        alt="Luxe overdekte marktboulevard met verlichte winkels"
        className="absolute inset-0 h-full w-full object-cover"
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
        <div className="mt-2 flex flex-wrap gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/70 text-primary backdrop-blur">
                <s.icon className="h-4 w-4" />
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
