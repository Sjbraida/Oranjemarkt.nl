import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function SectionHeader({
  title,
  action = "Bekijk alle",
  href = "#",
}: {
  title: string
  action?: string
  href?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-foreground md:text-xl">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        {action}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
