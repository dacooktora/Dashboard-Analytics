"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDataStore } from "@/hooks/use-data-store"

export function DashboardHeader() {
  const { timeRange, setTimeRange } = useDataStore()

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard Analitik UMKM</h1>
            <p className="text-sm text-muted-foreground mt-1">Segmentasi Pelanggan Berbasis Data untuk Strategi Pemasaran yang Lebih Tepat</p>
          </div>

        
        </div>
      </div>
    </header>
  )
}
