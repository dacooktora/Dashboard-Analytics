"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, Target, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react"
import { useDataStore } from "@/hooks/use-data-store"

export function AIInsights() {
  const { data } = useDataStore()
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      generateInsights(data)
    }
  }, [data])

  const buildContext = (processedData: any) => {
    const segments = processedData.segments || []
    const metrics = processedData.metrics || {}

    const segmentSummary = segments
      .map((s: any) => `- ${s.name}: ${s.count} customer, avg transaksi Rp ${s.avgValue?.toLocaleString("id-ID")}, total revenue Rp ${(s.avgValue * s.count)?.toLocaleString("id-ID")}`)
      .join("\n")

    const topCategories = (processedData.categoryData || [])
      .slice(0, 5)
      .map((c: any) => `- ${c.category}: ${c.count} transaksi, revenue Rp ${c.revenue?.toLocaleString("id-ID")}`)
      .join("\n")

    return `
DATA UMKM DIGITAL:

METRIK UTAMA:
- Total Pelanggan: ${metrics.totalCustomers?.toLocaleString("id-ID")}
- Total Transaksi: ${metrics.totalTransactions?.toLocaleString("id-ID")}
- Total Revenue: Rp ${metrics.totalRevenue?.toLocaleString("id-ID")}
- Rata-rata Nilai Transaksi: Rp ${metrics.avgTransactionValue?.toLocaleString("id-ID")}
- Conversion Rate: ${metrics.conversionRate?.toFixed(1)}%

SEGMENTASI PELANGGAN (K-Means Clustering):
${segmentSummary}

TOP KATEGORI PRODUK:
${topCategories || "Data kategori tidak tersedia"}

PERIODE DATA: ${processedData.dateRange?.start || "-"} hingga ${processedData.dateRange?.end || "-"}
`
  }

  const generateInsights = async (processedData: any) => {
    setLoading(true)
    setError(null)

    try {
      const context = buildContext(processedData)

      const prompt = `Berdasarkan data customer segmentation UMKM digital di atas, berikan analisis dalam format JSON dengan struktur PERSIS seperti berikut (jangan tambah field lain):

{
  "summary": "ringkasan eksekutif 2-3 kalimat tentang kondisi bisnis berdasarkan data",
  "opportunities": [
    {
      "title": "judul peluang singkat",
      "description": "deskripsi peluang dengan angka konkret dari data",
      "impact": "high atau medium atau low",
      "priority": 1
    }
  ],
  "risks": [
    {
      "title": "judul risiko singkat",
      "description": "deskripsi risiko berdasarkan data",
      "severity": "high atau medium atau low"
    }
  ],
  "recommendations": [
    "rekomendasi aksi konkret 1",
    "rekomendasi aksi konkret 2",
    "rekomendasi aksi konkret 3",
    "rekomendasi aksi konkret 4",
    "rekomendasi aksi konkret 5"
  ]
}

Buat 3 opportunities dan 2 risks. Gunakan angka-angka spesifik dari data. Jawab HANYA dengan JSON valid, tanpa teks lain.`

      const response = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal mendapatkan respons")
      }

      const result = await response.json()
      setInsights(result)
    } catch (err: any) {
      console.error("AI Insights error:", err)
      setError("Gagal memuat AI insights. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <p>Upload data untuk melihat AI insights</p>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
        <div className="flex flex-col items-center justify-center h-[200px] gap-4 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">AI sedang menganalisis data bisnis Anda...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
        <div className="flex flex-col items-center justify-center h-[200px] gap-4">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={() => data && generateInsights(data)}
            className="text-sm text-primary underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      </Card>
    )
  }

  if (!insights) return null

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-background border-2">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI-Powered Insights & Recommendations</h2>
              <p className="text-sm text-muted-foreground">Analisis cerdas dan saran strategis berbasis data</p>
            </div>
          </div>
          <button
            onClick={() => data && generateInsights(data)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>

        {/* Executive Summary */}
        <div className="mb-6 p-4 rounded-lg bg-card border">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Executive Summary
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Opportunities */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Peluang Strategis
            </h3>
            <div className="space-y-3">
              {insights.opportunities?.map((opp: any, idx: number) => (
                <Card key={idx} className="p-4 border-l-4 border-l-green-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{opp.title}</h4>
                    <Badge
                      variant={opp.impact === "high" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      Priority {opp.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opp.description}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Risk & Challenges
            </h3>
            <div className="space-y-3">
              {insights.risks?.map((risk: any, idx: number) => (
                <Card key={idx} className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{risk.title}</h4>
                    <Badge
                      variant={risk.severity === "high" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{risk.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Rekomendasi Aksi
          </h3>
          <ul className="space-y-2">
            {insights.recommendations?.map((rec: string, idx: number) => (
              <li key={idx} className="text-sm flex items-start gap-3">
                <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </>
  )
}
