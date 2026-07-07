"use client"

import { useEffect } from "react"
import { getVisitorToken } from "@/lib/visitor-token"

/**
 * Stuurt site-brede heartbeats zolang de bezoeker de site bekijkt, zodat het
 * live aantal actieve bezoekers op de homepage klopt. Rendert niets.
 */
export function PresenceTracker() {
  useEffect(() => {
    const token = getVisitorToken()
    if (!token) return

    let stopped = false

    const beat = () => {
      if (stopped || document.visibilityState === "hidden") return
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        keepalive: true,
      }).catch(() => {})
    }

    beat()
    const interval = setInterval(beat, 25_000)
    const onVisible = () => document.visibilityState === "visible" && beat()
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      stopped = true
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return null
}
