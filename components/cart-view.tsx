"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingCart, X, Check, ShieldCheck, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { setCartQuantity, removeFromCart } from "@/app/actions/cart"
import { placeOrder } from "@/app/actions/orders"
import { SHIPPING_FLAT, FREE_SHIPPING_THRESHOLD } from "@/lib/shipping"

export type CartLine = {
  id: number
  slug: string
  name: string
  price: number
  image: string
  storeName: string
  stock: number
  qty: number
}

const IDEAL_BANKS = [
  "ABN AMRO",
  "ASN Bank",
  "bunq",
  "ING",
  "Knab",
  "Rabobank",
  "RegioBank",
  "Revolut",
  "SNS",
  "Triodos Bank",
  "Van Lanschot",
]

type PayMethod = "ideal" | "applepay"

export function CartView({ initialLines, defaultName }: { initialLines: CartLine[]; defaultName: string }) {
  const router = useRouter()
  const [lines, setLines] = useState<CartLine[]>(initialLines)
  const [pending, startTransition] = useTransition()
  const [busyLine, setBusyLine] = useState<number | null>(null)

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [step, setStep] = useState<"adres" | "betalen">("adres")
  const [method, setMethod] = useState<PayMethod>("ideal")
  const [bank, setBank] = useState(IDEAL_BANKS[3])
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [paidTotal, setPaidTotal] = useState(0)

  // Shipping form
  const [name, setName] = useState(defaultName)
  const [address, setAddress] = useState("")
  const [postal, setPostal] = useState("")
  const [city, setCity] = useState("")

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines])
  const shipping = lines.length > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FLAT : 0
  const total = lines.length > 0 ? subtotal + shipping : 0

  const changeQty = (id: number, nextQty: number, stock: number) => {
    const clamped = Math.max(1, Math.min(stock > 0 ? stock : nextQty, nextQty))
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: clamped } : l)))
    setBusyLine(id)
    startTransition(async () => {
      await setCartQuantity(id, clamped)
      setBusyLine(null)
    })
  }

  const remove = (id: number) => {
    setLines((ls) => ls.filter((l) => l.id !== id))
    startTransition(async () => {
      await removeFromCart(id)
      router.refresh()
    })
  }

  const canPayAddress = name.trim() && address.trim() && postal.trim() && city.trim()

  const pay = () => {
    setProcessing(true)
    setError(null)
    // Simulate payment authorization, then persist the real order.
    setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await placeOrder({
            name: name.trim(),
            address: address.trim(),
            postal: postal.trim(),
            city: city.trim(),
            paymentMethod: method,
          })
          setOrderId(res.orderId)
          setPaidTotal(res.total)
          setPaid(true)
          setLines([])
          router.refresh()
        } catch (e) {
          setError(e instanceof Error ? e.message : "Er ging iets mis bij het afrekenen.")
        } finally {
          setProcessing(false)
        }
      })
    }, 1400)
  }

  const openCheckout = () => {
    setStep("adres")
    setError(null)
    setCheckoutOpen(true)
  }

  if (lines.length === 0 && !paid) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-12 text-center">
        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Je winkelwagen is leeg.</p>
        <Button render={<Link href="/" />}>Verder winkelen</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Line items */}
      <div className="flex flex-col gap-3">
        {lines.map((l) => (
          <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
            <Link href={`/product/${l.slug}`} className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.image || "/placeholder.svg"}
                alt={l.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${l.slug}`}
                className="truncate font-semibold text-foreground hover:text-primary"
              >
                {l.name}
              </Link>
              <p className="text-xs text-muted-foreground">{l.storeName}</p>
              <p className="mt-1 text-sm font-bold text-primary">{formatPrice(l.price)}</p>
              {l.stock > 0 && l.qty >= l.stock && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">Max. voorraad ({l.stock})</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center rounded-md border border-border">
                <button
                  onClick={() => changeQty(l.id, l.qty - 1, l.stock)}
                  aria-label="Minder"
                  disabled={l.qty <= 1 || busyLine === l.id}
                  className="flex h-9 w-9 items-center justify-center text-foreground hover:text-primary disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground">
                  {busyLine === l.id ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : l.qty}
                </span>
                <button
                  onClick={() => changeQty(l.id, l.qty + 1, l.stock)}
                  aria-label="Meer"
                  disabled={(l.stock > 0 && l.qty >= l.stock) || busyLine === l.id}
                  className="flex h-9 w-9 items-center justify-center text-foreground hover:text-primary disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => remove(l.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Verwijder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-foreground">Overzicht</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotaal</dt>
            <dd className="font-medium text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Verzendkosten</dt>
            <dd className="font-medium text-foreground">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</dd>
          </div>
          {shipping > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Nog {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} tot gratis verzending
            </p>
          )}
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
            <dt className="font-bold text-foreground">Totaal</dt>
            <dd className="font-bold text-primary">{formatPrice(total)}</dd>
          </div>
        </dl>
        <Button className="mt-4 h-12 w-full gap-2 font-semibold" onClick={openCheckout} disabled={lines.length === 0}>
          <Lock className="h-4 w-4" />
          Afrekenen
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
          Veilig betalen met iDEAL of Apple Pay
        </p>
      </aside>

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            aria-label="Sluiten"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => !processing && setCheckoutOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            {paid ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
                  <Check className="h-7 w-7" />
                </span>
                <h3 className="text-xl font-bold text-foreground">Betaling geslaagd!</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Je bestelling #{orderId} van {formatPrice(paidTotal)} via{" "}
                  {method === "ideal" ? `iDEAL (${bank})` : "Apple Pay"} is gelukt. De verkopers zijn op de hoogte
                  gebracht.
                </p>
                <div className="mt-2 flex w-full gap-2">
                  <Button variant="outline" className="h-11 flex-1 bg-transparent font-semibold" render={<Link href="/bestellingen" />}>
                    Mijn bestellingen
                  </Button>
                  <Button className="h-11 flex-1 font-semibold" render={<Link href="/" />}>
                    Verder winkelen
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">
                    {step === "adres" ? "Bezorgadres" : "Kies je betaalmethode"}
                  </h3>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    aria-label="Sluiten"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                )}

                {step === "adres" ? (
                  <div className="mt-4 space-y-3">
                    <Field label="Naam" value={name} onChange={setName} placeholder="Voor- en achternaam" />
                    <Field label="Adres" value={address} onChange={setAddress} placeholder="Straat en huisnummer" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Postcode" value={postal} onChange={setPostal} placeholder="1234 AB" />
                      <Field label="Plaats" value={city} onChange={setCity} placeholder="Amsterdam" />
                    </div>
                    <Button
                      className="mt-2 h-12 w-full font-semibold"
                      disabled={!canPayAddress}
                      onClick={() => setStep("betalen")}
                    >
                      Doorgaan naar betalen
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 space-y-3">
                      {/* iDEAL */}
                      <button
                        onClick={() => setMethod("ideal")}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                          method === "ideal" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            method === "ideal" ? "border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {method === "ideal" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                        <span className="flex h-8 w-12 items-center justify-center rounded-md bg-[#CC0066] text-xs font-black italic text-white">
                          iDEAL
                        </span>
                        <span className="font-semibold text-foreground">Betaal via je eigen bank</span>
                      </button>

                      {method === "ideal" && (
                        <div className="pl-4">
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Kies je bank</label>
                          <select
                            value={bank}
                            onChange={(e) => setBank(e.target.value)}
                            className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
                          >
                            {IDEAL_BANKS.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Apple Pay */}
                      <button
                        onClick={() => setMethod("applepay")}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                          method === "applepay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            method === "applepay" ? "border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {method === "applepay" && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                        </span>
                        <span className="flex h-8 w-12 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
                          Pay
                        </span>
                        <span className="font-semibold text-foreground">Apple Pay</span>
                      </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm text-muted-foreground">Te betalen</span>
                      <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
                    </div>

                    <Button className="mt-4 h-12 w-full gap-2 font-semibold" onClick={pay} disabled={processing || pending}>
                      {processing || pending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Bezig met betalen…
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          {method === "ideal" ? "Betaal met iDEAL" : "Betaal met Apple Pay"}
                        </>
                      )}
                    </Button>
                    <button
                      onClick={() => setStep("adres")}
                      className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                    >
                      Terug naar adres
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary"
      />
    </div>
  )
}
