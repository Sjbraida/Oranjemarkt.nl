"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ZoomIn, ZoomOut, X, Maximize2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

const MIN_SCALE = 1
const MAX_SCALE = 4
const STEP = 0.5

export function ProductGallery({ image, name, discount }: { image: string; name: string; discount: number | null }) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const reset = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const openViewer = () => {
    reset()
    setOpen(true)
  }

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(s + delta).toFixed(2)))
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  // Sluiten met Escape en scroll blokkeren zolang de viewer open is.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "+" || e.key === "=") zoomBy(STEP)
      if (e.key === "-") zoomBy(-STEP)
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, zoomBy])

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    setOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    })
  }
  const onPointerUp = () => {
    dragRef.current = null
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Voorbeeld: volledige foto zichtbaar (niets afgesneden). Klik om te vergroten. */}
      <button
        type="button"
        onClick={openViewer}
        aria-label={`Vergroot foto van ${name}`}
        className="group relative flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image || "/placeholder.svg"} alt={name} className="h-full w-full object-contain" />
        {discount ? (
          <span className="absolute left-4 top-4 rounded-md bg-destructive px-2 py-1 text-sm font-bold text-white">
            {`-${discount}%`}
          </span>
        ) : null}
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-md bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          <Maximize2 className="h-3.5 w-3.5" />
          Klik om te vergroten
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto van ${name}`}
        >
          {/* Werkbalk */}
          <div className="flex items-center justify-between gap-2 border-b border-border p-3">
            <span className="truncate px-1 text-sm font-medium text-foreground">{name}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => zoomBy(-STEP)}
                disabled={scale <= MIN_SCALE}
                aria-label="Uitzoomen"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-40"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums text-foreground">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => zoomBy(STEP)}
                disabled={scale >= MAX_SCALE}
                aria-label="Inzoomen"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-40"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={scale === MIN_SCALE && offset.x === 0 && offset.y === 0}
                aria-label="Herstel weergave"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-40"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Afbeelding: volledige foto, in-/uitzoombaar en sleepbaar */}
          <div
            className={cn(
              "flex flex-1 items-center justify-center overflow-hidden p-4",
              scale > 1 ? "cursor-grab active:cursor-grabbing touch-none" : "cursor-zoom-in",
            )}
            onClick={() => {
              if (scale <= 1) zoomBy(STEP)
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-100"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
