"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type ShareButtonProps = {
  title: string
  text?: string
  /** Relatief pad of volledige URL. Leeg = huidige pagina. */
  url?: string
  label?: string
  className?: string
  /** Toon alleen icoon (vierkante knop) of ook tekst. */
  iconOnly?: boolean
}

export function ShareButton({ title, text, url, label = "Delen", className, iconOnly = true }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url
      ? url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`
      : window.location.href

    // Web Share API waar beschikbaar (mobiel), anders link kopiëren.
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch {
        // Gebruiker annuleerde of niet ondersteund → val terug op kopiëren.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Laatste redmiddel: prompt.
      window.prompt("Kopieer de link:", shareUrl)
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label={label}
        title={copied ? "Link gekopieerd" : label}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary",
          className,
        )}
      >
        {copied ? <Check className="h-5 w-5 text-primary" /> : <Share2 className="h-5 w-5" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary",
        className,
      )}
    >
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Gekopieerd" : label}
    </button>
  )
}
