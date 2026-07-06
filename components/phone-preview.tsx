import { Bell, Search, Home, LayoutGrid, MessageSquare, Heart, User, Star } from 'lucide-react'
import { Logo } from '@/components/logo'

const miniCats = [
  { label: 'Elektronica' },
  { label: 'Mode' },
  { label: 'Wonen' },
  { label: 'Schoenen' },
]

export function PhonePreview() {
  return (
    <div className="hidden w-[300px] shrink-0 2xl:block">
      <div className="sticky top-24 overflow-hidden rounded-[2.2rem] border-4 border-border bg-sidebar shadow-2xl">
        {/* status bar / header */}
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <Logo size="sm" showTagline={false} />
          <span className="relative">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary text-[7px] font-bold leading-3 text-primary-foreground">
              3
            </span>
          </span>
        </div>

        <div className="px-4">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              readOnly
              placeholder="Zoek naar producten, kramen..."
              className="h-9 w-full rounded-lg border border-border bg-card pl-8 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* mini hero */}
        <div className="relative m-4 overflow-hidden rounded-xl">
          <img
            src="/hero-market.png"
            alt="Oranjemarkt avondmarkt"
            className="h-32 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center gap-2 p-3">
            <p className="text-sm font-extrabold leading-tight text-foreground">
              Welkom op <span className="text-primary">Oranjemarkt</span>
            </p>
            <p className="max-w-[9rem] text-[8px] leading-tight text-muted-foreground">
              Huur jouw digitale kraam en laat jouw business groeien.
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="w-fit rounded-md bg-primary px-2 py-1 text-[8px] font-bold text-primary-foreground">
                Huur een kraam
              </span>
              <span className="w-fit rounded-md border border-border px-2 py-1 text-[8px] font-medium text-foreground">
                Bekijk alle kramen
              </span>
            </div>
          </div>
        </div>

        {/* mini categories */}
        <div className="px-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground">
              Populaire categorieën
            </p>
            <span className="text-[9px] text-primary">Bekijk alle</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {miniCats.map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                  <LayoutGrid className="h-3.5 w-3.5" />
                </span>
                <span className="text-[7px] text-muted-foreground">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1">
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span className="h-1 w-1 rounded-full bg-border" />
          </div>
        </div>

        {/* mini featured */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground">Uitgelichte kramen</p>
            <span className="text-[9px] text-primary">Bekijk alle</span>
          </div>
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative h-24">
              <img
                src="/store-sneakers.png"
                alt="Sneakers010"
                className="h-full w-full object-cover"
              />
              <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[7px] font-bold text-primary-foreground">
                Top verkoper
              </span>
            </div>
            <div className="flex items-center justify-between p-2">
              <span className="text-[10px] font-semibold text-foreground">
                Sneakers010
              </span>
              <span className="flex items-center gap-0.5 text-[9px]">
                <Star className="h-2.5 w-2.5 fill-primary text-primary" />
                <span className="font-semibold text-foreground">4.9</span>
              </span>
            </div>
            <div className="flex justify-between px-2 pb-2 text-[8px] text-muted-foreground">
              <span>412 producten</span>
              <span>1,2k volgers</span>
            </div>
          </div>
        </div>

        {/* bottom nav */}
        <div className="flex items-center justify-around border-t border-border bg-card py-2.5">
          {[
            { icon: Home, active: true },
            { icon: LayoutGrid },
            { icon: MessageSquare },
            { icon: Heart, count: 12 },
            { icon: User },
          ].map((item, i) => (
            <span
              key={i}
              className={`relative ${item.active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <item.icon className="h-4 w-4" />
              {item.count && (
                <span className="absolute -right-2 -top-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-primary px-0.5 text-[7px] font-bold text-primary-foreground">
                  {item.count}
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
