import { NextResponse } from "next/server"
import { getLiveSnapshot } from "@/lib/live"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const snapshot = await getLiveSnapshot()
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return NextResponse.json({ error: "Kan live gegevens niet laden" }, { status: 500 })
  }
}
