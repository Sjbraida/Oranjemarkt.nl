"use client"

import { useRef, useState } from "react"
import { ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProductGallery({ image, name, discount }: { image: string; name: string; discount: number | null }) {
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-border bg-secondary"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-150",
            zoom ? "scale-[2]" : "scale-100",
          )}
          style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
        />
        {discount ? (
          <span className="absolute left-4 top-4 rounded-md bg-destructive px-2 py-1 text-sm font-bold text-white">
            {`-${discount}%`}
          </span>
        ) : null}
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-md bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          <ZoomIn className="h-3.5 w-3.5" />
          Beweeg om in te zoomen
        </span>
      </div>
    </div>
  )
}
