// AI-Powered Strategy Selection + Explanation
// Lapis 1: AI pilih 3 strategi dari 50 pool per segmen
// Lapis 2: StrategyAccordion panggil /api/strategy-explanation buat penjelasan

import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// ============================================================
// STEP 1: STRATEGY POOLS (200 strategi, 50 per segmen)
// ============================================================

export const STRATEGY_POOLS: Record<string, any[]> = {
  "High Value": [
    { id: "HV-01", nama: "Program loyalitas berbasis poin — setiap pembelian dapat poin ditukar diskon atau hadiah", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-02", nama: "Layanan pelanggan prioritas — antrian khusus atau pelayanan lebih cepat", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-03", nama: "Early access penawaran — informasikan promo sebelum diumumkan ke publik", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-04", nama: "Kartu pelanggan VIP dengan diskon tetap setiap transaksi 5–15%", kondisi: ["avgTx_tinggi", "freq_tinggi"] },
    { id: "HV-05", nama: "Undangan eksklusif event atau gathering khusus pelanggan setia", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-06", nama: "Flash deal private — penawaran khusus tidak diumumkan ke publik", kondisi: ["recency_baru", "avgTx_tinggi"] },
    { id: "HV-07", nama: "Program referral premium — bonus lebih besar jika ajak teman belanja", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-08", nama: "Hadiah gratis untuk setiap pembelian di atas nominal tertentu", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-09", nama: "Gratis ongkir atau layanan antar ke rumah tanpa minimum pembelian", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-10", nama: "Paket bundling produk utama dengan layanan tambahan spesial", kondisi: ["avgTx_tinggi", "freq_sedang"] },
    { id: "HV-11", nama: "Cashback langsung untuk setiap transaksi di atas threshold tertentu", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-12", nama: "Program upgrade layanan — dapatkan layanan premium dengan harga reguler", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-13", nama: "Notifikasi personal via WhatsApp untuk promo eksklusif atau stok terbatas", kondisi: ["recency_baru", "freq_tinggi"] },
    { id: "HV-14", nama: "Survey kepuasan eksklusif dengan imbalan voucher belanja", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-15", nama: "Program apresiasi tahunan — hadiah khusus di akhir tahun untuk pelanggan HV", kondisi: ["totalRevenue_tinggi"] },
    { id: "HV-16", nama: "Hadiah ulang tahun pelanggan — diskon atau produk gratis di hari spesial", kondisi: ["totalRevenue_tinggi"] },
    { id: "HV-17", nama: "Pencatatan riwayat pesanan personal agar tidak perlu mengulang informasi", kondisi: ["freq_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-18", nama: "Layanan pengiriman prioritas dengan estimasi waktu lebih cepat dari standar", kondisi: ["avgTx_tinggi", "recency_baru"] },
    { id: "HV-19", nama: "Program makin banyak makin hemat — diskon bertingkat sesuai jumlah pembelian", kondisi: ["freq_sedang", "avgTx_tinggi"] },
    { id: "HV-20", nama: "Update produk atau menu baru yang hanya dikirim ke pelanggan HV", kondisi: ["recency_baru", "freq_tinggi"] },
    { id: "HV-21", nama: "Prioritas penanganan komplain — keluhan diselesaikan lebih cepat dari biasa", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-22", nama: "Hampers atau parcel spesial di momen Lebaran, Natal, atau Tahun Baru", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-23", nama: "Program tier loyalitas — unlock keuntungan lebih besar setiap 3 atau 6 bulan", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-24", nama: "Bonus produk atau jasa tambahan gratis di setiap pembelian di atas nominal", kondisi: ["avgTx_tinggi", "recency_baru"] },
    { id: "HV-25", nama: "Kontak langsung dengan pemilik usaha untuk keluhan atau pesanan khusus", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-26", nama: "Pre-order eksklusif — pesan duluan sebelum stok atau menu resmi tersedia", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
    { id: "HV-27", nama: "Rekomendasi produk personal berdasarkan histori pembelian mereka", kondisi: ["freq_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-28", nama: "Opsi cicilan atau bayar nanti tanpa bunga khusus untuk pelanggan HV", kondisi: ["avgTx_tinggi", "freq_sedang"] },
    { id: "HV-29", nama: "Grup eksklusif WhatsApp atau Telegram khusus pelanggan setia", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-30", nama: "Reward pencapaian — hadiah spesial setiap total belanja mencapai kelipatan tertentu", kondisi: ["totalRevenue_tinggi"] },
    { id: "HV-31", nama: "Tawaran mencoba produk atau menu baru sebelum dijual ke publik umum", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-32", nama: "Program Pelanggan Bulan Ini — apresiasi publik di media sosial usaha", kondisi: ["freq_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-33", nama: "Packaging atau penyajian spesial yang lebih premium dari biasa", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-34", nama: "Layanan reservasi atau pre-order prioritas tanpa perlu antri", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-35", nama: "Poin loyalitas tidak pernah hangus selama pelanggan masih aktif bertransaksi", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-36", nama: "Penawaran spesial untuk pembelian ulang dalam waktu 30 hari", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "HV-37", nama: "Layanan konsultasi gratis sebelum memutuskan membeli", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-38", nama: "Program donasi bersama — sebagian keuntungan dari pembelian HV disumbangkan", kondisi: ["totalRevenue_tinggi", "recency_baru"] },
    { id: "HV-39", nama: "Produk atau menu seasonal eksklusif yang hanya tersedia untuk pelanggan HV", kondisi: ["recency_baru", "freq_tinggi"] },
    { id: "HV-40", nama: "Flash diskon personal via WhatsApp untuk HV yang mulai jarang bertransaksi", kondisi: ["recency_lama", "avgTx_tinggi"] },
    { id: "HV-41", nama: "Layanan kustomisasi pesanan sesuai permintaan khusus pelanggan", kondisi: ["avgTx_tinggi", "totalRevenue_tinggi"] },
    { id: "HV-42", nama: "Benefit yang bisa dibagikan ke anggota keluarga", kondisi: ["totalRevenue_tinggi", "freq_tinggi"] },
    { id: "HV-43", nama: "Update rutin tentang perubahan harga, menu baru, atau layanan terbaru", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-44", nama: "Poin loyalitas yang bisa digunakan untuk berbagai jenis produk atau layanan", kondisi: ["freq_tinggi"] },
    { id: "HV-45", nama: "Notifikasi awal jika ada produk atau menu yang akan dihentikan", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-46", nama: "Program reaktivasi personal jika pelanggan HV mulai tidak aktif", kondisi: ["recency_lama", "totalRevenue_tinggi"] },
    { id: "HV-47", nama: "Gratis biaya pengiriman atau layanan return tanpa syarat tambahan", kondisi: ["avgTx_tinggi", "freq_tinggi"] },
    { id: "HV-48", nama: "Diskon khusus di momen anniversary atau ulang tahun usaha", kondisi: ["recency_baru", "totalRevenue_tinggi"] },
    { id: "HV-49", nama: "Konten tips dan informasi eksklusif yang relevan dengan kebutuhan mereka", kondisi: ["freq_tinggi", "recency_baru"] },
    { id: "HV-50", nama: "Penawaran pre-order dengan harga early bird khusus untuk pelanggan HV", kondisi: ["freq_tinggi", "avgTx_tinggi"] },
  ],
  "Medium Value": [
    { id: "MV-01", nama: "Tawarkan produk satu level di atas yang biasa mereka beli (upselling)", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-02", nama: "Paket hemat — produk utama dan tambahan dengan harga bundled", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-03", nama: "Promosi musiman Lebaran, Tahun Baru, hari besar nasional", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-04", nama: "Program membership dengan benefit yang jelas dan terukur", kondisi: ["freq_sedang", "avgTx_sedang"] },
    { id: "MV-05", nama: "Win-back campaign untuk MV yang mulai jarang beli", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-06", nama: "Diskon bertingkat — semakin banyak beli semakin besar diskon", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-07", nama: "Program referral dengan reward menarik untuk keduanya", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-08", nama: "Re-engagement WA untuk MV yang tidak aktif", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-09", nama: "Flash sale eksklusif untuk pelanggan MV saja", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-10", nama: "Tawaran upgrade ke layanan premium dengan harga spesial", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-11", nama: "Voucher kejutan setelah pelanggan lama tidak bertransaksi", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-12", nama: "Program poin dengan milestone yang lebih dekat untuk dicapai", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-13", nama: "Cross-selling produk atau layanan pelengkap yang relevan", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-14", nama: "Notifikasi personal ketika produk favorit mereka restock", kondisi: ["recency_sedang", "freq_sedang"] },
    { id: "MV-15", nama: "Diskon khusus untuk pembelian kedua dalam satu bulan", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "MV-16", nama: "Cashback untuk transaksi di atas rata-rata mereka", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-17", nama: "Hadiah surprise kecil yang tidak diumumkan sebelumnya", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "MV-18", nama: "Program cicilan untuk mendorong transaksi bernilai lebih besar", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-19", nama: "Konten edukasi produk agar mereka tahu manfaat lebih banyak", kondisi: ["freq_rendah", "avgTx_sedang"] },
    { id: "MV-20", nama: "Penawaran bundle eksklusif yang tidak ada di katalog publik", kondisi: ["avgTx_sedang", "recency_baru"] },
    { id: "MV-21", nama: "Program loyalitas dengan target terlihat — X poin lagi dapat hadiah", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-22", nama: "Promo ulang tahun pelanggan — diskon atau produk gratis", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-23", nama: "Gamifikasi — tantangan belanja dengan reward di ujungnya", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-24", nama: "Rekomendasi produk personal berdasarkan histori pembelian", kondisi: ["freq_sedang", "totalRevenue_tinggi"] },
    { id: "MV-25", nama: "Gratis ongkir untuk pembelian di atas rata-rata transaksi mereka", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-26", nama: "Penawaran limited edition atau produk eksklusif", kondisi: ["recency_baru", "avgTx_sedang"] },
    { id: "MV-27", nama: "Upselling paket premium dengan perbedaan harga yang kecil", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-28", nama: "Notifikasi untuk mencoba produk baru yang belum pernah mereka beli", kondisi: ["freq_sedang", "recency_sedang"] },
    { id: "MV-29", nama: "Program tantangan beli 3 dapat bonus — dorong frekuensi naik", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-30", nama: "Penawaran eksklusif akhir bulan untuk mendorong transaksi rutin", kondisi: ["recency_sedang", "freq_sedang"] },
    { id: "MV-31", nama: "Diskon pada anniversary mereka bergabung sebagai pelanggan", kondisi: ["recency_baru", "totalRevenue_tinggi"] },
    { id: "MV-32", nama: "Add-on produk atau layanan tambahan dengan harga yang sangat hemat", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-33", nama: "WA blast personal disesuaikan nama dan riwayat pembelian", kondisi: ["recency_lama", "freq_sedang"] },
    { id: "MV-34", nama: "Tawaran paket yang menghemat jika membeli lebih dari satu item", kondisi: ["avgTx_sedang", "freq_rendah"] },
    { id: "MV-35", nama: "Reward jika berhasil naik ke segmen High Value dalam 3 bulan", kondisi: ["freq_sedang", "avgTx_sedang"] },
    { id: "MV-36", nama: "Promo khusus hari kerja untuk meratakan beban transaksi", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "MV-37", nama: "Tawaran produk entry-level HV agar mulai kenal kualitas lebih tinggi", kondisi: ["avgTx_sedang", "freq_sedang"] },
    { id: "MV-38", nama: "Voucher yang bisa digunakan di transaksi berikutnya tanpa batas minimum", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "MV-39", nama: "Konten social proof — pelanggan MV lain yang berhasil upgrade ke HV", kondisi: ["freq_sedang", "recency_sedang"] },
    { id: "MV-40", nama: "Penawaran bundel seasonal yang hanya tersedia 1–2 kali setahun", kondisi: ["recency_sedang", "avgTx_sedang"] },
    { id: "MV-41", nama: "Program undian — setiap transaksi di atas threshold masuk undian", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-42", nama: "Tawaran coba layanan premium sekali gratis tanpa komitmen", kondisi: ["avgTx_sedang", "recency_baru"] },
    { id: "MV-43", nama: "Penawaran hemat jika membeli 2 minggu lebih awal dari biasanya", kondisi: ["recency_sedang", "freq_sedang"] },
    { id: "MV-44", nama: "Diskon progresif — semakin sering beli semakin besar diskon per transaksi", kondisi: ["freq_rendah", "avgTx_sedang"] },
    { id: "MV-45", nama: "Layanan after-sales proaktif — follow up kepuasan setelah transaksi", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "MV-46", nama: "Program saling untung dengan pelanggan MV lain lewat referral bersama", kondisi: ["freq_sedang", "recency_baru"] },
    { id: "MV-47", nama: "Notifikasi harga terbaik ketika ada penurunan harga produk favorit", kondisi: ["recency_lama", "avgTx_sedang"] },
    { id: "MV-48", nama: "Bonus poin double di hari ulang tahun usaha", kondisi: ["recency_baru", "freq_sedang"] },
    { id: "MV-49", nama: "Tawaran eksklusif untuk pembelian pertama di kategori yang belum dicoba", kondisi: ["freq_sedang", "recency_sedang"] },
    { id: "MV-50", nama: "Program achievement — badge dan reward untuk milestones tertentu", kondisi: ["freq_sedang", "recency_baru"] },
  ],
  "Low Value": [
    { id: "LV-01", nama: "Re-engagement campaign personal via WhatsApp", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-02", nama: "Diskon besar satu kali untuk mendorong kembali bertransaksi", kondisi: ["avgTx_rendah", "recency_lama"] },
    { id: "LV-03", nama: "Konten edukasi produk — tunjukkan manfaat yang belum mereka ketahui", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-04", nama: "Voucher reaktivasi dengan masa berlaku terbatas", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-05", nama: "Flash sale produk entry-level dengan harga terendah", kondisi: ["avgTx_sangat_rendah", "recency_lama"] },
    { id: "LV-06", nama: "Program referral — ajak teman, dapatkan diskon untuk keduanya", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-07", nama: "Pesan personal dari pemilik usaha sebagai bentuk apresiasi", kondisi: ["totalRevenue_tinggi", "recency_lama"] },
    { id: "LV-08", nama: "Win-back offer — penawaran terbaik untuk pelanggan lama tidak beli", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-09", nama: "Tawaran produk terlaris dengan harga spesial sebagai pintu masuk", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-10", nama: "Program cicilan untuk produk yang lebih mahal dari biasa mereka beli", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-11", nama: "Diskon 20–30% tanpa minimum pembelian untuk dorong transaksi", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
    { id: "LV-12", nama: "Gamifikasi ringan — tantangan kecil dengan hadiah setelah 3 transaksi", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-13", nama: "Konten ulasan positif pelanggan lain dengan profil yang mirip", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-14", nama: "Gratis ongkir tanpa minimum untuk menghilangkan hambatan beli", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-15", nama: "Penawaran beli sekarang bayar nanti untuk produk apapun", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-16", nama: "Program poin dengan target sangat mudah dicapai", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-17", nama: "WA broadcast personal dengan penawaran relevan riwayat mereka", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-18", nama: "Flash deal produk paling murah di katalog", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
    { id: "LV-19", nama: "Survey singkat — tanya kenapa jarang beli dan beri reward", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-20", nama: "Paket mini — bundle hemat untuk coba beberapa produk sekaligus", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-21", nama: "Notifikasi stok hampir habis untuk produk yang pernah mereka beli", kondisi: ["recency_sedang", "freq_rendah"] },
    { id: "LV-22", nama: "Retargeting via WhatsApp setelah 45 hari tidak ada transaksi", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-23", nama: "Diskon khusus hari tertentu (misal: Senin diskon 15%)", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-24", nama: "Cashback kecil untuk setiap transaksi berapapun nilainya", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "LV-25", nama: "Konten tips hemat berbelanja — edukasi sambil tawarkan produk", kondisi: ["avgTx_rendah", "recency_sedang"] },
    { id: "LV-26", nama: "Undian berhadiah — setiap transaksi berapapun berhak ikut undian", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-27", nama: "Program trial layanan premium untuk pertama kali gratis", kondisi: ["avgTx_rendah", "recency_sedang"] },
    { id: "LV-28", nama: "Tawaran paket yang menggabungkan produk murah dan premium", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-29", nama: "Notifikasi harga turun atau promo terbaru via WA", kondisi: ["recency_lama", "avgTx_rendah"] },
    { id: "LV-30", nama: "Pesan reaktivasi — kami kangen kamu, ini hadiah kecil untuk kamu", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-31", nama: "Diskon ulang tahun pelanggan berapapun nominal transaksinya", kondisi: ["avgTx_rendah", "recency_sedang"] },
    { id: "LV-32", nama: "Cross-selling produk terjangkau yang relevan dengan pembelian lama", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-33", nama: "Penawaran beli 2 gratis 1 untuk produk entry-level tertentu", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "LV-34", nama: "Program reward setelah transaksi ke-3 — dorong konsistensi", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "LV-35", nama: "Konten manfaat produk yang dikemas ringan dan mudah dipahami", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-36", nama: "Penawaran terbatas 48 jam untuk menciptakan urgensi beli", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-37", nama: "Starter kit — paket awal yang mencakup semua kebutuhan dasar", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-38", nama: "Program donasi bersama — beli = kontribusi sosial kecil", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-39", nama: "Notifikasi awal sebelum harga naik — ciptakan sense of urgency", kondisi: ["recency_sedang", "avgTx_rendah"] },
    { id: "LV-40", nama: "Pesan WA yang sangat personal — sebut nama dan histori mereka", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-41", nama: "Penawaran eksklusif yang tidak tersedia di toko atau marketplace lain", kondisi: ["avgTx_rendah", "recency_sedang"] },
    { id: "LV-42", nama: "Program tier mudah — cukup 2 transaksi lagi untuk naik level", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "LV-43", nama: "Voucher besar untuk pertama kali coba kategori produk baru", kondisi: ["freq_rendah", "avgTx_rendah"] },
    { id: "LV-44", nama: "Konten cara hemat maksimal dengan produk yang sudah mereka kenal", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
    { id: "LV-45", nama: "Pesan akhir — jika tidak ada respons dalam 90 hari, kirim penawaran final", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "LV-46", nama: "Program double poin di hari-hari tertentu untuk mendorong frekuensi", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "LV-47", nama: "Penawaran harga khusus untuk pembelian dalam jumlah lebih besar", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-48", nama: "Konten perbandingan — tunjukkan nilai lebih produk dibanding kompetitor", kondisi: ["avgTx_rendah", "freq_rendah"] },
    { id: "LV-49", nama: "Notifikasi promo terbesar atau harga terbaik yang pernah ditawarkan", kondisi: ["avgTx_rendah", "recency_lama"] },
    { id: "LV-50", nama: "Survey kepuasan singkat dengan hadiah voucher sebagai apresiasi", kondisi: ["recency_sedang", "freq_rendah"] },
  ],
  Potential: [
    { id: "PT-01", nama: "Konten edukasi produk untuk membangun kepercayaan sebelum dorong beli lagi", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-02", nama: "Tawarkan produk pelengkap terjangkau sebagai transaksi berikutnya", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-03", nama: "Program referral — ajak teman, keduanya mendapat keuntungan kecil", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "PT-04", nama: "Pesan sambutan hangat dengan panduan singkat produk yang tersedia", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-05", nama: "Voucher diskon besar untuk mendorong transaksi berikutnya", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "PT-06", nama: "Flash deal produk termurah untuk turunkan hambatan transaksi kedua", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-07", nama: "Konten panduan mulai dari mana — produk cocok untuk pelanggan baru", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-08", nama: "Tawaran coba gratis atau demo produk untuk pelanggan pertama kali", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-09", nama: "5 pesan dalam 2 minggu berisi edukasi dan penawaran bertahap", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-10", nama: "Produk tambahan kecil dengan harga sangat terjangkau sebagai add-on", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-11", nama: "Notifikasi stok terbatas untuk produk sesuai budget mereka", kondisi: ["recency_sedang", "avgTx_sangat_rendah"] },
    { id: "PT-12", nama: "Program referral dengan reward lebih besar dari segmen lain", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-13", nama: "Konten FAQ — jawab pertanyaan umum sebelum mereka ragu beli lagi", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-14", nama: "CS proaktif — hubungi pelanggan yang lama tidak bertransaksi secara personal", kondisi: ["recency_sedang", "freq_rendah"] },
    { id: "PT-15", nama: "Cicilan sangat ringan untuk produk entry-level sekalipun", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-16", nama: "Tampilkan banyak ulasan positif dari pelanggan dengan profil serupa", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-17", nama: "Konten coba yang kecil dulu — jalan masuk dengan risiko sangat rendah", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-18", nama: "Layanan beli sekarang bayar nanti untuk transaksi berapapun nilainya", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-19", nama: "Diskon khusus untuk produk paling entry-level di seluruh katalog", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
    { id: "PT-20", nama: "Pesan reaktivasi personal dengan nada hangat dan tidak memaksa", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "PT-21", nama: "Poin double untuk transaksi kedua dan ketiga — bentuk kebiasaan beli", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "PT-22", nama: "Cerita sukses pelanggan lain dengan profil serupa — social proof", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-23", nama: "Gratis ongkir tanpa minimum pembelian — hapus semua alasan tidak beli", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-24", nama: "Program undian kecil — setiap pembelian berapapun masuk undian", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-25", nama: "Perbandingan nilai — tunjukkan mengapa produk ini lebih baik dari lain", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-26", nama: "Pesan WhatsApp personal disesuaikan kebutuhan — bukan blast massal", kondisi: ["recency_sedang", "freq_rendah"] },
    { id: "PT-27", nama: "Reward kecil untuk pembelian ulang dalam 30 hari — dorong repeat buy", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-28", nama: "Konten cara belanja aman dan nyaman untuk membangun kepercayaan awal", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-29", nama: "Flash sale produk termurah di katalog untuk menarik kembali", kondisi: ["avgTx_sangat_rendah", "recency_lama"] },
    { id: "PT-30", nama: "Paket mini — kombinasi produk kecil dengan total harga sangat terjangkau", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-31", nama: "Penawaran percobaan produk dengan harga paling minimal yang tersedia", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-32", nama: "Gamifikasi ringan — badge pelanggan baru dengan tantangan kecil", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-33", nama: "Konten mengapa pelanggan lain terus kembali membeli", kondisi: ["freq_rendah", "recency_sedang"] },
    { id: "PT-34", nama: "Penawaran beli satu gratis satu untuk produk entry-level tertentu", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-35", nama: "Retargeting via WhatsApp untuk pelanggan yang tidak respons email", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "PT-36", nama: "Konten manfaat dan urgensi ringan tanpa tekanan berlebihan", kondisi: ["recency_sedang", "avgTx_sangat_rendah"] },
    { id: "PT-37", nama: "Cashback instan — langsung potongan harga setelah selesai bertransaksi", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-38", nama: "Bundel dengan layanan tambahan kecil — nilai lebih tanpa tambah harga banyak", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-39", nama: "Ulasan jujur dari pelanggan nyata dengan budget sangat terbatas", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-40", nama: "Hadiah kecil jika berhasil dua kali pembelian dalam 30 hari", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-41", nama: "Diskon besar 30–40% untuk mendorong transaksi setelah lama tidak aktif", kondisi: ["avgTx_sangat_rendah", "recency_lama"] },
    { id: "PT-42", nama: "Tampilkan produk yang paling sering dibeli oleh pelanggan baru", kondisi: ["freq_rendah", "avgTx_sangat_rendah"] },
    { id: "PT-43", nama: "Layanan CS responsif — balas pesan dalam 5 menit untuk bangun kepercayaan", kondisi: ["recency_sedang", "freq_rendah"] },
    { id: "PT-44", nama: "Paket starter — semua yang dibutuhkan pelanggan baru dalam satu paket hemat", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-45", nama: "Pendekatan jujur dan tidak memaksa — hadir dan informatif tanpa tekanan", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-46", nama: "Langsung masukkan ke program poin sejak transaksi pertama", kondisi: ["freq_rendah", "recency_baru"] },
    { id: "PT-47", nama: "Notifikasi hampir habis untuk produk sesuai minat mereka", kondisi: ["recency_sedang", "avgTx_sangat_rendah"] },
    { id: "PT-48", nama: "Penawaran tanpa tekanan — diskon tetap tersedia kapanpun siap beli", kondisi: ["recency_lama", "freq_rendah"] },
    { id: "PT-49", nama: "Paket percobaan — produk utama ditambah bonus kecil dengan harga intro", kondisi: ["avgTx_sangat_rendah", "freq_rendah"] },
    { id: "PT-50", nama: "Panduan lengkap memilih produk sesuai kebutuhan dan budget", kondisi: ["avgTx_sangat_rendah", "recency_sedang"] },
  ],
}

// ============================================================
// STEP 2: AI SELECTION — pilih 3 strategi dari 50 pool
// ============================================================

export async function getAIRecommendations(segment: any, allSegments: any[]) {
  try {
    const pool = STRATEGY_POOLS[segment.name as keyof typeof STRATEGY_POOLS] || []
    if (pool.length === 0) return []

    // Build prompt buat AI pilih 3 strategi dari 50
    const prompt = `
Anda adalah konsultan bisnis UMKM yang ahli dalam strategi pemasaran berbasis data.

Pilih 3 strategi yang PALING COCOK untuk segmen pelanggan "${segment.name}" dari daftar 50 strategi di bawah ini.

DATA SEGMEN:
- Nama Segmen: ${segment.name}
- Jumlah Customer: ${segment.count}
- Rata-rata Transaksi: Rp ${segment.avgValue.toLocaleString('id-ID')}
- Total Revenue: Rp ${(segment.avgValue * segment.count).toLocaleString('id-ID')}
- Persentase dari Total: ${segment.percentage}%

KARAKTERISTIK SEGMEN:
${segment.name === "High Value" ? "- Pelanggan dengan nilai transaksi tertinggi dan frekuensi pembelian tinggi. Mereka adalah aset paling berharga."
: segment.name === "Medium Value" ? "- Pelanggan dengan nilai transaksi menengah, memiliki potensi untuk dinaikkan ke High Value."
: segment.name === "Low Value" ? "- Pelanggan dengan nilai transaksi rendah dan jarang bertransaksi. Perlu re-engagement."
: "- Pelanggan baru atau sangat jarang bertransaksi. Perlu edukasi dan pengenalan produk."}

DAFTAR 50 STRATEGI (format: ID: NAMA STRATEGI):
${pool.map((s: any) => `${s.id}: ${s.nama}`).join('\n')}

Pilih 3 strategi yang PALING COCOK untuk segmen ini.
Pertimbangkan:
1. Karakteristik segmen (nilai transaksi, frekuensi, recency)
2. Tujuan strategi (retensi, upselling, re-engagement, atau nurturing)
3. Keunikan setiap strategi

OUTPUT HANYA dalam format JSON:
{
  "selected": [
    { "id": "HV-03", "reason": "alasan singkat kenapa cocok" },
    { "id": "HV-07", "reason": "alasan singkat kenapa cocok" },
    { "id": "HV-09", "reason": "alasan singkat kenapa cocok" }
  ]
}

HANYA JSON, tanpa teks lain.
`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: prompt,
      temperature: 0.5,
      maxTokens: 800,
    })

    // Parse JSON
    let parsed
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = JSON.parse(text)
      }
    } catch {
      console.error("[v0] Failed to parse AI selection, using fallback")
      return pool.slice(0, 3)
    }

    const selected = parsed.selected || []
    if (selected.length === 0) return pool.slice(0, 3)

    // Ambil strategi berdasarkan ID yang dipilih AI
    const recommendations = selected
      .map((s: any) => {
        const found = pool.find((p: any) => p.id === s.id)
        return found ? { ...found, reason: s.reason || "Direkomendasikan oleh AI" } : null
      })
      .filter(Boolean)

    return recommendations.length >= 3 ? recommendations.slice(0, 3) : pool.slice(0, 3)
  } catch (error) {
    console.error("[v0] AI Strategy Selection Error:", error)
    const pool = STRATEGY_POOLS[segment.name as keyof typeof STRATEGY_POOLS] || []
    return pool.slice(0, 3)
  }
}

// ============================================================
// STEP 3: KOMPATIBILITAS dengan kode lama (segment-details.tsx)
// ============================================================

// Fungsi ini dipanggil dari segment-details.tsx
// Karena async, panggil pake await di komponen
export async function getDynamicRecommendations(segment: any, allSegments: any[]) {
  return getAIRecommendations(segment, allSegments)
}
