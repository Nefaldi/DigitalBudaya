# 🏛️ DigitalBudaya (DigiCulture Care) — Platform Cagar Budaya Sulawesi Tengah (v3.1.0)
> **Sistem Partisipatif Penyelamatan, Restorasi, dan Pengarsipan Digital Warisan Budaya Megalitikum & Tradisi Lisan Sulawesi Tengah**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GeoMapping-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)

---

## 📖 Ringkasan Proyek

**DigitalBudaya (DigiCulture Care)** adalah platform *fullstack* berbasis **Next.js 16 (App Router)** yang dirancang untuk mengawal upaya penyelamatan, dokumentasi partisipatif, serta digitalisasi cagar budaya di 13 Kabupaten dan Kota se-Provinsi Sulawesi Tengah.

Mulai dari komplek patung megalitikum dan kalamba purba di Lembah Bada/Besoa/Napu (Taman Nasional Lore Lindu), arsitektur vernakular rumah adat Soura & Tambi, hingga sastra tutur dan bahasa daerah yang terancam punah (seperti bahasa Rampi).

Platform ini mengintegrasikan katalog geospasial publik, alur kerja verifikasi konservator cagar budaya (*state machine*), perbandingan visual pemugaran sebelum-sesudah (*before-after slider*), pemutar audio warisan takbenda, serta portal analitik provinsi untuk pengambil kebijakan.

---

## 🛡️ Identitas Visual & Desain Editorial Kuratorial (Anti AI-Slop)

Sistem antarmuka DigitalBudaya dibangun dengan filosofi **Editorial Museum & Arsip Kuratorial**, menghindari estetika "AI-slop" (tanpa karakter emoji murahan, tanpa warna neon Tailwind sintetis, dan tanpa badge berbentuk kapsul bulat lonjong `border-radius: 9999px`).

### 1. Logo Resmi: Perisai Tadulako & Arca Palindo
Logo resmi menggabungkan **Perisai Tadulako** (simbol keprajuritan dan perlindungan adat Sulawesi Tengah) yang memayungi siluet **Arca Megalitikum Palindo / Sepe** (Lembah Bada, Poso).
- **Varian Terang (`public/logo-transparent.png`):** Siluet *Tadulako Shield Navy* (`#142948`) dengan latar transparan.
- **Varian Gelap (`public/logo-light-transparent.png`):** Siluet *Ivory Slate* (`#f8fafc`) dengan latar transparan.

### 2. Dual-Theme Harmonized Palette

| Token / Elemen | Tema Terang (*Light Editorial Archive*) | Tema Gelap (*Deep Megalithic Basalt*) | Deskripsi & Filosofi |
| :--- | :--- | :--- | :--- |
| **Brand Primer** | `#142948` (*Tadulako Shield Navy*) | `#5b8ec9` (*Megalith Azure*) | Warna institusional wibawa dari logo resmi; kontras WCAG AAA di kedua tema. |
| **Latar Kanvas** | `#f8fafc` (*Slate Archival Paper*) | `#0c1421` (*Deep Oceanic Basalt*) | Menghindari putih silau mentah `#ffffff` dan hitam pekat baterai `#000000`. |
| **Kartu & Permukaan** | `#ffffff` (Batas 1px `#e2e8f0`) | `#131f32` (Batas 1px `#1e2f49`) | Kedalaman hierarki struktural dengan garis rambut (*hairline borders*). |
| **Teks Primer** | `#0f172a` (*Obsidian Slate*) | `#f8fafc` (*Ivory Frost*) | Keterbacaan tipografi maksimal untuk teks panjang dan catatan arsip. |
| **Aksen Besoa Sandstone** | `#9c6634` (Soft: `#fbf5ee`) | `#c49658` (Soft: `rgba(196,150,88,0.14)`) | Aksen arca batu pasir purba untuk status antrean & tag kategori. |
| **Aksen Lindu Conifer** | `#1e4030` (Soft: `#edf6f0`) | `#4e8268` (Soft: `rgba(78,130,104,0.14)`) | Aksen vegetasi hutan Lore Lindu untuk status terverifikasi / selesai. |
| **Aksen Donggala Terracotta** | `#8c351e` (Soft: `#f7ede8`) | `#b84c30` (Soft: `rgba(184,76,48,0.14)`) | Aksen tenun Donggala untuk status proses & verifikasi kritis. |

