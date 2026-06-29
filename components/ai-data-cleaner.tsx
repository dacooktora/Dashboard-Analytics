"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Sparkles, CheckCircle2, AlertCircle, Download, FileSpreadsheet, Play } from "lucide-react"
import { toast } from "sonner"
import { dataStore } from "@/lib/data-store"
import { processCustomerData } from "@/lib/data-processor"

export function AIDataCleaner() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [originalPreview, setOriginalPreview] = useState<any[]>([])
  const [cleanedData, setCleanedData] = useState<any[]>([])
  const [isApplied, setIsApplied] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setStatus("idle")
    setIsApplied(false)

    // Simple preview for the UI
    const text = await selectedFile.text()
    const lines = text.split("\n").slice(0, 4)
    setOriginalPreview(lines.map((line) => line.split(",")))
  }

  const startCleaning = async () => {
  if (!file) return

  setStatus("processing")
  setProgress(10)

  try {
    const content = await file.text()

    const response = await fetch("/api/clean-data", {
      method: "POST",
      body: JSON.stringify({ content, filename: file.name }),
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) throw new Error("Cleaning failed")

    const result = await response.json()
    setCleanedData(result.cleanedData)
    setStatus("success")
    setProgress(100)

    if (result.wasAlreadyClean) {
      toast.success("Format data sudah sesuai, tidak ada yang perlu diubah!")
    } else {
      toast.success("Data berhasil dibersihkan oleh AI!")
    }
  } catch (error) {
    console.error("[v0] Cleaning error:", error)
    setStatus("error")
    toast.error("Gagal membersihkan data. Silakan coba lagi.")
  }
  }

  const applyToDashboard = () => {
    if (cleanedData.length === 0) return

    try {
      const processed = processCustomerData(cleanedData)
      dataStore.setData(processed)
      setIsApplied(true)
      toast.success("Data telah diterapkan ke dashboard!")
    } catch (error) {
      console.error("[v0] Error applying data:", error)
      toast.error("Gagal menerapkan data ke dashboard.")
    }
  }

  const downloadData = () => {
    if (cleanedData.length === 0) return

    const headers = Object.keys(cleanedData[0]).join(",")
    const rows = cleanedData.map((row) => Object.values(row).join(",")).join("\n")
    const csvContent = `${headers}\n${rows}`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cleaned_${file?.name || "data.csv"}`
    a.click()
  }

  return (
    <Card className="w-full border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>AI Data Cleaner</CardTitle>
        </div>
        <CardDescription>
          Unggah data mentah Anda, dan AI kami akan menyesuaikan formatnya agar sesuai dengan dashboard analitik.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "idle" && !file && (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 transition-colors hover:border-primary/50">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Pilih file spreadsheet (CSV/Excel)</p>
            <p className="text-xs text-muted-foreground mb-4">
              Mendukung format mentah tanpa perlu diatur terlebih dahulu
            </p>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                Cari File
                <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
              </label>
            </Button>
          </div>
        )}

        {file && status !== "success" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background border rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              {status === "idle" && (
                <Button size="sm" onClick={startCleaning} disabled={status === "processing"}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Mulai Bersihkan
                </Button>
              )}
            </div>

            {status === "processing" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>AI sedang menganalisis dan memperbaiki format...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        )}

        {status === "success" && cleanedData.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-lg gap-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Data berhasil disesuaikan!</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadData}
                  className="flex-1 sm:flex-none border-green-600/50 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Unduh (CSV)
                </Button>
                <Button
                  size="sm"
                  onClick={applyToDashboard}
                  disabled={isApplied}
                  className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isApplied ? "Sudah Diterapkan" : "Terapkan ke Dashboard"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border bg-background overflow-hidden">
              <div className="p-3 bg-muted/50 border-b">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hasil Pratinjau (Cleaned)
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(cleanedData[0])
                      .slice(0, 5)
                      .map((header) => (
                        <TableHead key={header} className="text-[10px]">
                          {header}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cleanedData.slice(0, 3).map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row)
                        .slice(0, 5)
                        .map((val: any, j) => (
                          <TableCell key={j} className="text-[10px] max-w-[100px] truncate">
                            {val}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setFile(null)
                setStatus("idle")
              }}
            >
              Bersihkan File Lain
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 p-8 border border-destructive/20 rounded-lg bg-destructive/5 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Gagal Memproses Data</p>
              <p className="text-sm text-muted-foreground">Terjadi kesalahan saat AI mencoba membersihkan data Anda.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
              Coba Lagi
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
