"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDataStore } from "@/hooks/use-data-store"
import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Customized,
} from "recharts"
import { useEffect, useState, useRef, useCallback } from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

const COLORS = {
  "High Value": "#ef4444",
  "Medium Value": "#3b82f6",
  "Low Value": "#22c55e",
  Potential: "#eab308",
}

const RenderZoomedDots = ({
  segments,
  data,
  xAxisMap,
  yAxisMap,
  scale,
  offsetX,
  offsetY,
}: any) => {
  const xAxis = xAxisMap && Object.values(xAxisMap)[0]
  const yAxis = yAxisMap && Object.values(yAxisMap)[0]

  if (!xAxis || !yAxis || !data || !(xAxis as any).scale || !(yAxis as any).scale)
    return null

  const xScale = (xAxis as any).scale
  const yScale = (yAxis as any).scale
  const xRange = xScale.range()
  const yRange = yScale.range()
  const xMin = Math.min(...xRange)
  const xMax = Math.max(...xRange)
  const yMin = Math.min(...yRange)
  const yMax = Math.max(...yRange)

  return (
    <g>
      <defs>
        <clipPath id="chart-clip">
          <rect x={xMin} y={yMin} width={xMax - xMin} height={yMax - yMin} />
        </clipPath>
      </defs>

      <g clipPath="url(#chart-clip)">
        {data.map((point: any, idx: number) => {
          const cx = xScale(point.x)
          const cy = yScale(point.y)
          const color = COLORS[point.segment as keyof typeof COLORS] || "#888"

          const zoomedCx = offsetX + cx * scale
          const zoomedCy = offsetY + cy * scale

          return (
            <circle
              key={`dot-${idx}`}
              cx={zoomedCx}
              cy={zoomedCy}
              r={6 * scale}
              fill={color}
              fillOpacity={0.9}
              stroke="#fff"
              strokeWidth={2}
            />
          )
        })}
      </g>
    </g>
  )
}

