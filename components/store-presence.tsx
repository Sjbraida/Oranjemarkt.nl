"use client"

import { useEffect } from "react"
import { getVisitorToken } from "@/lib/visitor-token"

/**
 * Stuurt heartbeats zolang de bezoeker deze kraam bekijkt, zodat de kraam
 * live als "actief bekeken" verschijnt op de kramen-pagina. Rendert niets.
 */
export function StorePresence({ storeId }: { storeId: number }) {
  useEffect(() => {
    const token = getVisitorToken()
    if (!token) return

    let stopped = false

    const beat = () => {
      if (stopped || document.visibilityState === "hidden") return
      // keepalive zodat de laatste heartbeat ook bij het sluiten meegaat
      fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, token }),
        keepalive: true,
      }).catch(() => {})
    }

    beat()
    const interval = setInterval(beat, 20_000)
    const onVisible = () => document.visibilityState === "visible" && beat()
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      stopped = true
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [storeId])

  return null
}
