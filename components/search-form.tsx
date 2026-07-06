"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SearchForm() {
  const router = useRouter()
  const [q, setQ] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    router.push(term ? `/zoeken?q=${encodeURIComponent(term)}` : "/zoeken")
  }

  return (
    <form onSubmit={onSubmit} className="relative flex flex-1 items-center" role="search">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Zoek naar producten, kramen en meer..."
        aria-label="Zoeken"
        className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-24 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <Button type="submit" className="absolute right-1.5 h-8 px-4 font-semibold">
        Zoeken
      </Button>
    </form>
  )
}
