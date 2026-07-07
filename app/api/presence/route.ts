import { NextResponse } from "next/server"
import { recordPresence } from "@/lib/live"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const token = typeof body?.token === "string" ? body.token.slice(0, 64) : ""

    if (!token) {
      return NextResponse.json({ ok: false, error: "Ongeldige aanvraag" }, { status: 400 })
    }

    await recordPresence(token)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
