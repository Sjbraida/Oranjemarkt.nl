"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleFavorite } from "@/app/actions/favorites"

export function FavoriteButton({
  productId,
  initialFavorited,
  isLoggedIn,
  className,
  size = "md",
  variant = "icon",
}: {
  productId: number
  initialFavorited: boolean
  isLoggedIn: boolean
  className?: string
  size?: "md" | "lg"
  variant?: "icon" | "labeled"
}) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoggedIn) {
      router.push("/sign-in")
      return
    }
    setFavorited((v) => !v)
    startTransition(async () => {
      try {
        const res = await toggleFavorite(productId)
        setFavorited(res.favorited)
      } catch {
        setFavorited((v) => !v)
      }
    })
  }

  if (variant === "labeled") {
    return (
      <button
        onClick={onClick}
        disabled={isPending}
        aria-pressed={favorited}
        className={cn(
          "flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary",
          className,
        )}
      >
        <Heart className={cn("h-5 w-5", favorited && "fill-primary text-primary")} />
        {favorited ? "Favoriet" : "Bewaren"}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      aria-label={favorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      aria-pressed={favorited}
      className={cn(
        "flex items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur transition-colors hover:text-primary",
        size === "md" ? "h-8 w-8" : "h-10 w-10",
        className,
      )}
    >
      <Heart className={cn(size === "md" ? "h-4 w-4" : "h-5 w-5", favorited && "fill-primary text-primary")} />
    </button>
  )
}
