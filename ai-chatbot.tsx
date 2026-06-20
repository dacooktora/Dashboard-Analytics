"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Bot, User, Loader2 } from "lucide-react"
import { useDataStore } from "@/hooks/use-data-store"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

interface AIChatbotProps {
  onClose: () => void
  insights: any
}

export function AIChatbot({ onClose, insights }: AIChatbotProps) {
  const { data } = useDataStore()
  const [input, setInput] = useState("")

  const context =
    data && data.metrics && data.segments
      ? `
KONTEKS DATA LENGKAP DARI FILE YANG DIUPLOAD:

=== RINGKASAN METRIK ===
- Total Customers: ${(data.metrics.totalCustomers || 0).toLocaleString("id-ID")} customer
- Total Revenue: Rp ${((data.metrics.totalRevenue || 0) / 1000000).toFixed(2)}M
- Total Transactions: ${(data.metrics.totalTransactions || 0).toLocaleString("id-ID")} transaksi
- Conversion Rate: ${(data.metrics.conversionRate || 0).toFixed(2)}%
- Average Transaction Value: Rp ${(data.metrics.avgTransactionValue || 0).toLocaleString("id-ID")}
- Periode Data: ${data.dateRange?.start || "N/A"} sampai ${data.dateRange?.end || "N/A"}

=== SEGMENTASI CUSTOMER (K-MEANS CLUSTERING) ===
${data.segments
  .map(
    (s) => `
${s.name.toUpperCase()} SEGMENT:
- Jumlah Customer: ${s.count || 0} customer (${(s.percentage || 0).toFixed(1)}% dari total)
- Average Transaction Value: Rp ${(s.avgValue || 0).toLocaleString("id-ID")}
- Total Revenue dari Segment: Rp ${(((s.avgValue || 0) * (s.count || 0)) / 1000000).toFixed(2)}M
- Karakteristik: ${s.description || "N/A"}
- Strategi: ${s.strategy || "N/A"}
- Sample Customers (Top 5):
${(s.customers || [])
  .slice(0, 5)
  .map(
    (c, i) =>
      `  ${i + 1}. ${c.name || c.id || "N/A"} - Email: ${c.email || "N/A"} - Phone: ${c.phone || "N/A"}
     Transaksi: ${c.frequency || 0}x, Total Value: Rp ${(c.monetary || 0).toLocaleString("id-ID")}, Last Transaction: ${c.lastTransactionDate || "N/A"}`,
  )
  .join("\n")}
`,
  )
  .join("\n")}

=== KATEGORI PRODUK ===
${
  data.productCategories && data.productCategories.length > 0
    ? data.productCategories
        .map(
          (cat) =>
            `- ${cat.category}: ${cat.count || 0} transaksi, Revenue: Rp ${((cat.revenue || 0) / 1000000).toFixed(2)}M (${(cat.percentage || 0).toFixed(1)}%)`,
        )
        .join("\n")
    : "Data kategori produk tidak tersedia"
}

=== ANALISIS RFM (Recency, Frequency, Monetary) ===
${
  data.rfmData
    ? `- Recency Score: ${(data.rfmData.recency || 0).toFixed(2)}/100
- Frequency Score: ${(data.rfmData.frequency || 0).toFixed(2)}/100
- Monetary Score: ${(data.rfmData.monetary || 0).toFixed(2)}/100`
    : "Data RFM tidak tersedia"
}

=== AI INSIGHTS SUMMARY ===
${insights?.summary || "Tidak ada insights yang tersedia"}

PELUANG STRATEGIS:
${insights?.opportunities?.map((o: any, i: number) => `${i + 1}. ${o.title}: ${o.description}`).join("\n") || "Tidak ada data"}

RISIKO TERIDENTIFIKASI:
${insights?.risks?.map((r: any, i: number) => `${i + 1}. ${r.title}: ${r.description}`).join("\n") || "Tidak ada data"}

REKOMENDASI AKSI:
${insights?.recommendations?.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n") || "Tidak ada data"}

INSTRUKSI PENTING:
- Semua data di atas berasal dari file Excel/CSV yang telah diupload oleh user ke website
- Anda HARUS menggunakan data ini untuk menjawab pertanyaan user
- Berikan jawaban yang spesifik dan data-driven berdasarkan angka-angka di atas
- Jika user bertanya tentang segment tertentu, gunakan data customer sample yang tersedia
- Berikan rekomendasi yang actionable dan terukur
`
      : "Belum ada data yang diupload. Silakan upload file Excel/CSV terlebih dahulu untuk memulai analisis."

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text:
              data && data.metrics && data.segments
                ? `Halo! Saya sudah membaca data dari file Excel yang Anda upload. Saya melihat ada ${data.metrics.totalCustomers || 0} customer dengan total revenue Rp ${((data.metrics.totalRevenue || 0) / 1000000).toFixed(1)}M yang terbagi dalam ${data.segments.length} segment. Silakan tanyakan apa saja tentang data Anda, misalnya:\n\n- "Apa yang harus saya lakukan untuk segment High Value?"\n- "Bagaimana cara meningkatkan revenue dari segment Potential?"\n- "Siapa saja customer top di segment High Value?"\n- "Strategi apa yang cocok untuk segment Low Value?"\n\nSaya siap membantu!`
                : "Halo! Saya AI Assistant untuk dashboard analitik UMKM Anda. Silakan upload data Excel/CSV terlebih dahulu agar saya bisa membantu menganalisis customer segmentation Anda.",
          },
        ],
      },
    ],
    body: {
      context,
    },
  })

  const handleSend = () => {
    if (!input.trim() || status === "in_progress") return
    sendMessage({ text: input })
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Caung Consultant</h2>
              <p className="text-xs text-muted-foreground">Tanyain apa aja gw jawab</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.parts.map((part, idx) => {
                    if (part.type === "text") {
                      return (
                        <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {status === "in_progress" && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanyakan tentang data atau strategi bisnis Anda..."
              disabled={status === "in_progress"}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={status === "in_progress" || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Tekan Enter untuk mengirim, Shift+Enter untuk baris baru</p>
        </div>
      </Card>
    </div>
  )
}
