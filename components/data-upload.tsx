"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { parseCSV, processCustomerData } from "@/lib/data-processor"
import { dataStore } from "@/lib/data-store"

export function DataUpload() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [fileName, setFileName] = useState<string>("")
  const [recordCount, setRecordCount] = useState<number>(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploadStatus("uploading")

    try {
      const text = await file.text()

      // Parse CSV data
      const customers = parseCSV(text)

      if (customers.length === 0) {
        setUploadStatus("error")
        return
      }

      // Process data and perform K-Means clustering
      const processedData = processCustomerData(customers)

      // Store data in global store
      dataStore.setData(processedData)

      setRecordCount(customers.length)
      setUploadStatus("success")
    } catch (error) {
      console.error("[v0] Error processing file:", error)
      setUploadStatus("error")
    }
  }

  const handleClearData = () => {
    dataStore.clearData()
    setUploadStatus("idle")
    setFileName("")
    setRecordCount(0)
  }

  const downloadTemplate = () => {
    // Create CSV template
    const template = `customer_id,customer_name,email,phone,transaction_date,transaction_amount,product_category,payment_method,customer_age,customer_location
CUST001,Budi Santoso,budi@email.com,081234567890,2024-01-15,450000,Electronics,Credit Card,28,Jakarta
CUST002,Siti Nurhaliza,siti@email.com,081234567891,2024-01-16,125000,Fashion,E-Wallet,35,Bandung
CUST003,Ahmad Wijaya,ahmad@email.com,081234567892,2024-01-17,890000,Electronics,Bank Transfer,42,Surabaya
CUST001,Budi Santoso,budi@email.com,081234567890,2024-02-10,320000,Fashion,Credit Card,28,Jakarta
CUST004,Dewi Lestari,dewi@email.com,081234567893,2024-02-12,560000,Home & Living,E-Wallet,31,Jakarta
CUST002,Siti Nurhaliza,siti@email.com,081234567891,2024-02-15,280000,Beauty,E-Wallet,35,Bandung`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template_data_customer.csv"
    a.click()
  }

  return (
    <Card className="p-6 border-2 border-dashed">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Upload Data Customer</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload file CSV atau Excel dengan data transaksi customer untuk di analisis
          </p>

          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Data yang diperlukan:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Customer ID
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Tanggal Transaksi
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Nilai Transaksi
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Kategori Produk
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Metode Pembayaran
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Usia Customer
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Lokasi
              </Badge>
            </div>
          </div>

          {uploadStatus === "success" && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                <strong>{fileName}</strong> berhasil diupload ({recordCount.toLocaleString()} records)
              </span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Gagal mengupload file. Pastikan format sesuai template.</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full md:w-auto bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>

          <label htmlFor="file-upload">
            <Button
              variant="default"
              size="sm"
              className="w-full md:w-auto cursor-pointer"
              disabled={uploadStatus === "uploading"}
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {uploadStatus === "uploading" ? "Memproses..." : "Upload Data"}
              </span>
            </Button>
          </label>
          <input id="file-upload" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />

          {uploadStatus === "success" && (
            <Button variant="destructive" size="sm" onClick={handleClearData} className="w-full md:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Semua Data
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
