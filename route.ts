export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { content } = await req.json()
    console.log("[v0] Starting local data cleaning simulation")

    // Parsing sederhana untuk CSV/Text
    const lines = content.split("\n").filter((line: string) => line.trim() !== "")
    if (lines.length < 2) throw new Error("Data too short")

    const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase())
    const rawRows = lines.slice(1).map((line: string) => line.split(","))

    // Heuristik untuk pemetaan kolom
    const mapping: Record<string, number> = {}
    headers.forEach((header, index) => {
      if (
        header.includes("nama") ||
        header.includes("name") ||
        header.includes("pelanggan") ||
        header.includes("customer")
      )
        mapping.customer_name = index
      if (header.includes("tgl") || header.includes("tanggal") || header.includes("date"))
        mapping.transaction_date = index
      if (
        header.includes("total") ||
        header.includes("jumlah") ||
        header.includes("amount") ||
        header.includes("nilai") ||
        header.includes("harga")
      )
        mapping.transaction_amount = index
      if (header.includes("kategori") || header.includes("category")) mapping.product_category = index
      if (header.includes("metode") || header.includes("payment") || header.includes("bayar"))
        mapping.payment_method = index
      if (header.includes("usia") || header.includes("umur") || header.includes("age")) mapping.customer_age = index
      if (
        header.includes("lokasi") ||
        header.includes("alamat") ||
        header.includes("location") ||
        header.includes("kota")
      )
        mapping.customer_location = index
      if (header.includes("email")) mapping.email = index
      if (header.includes("telp") || header.includes("phone") || header.includes("hp")) mapping.phone = index
    })

    console.log("[v0] Column mapping detected:", mapping)

    const cleanedData = rawRows.map((row: string[], idx: number) => {
      const getVal = (key: string) => (mapping[key] !== undefined ? row[mapping[key]]?.trim() : "")

      // Format amount (hilangkan Rp, koma, dll)
      const rawAmount = getVal("transaction_amount") || "0"
      const amount = Number.parseFloat(rawAmount.replace(/[^0-9.-]+/g, "")) || 0

      // Format age
      const age = Number.parseInt(getVal("customer_age")) || 25

      // Format date (asumsi YYYY-MM-DD jika memungkinkan, atau return as is)
      let date = getVal("transaction_date") || new Date().toISOString().split("T")[0]
      if (date.includes("/")) {
        const parts = date.split("/")
        if (parts.length === 3) date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
      }

      return {
        customer_id: `CUST-${1000 + idx}`,
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

    // Simulasi delay sedikit agar terasa seperti AI sedang berpikir
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return Response.json({ cleanedData })
  } catch (error) {
    console.error("[v0] Local Cleaning Error:", error)
    return Response.json({ error: "Gagal memproses data secara lokal" }, { status: 500 })
  }
}
