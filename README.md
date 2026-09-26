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

---

## Identitas Visual & Sistem Desain

Antarmuka menggunakan sistem desain editorial museum dengan sudut kuratorial (`border-radius: 3px - 8px`), tipografi terstruktur, dan penyesuaian tema terang/gelap berbasis logo resmi.

### 1. Logo Resmi
- Simbol: Perisai Tadulako melindungi Arca Megalitikum Palindo (Lembah Bada, Kabupaten Poso).
- Warna Inti: `#142948` (Tadulako Shield Navy).
- Aset Terintegrasi:
  - `public/logo-transparent.png` (Varian navy untuk tema terang).
  - `public/logo-light-transparent.png` (Varian gading `#f8fafc` untuk tema gelap dan footer).

### 2. Spesifikasi Palet Warna

| Elemen Token | Light Mode (Editorial Archive) | Dark Mode (Oceanic Basalt) | Keterangan |
|---|---|---|---|
| `--color-brand` | `#142948` | `#5b8ec9` | Warna utama perisai logo, kontras WCAG AAA di kedua tema |
| `--bg-canvas` | `#f8fafc` | `#0c1421` | Kanvas latar bebas silau |
| `--bg-card` | `#ffffff` | `#131f32` | Permukaan panel kartu |
| `--border-hairline` | `#e2e8f0` | `#1e2f49` | Garis batas tipis 1px |
| `--text-primary` | `#0f172a` | `#f8fafc` | Teks utama dengan kontras tinggi |
| `--text-muted` | `#64748b` | `#94a3b8` | Teks pendukung / metadata |
| Status Masuk | `#9c6634` (Sandstone) | `#c49658` | Aksen batu purba Besoa |
| Status Selesai | `#1e4030` (Conifer) | `#4e8268` | Aksen vegetasi Lore Lindu |
| Status Kritis | `#8c351e` (Terracotta) | `#b84c30` | Aksen tenun Donggala |

---

## Fitur Sistem

- **Katalog Geospasial Publik:** Direktori pencarian pusaka mencakup 13 Kabupaten/Kota se-Sulawesi Tengah dengan filter kategori (Benda vs Takbenda), status konservasi, dan pencarian teks *case-insensitive*.
- **Peta Interaktif Leaflet:** Pembatasan wilayah spesifik Sulteng (119.0°E - 124.5°E, -3.8°S - 2.2°N) dengan penanda pin SVG bertema perisai Tadulako.
- **Before-After Slider:** Komponen komparasi visual interaktif geser untuk membandingkan kondisi kerusakan awal dengan hasil pemugaran fisik atau digitalisasi 3D.
- **Audio Wave Player:** Pemutar audio HTML5 untuk pelestarian Warisan Budaya Takbenda (WBTB), sastra tutur lisan, dan rekaman dialek bahasa daerah yang terancam punah.
- **State Machine Konservasi:** Alur penanganan terstruktur: `LAPORAN_MASUK` -> `DIPROSES` (dikunci oleh Konservator Wilayah) -> `SELESAI`.
- **Manajemen Pengguna & Analitik:** Panel Superadmin untuk promosi peran pengguna serta visualisasi agregat sebaran cagar budaya per kabupaten/kota.

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
│   │   └── users/             # Manajemen user (Superadmin)
│   ├── katalog/               # Direktori publik geospasial
│   │   └── [id]/              # Dossier detail pusaka & slider pemugaran
│   ├── login/                 # Halaman autentikasi login
│   ├── pelapor/               # Portal pelapor masyarakat (/pelapor)
│   │   └── lapor/             # Form pelaporan dengan kompresor kanvas & peta
│   ├── register/              # Halaman pendaftaran pelapor
│   ├── superadmin/            # Panel kontrol provinsi
│   │   ├── analytics/         # Visualisasi sebaran 13 Kab/Kota
│   │   └── users/             # Manajemen akun & peran pengguna
│   ├── globals.css            # Desain sistem CSS tanpa framework utilitas eksternal
│   ├── layout.tsx             # Root layout (next/font & Leaflet CSS bundle)
│   └── page.tsx               # Beranda sistem & metrik provinsi
│
├── components/                # Komponen antarmuka mandiri
│   ├── AudioWavePlayer.tsx    # Pemutar audio WBTB
│   ├── BeforeAfterSlider.tsx  # Slider komparasi foto restorasi
│   ├── Footer.tsx             # Footer dengan varian logo dark
│   ├── HeritageCard.tsx       # Kartu katalog cagar budaya
│   ├── ImageCompressorUpload.tsx # Kompresor gambar HTML5 canvas
│   ├── MapPicker.tsx          # Penentu titik koordinat laporan
│   ├── Navbar.tsx             # Navigasi responsif (desktop & mobile drawer)
│   ├── SultengMap.tsx         # Peta spasial cagar budaya (Leaflet)
│   ├── ThemeToggle.tsx        # Toggle tema terang / gelap
│   └── WorkflowStepper.tsx    # Indikator alur status penanganan
│
├── lib/                       # Modul driver & helper
│   ├── auth.ts                # Verifikasi JWT & hash kata sandi bcrypt
│   ├── cloudinary.ts          # Driver upload stream Cloudinary SDK
│   ├── imageUtils.ts          # Optimasi format & ukuran URL Cloudinary
│   ├── prisma.ts              # Singleton PrismaClient
│   └── sultengLocations.ts    # Validasi koordinat batas wilayah Sulteng
│
├── prisma/
│   ├── schema.prisma          # Definisi skema model database
│   └── seed.ts                # Seeder akun demo & contoh data cagar budaya
│
├── public/                    # Berkas aset statis (logo resmi format transparan)
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
| `PATCH` | `/api/users/[id]` | Perubahan peran pengguna (Role Promotion) | Superadmin |
| `DELETE` | `/api/users/[id]` | Penonaktifan / penghapusan akun pengguna | Superadmin |
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
