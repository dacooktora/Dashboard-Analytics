"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Target } from "lucide-react"
import { useDataStore } from "@/hooks/use-data-store"

export function MetricsOverview() {
  const { data } = useDataStore()

  const metrics = data
    ? [
        {
          title: "Total Pelanggan",
          value: data.metrics.totalCustomers.toLocaleString(),
          change: "+12.5%",
          trend: "up" as const,
          icon: Users,
        },
        {
          title: "Transaksi Bulan Ini",
          value: data.metrics.totalTransactions.toLocaleString(),
          change: "+8.2%",
          trend: "up" as const,
          icon: ShoppingCart,
        },
        {
          title: "Revenue",
          value: `Rp ${Math.round(data.metrics.totalRevenue).toLocaleString("id-ID")}`,
          change: "+15.3%",
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          title: "Conversion Rate",
          value: `${data.metrics.conversionRate.toFixed(2)}%`,
          change: "-2.1%",
          trend: "down" as const,
          icon: Target,
        },
      ]
    : [
        {
          title: "Total Pelanggan",
          value: "-",
          change: "-",
          trend: "up" as const,
          icon: Users,
        },
        {
          title: "Transaksi Bulan Ini",
          value: "-",
          change: "-",
          trend: "up" as const,
          icon: ShoppingCart,
        },
        {
          title: "Revenue",
          value: "-",
          change: "-",
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          title: "Conversion Rate",
          value: "-",
          change: "-",
          trend: "down" as const,
          icon: Target,
        },
      ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown

        return (
          <Card key={metric.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {data && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-accent" : "text-destructive"
                  }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              <p className="mt-1 text-2xl font-bold tracking-tight">{metric.value}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
