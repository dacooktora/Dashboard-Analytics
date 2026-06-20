import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { strategyName, segmentName, businessType } = await req.json()

    if (!strategyName || !segmentName) {
      return NextResponse.json({ error: "strategyName dan segmentName wajib diisi" }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY tidak ditemukan di environment variables")
      return NextResponse.json({ error: "API key belum dikonfigurasi" }, { status: 500 })
    }

    const prompt = `Kamu adalah konsultan bisnis UMKM. Jelaskan secara singkat dan praktis (maksimal 4 kalimat, bahasa Indonesia santai tapi profesional) bagaimana cara menerapkan strategi berikut untuk sebuah usaha UMKM:

Strategi: "${strategyName}"
Target segmen pelanggan: ${segmentName}
Jenis usaha: ${businessType || "UMKM umum (kuliner, retail, jasa, dll)"}

Berikan jawaban dalam format:
1. Cara menerapkan (2-3 kalimat konkret dan actionable)
2. Contoh nyata untuk UMKM (1 kalimat)

Jangan gunakan markdown formatting, tulis sebagai paragraf biasa tanpa bullet point atau penomoran eksplisit.`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[v0] Groq API error:", response.status, errText)
      return NextResponse.json({ error: "Gagal menghasilkan penjelasan dari AI" }, { status: 502 })
    }

    const data = await response.json()
    const explanation = data.choices?.[0]?.message?.content?.trim() || "Penjelasan tidak tersedia saat ini."

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error("[v0] Error generating strategy explanation:", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
