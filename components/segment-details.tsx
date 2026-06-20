"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDataStore } from "@/hooks/use-data-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDynamicRecommendations } from "@/lib/strategy-scoring"
import { StrategyAccordion } from "@/components/strategy-accordion"

type SortField = "transaction_amount" | "transaction_date" | "frequency" | "customer_name"
type SortOrder = "asc" | "desc"

export function SegmentDetails() {
  const { data } = useDataStore()
  const [selectedSegment, setSelectedSegment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("transaction_amount")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const itemsPerPage = 20

  const handleViewDetail = (segment: any) => {
    setSelectedSegment(segment)
    setCurrentPage(1)
    setSortField("transaction_amount")
    setSortOrder("desc")
    setIsDialogOpen(true)
  }

  const getSortedCustomers = (customers: any[]) => {
    if (!customers) return []

    const customerFrequency = new Map<string, number>()
    customers.forEach((c) => {
      customerFrequency.set(c.customer_id, (customerFrequency.get(c.customer_id) || 0) + 1)
    })

    const customersWithFrequency = customers.map((c) => ({
      ...c,
      frequency: customerFrequency.get(c.customer_id) || 1,
    }))

    return [...customersWithFrequency].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "transaction_amount":
          comparison = a.transaction_amount - b.transaction_amount
          break
        case "transaction_date":
          comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
          break
        case "frequency":
          comparison = a.frequency - b.frequency
          break
        case "customer_name":
          comparison = (a.customer_name || "").localeCompare(b.customer_name || "")
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })
  }

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Detail Segmentasi Customer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis mendalam dan rekomendasi aksi untuk setiap segmen
          </p>
        </div>
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <p>Upload data untuk melihat detail segmentasi</p>
        </div>
      </Card>
    )
  }

  const sortedCustomers = selectedSegment ? getSortedCustomers(selectedSegment.customers) : []
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex)

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Detail Segmentasi Customer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis mendalam dan rekomendasi aksi untuk setiap segmen
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {data.segments.map((segment, idx) => (
            <Card key={segment.name} className="p-5 border-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-balance">{segment.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="font-mono">
                      {segment.count} pelanggan
                    </Badge>
                    <span className="text-sm text-muted-foreground">{segment.percentage.toFixed(1)}% dari total</span>
                  </div>
                </div>
                <div
                  className={`h-3 w-3 rounded-full bg-chart-${idx + 1}`}
                  style={{
                    backgroundColor: `hsl(var(--chart-${idx + 1}))`,
                  }}
                />
              </div>

              <Progress value={segment.percentage * 2.5} className="mb-4" />

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-xs">Avg. Transaksi</span>
                  </div>
                  <p className="text-sm font-semibold">Rp {Math.round(segment.avgValue).toLocaleString("id-ID")}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">Total</span>
                  </div>
                  <p className="text-sm font-semibold">{segment.count}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">Revenue</span>
                  </div>
                  <p className="text-sm font-semibold">
                    Rp {Math.round(segment.avgValue * segment.count).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Rekomendasi Strategi:</p>
                {(() => {
                  const recs = getDynamicRecommendations(segment, data.segments)
                  return (
                    <div className="mb-4">
                      <StrategyAccordion recommendations={recs} segmentName={segment.name} />
                    </div>
                  )
                })()}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => handleViewDetail(segment)}
                >
                  Lihat Detail
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedSegment?.name}</DialogTitle>
            <DialogDescription>Detail customer dan analisis mendalam untuk segment ini</DialogDescription>
          </DialogHeader>

          {selectedSegment && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-xs">Total Customer</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedSegment.count}</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">
                    Rp {Math.round(selectedSegment.avgValue * selectedSegment.count).toLocaleString("id-ID")}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs">Percentage</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedSegment.percentage.toFixed(1)}%</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-xs">Avg. Transaction</span>
                  </div>
                  <p className="text-2xl font-bold">Rp {Math.round(selectedSegment.avgValue).toLocaleString("id-ID")}</p>
                </Card>
              </div>

              <div>
                <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold">Daftar Customer (Semua Data)</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={sortField} onValueChange={(value) => handleSortChange(value as SortField)}>
                      <SelectTrigger className="w-[200px] bg-transparent">
                        <SelectValue placeholder="Urutkan berdasarkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transaction_amount">Nilai Transaksi</SelectItem>
                        <SelectItem value="frequency">Frekuensi Transaksi</SelectItem>
                        <SelectItem value="transaction_date">Tanggal Transaksi</SelectItem>
                        <SelectItem value="customer_name">Nama Customer</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "desc" ? (
                        <>
                          <ArrowDown className="h-4 w-4 mr-1" />
                          Tertinggi
                        </>
                      ) : (
                        <>
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Terendah
                        </>
                      )}
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      {startIndex + 1}-{Math.min(endIndex, sortedCustomers.length)} dari {sortedCustomers.length}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead className="hidden md:table-cell">Lokasi</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Frekuensi
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Nilai Transaksi
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-xs">{customer.customer_id}</TableCell>
                          <TableCell className="font-medium">{customer.customer_name || "-"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <span>{customer.email || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">{customer.customer_location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">
                              {customer.frequency}x
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            Rp {customer.transaction_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>{customer.transaction_date}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-3 text-center text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </div>
              </div>

              <Card className="p-4 bg-primary/5">
                <h3 className="font-semibold mb-3">Rekomendasi Aksi untuk Segment Ini</h3>
                <StrategyAccordion
                  recommendations={getDynamicRecommendations(selectedSegment, data.segments)}
                  segmentName={selectedSegment.name}
                  showMeta
                />
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
