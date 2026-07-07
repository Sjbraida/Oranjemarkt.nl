"use client"

const KEY = "omk_visitor_token"

/** Haalt een stabiele, anonieme bezoeker-token op (of maakt er een aan). */
export function getVisitorToken(): string {
  if (typeof window === "undefined") return ""
  try {
    let token = window.localStorage.getItem(KEY)
    if (!token) {
      token =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
      window.localStorage.setItem(KEY, token)
    }
    return token
  } catch {
    // localStorage geblokkeerd (bijv. privémodus): val terug op een sessie-token.
    return `anon_${Math.random().toString(36).slice(2)}`
  }
}
