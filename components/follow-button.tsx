"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleFollow } from "@/app/actions/follows"

export function FollowButton({
  storeId,
  initialFollowing = false,
  isLoggedIn = false,
  className,
}: {
  storeId: number
  initialFollowing?: boolean
  isLoggedIn?: boolean
  className?: string
}) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [pending, startTransition] = useTransition()

  const onClick = () => {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    const next = !following
    setFollowing(next)
    startTransition(async () => {
      try {
        const res = await toggleFollow(storeId)
        setFollowing(res.following)
        router.refresh()
      } catch {
        setFollowing(!next)
      }
    })
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={following}
      disabled={pending}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-md px-5 font-semibold transition-colors disabled:opacity-70",
        following
          ? "border border-border bg-card text-foreground hover:border-primary/50"
          : "bg-primary text-primary-foreground hover:opacity-90",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : following ? (
        <Check className="h-5 w-5" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
      {following ? "Volgend" : "Volgen"}
    </button>
  )
}
