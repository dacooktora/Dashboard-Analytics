"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useDataStore } from "@/hooks/use-data-store"
import { ChevronLeft, ChevronRight } from "lucide-react"

function formatCurrency(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`
}

// Parse tanggal YYYY-MM-DD tanpa timezone issue
function parseDateLocal(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split("-")
  return {
    year: parseInt(parts[0]),
    month: parseInt(parts[1]),
    day: parseInt(parts[2]),
  }
}

// Format tanggal untuk label grafik: "01 Jan"
function formatDateLabel(dateStr: string): string {
  const { day, month } = parseDateLocal(dateStr)
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"]
  return `${String(day).padStart(2, "0")} ${monthNames[month - 1]}`
}

function getAvailableMonths(timeSeriesData: any[]): { year: number; month: number }[] {
  const monthsSet = new Set<string>()
  timeSeriesData.forEach((d) => {
    const { year, month } = parseDateLocal(d.date)
    const key = `${year}-${String(month).padStart(2, "0")}`
    monthsSet.add(key)
  })

  return Array.from(monthsSet)
    .sort()
    .map((key) => {
      const [year, month] = key.split("-").map(Number)
      return { year, month }
    })
}

export function PerformanceCharts() {
  const { data } = useDataStore()
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [availableMonths, setAvailableMonths] = useState<{ year: number; month: number }[]>([])

  useEffect(() => {
    if (data?.timeSeriesData && data.timeSeriesData.length > 0) {
      const months = getAvailableMonths(data.timeSeriesData)
      setAvailableMonths(months)
      if (months.length > 0) {
        const lastMonth = months[months.length - 1]
        setSelectedYear(lastMonth.year)
        setSelectedMonth(lastMonth.month)
      }
    }
  }, [data?.timeSeriesData])

  if (!data) {
    return (
      <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Revenue & Transaction Performance</h2>
          <p className="text-sm text-muted-foreground mt-1">Pilih bulan untuk melihat data harian</p>
        </div>
        <div className="flex items-center justify-center h-[350px] text-muted-foreground">
          <p>Upload data untuk melihat grafik kinerja</p>
        </div>
      </Card>
    )
  }

  // Filter pakai parseDateLocal (no timezone issue)
  const filteredData = selectedYear && selectedMonth
    ? data.timeSeriesData.filter((d) => {
        const { year, month } = parseDateLocal(d.date)
        return year === selectedYear && month === selectedMonth
      })
    : data.timeSeriesData

  const performanceData = filteredData.map((d) => ({
    date: formatDateLabel(d.date),
    revenue: d.revenue || 0,
    transactions: d.transactions || 0,
    rawDate: d.date,
  }))

  const availableYears = Array.from(new Set(availableMonths.map((m) => m.year))).sort()
  const monthsForYear = selectedYear ? availableMonths.filter((m) => m.year === selectedYear) : []

  const handlePreviousMonth = () => {
    if (!selectedYear || !selectedMonth) return
    const currentIndex = availableMonths.findIndex((m) => m.year === selectedYear && m.month === selectedMonth)
    if (currentIndex > 0) {
      const prevMonth = availableMonths[currentIndex - 1]
      setSelectedYear(prevMonth.year)
      setSelectedMonth(prevMonth.month)
    }
  }

  const handleNextMonth = () => {
    if (!selectedYear || !selectedMonth) return
    const currentIndex = availableMonths.findIndex((m) => m.year === selectedYear && m.month === selectedMonth)
    if (currentIndex < availableMonths.length - 1) {
      const nextMonth = availableMonths[currentIndex + 1]
      setSelectedYear(nextMonth.year)
      setSelectedMonth(nextMonth.month)
    }
  }

  const monthNames = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ]

  const selectedMonthName = selectedMonth ? monthNames[selectedMonth - 1] : ""
  const currentIndex = availableMonths.findIndex((m) => m.year === selectedYear && m.month === selectedMonth)
  const canGoPrevious = currentIndex > 0
  const canGoNext = currentIndex < availableMonths.length - 1

  // Hitung total revenue & transaksi untuk bulan yang dipilih
  const monthlyRevenue = filteredData.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const monthlyTransactions = filteredData.reduce((sum, d) => sum + (d.transactions || 0), 0)
  const avgTransactionValue = monthlyTransactions > 0 ? monthlyRevenue / monthlyTransactions : 0

  return (
    <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Revenue & Transaction Performance</h2>
        <p className="text-sm text-muted-foreground mt-1">Pilih bulan untuk melihat data harian</p>
      </div>

      {/* Month/Year Selector */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Tahun:</label>
          <select
            value={selectedYear ? String(selectedYear) : ""}
            onChange={(e) => {
              const year = e.target.value ? Number(e.target.value) : null
              if (year) {
                setSelectedYear(year)
                const firstMonthInYear = availableMonths.find((m) => m.year === year)
                if (firstMonthInYear) setSelectedMonth(firstMonthInYear.month)
              }
            }}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            {availableYears.length === 0 && <option value="">Tidak ada data</option>}
            {availableYears.map((year) => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Bulan:</label>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousMonth}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <select
              value={selectedMonth ? String(selectedMonth) : ""}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm min-w-[120px]"
            >
              {monthsForYear.length === 0 && <option value="">Tidak ada data</option>}
              {monthsForYear.map((m) => (
                <option key={m.month} value={String(m.month)}>
                  {monthNames[m.month - 1]}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedYear && selectedMonth && (
          <span className="text-sm text-muted-foreground ml-auto">
            {selectedMonthName} {selectedYear}
          </span>
        )}
      </div>

      {performanceData.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <p>Tidak ada data untuk bulan ini</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</span>
                <span className="text-xl font-bold text-chart-1">
                  {formatCurrency(monthlyRevenue)}
                </span>
              </div>
              <Badge variant="outline" className="text-chart-1 bg-chart-1/5 border-chart-1/20 font-medium">
                Avg Transaction: {formatCurrency(avgTransactionValue)}
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  interval={Math.floor(performanceData.length / 6)}
                />
                <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" tick={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Transactions
                </span>
                <span className="text-xl font-bold text-chart-2">{monthlyTransactions}</span>
              </div>
              <Badge variant="outline" className="text-chart-2 bg-chart-2/5 border-chart-2/20 font-medium">
                Orders Processed
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  interval={Math.floor(performanceData.length / 6)}
                />
                <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" tick={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="transactions"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#colorTransactions)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
