import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { context, prompt } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak ditemukan" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Anda adalah konsultan bisnis UMKM yang ahli dalam analisis customer segmentation. Berikan analisis berdasarkan data yang diberikan. Jawab HANYA dalam format JSON valid, tanpa teks lain.`,
          },
          {
            role: "user",
            content: `${context}\n\n${prompt}`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Groq API error:", errorText)
      return NextResponse.json(
        { error: "Gagal generate insights" },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || "{}"

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Format response tidak valid")
      }
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("[v0] AI Insights error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    )
  }
}
