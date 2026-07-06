"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"

function translateAuthError(message?: string, status?: number): string {
  const m = (message ?? "").toLowerCase()
  if (m.includes("invalid") && (m.includes("email") || m.includes("password"))) {
    return "Onjuist e-mailadres of wachtwoord."
  }
  if (m.includes("already") || m.includes("exists") || status === 422) {
    return "Er bestaat al een account met dit e-mailadres."
  }
  if (m.includes("origin") || m.includes("forbidden") || status === 403) {
    return "Inloggen werd geweigerd door de server. Ververs de pagina en probeer het opnieuw."
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("failed")) {
    return "Kan geen verbinding maken. Controleer je internetverbinding en probeer het opnieuw."
  }
  return message || "Er ging iets mis. Probeer het opnieuw."
}

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      setLoading(false)

      if (error) {
        setError(translateAuthError(error.message, error.status))
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setLoading(false)
      setError("Kan geen verbinding maken. Controleer je internetverbinding en probeer het opnieuw.")
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground text-balance">
              {isSignUp ? "Maak een account aan" : "Welkom terug"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp
                ? "Meld je aan en start jouw eigen kraam op Oranjemarkt."
                : "Log in op je account om verder te gaan."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Jouw naam"
                  className="text-base"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="jij@voorbeeld.nl"
                className="text-base"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder="Minimaal 8 tekens"
                className="text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold">
              {loading ? "Even geduld..." : isSignUp ? "Account aanmaken" : "Inloggen"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isSignUp ? "Heb je al een account? " : "Nog geen account? "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {isSignUp ? "Inloggen" : "Registreren"}
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
              Terug naar Oranjemarkt
          </Link>
        </p>
      </div>
    </main>
  )
}
