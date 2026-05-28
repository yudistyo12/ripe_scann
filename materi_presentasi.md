# Panduan Presentasi Proyek: RipeScan (Deteksi Kematangan & Kualitas Makanan)

Berikut adalah ringkasan teknis dan konseptual yang disusun khusus agar Anda bisa menjelaskan tugas pemrograman ini dengan percaya diri dan elegan saat presentasi di hadapan Dosen.

---

## 1. Latar Belakang & Tujuan
**Nama Aplikasi:** RipeScan (Sistem Deteksi Kualitas Makanan Cerdas)
**Tujuan Pembuatan:** 
Awalnya dirancang menghitung nutrisi, namun aplikasi di-*pivot* menjadi **Sistem Deteksi Kematangan dan Kelayakan Makanan**. Hal ini sejalan dengan program *Makan Bergizi Gratis (MBG)* dan pengecekan ketahanan pangan skala rumah tangga. Aplikasi bertujuan membantu masyarakat / siswa memastikan buah belum membusuk, atau memastikan makanan olahan (seperti ayam bakar/telur) tidak gosong sebelum dikonsumsi. 

---

## 2. Arsitektur Teknologi & Tool
Jelaskan ke dosen bahwa Anda tidak membuat website "biasa", melainkan sebuah **Web Application dengan arsitektur canggih**:

- **Frontend / Basis Platform:** `Next.js` dan `React.js` dengan desain *mobile-first* (Sangat responsif seperti aplikasi asli di HP).
- **Styling:** `Tailwind CSS` & `Framer Motion` untuk *smooth animation* dan *glassmorphism UI*.
- **Database / Penyimpanan:** Menggunakan `LocalStorage/Client-Side Storage`, sehingga data sejarah (*Tracker*) tersimpan cepat tanpa biaya *server*.
- **Otak AI / Deep Learning:** `TensorFlow.js` menggunakan arsitektur **MobileNet V1 (Alpha 0.5)**.
- **Sistem Penglihatan Komputer:** `HTML5 Canvas API` dan *Mathematical Pixel Extraction*.

---

## 3. Cara Kerja Sistem (Inti Presentasi Anda)
Ini adalah porsi *killer* untuk mendapatkan nilai sempurna. Jelaskan proses identifikasi ini menjadi 2 langkah pintar:

### A. Tahap 1: Pengenalan Objek (Deep Learning)
Aplikasi tidak mendeteksi segalanya secara *"hardcode"*. Kita memanfaatkan algoritma **MobileNet** yang sudah ditraining dengan ribuan citra (*ImageNet dataset*). 
- Saat foto diambil / di-upload, vektor gambar dikirim ke AI. 
- AI akan mengeluarkan *output* (contoh: *fried egg*, *banana*, *plate*).
- Aplikasi memiliki *Translator Auto-Mapping* yang menerjemahkan bahasa AI tersebut ke dalam konteks makanan Indonesia (contoh: "Telur Goreng", "Pisang", "Hidangan Makanan").
- Jika difoto adalah laptop atau kucing, aplikasi punya perlindungan logika (validasi) yang langsung menolak dan mengatakan itu **Bukan Buah/Sayur**.

### B. Tahap 2: Analisis Kualitas & Kematangan (Image Processing)
Setelah tahu *apa* objeknya, aplikasi butuh tahu *bagaimana* kondisinya. Di sini AI tidak bisa bekerja sendirian, kita menggunakan ilmu pemrosesan citra murni:
1. Layar mengambil area tengah foto, membedah data `(Red, Green, Blue / RGB)` setiap piksel mikroskopis di baliknya menggunakan `<canvas>`.
2. Matematika bekerja mengkonversi `RGB` menjadi formula **`HSL` (Hue, Saturation, Lightness)**.
3. **Logika HSL dihubungkan silang dengan Nama Objek:**
   - **Pisang:** Jika nilai derajat *Hue* tinggi (hijau) = Mentah.
   - **Tomat:** Jika nilai derajat *Hue* rendah (merah) = Matang.
   - **Makanan Olahan/Masakan (Telur, Ayam Bakar):** Jika poin *Lightness (L)* sangat rendah (gelap pekat/hitam), sistem mencapnya **Tertalu Matang / Gosong**. Jika normal = Matang Siap Saji.

*(Dua tahap ini berjalan berdampingan di bawah 1 detik!)*

---

## 4. Keunggulan yang Patut Dibanggakan (Fitur Unggulan)
Saat mendemonstrasikan, jangan lupa pamerkan fitur-fitur ini:
- **Optimization untuk Mobile:** Karena ini *Pemrograman Mobile 1*, model AI-nya sudah saya **kompresi (Alpha 0.5)** agar tidak memakan RAM HP dan sangat cepat mendownload *weights*-nya saat pertama dibuka.
- **Tracking Log Inventaris Interaktif:** Aplikasi tidak cuma *scan*, tetapi langsung memisahkan mana hitungan harian makanan matang, mentah, atau yang perlu diwaspadai (busuk) ke dalam *dashboard bar-chart*. Semua record bisa dihapus *(Delete history)* dengan sekali klik.
- **Kamera vs Galeri Seamless:** Algoritma pemrosesan citranya terdistribusi sangat merata. Artinya, analisis gambar akan bekerja persis sama dan super akurat entah itu direkam *live* dari kamera webcam HP, maupun di-*upload* manual dari File Manager HP.

---

## 5. Kesimpulan Presentasi (Penutup)
*"Project RipeScan yang saya kembangkan berhasil membuktikan bahwa browser web mobile saat ini telah berevolusi luar biasa. Kita tidak lagi sekadar mendesain tampilan form, tetapi mampu menanamkan algoritma Kecerdasan Buatan (AI) asli dan Pemrosesan Citra Matematika langsung di dalam smartphone pengguna."*

