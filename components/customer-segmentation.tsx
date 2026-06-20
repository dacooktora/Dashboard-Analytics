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
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

const COLORS = {
  "High Value": "#ef4444",
  "Medium Value": "#3b82f6",
  "Low Value": "#22c55e",
  Potential: "#eab308",
}

const RenderClusterEnclosures = ({ segments, data, xAxis, yAxis }: any) => {
  if (!xAxis || !yAxis || !data || !xAxis.scale || !yAxis.scale) return null

  return (
    <g>
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

        return (
          <circle
            key={`enclosure-${segmentName}`}
            cx={cx}
            cy={cy}
            r={radius}
            fill={color}
            fillOpacity={0.05}
            stroke={color}
            strokeWidth={2}
            strokeDasharray="10 5"
          />
        )
      })}
    </g>
  )
}

export function CustomerSegmentation() {
  const { data } = useDataStore()

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

  return (
    <Card className="p-6 border-none shadow-md bg-card/50 backdrop-blur">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">K-Means Customer Segmentation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualisasi pengelompokan pelanggan berdasarkan Frekuensi vs Nilai Transaksi
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          💡 Pinch (2 jari) untuk zoom, geser untuk eksplorasi
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
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

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={true}
        smooth={true}
        wheel={{ step: 0.05 }}
        pinch={{ step: 0.05 }}
      >
        {({ setTransform }) => (
          <>
            <div className="flex justify-end mb-1">
              <button
                onClick={() => setTransform(1, 0, 0)}
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                Reset Zoom
              </button>
            </div>
            <TransformComponent
              wrapperStyle={{
                width: "100%",
                height: 370,
                touchAction: "none",
              }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 20, right: 10, bottom: 50, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                    tickFormatter={(val) => `Rp ${Math.round(val).toLocaleString("id-ID")}`}
                    width={90}
                  />

                  <Customized
                    component={(props: any) => (
                      <RenderClusterEnclosures {...props} segments={segmentList} data={data.clusterData} />
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
                      if (name === "Nilai Transaksi") return [`Rp ${value.toLocaleString("id-ID")}`, name]
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

                  {segmentList.map((segmentName) => (
                    <Scatter
                      key={segmentName}
                      name={segmentName}
                      data={data.clusterData.filter((d) => d.segment === segmentName)}
                      fill={COLORS[segmentName as keyof typeof COLORS]}
                      animationDuration={1500}
                    >
                      {data.clusterData
                        .filter((d) => d.segment === segmentName)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${segmentName}-${index}`}
                            fill={COLORS[segmentName as keyof typeof COLORS]}
                            fillOpacity={0.9}
                            stroke="#fff"
                            strokeWidth={2}
                            r={6}
                          />
                        ))}
                    </Scatter>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </Card>
  )
}
