# 🏛️ DigiCulture Care - Backend API Service (v3.0.0)
### Platform Penyelamatan & Dokumentasi Warisan Budaya Sulawesi Tengah

Proyek ini adalah **Backend Service & REST API** untuk platform **DigiCulture Care v3.0.0 (Enhanced Regional Edition)** yang dibangun menggunakan **Next.js 16 (App Router)**, **Prisma ORM (PostgreSQL Supabase)**, dan **Cloudinary CDN Storage**.

---

## 📂 Peta Struktur Folder & File (Architecture Directory Tree)

Struktur proyek ini telah disusun secara modular, rapi, dan mengikuti standar industri agar sangat mudah dipahami oleh pengembang **Frontend** maupun **Backend**:

```
DigitalBudaya/
├── 📄 API_DOCUMENTATION.md    # 📖 Panduan Lengkap REST API untuk Developer Frontend
├── 📄 README.md               # 📌 Dokumentasi Utama Proyek & Peta Folder
├── 📄 .env                    # 🔒 Variabel Lingkungan (Supabase DB, Cloudinary, JWT)
├── 📄 .env.example            # 📋 Template Variabel Lingkungan
│
├── 📁 app/                    # 🌐 Next.js App Router & API Endpoints
│   ├── 📁 api/                # ⚡ REST API Handlers
│   │   ├── 📁 analytics/      # GET /api/analytics (Metrik Statistik Regional Sulteng)
│   │   ├── 📁 auth/           # /api/auth (Login, Register, Session Me, Logout)
│   │   │   ├── 📁 login/      # POST /api/auth/login
│   │   │   ├── 📁 me/         # GET /api/auth/me & POST /api/auth/logout
│   │   │   └── 📁 register/   # POST /api/auth/register
│   │   ├── 📁 reports/        # /api/reports (Katalog, Submission, Workflow State Machine)
│   │   │   ├── 📁 [id]/       # GET, PATCH, DELETE /api/reports/[id]
│   │   │   └── route.ts       # GET, POST /api/reports
│   │   ├── 📁 upload/         # POST /api/upload (Media Upload Foto & Audio ke Cloudinary)
│   │   └── 📁 users/          # /api/users (Superadmin User RBAC Management)
│   │       ├── 📁 [id]/       # PATCH, DELETE /api/users/[id]
│   │       └── route.ts       # GET /api/users
│   ├── globals.css            # Styling Global
│   ├── layout.tsx             # Root Layout
│   └── page.tsx               # Dashboard Portal Status API Service Backend
│
├── 📁 lib/                    # 🛠️ Helper Utilities & Core Service Drivers
│   ├── auth.ts                # 🔐 JWT Hashing, Password Compare (Bcrypt), & Session Extraction
│   ├── cloudinary.ts          # ☁️ Driver SDK Cloudinary Photo & Audio Upload
│   ├── prisma.ts              # 🗄️ Prisma Client Singleton Instance
│   └── sultengLocations.ts    # 🗺️ Daftar 13 Kab/Kota & Validator GPS Bounds Sulteng
│
├── 📁 prisma/                 # 📊 Database Models & Migration Scripts
│   ├── schema.prisma          # 📜 Model Data PostgreSQL Supabase (User & HeritageReport)
│   └── seed.ts                # 🌱 Data Awal Sulteng (Pokekea, Tambi, Rampi & Akun Test)
│
└── 📁 public/                 # 🖼️ Asset Statis
```

---

## ⚡ Ringkasan REST API Endpoints

| Method | Endpoint | Deskripsi | Akses Peran |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pendaftaran mandiri Pelapor (Masyarakat) | Publik |
| `POST` | `/api/auth/login` | Otentikasi Akun (Menerima JWT Token) | Publik |
| `GET` | `/api/auth/me` | Cek profil sesi user terautentikasi | Logged In |
| `GET` | `/api/reports` | Katalog Publik & Filter (Kabupaten/Status/Search) | Publik / All |
| `POST` | `/api/reports` | Kirim laporan baru (Validasi GPS Bounds Sulteng) | Pelapor / Admin |
| `GET` | `/api/reports/[id]` | Detail laporan spesifik | Publik / All |
| `PATCH` | `/api/reports/[id]` | Update Workflow (`LAPORAN_MASUK` ➔ `DIPROSES` ➔ `SELESAI`) | Admin / Superadmin |
| `DELETE` | `/api/reports/[id]` | Pembatalan / Penghapusan Laporan | Pelapor / Superadmin |
| `POST` | `/api/upload` | Upload Foto Resolusi Tinggi & Audio ke Cloudinary | Logged In |
| `GET` | `/api/users` | Daftar Pengguna & Filter Role (RBAC) | Superadmin |
| `PATCH` | `/api/users/[id]` | Ubah Role Pengguna (`PELAPOR` ↔ `ADMIN` ↔ `SUPERADMIN`) | Superadmin |
| `DELETE` | `/api/users/[id]` | Hapus Akun Pengguna | Superadmin |
| `GET` | `/api/analytics` | Metrik Analitik Regional Sulawesi Tengah | Admin / Superadmin |

---

## 🔑 Akun Pengujian Bawaan (Seed Accounts)

Seluruh akun menggunakan password: `password123`

- **Superadmin**: `superadmin@digiculture.id`
- **Admin (Konservator)**: `admin@digiculture.id`
- **Pelapor (Masyarakat)**: `pelapor@digiculture.id`

---

## 🚀 Cara Menjalankan Service

1. **Install Dependencies**: `npm install`
2. **Jalankan Development Server**: `npm run dev`
3. **Buka Service Portal**: `http://localhost:3000`
