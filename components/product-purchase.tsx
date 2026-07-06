"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Zap, Tag, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { addToCart } from "@/app/actions/cart"
import { sendOffer } from "@/app/actions/messages"

export function ProductPurchase({
  productId,
  storeId,
  price,
  productName,
  stock,
  isLoggedIn,
}: {
  productId: number
  storeId: number
  price: number
  productName: string
  stock: number
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [qty, setQty] = useState(1)
  const [cartAdded, setCartAdded] = useState(false)
  const [action, setAction] = useState<"cart" | "buy" | null>(null)
  const [negotiateOpen, setNegotiateOpen] = useState(false)
  const [bid, setBid] = useState(Math.round(price * 0.9))
  const [bidSent, setBidSent] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)

  const outOfStock = stock <= 0
  const maxQty = stock > 0 ? stock : 99

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=/product`)
      return
    }
    setAction("cart")
    startTransition(async () => {
      await addToCart(productId, qty)
      setCartAdded(true)
      router.refresh()
      setAction(null)
      setTimeout(() => setCartAdded(false), 2000)
    })
  }

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=/winkelwagen`)
      return
    }
    setAction("buy")
    startTransition(async () => {
      await addToCart(productId, qty)
      router.push("/winkelwagen")
    })
  }

  const submitBid = () => {
    if (!isLoggedIn) {
      router.push(`/sign-in?redirect=/product`)
      return
    }
    setBidError(null)
    startTransition(async () => {
      try {
        await sendOffer(storeId, productName, bid, price)
        setBidSent(true)
        router.refresh()
      } catch (e) {
        setBidError(e instanceof Error ? e.message : "Bod kon niet worden verstuurd.")
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Aantal</span>
        <div className="flex items-center rounded-md border border-border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Minder"
            disabled={outOfStock}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold text-foreground">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            aria-label="Meer"
            disabled={outOfStock || qty >= maxQty}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {outOfStock ? (
            <span className="font-semibold text-destructive">Uitverkocht</span>
          ) : (
            <>
              Totaal: <span className="font-bold text-foreground">{formatPrice(price * qty)}</span>
            </>
          )}
        </span>
      </div>

      {stock > 0 && stock <= 5 && (
        <p className="-mt-1 text-xs font-medium text-destructive">Nog maar {stock} op voorraad</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button size="lg" onClick={handleBuyNow} disabled={outOfStock || pending} className="h-12 gap-2 font-semibold">
          {action === "buy" && pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          Direct kopen
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleAddToCart}
          disabled={outOfStock || pending}
          className="h-12 gap-2 bg-transparent font-semibold"
        >
          {action === "cart" && pending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : cartAdded ? (
            <Check className="h-5 w-5" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}
          {cartAdded ? "Toegevoegd" : "In winkelwagen"}
        </Button>
      </div>

      <button
        onClick={() => {
          setNegotiateOpen(true)
          setBidSent(false)
          setBidError(null)
        }}
        className="flex h-12 items-center justify-center gap-2 rounded-md border border-dashed border-primary/50 font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        <Tag className="h-5 w-5" />
        Doe een bod
      </button>

      {negotiateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            aria-label="Sluiten"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setNegotiateOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <button
              onClick={() => setNegotiateOpen(false)}
              aria-label="Sluiten"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            {bidSent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
                  <Check className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-foreground">Bod verstuurd!</h3>
                <p className="text-sm text-muted-foreground">
                  Je bod van {formatPrice(bid)} is als bericht naar de verkoper gestuurd. Je krijgt antwoord in je
                  berichten.
                </p>
                <Button className="mt-1 h-11 w-full font-semibold" render={<Link href="/berichten" />}>
                  Naar mijn berichten
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-foreground">Doe een bod</h3>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">{`Onderhandel over "${productName}". Vraagprijs: ${formatPrice(price)}.`}</p>
                {bidError && (
                  <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{bidError}</p>
                )}
                <label className="mt-4 block text-sm font-medium text-foreground">Jouw bod</label>
                <div className="mt-1.5 flex items-center rounded-md border border-border bg-background px-3">
                  <span className="text-muted-foreground">€</span>
                  <input
                    type="number"
                    value={bid}
                    min={1}
                    onChange={(e) => setBid(Number(e.target.value))}
                    className="h-11 w-full bg-transparent px-2 text-base text-foreground outline-none"
                  />
                </div>
                <Button className="mt-4 h-11 w-full gap-2 font-semibold" onClick={submitBid} disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verstuur bod
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
