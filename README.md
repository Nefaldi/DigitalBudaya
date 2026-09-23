# 🏛️ DigiCulture Care — Backend API Service (v3.0.0)
> **Platform Penyelamatan & Dokumentasi Warisan Budaya Sulawesi Tengah**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql)](https://supabase.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)

Halo! 👋 Selamat datang di repositori **DigiCulture Care Backend API**. 

Backend service ini dibangun menggunakan **Next.js 16 (App Router)**, **Prisma ORM**, database **PostgreSQL (Supabase)**, dan **Cloudinary CDN** untuk mendokumentasikan serta mengawal upaya pelestarian warisan budaya (benda maupun takbenda) di 13 Kabupaten/Kota se-Sulawesi Tengah.

---

## 📑 Daftar Isi
- [🚀 Langkah Cepat Setelah Clone (Quick Start)](#-langkah-cepat-setelah-clone-quick-start)
- [✨ Fitur Utama](#-fitur-utama)
- [🔑 Akun Demo Siap Pakai](#-akun-demo-siap-pakai)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [⚡ Ringkasan REST API Endpoints](#-ringkasan-rest-api-endpoints)
- [📜 Skrip yang Tersedia](#-skrip-yang-tersedia)
- [🛠️ Tech Stack](#️-tech-stack)

---

## 🚀 Langkah Cepat Setelah Clone (Quick Start)

Baru selesai melakukan `git clone`? Yuk, ikuti langkah-langkah mudah di bawah ini biar aplikasinya langsung jalan mulus di komputer lokal kamu:

### 1. Masuk ke Folder Proyek
Buka terminal dan arahkan ke direktori hasil clone:
```bash
cd DigitalBudaya
```

### 2. Pasang Dependensi
Pastikan kamu sudah menginstal **Node.js** (disarankan v18 atau v20+) dan **npm**. Lalu jalankan:
```bash
npm install
```

### 3. Buat File Environment (`.env`)
Salin file template `.env.example` yang sudah disediakan:
```bash
cp .env.example .env
```
Buka file `.env` kamu dan sesuaikan nilainya dengan kredensial yang kamu miliki:
```env
# 1. Koneksi Database PostgreSQL (Bisa pakai Supabase)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 2. Secret Key JWT (Bebas, gunakan string acak yang aman)
JWT_SECRET="kunci-rahasia-jwt-kamu-di-sini-2026"

# 3. Kredensial Cloudinary (Untuk upload foto & audio)
CLOUDINARY_CLOUD_NAME="nama_cloud_kamu"
CLOUDINARY_API_KEY="api_key_kamu"
CLOUDINARY_API_SECRET="api_secret_kamu"
```

> [!TIP]
> Kalau kamu pakai Supabase, gunakan connection string **Transaction Pooler (Port 6543)** untuk `DATABASE_URL` dan **Session Mode / Direct (Port 5432)** untuk `DIRECT_URL`.

### 4. Siapkan Database & Prisma Client
Sinkronkan skema database dari file `prisma/schema.prisma` ke database kamu:
```bash
# 1. Generate Prisma Client lokal
npx prisma generate

# 2. Dorong skema model (User & HeritageReport) langsung ke database
npx prisma db push
```

### 5. Masukkan Data Awal (Seeding)
Biar database kamu gak kosong saat pengujian, jalankan perintah seeder ini untuk otomatis membuat akun contoh dan beberapa data pusaka khas Sulteng (Pokekea, Tambi, Rampi):
```bash
npm run seed
```

### 6. Jalankan Server Development! 🎉
Semua sudah siap! Sekarang kamu tinggal menyalakan dev server:
```bash
npm run dev
```

Buka browser kamu di: **[http://localhost:3000](http://localhost:3000)**.  
Kamu akan melihat status service API aktif dan siap menerima request dari tim Frontend, aplikasi mobile, Postman, ataupun cURL!

---

## ✨ Fitur Utama

- 🔐 **Autentikasi & RBAC Lengkap**: Mendukung peran `SUPERADMIN`, `ADMIN` (Konservator), dan `PELAPOR` (Masyarakat). Autentikasi aman berbasis JWT (Cookie & Authorization Header).
- 📍 **Validasi Wilayah Sulawesi Tengah**: Dilengkapi pengecekan batas geografis (*bounding box*) dan 13 Kabupaten/Kota administratif se-Sulteng.
- 🔄 **State Machine Penanganan**: Alur status laporan yang terstruktur rapi: `LAPORAN_MASUK` ➔ `DIPROSES` ➔ `SELESAI`.
- ☁️ **Media Storage Cloudinary**: Upload foto resolusi tinggi dan rekaman audio untuk warisan budaya takbenda langsung ke CDN Cloudinary.
- 📊 **Metrik Analitik Regional**: Rekap data sebaran laporan per wilayah kabupaten/kota dan kategori warisan untuk dashboard pengambil kebijakan.

---

## 🔑 Akun Demo Siap Pakai

Semua akun hasil seeding menggunakan password default: `password123`

| Peran (Role) | Email | Deskripsi Hak Akses |
|---|---|---|
| **Superadmin** | `superadmin@digiculture.id` | Akses penuh manajemen user, analitik provinsi, dan hapus laporan |
| **Admin** | `admin@digiculture.id` | Konservator lapangan: ubah status laporan, upload bukti penanganan & audio |
| **Pelapor** | `pelapor@digiculture.id` | Masyarakat umum: kirim laporan pusaka, koreksi/batalkan laporan sendiri |

---

## 📂 Struktur Direktori Proyek

Kodenya disusun rapi dan modular agar kamu gampang menemukan file yang dicari:

```
DigitalBudaya/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 api/                # Kumpulan Route Handlers REST API
│   │   ├── 📁 analytics/      # GET /api/analytics
│   │   ├── 📁 auth/           # Login, Register, Me, Logout
│   │   ├── 📁 reports/        # CRUD Katalog & Laporan Warisan Budaya
│   │   ├── 📁 upload/         # Upload Foto & Audio ke Cloudinary
│   │   └── 📁 users/          # Manajemen Pengguna (Superadmin)
│   ├── favicon.ico            # Favicon Asset
│   ├── layout.tsx             # Root Layout
│   └── page.tsx               # Status Portal Dashboard Backend
│
├── 📁 lib/                    # Helper & Driver Core
│   ├── auth.ts                # Token JWT & Bcrypt password helper
│   ├── cloudinary.ts          # Integrasi Cloudinary SDK
│   ├── prisma.ts              # Singleton Prisma Client
│   └── sultengLocations.ts    # Validasi 13 Kab/Kota & Bounding Box Sulteng
│
├── 📁 prisma/                 # Skema Database & Migrasi
│   ├── schema.prisma          # Definisi Model Data
│   └── seed.ts                # Script Seeder Data Awal
│
├── 📄 API_DOCUMENTATION.md    # Panduan lengkap request & response payload API
├── 📄 README.md               # Dokumentasi utama proyek
└── 📄 .env.example            # Template konfigurasi environment
```

---

## ⚡ Ringkasan REST API Endpoints

Untuk detail lengkap spesifikasi payload request, query parameter, dan contoh response JSON, silakan cek [API_DOCUMENTATION.md](file:///home/dil/Code/DigitalBudaya/API_DOCUMENTATION.md).

| Method | Endpoint | Fungsi | Siapa yang Bisa Akses? |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pendaftaran akun masyarakat (Pelapor) | Publik |
| `POST` | `/api/auth/login` | Masuk dan dapatkan token sesi JWT | Publik |
| `GET` | `/api/auth/me` | Cek profil user yang sedang login | Terautentikasi |
| `POST` | `/api/auth/me` | Logout (hapus cookie sesi) | Terautentikasi |
| `GET` | `/api/reports` | Katalog publik & filter laporan pusaka | Publik / Semua |
| `POST` | `/api/reports` | Buat laporan pusaka baru (cek koordinat Sulteng) | Pelapor & Admin |
| `GET` | `/api/reports/[id]` | Ambil detail satu laporan | Publik / Semua |
| `PATCH` | `/api/reports/[id]` | Update data / alur status penanganan | Sesuai Peran |
| `DELETE` | `/api/reports/[id]` | Batalkan / hapus laporan | Pelapor / Superadmin |
| `POST` | `/api/upload` | Upload foto/audio ke Cloudinary CDN | Terautentikasi |
| `GET` | `/api/users` | List semua user & filter peran | Superadmin |
| `PATCH` | `/api/users/[id]` | Ganti role / edit profil user | Superadmin |
| `DELETE` | `/api/users/[id]` | Hapus akun user | Superadmin |
| `GET` | `/api/analytics` | Ringkasan statistik & sebaran data se-Sulteng | Admin & Superadmin |

---

## 📜 Skrip yang Tersedia

Kamu bisa menjalankan beberapa skrip bawaan berikut di terminal:

- `npm run dev` — Menjalankan server lokal Next.js di mode development.
- `npm run build` — Melakukan kompilasi aplikasi untuk mode production.
- `npm run start` — Menjalankan server mode production setelah dibuild.
- `npm run lint` — Memeriksa standar kode dan potensi error dengan ESLint.
- `npm run seed` — Mengisi database dengan data dummy awal.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [PostgreSQL](https://supabase.com/) & [Prisma v6](https://www.prisma.io/)
- **Media CDN**: [Cloudinary](https://cloudinary.com/)
- **Keamanan**: [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js) & [JSON Web Token (JWT)](https://jwt.io/)

---

Selamat berkolaborasi dan berkarya menjaga warisan budaya Sulawesi Tengah! 🌟  
Ada pertanyaan atau kendala saat setup? Jangan ragu buat cek [API_DOCUMENTATION.md](file:///home/dil/Code/DigitalBudaya/API_DOCUMENTATION.md) atau buka issue di repositori ini.
