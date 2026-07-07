import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { optionalUser } from "@/lib/session"

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export async function POST(request: NextRequest) {
  try {
    // Alleen ingelogde gebruikers mogen uploaden.
    const user = await optionalUser()
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 })
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Alleen afbeeldingen zijn toegestaan" }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Bestand is te groot (max 8 MB)" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const key = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const blob = await put(key, file, { access: "public" })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Uploaden mislukt" }, { status: 500 })
  }
}
