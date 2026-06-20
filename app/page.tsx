import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsOverview } from "@/components/metrics-overview"
import { CustomerSegmentation } from "@/components/customer-segmentation"
import { PerformanceCharts } from "@/components/performance-charts"
import { SegmentDetails } from "@/components/segment-details"
import { DataUpload } from "@/components/data-upload"
import { AdvancedAnalytics } from "@/components/advanced-analytics"
import { AIInsights } from "@/components/ai-insights"
import { AIDataCleaner } from "@/components/ai-data-cleaner"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <AIDataCleaner />

        <DataUpload />

        <MetricsOverview />

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerSegmentation />
          <PerformanceCharts />
        </div>

        <AIInsights />

        <AdvancedAnalytics />

        <SegmentDetails />
      </main>
    </div>
  )
}
