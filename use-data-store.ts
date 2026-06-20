"use client"

import { useEffect, useState } from "react"
import { dataStore, type ProcessedData } from "@/lib/data-store"

export function useDataStore() {
  const [data, setData] = useState<ProcessedData | null>(dataStore.getFilteredData())
  const [timeRange, setTimeRangeState] = useState<string>(dataStore.getTimeRange())

  useEffect(() => {
    const unsubscribe = dataStore.subscribe(() => {
      setData(dataStore.getFilteredData())
      setTimeRangeState(dataStore.getTimeRange())
    })

    return unsubscribe
  }, [])

  const setTimeRange = (range: string) => {
    dataStore.setTimeRange(range)
  }

  return { data, timeRange, setTimeRange }
}
