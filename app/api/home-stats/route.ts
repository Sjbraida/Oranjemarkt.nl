import { NextResponse } from "next/server"
import { getHomeStats } from "@/lib/live"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = await getHomeStats()
    return NextResponse.json(stats)
  } catch {
    return NextResponse.json({ activeStores: 0, liveVisitors: 0, activeSubscriptions: 0 }, { status: 500 })
  }
}
