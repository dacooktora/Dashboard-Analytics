"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDataStore } from "@/hooks/use-data-store"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
]

// Formatter for Indonesian Rupiah — nominal penuh
function formatCurrency(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`
}

export function AdvancedAnalytics() {
  const { data } = useDataStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Advanced Analytics</h2>
            <p className="text-sm text-muted-foreground">Analisis mendalam untuk pengambilan keputusan strategis</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Upload data untuk melihat analisis</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Advanced Analytics</h2>
          <p className="text-sm text-muted-foreground">Analisis mendalam untuk pengambilan keputusan strategis</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* RFM Analysis Radar */}
        <Card className="p-6 overflow-hidden border-none shadow-md bg-card/50 backdrop-blur">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">RFM Analysis Dashboard</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Visualisasi profil segmen berdasarkan Recency, Frequency, & Monetary
            </p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.rfmData}>
              <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="segment"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
              <Radar
                name="Recency"
                dataKey="recency"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.4}
                animationBegin={0}
                animationDuration={1500}
              />
              <Radar
                name="Frequency"
                dataKey="frequency"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.4}
                animationBegin={300}
                animationDuration={1500}
              />
              <Radar
                name="Monetary"
                dataKey="monetary"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
                animationBegin={600}
                animationDuration={1500}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* CLV Distribution */}
        <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">CLV Distribution</h3>
            <p className="text-xs text-muted-foreground mt-1">Distribusi pelanggan berdasarkan Customer Lifetime Value</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.clvData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="range"
                axisLine={false}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={55}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="count" animationDuration={2000} barSize={40}>
                {data.clvData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} radius={[6, 6, 0, 0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-4 justify-start">
            {data.clvData.map((item, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                style={{ backgroundColor: `${COLORS[idx % COLORS.length]}20`, color: COLORS[idx % COLORS.length] }}
                className="border-none font-medium"
              >
                {item.range}: {item.count} customer ({item.percentage}%)
              </Badge>
            ))}
          </div>
        </Card>

        {/* Cohort Retention Analysis — FIXED */}
        <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Retention & Revenue Trend</h3>
            <p className="text-xs text-muted-foreground mt-1">Analisis kohort dan pertumbuhan pendapatan bulanan</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[280px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={data.cohortData} 
                  margin={{ 
                    top: 10, 
                    right: 5, 
                    left: -5, 
                    bottom: 0 
                  }}
                >
                  <defs>
                    <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    tickFormatter={(val) => formatCurrency(val)}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="retention"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--chart-2))", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Retention %"
                    animationDuration={2500}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--chart-1))", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Revenue"
                    animationDuration={2500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Product Category Performance */}
        <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Category Performance</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Klik kategori untuk melihat detail pelanggan yang membeli produk tersebut
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                    onClick={(entry) => setSelectedCategory(entry.name)}
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedCategory === entry.name ? COLORS[index % COLORS.length] : `${COLORS[index % COLORS.length]}80`}
                        stroke={selectedCategory === entry.name ? "#000" : "none"}
                        strokeWidth={selectedCategory === entry.name ? 2 : 0}
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                        opacity={selectedCategory === null || selectedCategory === entry.name ? 1 : 0.4}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${formatCurrency(props.payload.revenue)} (${value}%)`,
                      name,
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {selectedCategory && (
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">
                    Pelanggan yang membeli {selectedCategory}
                  </h4>
                </div>
                <div className="overflow-x-auto max-h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Nama Pelanggan</TableHead>
                        <TableHead className="text-xs">Frekuensi Beli</TableHead>
                        <TableHead className="text-xs text-right">Total Nominal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.segments
                        .flatMap((seg: any) => seg.customers || [])
                        .filter((c: any) => c.product_category === selectedCategory)
                        .reduce((acc: any, c: any) => {
                          const existing = acc.find((item: any) => item.customer_id === c.customer_id)
                          if (existing) {
                            existing.count += 1
                            existing.total += c.transaction_amount
                          } else {
                            acc.push({
                              customer_id: c.customer_id,
                              customer_name: c.customer_name || "Unknown",
                              count: 1,
                              total: c.transaction_amount,
                            })
                          }
                          return acc
                        }, [])
                        .sort((a: any, b: any) => b.total - a.total)
                        .map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-medium">{item.customer_name}</TableCell>
                            <TableCell className="text-xs">{item.count}x</TableCell>
                            <TableCell className="text-xs text-right font-medium">
                              {formatCurrency(item.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
