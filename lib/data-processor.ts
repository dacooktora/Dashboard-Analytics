import type { CustomerData, ProcessedData } from "./data-store"

// Currency formatter for Indonesian Rupiah — nominal penuh dengan titik pemisah ribuan
export function formatCurrency(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`
}

// Helper function to calculate percentile rank for non-uniform distribution
function percentileRank(values: number[], value: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  const below = sorted.filter((v) => v < value).length
  const equal = sorted.filter((v) => v === value).length
  return Math.round(((below + equal * 0.5) / sorted.length) * 100)
}

export function parseCSV(text: string): CustomerData[] {
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())

  const customers: CustomerData[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length < headers.length) continue

    const customer: any = {}
    headers.forEach((header, index) => {
      customer[header] = values[index]
    })

    customers.push({
      customer_id: customer.customer_id || `CUST${i}`,
      transaction_date: customer.transaction_date || new Date().toISOString().split("T")[0],
      transaction_amount: Number.parseFloat(customer.transaction_amount) || 0,
      product_category: customer.product_category || "Unknown",
      payment_method: customer.payment_method || "Unknown",
      customer_age: Number.parseInt(customer.customer_age) || 0,
      customer_location: customer.customer_location || "Unknown",
      customer_name: customer.customer_name,
      email: customer.email,
      phone: customer.phone,
    })
  }

  return customers
}

export function processCustomerData(customers: CustomerData[]): ProcessedData {
  // Calculate RFM metrics for each customer
  const customerMetrics = new Map<
    string,
    {
      recency: number
      frequency: number
      monetary: number
      transactions: CustomerData[]
    }
  >()

  const today = new Date("2026-06-30") // Use the current date from context

  customers.forEach((customer) => {
    const existing = customerMetrics.get(customer.customer_id)
    const transactionDate = new Date(customer.transaction_date)
    const daysSinceTransaction = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (existing) {
      existing.frequency += 1
      existing.monetary += customer.transaction_amount
      existing.recency = Math.min(existing.recency, daysSinceTransaction)
      existing.transactions.push(customer)
    } else {
      customerMetrics.set(customer.customer_id, {
        recency: daysSinceTransaction,
        frequency: 1,
        monetary: customer.transaction_amount,
        transactions: [customer],
      })
    }
  })

  const customerArray = Array.from(customerMetrics.entries()).map(([id, metrics]) => ({
    id,
    ...metrics,
  }))

  // Extract arrays for percentile calculation
  const frequencyValues = customerArray.map((c) => c.frequency)
  const monetaryValues = customerArray.map((c) => c.monetary)
  const recencyValues = customerArray.map((c) => c.recency)

  // Normalize using percentile rank (handles non-uniform distributions better)
  const normalizedCustomers = customerArray.map((c) => ({
    ...c,
    normalizedFrequency: percentileRank(frequencyValues, c.frequency),
    normalizedMonetary: percentileRank(monetaryValues, c.monetary),
    normalizedRecency: 100 - percentileRank(recencyValues, c.recency), // Inverse: lower recency = higher score
  }))

  // Perform RFM-based segmentation (sophisticated algorithm)
  const segments = performRFMSegmentation(normalizedCustomers)

  const totalRevenue = customers.reduce((sum, c) => sum + c.transaction_amount, 0)
  const uniqueCustomers = customerMetrics.size

  const timeSeriesMap = new Map<string, { revenue: number; transactions: number }>()
  customers.forEach((c) => {
    const date = c.transaction_date
    const existing = timeSeriesMap.get(date) || { revenue: 0, transactions: 0 }
    existing.revenue += c.transaction_amount
    existing.transactions += 1
    timeSeriesMap.set(date, existing)
  })

  const timeSeriesData = Array.from(timeSeriesMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    customers,
    metrics: {
      totalCustomers: uniqueCustomers,
      totalTransactions: customers.length,
      totalRevenue,
      conversionRate: uniqueCustomers > 0 ? (uniqueCustomers / customers.length) * 100 : 0,
      avgTransactionValue: customers.length > 0 ? totalRevenue / customers.length : 0,
    },
    segments: segments.map((seg) => ({
      name: seg.name,
      count: seg.count,
      percentage: seg.percentage,
      avgValue: seg.avgValue,
      customers: seg.transactionList, // Raw transactions for table/detail views
    })),
    clusterData: normalizedCustomers.map((c) => {
      const segmentName = getSegmentName(c, segments)

      // Menggunakan kombinasi Frequency dan Monetary untuk sebaran yang lebih alami
      // Add jittering to avoid overlapping points using ID-based variation
      const jitter = (c.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 15) - 7.5
      let displayX = Math.min(100, Math.max(0, c.normalizedFrequency + jitter))

      return {
        x: displayX,
        y: c.monetary,
        segment: segmentName,
        customer_id: c.id,
      }
    }),
    timeSeriesData,
    categoryData: calculateCategoryData(customers),
    cohortData: calculateCohortData(customers),
    clvData: calculateCLVData(customerArray),
    rfmData: calculateRFMData(segments),
  }
}

function performRFMSegmentation(customers: any[]): {
  name: string
  count: number
  percentage: number
  avgValue: number
  metricList: any[]
  transactionList: CustomerData[]
}[] {
  // Calculate RFM scores menggunakan weighted formula
  const customersWithRFMScore = customers.map((c) => {
    // Normalize each metric ke scale 0-100
    const recencyScore = c.normalizedRecency // 0-100 (higher = lebih baru)
    const frequencyScore = c.normalizedFrequency // 0-100 (higher = semakin sering)
    const monetaryScore = c.normalizedMonetary // 0-100 (higher = lebih besar)

    // Weighted RFM Score = (R×0.3) + (F×0.3) + (M×0.4)
    // Monetary diberi bobot lebih besar karena value paling penting untuk bisnis
    const rfmScore = recencyScore * 0.3 + frequencyScore * 0.3 + monetaryScore * 0.4

    return {
      ...c,
      rfmScore: Math.round(rfmScore),
    }
  })

  // Segment berdasarkan RFM Score thresholds (bukan pembagian rata rata)
  const segmentRanges = [
    { name: "High Value", min: 70, max: 100, description: "Loyal, sering beli, value tinggi" },
    { name: "Medium Value", min: 40, max: 69, description: "Growing customer, perlu nurture" },
    { name: "Low Value", min: 20, max: 39, description: "One-time buyer atau inactive" },
    { name: "Potential", min: 0, max: 19, description: "Churn risk atau new customer" },
  ]

  const totalCustomers = customersWithRFMScore.length

  return segmentRanges.map((range) => {
    const segCustomers = customersWithRFMScore.filter((c) => c.rfmScore >= range.min && c.rfmScore <= range.max)
    const totalValue = segCustomers.reduce((sum, c) => sum + c.monetary, 0)

    return {
      name: range.name,
      count: segCustomers.length,
      percentage: Math.round((segCustomers.length / totalCustomers) * 100),
      avgValue: segCustomers.length > 0 ? totalValue / segCustomers.length : 0,
      metricList: segCustomers,
      transactionList: segCustomers.flatMap((c) => c.transactions),
    }
  })
}

function getSegmentName(customer: any, segments: any[]): string {
  for (const segment of segments) {
    if (segment.metricList.some((c: any) => c.id === customer.id)) {
      return segment.name
    }
  }
  return "Unknown"
}

function calculateCategoryData(customers: CustomerData[]) {
  const categoryMap = new Map<string, number>()

  customers.forEach((c) => {
    const existing = categoryMap.get(c.product_category) || 0
    categoryMap.set(c.product_category, existing + c.transaction_amount)
  })

  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0)

  return Array.from(categoryMap.entries())
    .map(([name, revenue]) => ({
      name,
      value: Math.round((revenue / total) * 100),
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

function calculateCohortData(customers: CustomerData[]) {
  const monthlyData = new Map<string, { customers: Set<string>; revenue: number }>()

  customers.forEach((c) => {
    const d = new Date(c.transaction_date)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const existing = monthlyData.get(monthKey) || { customers: new Set(), revenue: 0 }
    existing.customers.add(c.customer_id)
    existing.revenue += c.transaction_amount
    monthlyData.set(monthKey, existing)
  })

  const sortedKeys = Array.from(monthlyData.keys()).sort()
  const firstMonthKey = sortedKeys[0]
  const firstMonthCustomers = monthlyData.get(firstMonthKey)?.customers.size || 1

  return sortedKeys.slice(-6).map((key) => {
    const data = monthlyData.get(key)!
    const [year, month] = key.split("-")
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", { month: "short" })
    return {
      month: monthName,
      retention: Math.round((data.customers.size / firstMonthCustomers) * 100),
      revenue: Math.round(data.revenue),
    }
  })
}

function calculateCLVData(customerArray: any[]) {
  const ranges = [
    { range: "< Rp 100.000", min: 0, max: 100000 },
    { range: "Rp 100.000 - 500.000", min: 100000, max: 500000 },
    { range: "Rp 500.000 - 1.000.000", min: 500000, max: 1000000 },
    { range: "Rp 1.000.000 - 3.000.000", min: 1000000, max: 3000000 },
    { range: "Rp 3.000.000 - 5.000.000", min: 3000000, max: 5000000 },
    { range: "> Rp 5.000.000", min: 5000000, max: Number.POSITIVE_INFINITY },
  ]

  const distribution = ranges.map((r) => ({
    range: r.range,
    count: customerArray.filter((c) => c.monetary >= r.min && c.monetary < r.max).length,
    percentage: 0,
  }))

  const total = customerArray.length
  distribution.forEach((d) => {
    d.percentage = Math.round((d.count / total) * 100)
  })

  return distribution
}

function calculateRFMData(segments: any[]) {
  const allMetricCustomers = segments.flatMap((seg) => seg.metricList)

  // Use percentile-based approach for consistency with normalization
  const recencyValues = allMetricCustomers.map((c: any) => c.recency || 0)
  const frequencyValues = allMetricCustomers.map((c: any) => c.frequency || 0)
  const monetaryValues = allMetricCustomers.map((c: any) => c.monetary || 0)

  return segments.map((seg) => {
    const customers = seg.metricList
    if (customers.length === 0) {
      return { segment: seg.name, recency: 0, frequency: 0, monetary: 0, count: 0 }
    }

    const avgRecency = customers.reduce((sum: number, c: any) => sum + (c.recency || 0), 0) / customers.length
    const avgFrequency = customers.reduce((sum: number, c: any) => sum + (c.frequency || 0), 0) / customers.length
    const avgMonetary = customers.reduce((sum: number, c: any) => sum + (c.monetary || 0), 0) / customers.length

    // Use percentile rank for consistency
    const recencyScore = 100 - percentileRank(recencyValues, avgRecency)
    const frequencyScore = percentileRank(frequencyValues, avgFrequency)
    const monetaryScore = percentileRank(monetaryValues, avgMonetary)

    return {
      segment: seg.name,
      recency: Math.max(0, recencyScore),
      frequency: frequencyScore,
      monetary: monetaryScore,
      count: seg.count,
    }
  })
}
