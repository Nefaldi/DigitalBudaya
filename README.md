# DigitalBudaya (DigiCulture Care)

Sistem registrasi, pelaporan, dan pengarsipan digital cagar budaya megalitikum serta tradisi lisan Provinsi Sulawesi Tengah berbasis Next.js 16 App Router, Prisma ORM, PostgreSQL (Supabase), dan Cloudinary.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GeoMapping-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)

---

## Daftar Isi
- [Akun Demo](#akun-demo)
- [Quick Start](#quick-start)
- [Arsitektur & Batasan Free-Tier](#arsitektur--batasan-free-tier)
- [Identitas Visual & Sistem Desain](#identitas-visual--sistem-desain)
- [Fitur Sistem](#fitur-sistem)
- [Struktur Direktori](#struktur-direktori)
- [Ringkasan REST API](#ringkasan-rest-api)
- [Daftar Skrip](#daftar-skrip)

---

## Akun Demo

Semua akun hasil seeding menggunakan password default: `password123`

| Peran (Role) | Email | Akses & Kewenangan |
|---|---|---|
| **Superadmin** | `superadmin@digiculture.id` | Manajemen pengguna se-provinsi, analitik regional, hapus laporan |
| **Admin** | `admin@digiculture.id` | Konservator lapangan: verifikasi status, upload foto restorasi & audio WBTB |
| **Pelapor** | `pelapor@digiculture.id` | Masyarakat umum: kirim laporan kondisi cagar budaya, kelola draft laporan mandiri |

---

## Quick Start

### 1. Prasyarat Sistem
- Node.js versi 18.x atau 20.x
- npm versi 9.x atau lebih baru
- Akun Supabase (Database PostgreSQL)
- Akun Cloudinary (Media Storage)

### 2. Kloning & Pasang Dependensi
```bash
git clone <URL_REPOSITORY>
cd DigitalBudaya
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file template `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Sesuaikan variabel berikut pada file `.env`:
```env
# Database PostgreSQL Supabase (Port 6543 untuk Transaction Pooler)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Sesi JWT
JWT_SECRET="kunci-rahasia-jwt-digitalbudaya-2026-super-secure"
AUTH_SECRET="kunci-rahasia-jwt-digitalbudaya-2026-super-secure"

# Kredensial Cloudinary
CLOUDINARY_CLOUD_NAME="nama_cloud_anda"
CLOUDINARY_API_KEY="api_key_anda"
CLOUDINARY_API_SECRET="api_secret_anda"
```

### 4. Sinkronisasi Database & Seeding
```bash
# Sinkronkan skema Prisma ke database
npx prisma generate
npx prisma db push

# Masukkan data awal (akun demo & contoh cagar budaya Sulteng)
npm run seed
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Aplikasi dapat diakses di `http://localhost:3000`.

---

## Arsitektur & Batasan Free-Tier

Sistem dirancang dengan optimasi khusus untuk beroperasi di bawah batasan paket gratis penyedia layanan cloud:

1. **Vercel Serverless (Maksimal 4.5 MB Payload Request):**
   - Kompresi sisi klien menggunakan HTML5 Canvas pada `ImageCompressorUpload.tsx`. Foto kamera ponsel berukuran 8–15 MB diubah dimensinya menjadi maksimal 1600px dan dikompresi ke JPEG kualitas 0.82 sebelum dikirim ke API upload, menghasilkan berkas 300–500 KB tanpa melanggar batasan payload Vercel.
2. **Cloudinary (Batas 25 Kredit/Bulan):**
   - Menggunakan utility `lib/imageUtils.ts` untuk menginjeksi parameter transformasi on-the-fly (`f_auto,q_auto,w_*`) langsung pada URL CDN.
   - Komponen Next.js Image dikonfigurasi dengan properti `unoptimized` untuk gambar eksternal Cloudinary, mencegah terpakainya kuota 1.000 transformasi bulanan pada Vercel Hobby.
3. **Supabase PostgreSQL (Batas Database 500 MB & Connection Pooling):**
   - Kueri analitik dan halaman beranda menggunakan eksekusi agregat paralel `prisma.heritageReport.groupBy()` di dalam `Promise.all`, memangkas kueri hitung sekuensial dari 6 kali menjadi 1 kali roundtrip database.
   - Menggunakan port 6543 (PgBouncer Transaction Pooler) untuk mencegah koneksi habis pada lingkungan serverless.
4. **Optimasi Font & Aset Statis:**
   - Tipografi Google Fonts (`Plus Jakarta Sans` dan `JetBrains Mono`) diimpor melalui modul bawaan `next/font/google` di `app/layout.tsx`. Font disimpan lokal saat build untuk mencegah layout shift (CLS = 0) dan menghilangkan network waterfall ke domain pihak ketiga.
5. **In-Memory Rate Limiting:**
   - Rate limiting diimplementasikan secara modular pada `lib/rateLimit.ts` dengan penanda interval `timer.unref()` untuk memastikan siklus pembersihan memori tidak menghambat proses serverless atau graceful shutdown.

---

## Identitas Visual & Sistem Desain

Antarmuka mengadopsi filosofi **Nordic-Swiss Cultural Archival / Contemporary Curatorial Minimal**. Pendekatan ini menonjolkan bobot data, hierarki informasi yang ketat, dan menghapus seluruh ornamen artifisial (*anti-AI slop*, zero visual emojis).

### 1. Logo Resmi
- Simbol: Perisai Tadulako melindungi Arca Megalitikum Palindo (Lembah Bada, Kabupaten Poso).
- Warna Inti: `#142948` (Tadulako Shield Navy).
- Aset Terintegrasi:
  - `public/logo-transparent.png` (Varian navy untuk tema terang).
  - `public/logo-light-transparent.png` (Varian gading `#f8fafc` untuk tema gelap dan footer).

### 2. Spesifikasi Palet Warna & Tipografi

| Elemen Token | Light Mode (Archival Parchment) | Dark Mode (Obsidian Ink) | Keterangan |
|---|---|---|---|
| `--color-brand` | `#142948` | `#7FA2C7` | Warna utama perisai logo, kontras WCAG AAA |
| `--bg-canvas` | `#FAFAFA` | `#111215` | Kanvas latar bertekstur kertas arsip |
| `--bg-card` | `#FFFFFF` | `#18191E` | Permukaan panel kartu kuratorial |
| `--border-hairline` | `#E4E4E7` | `#27272A` | Garis batas struktural 1px |
| `--text-primary` | `#09090B` | `#F4F4F5` | Teks utama dengan kontras tinggi |
| `--text-muted` | `#71717A` | `#A1A1AA` | Teks pendukung / metadata registri |
| Status Masuk | `#991B1B` (Merah Bata) | `#F87171` | Status registrasi awal masuk |
| Status Diproses | `#92400E` (Ambar Emas) | `#FBBF24` | Status dalam penanganan konservator |
| Status Selesai | `#166534` (Zamrud Lembah) | `#4ADE80` | Status terverifikasi dan selesai dipugar |

- **Tipografi Utama:** `Plus Jakarta Sans` untuk teks kuratorial, antarmuka, dan judul.
- **Tipografi Monospace:** `JetBrains Mono` untuk nomor inventaris, koordinat GPS, dan metadata tanggal.
- **Format Cetak Dokumen A4:** Dukungan CSS `@media print` untuk mencetak dossier berkas cagar budaya secara resmi tanpa elemen navigasi browser.

---

## Fitur Sistem

- **Framed Archival Hero & Live Metrics:** Tampilan beranda berbingkai arsip resmi BPK Wilayah XVIII dengan indikator registri aktif dan metrik kuantitatif langsung dari basis data.
- **Katalog Geospasial Publik:** Direktori pencarian pusaka mencakup 13 Kabupaten/Kota se-Sulawesi Tengah dengan sinkronisasi parameter URL dua arah, filter kategori, status konservasi, dan pencarian teks *case-insensitive*.
- **Peta Interaktif Leaflet:** Pembatasan wilayah spesifik Sulteng (119.0°E - 124.5°E, -3.8°S - 2.2°N) dengan penanda pin SVG bertema perisai Tadulako dan lompatan langsung dari navigasi (`/#peta`).
- **Before-After Slider Modern:** Komponen komparasi visual interaktif dengan Pointer Capture API, dukungan sentuh mobile, dan penempatan posisi instan via klik.
- **Dossier Lembar Arsip & Cetak Fisik:** Halaman detail dua kolom yang memuat metadata registrasi, peta lokasi terverifikasi, dan tombol cetak dossier A4.
- **Audio Wave Player:** Pemutar audio HTML5 untuk pelestarian Warisan Budaya Takbenda (WBTB), sastra tutur lisan, dan rekaman dialek daerah.
- **Formulir Laporan Lapangan:** Input data komprehensif, kompresi foto klien otomatis, penanda GPS interaktif, dan peringatan draf offline berbasis penyimpanan lokal.
- **Meja Kerja Konservator (Admin):** Alur verifikasi laporan, pengambilan alih investigasi, serta pengunggahan foto restorasi dan rekaman audio.
- **Panel Tata Kelola & Analitik (Superadmin):** Visualisasi sebaran lengkap 13 Kabupaten/Kota se-Sulawesi Tengah dan manajemen akun dengan kontrol RBAC.

---

## Struktur Direktori

```
DigitalBudaya/
├── app/
│   ├── admin/                 # Meja kerja verifikasi konservator (/admin)
│   ├── api/                   # Route handlers REST API
│   │   ├── analytics/         # GET /api/analytics
│   │   ├── auth/              # login, register, me, logout
│   │   ├── reports/           # CRUD katalog & laporan cagar budaya
│   │   ├── upload/            # Upload foto & audio ke Cloudinary
│   │   └── users/             # Manajemen user & profil akun
│   │       ├── [id]/          # Operasi per pengguna (Superadmin)
│   │       └── profile/       # GET/PATCH profil pengguna login
│   ├── katalog/               # Direktori publik geospasial
│   │   └── [id]/              # Dossier detail pusaka & slider pemugaran
│   ├── login/                 # Halaman autentikasi login
│   ├── pelapor/               # Portal pelapor masyarakat (/pelapor)
│   │   ├── lapor/             # Form pelaporan dengan kompresor kanvas & peta
│   │   └── profil/            # Manajemen profil & riwayat pelapor
│   ├── register/              # Halaman pendaftaran pelapor
│   ├── superadmin/            # Panel kontrol provinsi
│   │   ├── analytics/         # Visualisasi sebaran lengkap 13 Kab/Kota
│   │   └── users/             # Manajemen akun & peran pengguna
│   ├── globals.css            # Sistem desain CSS arsip minimal (anti-AI slop)
│   ├── layout.tsx             # Root layout (next/font & Leaflet CSS bundle)
│   └── page.tsx               # Beranda berbingkai kuratorial & metrik live
│
├── components/                # Komponen antarmuka mandiri
│   ├── AudioWavePlayer.tsx    # Pemutar audio WBTB
│   ├── BeforeAfterSlider.tsx  # Slider komparasi foto (Pointer Capture API)
│   ├── Footer.tsx             # Footer institusional 4 kolom
│   ├── HeritageCard.tsx       # Kartu katalog cagar budaya (rasio 16:10)
│   ├── ImageCompressorUpload.tsx # Kompresor gambar HTML5 canvas
│   ├── MapPicker.tsx          # Penentu titik koordinat laporan
│   ├── Navbar.tsx             # Navigasi responsif (56px fixed, jump to #peta)
│   ├── PrintDossierButton.tsx # Tombol cetak berkas arsip resmi A4
│   ├── SultengMap.tsx         # Peta spasial cagar budaya (Leaflet)
│   ├── ThemeToggle.tsx        # Toggle tema terang / gelap
│   └── WorkflowStepper.tsx    # Indikator alur status penanganan
│
├── lib/                       # Modul driver & helper
│   ├── auth.ts                # Verifikasi JWT & hash kata sandi bcrypt
│   ├── cloudinary.ts          # Driver upload stream Cloudinary SDK
│   ├── imageUtils.ts          # Optimasi format & ukuran URL Cloudinary
│   ├── prisma.ts              # Singleton PrismaClient
│   ├── rateLimit.ts           # Rate limiter memori dengan unref lifecycle
│   └── sultengLocations.ts    # Validasi koordinat batas wilayah Sulteng
│
├── prisma/
│   ├── schema.prisma          # Definisi skema model database
│   └── seed.ts                # Seeder akun demo & contoh data cagar budaya
│
├── public/                    # Berkas aset statis (logo resmi transparan)
├── next.config.ts             # Konfigurasi remote domain gambar Next.js
└── README.md                  # Dokumentasi teknis proyek
```

---

## Ringkasan REST API

Spesifikasi lengkap muatan permintaan dan respons dapat dilihat pada [API_DOCUMENTATION.md](file:///home/dil/Code/DigitalBudaya/API_DOCUMENTATION.md).

| Method | Endpoint | Deskripsi Fungsi | Akses |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pendaftaran akun masyarakat baru | Publik |
| `POST` | `/api/auth/login` | Autentikasi akun & pembuatan cookie JWT | Publik |
| `GET` | `/api/auth/me` | Pembacaan profil pengguna sesi aktif | Terautentikasi |
| `POST` | `/api/auth/me` | Logout (penghapusan cookie sesi) | Terautentikasi |
| `GET` | `/api/reports` | Mengambil daftar katalog & filter wilayah | Publik |
| `POST` | `/api/reports` | Membuat laporan cagar budaya baru | Pelapor & Admin |
| `GET` | `/api/reports/[id]` | Mengambil satu data detail cagar budaya | Publik |
| `PATCH` | `/api/reports/[id]` | Pembaruan status penanganan / koreksi draft | Sesuai Peran |
| `DELETE` | `/api/reports/[id]` | Pembatalan atau penghapusan laporan | Pelapor / Superadmin |
| `POST` | `/api/upload` | Upload media foto/audio ke Cloudinary | Terautentikasi |
| `GET` | `/api/users` | Daftar semua akun pengguna | Superadmin |
| `POST` | `/api/users` | Pembuatan akun baru dengan relasi count | Superadmin |
| `PATCH` | `/api/users/[id]` | Perubahan peran pengguna (Role Promotion) | Superadmin |
| `DELETE` | `/api/users/[id]` | Penonaktifan / penghapusan akun pengguna | Superadmin |
| `GET` | `/api/users/profile` | Mengambil profil dan statistik pelapor aktif | Terautentikasi |
| `PATCH` | `/api/users/profile` | Memperbarui nama/password pengguna aktif | Terautentikasi |
| `GET` | `/api/analytics` | Ringkasan statistik agregat se-provinsi | Admin & Superadmin |

---

## Daftar Skrip

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server development Next.js lokal (`http://localhost:3000`) |
| `npm run build` | Menjalankan kompilasi TypeScript dan pembuatan build produksi |
| `npm run start` | Menjalankan server aplikasi pada mode produksi |
| `npm run lint` | Menjalankan pemeriksaan kode menggunakan ESLint |
| `npm run seed` | Menjalankan pengisian data awal ke database Supabase |
