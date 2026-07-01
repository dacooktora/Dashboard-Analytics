import { type NextRequest, NextResponse } from "next/server"
import { getAIRecommendations } from "@/lib/strategy-scoring"

export async function POST(req: NextRequest) {
  try {
    const { segment, allSegments } = await req.json()

    if (!segment || !allSegments) {
      return NextResponse.json(
        { error: "segment dan allSegments wajib diisi" },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY tidak ditemukan di environment variables")
      return NextResponse.json(
        { error: "API key belum dikonfigurasi di server" },
        { status: 500 }
      )
    }

    // getAIRecommendations dipanggil di SINI (server), bukan dari client,
    // jadi process.env.GROQ_API_KEY bisa terbaca dengan benar
    const recommendations = await getAIRecommendations(segment, allSegments)

    return NextResponse.json({ recommendations })
  } catch (error: any) {
    console.error("[v0] Error generating strategy recommendations:", error?.message || error)
    return NextResponse.json(
      { error: "Gagal menghasilkan rekomendasi strategi" },
      { status: 500 }
    )
  }
}
