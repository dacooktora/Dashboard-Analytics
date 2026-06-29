export const maxDuration = 60

const EXPECTED_COLUMNS = [
  "customer_id",
  "customer_name",
  "email",
  "phone",
  "transaction_date",
  "transaction_amount",
  "product_category",
  "payment_method",
  "customer_age",
  "customer_location",
]

// Check if headers already match the expected dashboard format
function isAlreadyClean(headers: string[]): boolean {
  const normalized = headers.map((h) => h.trim().toLowerCase())
  const matchCount = EXPECTED_COLUMNS.filter((col) => normalized.includes(col)).length
  // Consider "already clean" if at least 8 of 10 expected columns are present
  return matchCount >= 8
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json()
    console.log("[v0] Starting data cleaning")

    const lines = content
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l !== "")

    if (lines.length < 2) throw new Error("Data too short")

    const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase())
    const rawRows = lines.slice(1).map((line: string) => {
      // Handle quoted CSV values properly
      const cells: string[] = []
      let current = ""
      let inQuotes = false
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          cells.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      cells.push(current.trim())
      return cells
    })

    // --- If format is already correct, just parse and return as-is ---
    if (isAlreadyClean(headers)) {
      console.log("[v0] Format already correct, skipping transformation")

      const cleanedData = rawRows
        .filter((row: string[]) => row.some((cell) => cell !== ""))
        .map((row: string[]) => {
          const obj: Record<string, any> = {}
          headers.forEach((header, i) => {
            const val = row[i] ?? ""
            // Only do type coercion, not remapping
            if (header === "transaction_amount" || header === "customer_age") {
              obj[header] = Number(val.replace(/[^0-9.-]+/g, "")) || 0
            } else {
              obj[header] = val
            }
          })
          return obj
        })

      await new Promise((resolve) => setTimeout(resolve, 800))
      return Response.json({ cleanedData, wasAlreadyClean: true })
    }

    // --- Format is wrong/different — do full heuristic remapping ---
    console.log("[v0] Format needs cleaning, remapping columns")

    const mapping: Record<string, number> = {}
    headers.forEach((header, index) => {
      if (
        header.includes("nama") ||
        header.includes("name") ||
        header.includes("pelanggan") ||
        header.includes("customer_name") ||
        header.includes("customer name")
      )
        mapping.customer_name = mapping.customer_name ?? index

      if (header.includes("tgl") || header.includes("tanggal") || header.includes("date"))
        mapping.transaction_date = mapping.transaction_date ?? index

      if (
        header.includes("total") ||
        header.includes("jumlah") ||
        header.includes("amount") ||
        header.includes("nilai") ||
        header.includes("harga") ||
        header.includes("nominal")
      )
        mapping.transaction_amount = mapping.transaction_amount ?? index

      if (header.includes("kategori") || header.includes("category") || header.includes("produk"))
        mapping.product_category = mapping.product_category ?? index

      if (header.includes("metode") || header.includes("payment") || header.includes("bayar") || header.includes("pembayaran"))
        mapping.payment_method = mapping.payment_method ?? index

      if (header.includes("usia") || header.includes("umur") || header.includes("age"))
        mapping.customer_age = mapping.customer_age ?? index

      if (
        header.includes("lokasi") ||
        header.includes("alamat") ||
        header.includes("location") ||
        header.includes("kota") ||
        header.includes("domisili")
      )
        mapping.customer_location = mapping.customer_location ?? index

      if (header.includes("email"))
        mapping.email = mapping.email ?? index

      if (
        header.includes("telp") ||
        header.includes("phone") ||
        header.includes("hp") ||
        header.includes("nomor") ||
        header.includes("no_hp")
      )
        mapping.phone = mapping.phone ?? index

      if (
        header.includes("id") ||
        header.includes("customer_id") ||
        header.includes("no") ||
        header.includes("kode")
      )
        mapping.customer_id = mapping.customer_id ?? index
    })

    console.log("[v0] Column mapping detected:", mapping)

    const cleanedData = rawRows
      .filter((row: string[]) => row.some((cell) => cell !== ""))
      .map((row: string[], idx: number) => {
        const getVal = (key: string) =>
          mapping[key] !== undefined ? (row[mapping[key]] ?? "").trim() : ""

        // Format amount
        const rawAmount = getVal("transaction_amount") || "0"
        const amount = parseFloat(rawAmount.replace(/[^0-9.-]+/g, "")) || 0

        // Format age
        const age = parseInt(getVal("customer_age")) || 25

        // Format date → YYYY-MM-DD
        let date = getVal("transaction_date") || new Date().toISOString().split("T")[0]
        if (date.includes("/")) {
          const parts = date.split("/")
          if (parts.length === 3) {
            // Handle DD/MM/YYYY or MM/DD/YYYY (assume DD/MM/YYYY for Indonesian data)
            date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
          }
        }

        // Reuse existing customer_id if available, else generate
        const existingId = getVal("customer_id")
        const customerId = existingId || `CUST${String(1000 + idx).padStart(3, "0")}`

        return {
          customer_id: customerId,
          customer_name: getVal("customer_name") || `Pelanggan ${idx + 1}`,
          email: getVal("email") || `user${idx + 1}@example.com`,
          phone: getVal("phone") || "0812-0000-0000",
          transaction_date: date,
          transaction_amount: amount,
          product_category: getVal("product_category") || "Umum",
          payment_method: getVal("payment_method") || "Tunai",
          customer_age: age,
          customer_location: getVal("customer_location") || "Jakarta",
        }
      })

    console.log("[v0] Successfully cleaned rows:", cleanedData.length)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    return Response.json({ cleanedData, wasAlreadyClean: false })
  } catch (error) {
    console.error("[v0] Cleaning Error:", error)
    return Response.json({ error: "Gagal memproses data" }, { status: 500 })
  }
}
