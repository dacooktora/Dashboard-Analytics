export interface CustomerData {
  customer_id: string
  transaction_date: string
  transaction_amount: number
  product_category: string
  payment_method: string
  customer_age: number
  customer_location: string
  customer_name?: string
  email?: string
  phone?: string
}

export interface ProcessedData {
  customers: CustomerData[]
  metrics: {
    totalCustomers: number
    totalTransactions: number
    totalRevenue: number
    conversionRate: number
    avgTransactionValue: number
  }
  segments: {
    name: string
    count: number
    percentage: number
    avgValue: number
    customers: CustomerData[]
  }[]
  clusterData: {
    x: number
    y: number
    segment: string
    customer_id: string
  }[]
  timeSeriesData: {
    date: string
    revenue: number
    transactions: number
  }[]
  categoryData: {
    name: string
    value: number
    revenue: number
  }[]
  cohortData: {
    month: string
    retention: number
    revenue: number
  }[]
  clvData: {
    range: string
    count: number
    percentage: number
  }[]
  rfmData: {
    segment: string
    recency: number
    frequency: number
    monetary: number
    count: number
  }[]
}

class DataStore {
  private listeners: Set<() => void> = new Set()
  private data: ProcessedData | null = null
  // Default to "all" so newly applied data is never silently hidden by a date filter
  private timeRange = "all"

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify() {
    this.listeners.forEach((listener) => listener())
  }

  setData(data: ProcessedData) {
    this.data = data
    this.notify()
  }

  getData(): ProcessedData | null {
    return this.data
  }

  getFilteredData(): ProcessedData | null {
    if (!this.data) return null

    // "all" (default) — no date filtering, return everything that was uploaded
    if (this.timeRange === "all") {
      return this.data
    }

    // Use the real current date instead of a hardcoded one
    const now = new Date()
    let daysToFilter = 30

    switch (this.timeRange) {
      case "24h":
        daysToFilter = 1
        break
      case "7d":
        daysToFilter = 7
        break
      case "30d":
        daysToFilter = 30
        break
      case "90d":
        daysToFilter = 90
        break
      default:
        daysToFilter = 30
    }

    const cutoffDate = new Date(now)
    cutoffDate.setDate(cutoffDate.getDate() - daysToFilter)

    // Filter customers by date
    const filteredCustomers = this.data.customers.filter((customer) => {
      const transactionDate = new Date(customer.transaction_date)
      return transactionDate >= cutoffDate && transactionDate <= now
    })

    if (filteredCustomers.length === 0) {
      return this.data // Return original data if no data in range
    }

    // Reprocess filtered data
    const { processCustomerData } = require("./data-processor")
    return processCustomerData(filteredCustomers)
  }

  setTimeRange(range: string) {
    this.timeRange = range
    this.notify()
  }

  getTimeRange(): string {
    return this.timeRange
  }

  clearData() {
    this.data = null
    this.notify()
  }

  hasData(): boolean {
    return this.data !== null
  }
}

export const dataStore = new DataStore()
