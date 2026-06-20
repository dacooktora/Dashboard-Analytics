# Rumus Detail Segmentasi Customer - Customer Segmentation Dashboard

## Pendahuluan
Sistem segmentasi pelanggan ini menggunakan **RFM-Based Scoring** (bukan pembagian rata-rata/quartile) untuk memberikan segmentasi yang lebih akurat dan bermakna secara bisnis.

---

## 1. RFM Metrics (Data Input)

Setiap pelanggan dihitung metrik RFM berikut:

### **R = Recency** (Kesegaran Transaksi)
- **Definisi**: Berapa hari sejak transaksi terakhir pelanggan
- **Rumus**: `Recency = Hari Saat Ini - Tanggal Transaksi Terakhir`
- **Contoh**: 
  - Pelanggan A transaksi hari ini → Recency = 0 hari
  - Pelanggan B transaksi 30 hari lalu → Recency = 30 hari

### **F = Frequency** (Frekuensi Transaksi)
- **Definisi**: Berapa kali pelanggan melakukan transaksi
- **Rumus**: `Frequency = Total Jumlah Transaksi per Pelanggan`
- **Contoh**:
  - Pelanggan A: 5 transaksi → Frequency = 5
  - Pelanggan B: 1 transaksi → Frequency = 1

### **M = Monetary** (Nilai Transaksi)
- **Definisi**: Total uang yang dihabiskan pelanggan
- **Rumus**: `Monetary = Sum(Semua Nilai Transaksi Pelanggan)`
- **Contoh**:
  - Pelanggan A: Total belanja Rp 5.000.000 → Monetary = 5.000.000
  - Pelanggan B: Total belanja Rp 500.000 → Monetary = 500.000

---

## 2. Normalisasi RFM (Scale 0-100)

Karena ketiga metrik punya satuan berbeda, kita normalisasi ke skala yang sama (0-100):

```
Normalized Recency = (1 - Recency / Max Recency) × 100
  → (1 - semakin besar recency, semakin rendah score)
  → Higher score = lebih baru transaksi terakhir

Normalized Frequency = (Frequency / Max Frequency) × 100
  → Higher score = semakin sering transaksi

Normalized Monetary = (Monetary / Max Monetary) × 100
  → Higher score = semakin besar nilai transaksi
```

**Contoh Normalisasi:**
```
Jika Max Recency = 100 hari, Max Frequency = 10, Max Monetary = 10 juta

Pelanggan A:
- Recency = 5 hari → Normalized = (1 - 5/100) × 100 = 95
- Frequency = 8 × → Normalized = (8/10) × 100 = 80
- Monetary = Rp 5 juta → Normalized = (5juta/10juta) × 100 = 50

Pelanggan B:
- Recency = 50 hari → Normalized = (1 - 50/100) × 100 = 50
- Frequency = 2 → Normalized = (2/10) × 100 = 20
- Monetary = Rp 500 ribu → Normalized = (0.5juta/10juta) × 100 = 5
```

---

## 3. Weighted RFM Score (Scoring)

Menggabungkan ketiga metrik dengan bobot berbeda:

```
RFM Score = (Recency × 0.30) + (Frequency × 0.30) + (Monetary × 0.40)

Penjelasan Bobot:
- Recency (30%): Kesegaran kontak pelanggan
- Frequency (30%): Loyalitas pembelian berulang
- Monetary (40%): Prioritas tertinggi, value bisnis terbesar
```

**Mengapa bobot Monetary 40%?**
- Pelanggan dengan nilai transaksi tinggi lebih penting untuk bisnis
- Fokus pada revenue impact, bukan hanya frequency
- Seorang pembeli 1x dengan value Rp 10 juta lebih valuable daripada pembeli 10x dengan value Rp 100 ribu setiap kali

**Contoh Kalkulasi:**
```
Pelanggan A:
RFM Score = (95 × 0.30) + (80 × 0.30) + (50 × 0.40)
          = 28.5 + 24 + 20
          = 72.5 → Dibulatkan: 73

Pelanggan B:
RFM Score = (50 × 0.30) + (20 × 0.30) + (5 × 0.40)
          = 15 + 6 + 2
          = 23
```

---

## 4. Segmentasi Berdasarkan RFM Score

Setelah mendapat RFM Score (0-100), pelanggan diklasifikasikan ke 4 segment:

| Segment | RFM Score | Deskripsi | Aksi Bisnis |
|---------|-----------|-----------|------------|
| **High Value** | 70-100 | Pelanggan loyal, sering beli, value tinggi | Loyalty program, exclusive benefits, VIP treatment |
| **Medium Value** | 40-69 | Growing customer, butuh nurture | Upselling, cross-selling, bundling |
| **Low Value** | 20-39 | One-time buyer atau sudah inactive | Re-engagement, discount, education content |
| **Potential** | 0-19 | Churn risk atau new customer dengan value rendah | Nurture campaign, referral program, special offers |

