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
            <p className="text-sm text-muted-foreground mt-1">Customer Segmentation dengan K-Means Clustering</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 Jam</SelectItem>
                <SelectItem value="7d">7 Hari</SelectItem>
                <SelectItem value="90d">90 Hari</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}
