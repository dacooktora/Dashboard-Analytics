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
  xAxis,
  yAxis,
  scale,
  offsetX,
  offsetY,
}: any) => {
  if (!xAxis || !yAxis || !data || !xAxis.scale || !yAxis.scale) return null

  return (
    <g>
      {/* Cluster enclosures */}
      {segments.map((segmentName: string) => {
        const points = data.filter((d: any) => d.segment === segmentName)
        if (points.length < 1) return null

        const avgX = points.reduce((sum: number, p: any) => sum + p.x, 0) / points.length
        const avgY = points.reduce((sum: number, p: any) => sum + p.y, 0) / points.length

        const cx = xAxis.scale(avgX)
        const cy = yAxis.scale(avgY)

        const pixelDistances = points.map((p: any) => {
          const px = xAxis.scale(p.x)
          const py = yAxis.scale(p.y)
          return Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2))
        })

        const maxDist = Math.max(...pixelDistances)
        const radius = (maxDist || 30) + 30
        const color = COLORS[segmentName as keyof typeof COLORS]

        // Apply zoom transform to enclosure
        const zoomedCx = offsetX + cx * scale
        const zoomedCy = offsetY + cy * scale

        return (
          <circle
            key={`enclosure-${segmentName}`}
            cx={zoomedCx}
            cy={zoomedCy}
            r={radius * scale}
            fill={color}
            fillOpacity={0.05}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="10 5"
          />
        )
      })}

      {/* Data points with zoom */}
      {data.map((point: any, idx: number) => {
        const cx = xAxis.scale(point.x)
        const cy = yAxis.scale(point.y)
        const color = COLORS[point.segment as keyof typeof COLORS] || "#888"

        // Apply zoom transform only to dot positions
        const zoomedCx = offsetX + cx * scale
        const zoomedCy = offsetY + cy * scale

        return (
          <circle
            key={`dot-${idx}`}
            cx={zoomedCx}
            cy={zoomedCy}
            r={6}
            fill={color}
            fillOpacity={0.9}
            stroke="#fff"
            strokeWidth={2}
          />
        )
      })}
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
    setScale((s) => Math.min(s + 0.3, 5))
  }

  const handleZoomOut = () => {
    setScale((s) => Math.max(s - 0.3, 0.5))
  }

  const handleReset = () => {
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  // Pinch to zoom handler
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      )

      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current
        setScale((s) => Math.min(Math.max(s + delta * 0.01, 0.5), 5))
      }
      lastPinchDist.current = dist
    }
  }, [])

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

  return (
    <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">K-Means Customer Segmentation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualisasi pengelompokan pelanggan berdasarkan Frekuensi vs Nilai Transaksi
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
          {/* Zoom Controls */}
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

          {/* Chart */}
          <div
            ref={chartAreaRef}
            style={{ width: "100%", height: containerHeight }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 10, bottom: 50, left: 10 }}>
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
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  domain={[0, 100]}
                  label={{
                    value: "Frekuensi Score (%)",
                    position: "bottom",
                    offset: 30,
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Nilai Transaksi"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(val) =>
                    `Rp ${Math.round(val).toLocaleString("id-ID")}`
                  }
                  width={90}
                />

                {/* Render zoomed dots via Customized */}
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
                <Legend
                  verticalAlign="top"
                  align="center"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />

                {/* Invisible scatter untuk tooltip tetap jalan */}
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