**Contoh Hasil Segmentasi:**
```
Dari contoh di atas:
- Pelanggan A (Score 73) → HIGH VALUE
- Pelanggan B (Score 23) → LOW VALUE
```

---

## 5. Perbedaan dengan Metode Lama (Quartile)

### Metode Lama (Pembagian Rata-rata)
```
Hanya 25% pelanggan untuk setiap segment
- Top 25% → High Value
- 25-50% → Medium Value
- 50-75% → Low Value
- Bottom 25% → Potential

❌ Problem: Tidak mempertimbangkan kualitas RFM
   Pelanggan terbaik bisa tercampur dengan rata-rata
```

### Metode Baru (RFM-Based Scoring) ✅
```
Berdasarkan actual RFM performance
- Score 70+: High Value (bisa 10% atau 40% tergantung data)
- Score 40-69: Medium Value
- Score 20-39: Low Value
- Score <20: Potential

✅ Benefit: 
   - Lebih akurat mencerminkan nilai pelanggan
   - Fokus pada business impact (revenue)
   - Lebih fleksibel sesuai bisnis real
   - Segmen bisa berubah seiring pelanggan berkembang
```

---

## 6. Output Dashboard

Dashboard menampilkan:

1. **CLV Distribution Chart** - Sebaran pelanggan berdasarkan total spending
2. **Segment Overview** - Statistik per segment (count, %, avg value)
3. **Detail Segmentasi** - Tabel pelanggan per segment dengan RFM score
4. **Rekomendasi Aksi** - Action plan spesifik untuk setiap segment
5. **Category Performance** - Produk apa yang dibeli per segment

---

## 7. Live Example Calculation

**Dataset**: 182 Pelanggan, periode Oct-Dec 2024

```
Max Values:
- Max Recency: 88 hari
- Max Frequency: 9 transaksi
- Max Monetary: Rp 1.450.000

Contoh 3 Pelanggan:

PELANGGAN 1 (Budi Santoso):
- Last Transaction: 5 hari lalu → Recency Score = (1-5/88)×100 = 94.3
- Total Transactions: 3 → Frequency Score = (3/9)×100 = 33.3
- Total Spent: Rp 4.250.000 → Monetary Score = (4.25/14.5)×100 = 29.3

RFM Score = (94.3 × 0.30) + (33.3 × 0.30) + (29.3 × 0.40)
          = 28.3 + 10.0 + 11.7 = 50.0
Segment → MEDIUM VALUE ✓

PELANGGAN 2 (Siti Rahayu):
- Recency: 40 hari → Score = (1-40/88)×100 = 54.5
- Frequency: 2 → Score = (2/9)×100 = 22.2
- Monetary: Rp 2.565.000 → Score = (2.565/14.5)×100 = 17.7

RFM Score = (54.5 × 0.30) + (22.2 × 0.30) + (17.7 × 0.40)
          = 16.4 + 6.7 + 7.1 = 30.2
Segment → LOW VALUE ✓

PELANGGAN 3 (Ahmad Wijaya):
- Recency: 77 hari → Score = (1-77/88)×100 = 12.5
- Frequency: 2 → Score = 22.2
- Monetary: Rp 1.425.000 → Score = (1.425/14.5)×100 = 9.8

RFM Score = (12.5 × 0.30) + (22.2 × 0.30) + (9.8 × 0.40)
          = 3.75 + 6.66 + 3.92 = 14.3
Segment → POTENTIAL ✓
```

---

## 8. Rekomendasi Aksi Per Segment

### High Value (RFM ≥ 70)
- **Target**: Retention & Expansion
- **Actions**:
  - Premium loyalty program dengan rewards tinggi
  - Personal account manager untuk support
  - Early access ke produk/promo baru
  - VIP event invitation
  - Customized product recommendation

### Medium Value (RFM 40-69)
- **Target**: Growth & Upselling
- **Actions**:
  - Cross-selling campaign (produk complementary)
  - Bundle offers dengan diskon menarik
  - Seasonal promotions
  - Educational content about premium products
  - Incentive untuk increase purchase frequency

### Low Value (RFM 20-39)
- **Target**: Re-engagement
- **Actions**:
  - Win-back campaign dengan special discount
  - Remind tentang keuntungan produk
  - Ask for feedback (kenapa jarang beli?)
  - Product education via email/SMS
  - Limited-time special offer

### Potential (RFM < 20)
- **Target**: Nurture & Activation
- **Actions**:
  - Nurture dengan valuable content
  - Soft engagement (newsletter, tips)
  - Referral program (ask friends)
  - Low-commitment offers (bundling, trial)
  - Understand churn reason (jika ex-customer)

---

## Kesimpulan

Segmentasi RFM-based lebih sophisticated dan data-driven dibanding simple quartile split. Ini memungkinkan:
✅ Targeting akurat sesuai customer value
✅ ROI lebih tinggi dari retention/acquisition spend
✅ Fleksibilitas sesuai business goal
✅ Continuous improvement seiring data baru
