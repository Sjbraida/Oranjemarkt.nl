import { User } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Toont de echte profielfoto van een account. Is er geen foto, dan tonen we
 * een neutraal personen-icoon — nooit letters/initialen.
 */
export function UserAvatar({
  src,
  name,
  className,
  iconClassName,
}: {
  src?: string | null
  name?: string | null
  className?: string
  iconClassName?: string
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-primary",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || "/placeholder.svg"}
          alt={name ? `Profielfoto van ${name}` : "Profielfoto"}
          className="h-full w-full object-cover"
        />
      ) : (
        <User className={cn("h-1/2 w-1/2", iconClassName)} aria-hidden />
      )}
    </span>
  )
}
