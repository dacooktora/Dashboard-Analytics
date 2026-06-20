import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"

export const maxDuration = 30

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context?: string } = await req.json()

  const systemMessage = {
    role: "system" as const,
    content: `Anda adalah AI consultant ahli dalam analisis customer segmentation dan strategi bisnis UMKM di Indonesia. 

PENTING: User telah mengupload file Excel/CSV ke website dan semua data yang Anda terima di bawah ini berasal dari file tersebut. Anda HARUS menggunakan data ini untuk menjawab pertanyaan user.

INSTRUKSI:
1. SELALU rujuk ke data spesifik yang diberikan dalam konteks
2. Berikan jawaban yang data-driven dengan angka-angka konkret
3. Jika user bertanya tentang segment tertentu, sebutkan jumlah customer, revenue, dan karakteristiknya
4. Berikan rekomendasi yang actionable dan terukur
5. Gunakan bahasa Indonesia yang profesional namun ramah
6. Jika user bertanya tentang customer spesifik, gunakan data sample yang tersedia
7. JANGAN pernah bilang "saya tidak bisa melihat file" - Anda SUDAH menerima semua data dari file yang diupload

DATA KONTEKS DARI FILE YANG DIUPLOAD:
${context || "Belum ada data yang diupload."}`,
  }

  const prompt = [systemMessage, ...convertToModelMessages(messages)]

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.7,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