export function CustomerSegmentation() {
  const { data } = useDataStore()
  const [isClient, setIsClient] = useState(false)
  const [containerHeight, setContainerHeight] = useState(400)
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const lastPinchDist = useRef<number | null>(null)
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })

  const MIN_SCALE = 0.5
  const MAX_SCALE = 5

  const applyZoom = useCallback((rawScale: number, anchorX: number, anchorY: number) => {
    const newScale = Math.min(Math.max(rawScale, MIN_SCALE), MAX_SCALE)
    const { scale: oldScale, offsetX: oldOffsetX, offsetY: oldOffsetY } = transformRef.current
    if (newScale === oldScale) return

    const ratio = newScale / oldScale
    const newOffsetX = anchorX - (anchorX - oldOffsetX) * ratio
    const newOffsetY = anchorY - (anchorY - oldOffsetY) * ratio

    transformRef.current = { scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY }
    setScale(newScale)
    setOffsetX(newOffsetX)
    setOffsetY(newOffsetY)
  }, [])

  const getContainerCenter = () => {
    const rect = chartAreaRef.current?.getBoundingClientRect()
    return rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 }
  }

  // Hitung domain dinamis untuk sumbu X dan Y berdasarkan zoom
  const getXDomain = () => {
    const range = 100 / scale
    const center = 50 - offsetX / scale
    return [Math.max(0, center - range / 2), Math.min(100, center + range / 2)]
  }

  const getYDomain = () => {
    const maxY = data?.clusterData?.reduce((max, d) => Math.max(max, d.y), 0) || 10000000
    const range = maxY / scale
    const center = maxY / 2 - offsetY / scale
    return [Math.max(0, center - range / 2), Math.min(maxY, center + range / 2)]
  }

  useEffect(() => {
    setIsClient(true)
    const updateHeight = () => {
      const width = window.innerWidth
      if (width < 640) setContainerHeight(320)
      else if (width < 1024) setContainerHeight(360)
      else setContainerHeight(400)
    }
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [])

  const handleZoomIn = () => {
    const { x, y } = getContainerCenter()
    applyZoom(transformRef.current.scale + 0.3, x, y)
  }

  const handleZoomOut = () => {
    const { x, y } = getContainerCenter()
    applyZoom(transformRef.current.scale - 0.3, x, y)
  }

  const handleReset = () => {
    transformRef.current = { scale: 1, offsetX: 0, offsetY: 0 }
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  const getTouchDist = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinchDist.current = getTouchDist(e.touches[0], e.touches[1])
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && chartAreaRef.current) {
        e.preventDefault()
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const dist = getTouchDist(touch1, touch2)
        const rect = chartAreaRef.current.getBoundingClientRect()
        const midX = (touch1.clientX + touch2.clientX) / 2 - rect.left
        const midY = (touch1.clientY + touch2.clientY) / 2 - rect.top

        if (lastPinchDist.current) {
          const ratio = dist / lastPinchDist.current
          applyZoom(transformRef.current.scale * ratio, midX, midY)
        }
        lastPinchDist.current = dist
      }
    },
    [applyZoom]
  )

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null
  }, [])

  if (!data) {
    return (
      <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">K-Means Customer Segmentation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visualisasi clustering berdasarkan nilai transaksi dan frekuensi
          </p>
        </div>
        <div className="flex items-center justify-center h-[350px] text-muted-foreground">
          <p>Upload data untuk melihat visualisasi clustering</p>
        </div>
      </Card>
    )
  }

  const segmentList = ["High Value", "Medium Value", "Low Value", "Potential"]
  const hasData = data.clusterData && data.clusterData.length > 0
  const xDomain = getXDomain()
  const yDomain = getYDomain()

  return (
    <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">K-Means Customer Segmentation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualisasi pengelompokan pelanggan berdasarkan Frekuensi vs Nilai Transaksi
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          💡 Zoom: pinch (2 jari) atau tombol +/-
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {data.segments.map((segment) => (
          <Badge
            key={segment.name}
            variant="outline"
            style={{
              borderColor: COLORS[segment.name as keyof typeof COLORS],
              color: COLORS[segment.name as keyof typeof COLORS],
              backgroundColor: `${COLORS[segment.name as keyof typeof COLORS]}10`,
            }}
            className="font-medium px-3 py-1"
          >
            {segment.name} ({segment.count})
          </Badge>
        ))}
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Data cluster tidak tersedia</p>
        </div>
      ) : !isClient ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Memuat chart...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end gap-2 mb-2">
            <span className="text-xs text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomIn}
              disabled={scale >= 5}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleReset}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          <div
            ref={chartAreaRef}
            style={{
              width: "100%",
              height: containerHeight,
              touchAction: "pan-y",
              overflow: "hidden",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 5, bottom: 40, left: -10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Frekuensi"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13, fontWeight: 500 }}
                  domain={xDomain}
                  tickCount={6}
                  label={{
                    value: "Frekuensi Score (%)",
                    position: "bottom",
                    offset: 25,
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Nilai Transaksi"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val) =>
                    val >= 1000000 ? `Rp ${Math.round(val / 1000000)}JT` : `Rp ${Math.round(val / 1000)}K`
                  }
                  width={60}
                  domain={yDomain}
                  tickCount={5}
                />

                <Customized
                  component={(props: any) => (
                    <RenderZoomedDots
                      {...props}
                      segments={segmentList}
                      data={data.clusterData}
                      scale={scale}
                      offsetX={offsetX}
                      offsetY={offsetY}
                    />
                  )}
                />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "Nilai Transaksi")
                      return [`Rp ${value.toLocaleString("id-ID")}`, name]
                    return [value, name]
                  }}
                />

                {segmentList.map((segmentName) => (
                  <Scatter
                    key={segmentName}
                    name={segmentName}
                    data={data.clusterData.filter((d) => d.segment === segmentName)}
                    fill="transparent"
                    opacity={0}
                  >
                    {data.clusterData
                      .filter((d) => d.segment === segmentName)
                      .map((entry, index) => (
                        <Cell
                          key={`cell-${segmentName}-${index}`}
                          fill="transparent"
                          r={6}
                        />
                      ))}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Card>
  )
}
