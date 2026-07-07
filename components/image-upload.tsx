"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, Loader2, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ImageUploadProps = {
  /** Huidige afbeeldings-URL (of leeg). */
  value: string
  /** Wordt aangeroepen met de nieuwe URL na upload of wissen. */
  onChange: (url: string) => void
  /** Verhouding van het voorbeeldkader, bijv. "3 / 1" voor een banner of "1 / 1" vierkant. */
  aspect?: string
  /** Korte hint onder het kader. */
  hint?: string
  /** Extra klassen op het kader. */
  className?: string
  label?: string
}

export function ImageUpload({
  value,
  onChange,
  aspect = "1 / 1",
  hint,
  className,
  label = "Afbeelding",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Uploaden mislukt")
      onChange(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uploaden mislukt")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-muted"
        style={{ aspectRatio: aspect }}
      >
        {value ? (
          <Image src={value || "/placeholder.svg"} alt="Voorbeeld" fill className="object-cover" sizes="(max-width: 768px) 100vw, 640px" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Nog geen afbeelding</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
            aria-label="Afbeelding verwijderen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {value ? "Vervangen" : "Uploaden"}
        </button>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
