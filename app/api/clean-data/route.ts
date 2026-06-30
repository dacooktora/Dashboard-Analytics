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

function isAlreadyClean(headers: string[]): boolean {
  const normalized = headers.map((h) => h.trim().toLowerCase())
  const matchCount = EXPECTED_COLUMNS.filter((col) => normalized.includes(col)).length
  return matchCount >= 8
}

function parseCSVLine(line: string): string[] {
  // Normalize smart quotes to straight quotes
  const normalized = line.replace(/[\u201C\u201D\u201E\u201F]/g, '"').replace(/[\u2018\u2019]/g, "'")
  const cells: string[] = []
  let current = ""
  let inQuotes = false
  for (const char of normalized) {
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
}

function parseAmount(raw: string): number {
  if (!raw) return 0
  let val = raw.trim()

  // Remove currency prefix (Rp, rp, RP)
  val = val.replace(/^[Rr][Pp]\.?\s*/g, "")

  // Detect Indonesian format: dots as thousand separators
  // e.g. "1.250.000" or "750.000"
  const dotCount = (val.match(/\./g) || []).length
  const commaCount = (val.match(/,/g) || []).length

  if (dotCount >= 2) {
    // Multiple dots → thousands separator (Indonesian: 1.250.000)
    val = val.replace(/\./g, "")
  } else if (dotCount === 1 && commaCount === 0) {
    // Single dot — check if it's a thousand separator (e.g. "750.000")
    const afterDot = val.split(".")[1]
    if (afterDot && afterDot.length === 3) {
      // "750.000" → treat dot as thousand separator
      val = val.replace(/\./g, "")
    }
    // else treat as decimal (e.g. "750.5")
  }

  if (commaCount >= 2) {
    // Multiple commas → thousand separators (English: 2,300,000)
    val = val.replace(/,/g, "")
  } else if (commaCount === 1) {
    // Single comma — could be decimal (European: 1.250,50) or thousand (1,250)
    const afterComma = val.split(",")[1]
    if (afterComma && afterComma.length <= 2) {
      // Treat as decimal separator
      val = val.replace(",", ".")
    } else {
      // Treat as thousand separator
      val = val.replace(",", "")
    }
  }

  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().split("T")[0]
  const val = raw.trim()

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val

  // DD/MM/YYYY or D/M/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
    const [d, m, y] = val.split("/")
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  // DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(val)) {
    const [d, m, y] = val.split("-")
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  return val
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json()
    console.log("[v0] Starting data cleaning")

    const lines = content
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l !== "")

    if (lines.length < 2) throw new Error("Data too short")

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase())
    const rawRows = lines.slice(1).map((line: string) => parseCSVLine(line))

    console.log("[v0] Headers detected:", headers)
    console.log("[v0] Total rows:", rawRows.length)

    // --- Already correct format → parse and return as-is ---
    if (isAlreadyClean(headers)) {
      console.log("[v0] Format already correct, skipping transformation")

      const cleanedData = rawRows
        .filter((row: string[]) => row.some((cell) => cell !== ""))
        .map((row: string[]) => {
          const obj: Record<string, any> = {}
          headers.forEach((header, i) => {
            const val = row[i] ?? ""
            if (header === "transaction_amount" || header === "customer_age") {
              obj[header] = header === "transaction_amount"
                ? parseAmount(val)
                : parseInt(val) || 0
            } else {
              obj[header] = val
            }
          })
          return obj
        })

      await new Promise((resolve) => setTimeout(resolve, 800))
      return Response.json({ cleanedData, wasAlreadyClean: true })
    }

    // --- Needs remapping ---
    console.log("[v0] Format needs cleaning, remapping columns")

    const mapping: Record<string, number> = {}
    headers.forEach((header, index) => {
      // customer_name
      if (header.includes("nama") || header.includes("pelanggan") || header === "name" || header === "customer_name")
        mapping.customer_name = mapping.customer_name ?? index

      // transaction_date
      if (header.includes("tgl") || header.includes("tanggal") || header.includes("date"))
        mapping.transaction_date = mapping.transaction_date ?? index

      // transaction_amount
      if (header.includes("total") || header.includes("jumlah") || header.includes("amount") ||
          header.includes("nilai") || header.includes("harga") || header.includes("nominal") || header.includes("belanja"))
        mapping.transaction_amount = mapping.transaction_amount ?? index

      // product_category
      if (header.includes("kategori") || header.includes("category") || header.includes("produk"))
        mapping.product_category = mapping.product_category ?? index

      // payment_method
      if (header.includes("metode") || header.includes("payment") || header.includes("bayar") || header.includes("pembayaran"))
        mapping.payment_method = mapping.payment_method ?? index

      // customer_age
      if (header.includes("usia") || header.includes("umur") || header.includes("age"))
        mapping.customer_age = mapping.customer_age ?? index

      // customer_location
      if (header.includes("lokasi") || header.includes("alamat") || header.includes("location") ||
          header.includes("kota") || header.includes("domisili"))
        mapping.customer_location = mapping.customer_location ?? index

      // email — exact or contains "email"
      if (header.includes("email"))
        mapping.email = mapping.email ?? index

      // phone — explicit HP/phone keywords only, NOT "no" alone
      if (header === "no hp" || header === "no. hp" || header.includes("phone") ||
          header.includes("telp") || header.includes("hp") || header === "no_hp")
        mapping.phone = mapping.phone ?? index

      // customer_id — only if explicitly an id column, not "no" alone
      if (header === "customer_id" || header === "id_pelanggan" || header === "id pelanggan" || header === "kode pelanggan")
        mapping.customer_id = mapping.customer_id ?? index
    })

    console.log("[v0] Column mapping:", mapping)

    const cleanedData = rawRows
      .filter((row: string[]) => row.some((cell) => cell !== ""))
      .map((row: string[], idx: number) => {
        const getVal = (key: string) =>
          mapping[key] !== undefined ? (row[mapping[key]] ?? "").trim() : ""

        // customer_id: use existing or generate
        const existingId = getVal("customer_id")
        const customerId = existingId || `CUST${String(1000 + idx).padStart(3, "0")}`

        return {
          customer_id: customerId,
          customer_name: getVal("customer_name") || `Pelanggan ${idx + 1}`,
          email: getVal("email") || `user${idx + 1}@example.com`,
          phone: getVal("phone") || "0812-0000-0000",
          transaction_date: parseDate(getVal("transaction_date")),
          transaction_amount: parseAmount(getVal("transaction_amount")),
          product_category: getVal("product_category") || "Umum",
          payment_method: getVal("payment_method") || "Tunai",
          customer_age: parseInt(getVal("customer_age")) || 25,
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