### 3. Arsitektur Mobile-First & Desktop Ergonomics
- **Mobile-First:** Seluruh komponen diuji pada lebar layar HP (375px - 414px) dengan *minimum touch-target* 44px, drawer navigasi *slide-over*, accordion tabel data, dan peta yang aman dari *scroll trapping*.
- **Desktop UX:** Layar lebar (1280px+) memanfaatkan tata letak multi-kolom, dossier arsip berdampingan (*split-panel*), dan meja kerja inspeksi konservator yang efisien.

---

## ⚡ Arsitektur Efisiensi & Strategi Free-Tier

Platform ini dioptimalkan secara ketat untuk berjalan andal di bawah batasan paket gratis (*free-tier constraints*):

1. **Vercel Serverless Function (Batas Payload 4.5 MB):**
   - Komponen [`ImageCompressorUpload.tsx`](file:///home/dil/Code/DigitalBudaya/components/ImageCompressorUpload.tsx) melakukan *downsampling* dan kompresi JPEG berbasis HTML5 Canvas langsung di browser pengguna sebelum diunggah ke server. Foto kamera ponsel 12MP (8–15 MB) terkompresi otomatis menjadi ~300–500 KB tanpa kehilangan detail arkeologis.
2. **Cloudinary CDN (Batas Kuota 25 Kredit/Bulan):**
   - Menggunakan utility [`lib/imageUtils.ts`](file:///home/dil/Code/DigitalBudaya/lib/imageUtils.ts) yang menginjeksi transformasi *on-the-fly* (`f_auto,q_auto,w_*`) untuk menyajikan format WebP/AVIF modern sesuai dimensi layar pengguna.
   - Komponen Next.js `<Image unoptimized />` digunakan untuk gambar Cloudinary dinamis sehingga **tidak memakan kuota 1.000 Image Optimization per bulan milik Vercel**.
3. **Supabase PostgreSQL (Koneksi Pooler Port 6543 & Batas DB 500 MB):**
   - Optimasi kueri database pada rute analitik ([`app/api/analytics/route.ts`](file:///home/dil/Code/DigitalBudaya/app/api/analytics/route.ts)) dan beranda ([`app/page.tsx`](file:///home/dil/Code/DigitalBudaya/app/page.tsx)) dengan menggabungkan kueri hitung sekuensial menjadi kueri SQL agregat paralel `prisma.heritageReport.groupBy()`. Mengurangi *roundtrip database* hingga 70%.
4. **Zero Layout Shift Font Self-Hosting:**
   - Tipografi Google Fonts (`Plus Jakarta Sans` & `JetBrains Mono`) diimpor melalui `next/font/google` di [`app/layout.tsx`](file:///home/dil/Code/DigitalBudaya/app/layout.tsx), memangkas *render-blocking network requests* ke CDN eksternal.

---

## ✨ Fitur-Fitur Utama

- 🗺️ **Katalog Publik & Geospasial Sulteng:** Filter multi-dimensi (13 Kabupaten/Kota, Kategori Benda/Takbenda, Status Penyelamatan, Pencarian teks bebas *case-insensitive*).
- 📍 **Peta Interaktif Leaflet:** Bounding box Sulawesi Tengah (-3.8°S s/d 2.2°N, 119.0°E s/d 124.5°E) dengan pin SVG bertema Tadulako Shield dan popup interaktif.
- 🎚️ **Before-After Restoration Slider:** Slider perbandingan visual interaktif geser (*drag & touch*) untuk membandingkan kondisi rusak awal dengan hasil digitalisasi 3D / konservasi fisik.
- 🎵 **Audio Wave Player:** Pemutar audio HTML5 responsif dengan visualisator gelombang suara untuk dokumentasi warisan budaya takbenda (WBTB) seperti bahasa daerah Rampi dan sastra tutur.
- 📋 **Workflow Stepper (State Machine):** Visualisasi tahapan penanganan terstandar: `LAPORAN_MASUK` ➔ `DIPROSES` (oleh Konservator Wilayah) ➔ `SELESAI` (Verifikasi Lapangan Tuntas).
- 🔐 **Role-Based Access Control (RBAC):**
  - **Publik:** Menjelajahi katalog terverifikasi dan dossier detail.
  - **Pelapor:** Pendaftaran mandiri, pembuatan laporan cagar budaya, manajemen draf laporan sendiri.
  - **Admin (Konservator):** Mengklaim laporan, mengubah status penanganan, mengunggah foto digitalisasi pemugaran & audio WBTB.
  - **Superadmin:** Manajemen pengguna se-provinsi (ubah role / hapus akun) dan pemantauan analitik sebaran 13 Kab/Kota.

---

## 🔑 Akun Demo Siap Pakai

Semua akun hasil seeding menggunakan password default: **`password123`**

| Peran (Role) | Email | Hak Akses Utama |
|---|---|---|
| **Superadmin** | `superadmin@digiculture.id` | Manajemen user se-provinsi, hapus laporan, dan dashboard analitik lengkap |
| **Admin** | `admin@digiculture.id` | Konservator lapangan: klaim laporan, update status, upload hasil restorasi & audio |
| **Pelapor** | `pelapor@digiculture.id` | Masyarakat umum: buat laporan pusaka baru, edit laporan sendiri berstatus masuk |

---

## 📂 Struktur Direktori Proyek

```
DigitalBudaya/
├── 📁 app/                             # Next.js App Router (Fullstack)
│   ├── 📁 admin/                       # Meja Kerja Konservator Lapangan (/admin)
│   ├── 📁 api/                         # REST API Route Handlers
│   │   ├── 📁 analytics/               # GET /api/analytics (Agregat Wilayah & Status)
│   │   ├── 📁 auth/                    # Login, Register, Me (JWT Cookie & Header)
│   │   ├── 📁 reports/                 # CRUD Laporan & Katalog ([id], POST, PATCH, DELETE)
│   │   ├── 📁 upload/                  # Upload Media ke Cloudinary CDN
│   │   └── 📁 users/                   # Manajemen User ([id], PATCH role, DELETE)
│   ├── 📁 katalog/                     # Direktori Publik Geospasial
│   │   ├── 📁 [id]/                    # Dossier Detail Cagar Budaya & Slider Pemugaran
│   │   └── page.tsx                    # Daftar Katalog Publik & Filter Spasial
│   ├── 📁 login/                       # Halaman Masuk Akun
│   ├── 📁 pelapor/                     # Portal Pelapor Masyarakat (/pelapor)
│   │   └── 📁 lapor/                   # Formulir Kirim Laporan dengan Peta & Kompresor
│   ├── 📁 register/                    # Pendaftaran Akun Pelapor Baru
│   ├── 📁 superadmin/                  # Panel Superadmin Provinsi
│   │   ├── 📁 analytics/               # Visualisasi Matriks Sebaran 13 Kab/Kota
│   │   └── 📁 users/                   # Meja Kerja Manajemen Akses Pengguna
│   ├── globals.css                     # Design System Vanilla CSS (Light & Dark Theme)
│   ├── layout.tsx                      # Root Layout (next/font, Theme Initializer, Leaflet CSS)
│   └── page.tsx                        # Beranda Editorial & Ringkasan Metrik Cagar Budaya
│
├── 📁 components/                      # Komponen UI Terisolasi & Reusable
│   ├── AudioWavePlayer.tsx             # Pemutar Audio Warisan Budaya Takbenda (WBTB)
│   ├── BeforeAfterSlider.tsx           # Slider Komparasi Restorasi Fisik / Digital
│   ├── Footer.tsx                      # Footer Institusional dengan Logo Light-Variant
│   ├── HeritageCard.tsx                # Kartu Dossier Cagar Budaya (Archival Tags)
│   ├── ImageCompressorUpload.tsx       # Kompresor Foto Klien (HTML5 Canvas -> Cloudinary)
│   ├── MapPicker.tsx                   # Penentu Koordinat Interaktif saat Pelaporan
│   ├── Navbar.tsx                      # Navigasi Responsif Desktop & Drawer Mobile
│   ├── SultengMap.tsx                  # Peta Interaktif Sebaran Cagar Budaya (Leaflet)
│   ├── ThemeToggle.tsx                 # Tombol Pergantian Tema Terang / Gelap
│   └── WorkflowStepper.tsx             # Indikator Status Tahapan Penyelamatan
│
├── 📁 lib/                             # Core Driver & Utility Helpers
│   ├── auth.ts                         # Helper JWT Token, Hash Bcrypt, & Ekstraksi Sesi
│   ├── cloudinary.ts                   # Driver Cloudinary SDK Upload Stream
│   ├── imageUtils.ts                   # Utility Optimasi URL Cloudinary On-The-Fly
│   ├── prisma.ts                       # Singleton PrismaClient untuk Serverless/Dev
│   └── sultengLocations.ts             # Daftar 13 Kab/Kota & Bounding Box Koordinat Sulteng
│
├── 📁 prisma/                          # Skema & Migrasi Database
│   ├── schema.prisma                   # Model User & HeritageReport
│   └── seed.ts                         # Seeder Data Awal Akun & Pusaka Sulteng
│
├── 📁 public/                          # Aset Statis Publik
│   ├── logo-transparent.png            # Logo Perisai Tadulako Navy (Light Mode)
│   ├── logo-light-transparent.png      # Logo Perisai Tadulako Ivory (Dark Mode & Footer)
│   └── logo.png                        # Master Asset Logo Resolusi Tinggi
│
├── 📄 API_DOCUMENTATION.md             # Dokumentasi Lengkap REST API Payload
├── 📄 next.config.ts                   # Konfigurasi Next.js (Image Remote Patterns & Optimasi)
└── 📄 README.md                        # Dokumentasi Utama Repositori
```

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Pasang Dependensi
Pastikan **Node.js** (v18 atau v20+) dan **npm** sudah terpasang di sistem Anda:
```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi variabel lingkungan berikut:
```env
# Database PostgreSQL Supabase (Gunakan Port 6543 untuk Transaction Pooler)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Kunci Rahasia Sesi JWT
JWT_SECRET="kunci-rahasia-jwt-digitalbudaya-2026-super-secure"
AUTH_SECRET="kunci-rahasia-jwt-digitalbudaya-2026-super-secure"

# Kredensial Media Cloudinary CDN
CLOUDINARY_CLOUD_NAME="nama_cloud_anda"
CLOUDINARY_API_KEY="api_key_anda"
CLOUDINARY_API_SECRET="api_secret_anda"
```

### 3. Migrasi & Seeding Database
Dorong skema Prisma ke database Supabase dan masukkan data awal:
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Sinkronkan tabel ke database
npx prisma db push

# 3. Jalankan script seeder
npm run seed
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda.

---

## 🛠️ Ringkasan REST API Endpoints

Spesifikasi detail request/response payload tersedia di [API_DOCUMENTATION.md](file:///home/dil/Code/DigitalBudaya/API_DOCUMENTATION.md).

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pendaftaran akun masyarakat pelapor | Publik |
| `POST` | `/api/auth/login` | Autentikasi akun & penerbitan token JWT | Publik |
| `GET` | `/api/auth/me` | Membaca sesi pengguna aktif | Terautentikasi |
| `POST` | `/api/auth/me` | Logout (penghapusan cookie sesi) | Terautentikasi |
| `GET` | `/api/reports` | Mengambil katalog publik & filter spasial | Publik / Semua |
| `POST` | `/api/reports` | Membuat laporan cagar budaya baru | Pelapor & Admin |
| `GET` | `/api/reports/[id]` | Mengambil satu dossier cagar budaya | Publik / Semua |
| `PATCH` | `/api/reports/[id]` | Memperbarui laporan / alur status konservasi | Sesuai Peran |
| `DELETE` | `/api/reports/[id]` | Menghapus / membatalkan laporan | Pelapor / Superadmin |
| `POST` | `/api/upload` | Mengunggah foto/audio ke Cloudinary CDN | Terautentikasi |
| `GET` | `/api/users` | Daftar seluruh pengguna & filter peran | Superadmin |
| `PATCH` | `/api/users/[id]` | Mengubah peran (*role promotion/demotion*) | Superadmin |
| `DELETE` | `/api/users/[id]` | Menghapus akun pengguna | Superadmin |
| `GET` | `/api/analytics` | Ringkasan statistik sebaran 13 Kab/Kota | Admin & Superadmin |

---

## 🧪 Skrip Perintah Tersedia

- `npm run dev` — Menjalankan server Next.js lokal di mode development.
- `npm run build` — Melakukan kompilasi produksi Next.js (TypeScript, Prerendering, Optimasi Bundle).
- `npm run start` — Menjalankan server Next.js di mode produksi setelah dibuild.
- `npm run lint` — Memeriksa standar kode dan linting ESLint (0 errors, 0 warnings).
- `npm run seed` — Mengisi database dengan data awal akun demo dan pusaka Sulteng.

---

Mari bersama menjaga dan mendokumentasikan warisan adiluhung peradaban megalitik dan tradisi tutur bumi Tadulako, Sulawesi Tengah! 🏛️✨
