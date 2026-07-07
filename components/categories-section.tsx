import type { ComponentType } from "react"
import Link from "next/link"
import {
  Cpu,
  Shirt,
  Footprints,
  Gem,
  Car,
  Bike,
  Boxes,
  Blocks,
  Gamepad2,
  Smartphone,
  Laptop,
  Watch,
  Sofa,
  Camera,
  Flower2,
  Dumbbell,
  Baby,
  TreePine,
  Music,
  BookOpen,
  Package,
  Landmark,
  Palette,
  Diamond,
  Hourglass,
  Stamp,
  ToyBrick,
  Film,
  Guitar,
  Hammer,
  Utensils,
  Briefcase,
  ShoppingBag,
  Glasses,
  PawPrint,
  HeartPulse,
  Ticket,
  Wine,
  Plane,
} from "lucide-react"
import { SectionHeader } from "@/components/section-header"

/** Eigen icoon voor verzamelkaarten (Pokémon e.d.): een kaart met embleem. */
export function CardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M8 15h8" />
    </svg>
  )
}

export type Category = {
  label: string
  icon: ComponentType<{ className?: string }>
  hall: number
}

// Elke categorie is een "hal" in de bazaar met een eigen halnummer.
// "Overig" blijft altijd als laatste staan (fallback-hal in resolveHall).
export const categories: Category[] = [
  { label: "Elektronica", icon: Cpu, hall: 1 },
  { label: "Mode", icon: Shirt, hall: 2 },
  { label: "Sneakers", icon: Footprints, hall: 3 },
  { label: "Verzamelen", icon: Gem, hall: 4 },
  { label: "Auto", icon: Car, hall: 5 },
  { label: "Motor", icon: Bike, hall: 6 },
  { label: "Pokemon", icon: CardIcon, hall: 7 },
  { label: "Funko", icon: Boxes, hall: 8 },
  { label: "Lego", icon: Blocks, hall: 9 },
  { label: "Gaming", icon: Gamepad2, hall: 10 },
  { label: "Telefoons", icon: Smartphone, hall: 11 },
  { label: "Laptops", icon: Laptop, hall: 12 },
  { label: "Horloges", icon: Watch, hall: 13 },
  { label: "Meubels", icon: Sofa, hall: 14 },
  { label: "Vintage", icon: Camera, hall: 15 },
  { label: "Beauty", icon: Flower2, hall: 16 },
  { label: "Sport", icon: Dumbbell, hall: 17 },
  { label: "Kinderen", icon: Baby, hall: 18 },
  { label: "Huis & Tuin", icon: TreePine, hall: 19 },
  { label: "Muziek", icon: Music, hall: 20 },
  { label: "Boeken", icon: BookOpen, hall: 21 },
  { label: "Kunst", icon: Palette, hall: 22 },
  { label: "Sieraden", icon: Diamond, hall: 23 },
  { label: "Antiek", icon: Hourglass, hall: 24 },
  { label: "Postzegels & Munten", icon: Stamp, hall: 25 },
  { label: "Speelgoed", icon: ToyBrick, hall: 26 },
  { label: "Films & Series", icon: Film, hall: 27 },
  { label: "Muziekinstrumenten", icon: Guitar, hall: 28 },
  { label: "Gereedschap", icon: Hammer, hall: 29 },
  { label: "Keuken", icon: Utensils, hall: 30 },
  { label: "Kantoor", icon: Briefcase, hall: 31 },
  { label: "Tassen", icon: ShoppingBag, hall: 32 },
  { label: "Zonnebrillen", icon: Glasses, hall: 33 },
  { label: "Huisdieren", icon: PawPrint, hall: 34 },
  { label: "Gezondheid", icon: HeartPulse, hall: 35 },
  { label: "Tickets", icon: Ticket, hall: 36 },
  { label: "Eten & Drinken", icon: Wine, hall: 37 },
  { label: "Modelbouw", icon: Plane, hall: 38 },
  { label: "Overig", icon: Package, hall: 39 },
]

/** Het gedeelde "hal-logo" van de bazaar. */
export const HallIcon = Landmark

export function getCategory(label: string): Category | undefined {
  return categories.find((c) => c.label.toLowerCase() === label.toLowerCase())
}

// Oudere/afwijkende categorienamen koppelen aan de juiste hal.
const CATEGORY_ALIASES: Record<string, string> = {
  "kleding & mode": "Mode",
  "kleding": "Mode",
  "mode & kleding": "Mode",
  "sieraden": "Verzamelen",
  "kunst & ambacht": "Verzamelen",
  "kunst & verzamelobjecten": "Verzamelen",
  "wonen & interieur": "Meubels",
  "wonen & decoratie": "Meubels",
  "interieur": "Meubels",
  "boeken & media": "Boeken",
  "speelgoed": "Kinderen",
  "eten & drinken": "Overig",
  "algemeen": "Overig",
}

/**
 * Zet elke categorienaam om naar een hal. Valt terug op "Overig" (Hal 22)
 * zodat elk product altijd een halnummer heeft.
 */
export function resolveHall(label: string): Category {
  const direct = getCategory(label)
  if (direct) return direct
  const aliasTarget = CATEGORY_ALIASES[label.toLowerCase()]
  if (aliasTarget) {
    const aliased = getCategory(aliasTarget)
    if (aliased) return aliased
  }
  return categories[categories.length - 1] // "Overig"
}

// Toon per schermbreedte precies maximaal 3 rijen. De kolommen verschillen
// (3/4/6/8), dus 3 rijen = 9/12/18/24 items. Items daarboven worden verborgen
// en zijn te vinden via "Alle categorieën".
function rowLimitClass(index: number): string {
  if (index < 9) return "" // altijd zichtbaar (3 rijen bij 3 kolommen)
  if (index < 12) return "hidden sm:flex" // 4e t/m start: pas vanaf sm (3 rijen bij 4 kolommen)
  if (index < 18) return "hidden lg:flex" // pas vanaf lg (3 rijen bij 6 kolommen)
  return "hidden xl:flex" // pas vanaf xl (3 rijen bij 8 kolommen)
}

export function CategoriesSection() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Ontdek de bazaar" action="Alle categorieën" href="/categorieen" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map((cat, index) => (
          <Link
            key={cat.label}
            href={`/categorie/${encodeURIComponent(cat.label)}`}
            className={`group relative flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-sidebar-accent ${rowLimitClass(index) || "flex"}`}
          >
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
              <Landmark className="h-2.5 w-2.5" />
              Hal {cat.hall}
            </span>
            <span className="mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <cat.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium leading-tight text-muted-foreground group-hover:text-foreground">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
