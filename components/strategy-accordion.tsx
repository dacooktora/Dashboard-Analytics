"use client"

import { useState, useEffect, useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, RefreshCw } from "lucide-react"

const CACHE_KEY = "strategy-explanations-cache"

function loadCache(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveCache(cache: Record<string, string>) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore quota errors
  }
}

interface StrategyItem {
  id: string
  nama: string
  skor?: number
  match?: number
  reason?: string
}

interface StrategyAccordionProps {
  recommendations: StrategyItem[]
  segmentName: string
  businessType?: string
  /** Optional: render extra metadata (e.g. score) below the title inside the trigger */
  showMeta?: boolean
}

export function StrategyAccordion({
  recommendations,
  segmentName,
  businessType = "UMKM umum",
  showMeta = false,
}: StrategyAccordionProps) {
  const [explanations, setExplanations] = useState<Record<string, string>>({})
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setExplanations(loadCache())
  }, [])

  const fetchExplanation = useCallback(
    async (strategy: StrategyItem) => {
      const key = strategy.id
      if (!key || explanations[key] || loadingIds.has(key)) return

      setLoadingIds((prev) => new Set(prev).add(key))
      setErrorIds((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })

      try {
        const res = await fetch("/api/strategy-explanation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategyName: strategy.nama,
            segmentName,
            businessType,
          }),
        })

        const data = await res.json()

        if (res.ok && data.explanation) {
          setExplanations((prev) => {
            const updated = { ...prev, [key]: data.explanation }
            saveCache(updated)
            return updated
          })
        } else {
          setErrorIds((prev) => new Set(prev).add(key))
        }
      } catch (err) {
        console.error("[v0] Gagal fetch penjelasan strategi:", err)
        setErrorIds((prev) => new Set(prev).add(key))
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    },
    [explanations, loadingIds, segmentName, businessType],
  )

  if (!recommendations || recommendations.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada rekomendasi untuk segmen ini.</p>
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {recommendations.map((rec, idx) => {
        const key = rec.id || `item-${idx}`
        const isLoading = loadingIds.has(key)
        const isError = errorIds.has(key)
        const explanation = explanations[key]

        return (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger onClick={() => fetchExplanation(rec)} className="text-sm">
              <span className="flex-1 text-left">
                {rec.nama}
                {rec.reason && (
                  <span className="block text-xs text-primary/80 mt-1 italic">
                    💡 Dipilih karena: {rec.reason}
                  </span>
                )}
                {showMeta && typeof rec.skor === "number" && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Relevansi: {(rec.skor * 100).toFixed(0)}%{typeof rec.match === "number" ? ` · ${rec.match} kondisi cocok` : ""}
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <p className="text-xs mb-2 text-muted-foreground/80">
                Berikut cara praktis menerapkan strategi ini ke bisnis Anda:
              </p>
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyusun penjelasan...</span>
                </div>
              )}

              {isError && !isLoading && (
                <div className="space-y-2">
                  <p>Gagal memuat penjelasan, coba lagi nanti.</p>
                  <button
                    type="button"
                    onClick={() => fetchExplanation(rec)}
                    className="inline-flex items-center gap-1 text-primary underline text-xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Coba lagi
                  </button>
                </div>
              )}

              {explanation && !isLoading && <p className="leading-relaxed">{explanation}</p>}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
