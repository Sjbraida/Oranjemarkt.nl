import Link from "next/link"
import {
  Cpu,
  Shirt,
  Footprints,
  Gem,
  Car,
  Bike,
  Sparkles,
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
} from "lucide-react"
import { SectionHeader } from "@/components/section-header"

export const categories = [
  { label: "Elektronica", icon: Cpu },
  { label: "Mode", icon: Shirt },
  { label: "Sneakers", icon: Footprints },
  { label: "Verzamelen", icon: Gem },
  { label: "Auto", icon: Car },
  { label: "Motor", icon: Bike },
  { label: "Pokemon", icon: Sparkles },
  { label: "Funko", icon: Boxes },
  { label: "Lego", icon: Blocks },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Telefoons", icon: Smartphone },
  { label: "Laptops", icon: Laptop },
  { label: "Horloges", icon: Watch },
  { label: "Meubels", icon: Sofa },
  { label: "Vintage", icon: Camera },
  { label: "Beauty", icon: Flower2 },
  { label: "Sport", icon: Dumbbell },
  { label: "Kinderen", icon: Baby },
  { label: "Huis & Tuin", icon: TreePine },
  { label: "Muziek", icon: Music },
  { label: "Boeken", icon: BookOpen },
  { label: "Overig", icon: Package },
]

export function CategoriesSection() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Ontdek de bazaar" action="Alle categorieën" href="/categorieen" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={`/categorie/${encodeURIComponent(cat.label)}`}
            className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-sidebar-accent"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
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
