# Dokumentasi API Backend & Database Specs (REST API)
## DigiCulture Care - Sulawesi Tengah Edition (v3.0.0)

Dokumen ini disusun sebagai panduan pengembang **Frontend** dan **Backend Integrasi** untuk platform **DigiCulture Care**.

---

## 1. Spesifikasi Database (PostgreSQL Supabase) & Cloudinary

### Database Provider: PostgreSQL (PRD Section 5)
* **ORM**: Prisma Client v6 (`prisma/schema.prisma`)
* **Connection String Variables**:
  - `DATABASE_URL`: Connection string PostgreSQL (Pooled / PGBouncer)
  - `DIRECT_URL`: Connection string PostgreSQL Direct (Session mode)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Media Storage Provider: Cloudinary
Seluruh berkas media (`fotoKondisiAwal`, `fotoDigitalisasi`, `rekamanAudioUrl`) disimpan dan didistribusikan melalui **Cloudinary CDN**.

Variables `.env`:
```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

---

## 2. API Upload Berkas Media Cloudinary (`POST /api/upload`)

#### Upload Foto / Audio ke Cloudinary
* **Endpoint**: `POST /api/upload`
* **Akses**: Terautentikasi (`PELAPOR`, `ADMIN`, `SUPERADMIN`)
* **Content-Type**: `multipart/form-data`
* **Form Fields**:
  - `file`: Berkas Gambar (`JPG`, `PNG`, `WEBP`) atau Audio (`MP3`, `WAV`, `AAC`)
  - `folder`: Opsional (Contoh: `digiculture/laporan_awal`, `digiculture/digitalisasi`, `digiculture/audio`)
* **Response Success (200 OK)**:
  ```json
  {
    "message": "Upload ke Cloudinary berhasil",
    "url": "https://res.cloudinary.com/demo/image/upload/v123456/digiculture_care/foto1.jpg",
    "publicId": "digiculture_care/foto1"
  }
  ```

---

## 3. Akun Pengujian Bawaan (Seed Data)

Seluruh akun menggunakan password default: `password123`

| Peran (Role) | Email | Keterangan |
|---|---|---|
| `SUPERADMIN` | `superadmin@digiculture.id` | Pengelola sistem & manajemen pengguna |
| `ADMIN` | `admin@digiculture.id` | Petugas konservator & digitalisasi |
| `PELAPOR` | `pelapor@digiculture.id` | Sahabat budaya / masyarakat umum |

---

## 4. API Endpoints Reference

### 🔐 A. Modul Autentikasi (`/api/auth`)

#### 1. Registrasi Akun Mandiri Pelapor
* **Endpoint**: `POST /api/auth/register`
* **Request Body**:
  ```json
  {
    "nama": "Ahmad Kaili",
    "email": "ahmad@gmail.com",
    "password": "password123"
  }
  ```

#### 2. Login Akun
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "admin@digiculture.id",
    "password": "password123"
  }
  ```
* **Response Success (200 OK)**:
  ```json
  {
    "message": "Login berhasil",
    "user": {
      "id": "uuid-string",
      "nama": "Siti Rahmawati",
      "email": "admin@digiculture.id",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

#### 3. Cek Sesi Aktif
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <TOKEN>`

---

### 🏛️ B. Modul Laporan Penyelamatan (`/api/reports`)

#### 1. Katalog Publik & Daftar Laporan
* **Endpoint**: `GET /api/reports`
* **Query Parameters**:
  - `status`: `LAPORAN_MASUK` | `DIPROSES` | `SELESAI` | `Semua`
  - `kabupatenKota`: Filter 13 Kabupaten/Kota di Sulteng (misal: `Kabupaten Poso`, `Kabupaten Sigi`, `Kota Palu`)
  - `kategori`: `BENDA` | `TAKBENDA`
  - `search`: Kata kunci pencarian
  - `myReports`: `true` (Menampilkan laporan milik user aktif)

#### 2. Buat Laporan Baru (Crowdsourcing)
* **Endpoint**: `POST /api/reports`
* **Request Body**:
  ```json
  {
    "judulPusaka": "Rumah Adat Soura Kaili",
    "kategori": "BENDA",
    "lokasiSpesifik": "Desa Biromaru",
    "kabupatenKota": "Kabupaten Sigi",
    "latitude": -1.4167,
    "longitude": 120.1500,
    "deskripsiKrisis": "Atap ijuk tradisional mengalami pelapukan.",
    "fotoKondisiAwal": "https://res.cloudinary.com/..."
  }
  ```
* **Validasi Otomatis**: Latitude (-3.8 s.d 2.2) dan Longitude (119.0 s.d 124.5) harus berada di wilayah Sulawesi Tengah.

#### 3. Detail Laporan Spesifik
* **Endpoint**: `GET /api/reports/[id]`

#### 4. Update Status & Digitalisasi Admin / Koreksi Pelapor
* **Endpoint**: `PATCH /api/reports/[id]`
* **Request Body (Admin Workflow Transition)**:
  ```json
  {
    "status": "SELESAI",
    "fotoDigitalisasi": "https://res.cloudinary.com/...",
    "rekamanAudioUrl": "https://res.cloudinary.com/...",
    "catatanPenanganan": "Hasil investigasi konservasi lapangan telah tuntas."
  }
  ```

#### 5. Batalkan / Hapus Laporan
* **Endpoint**: `DELETE /api/reports/[id]`

---

### 👑 C. Modul Manajemen Pengguna & Analitik Superadmin (`/api/users` & `/api/analytics`)

#### 1. Daftar Pengguna (Superadmin Only)
* **Endpoint**: `GET /api/users?role=Semua`

#### 2. Ubah Peran Pengguna (Role Elevation)
* **Endpoint**: `PATCH /api/users/[id]`
* **Request Body**: `{ "role": "ADMIN" }`

#### 3. Hapus Akun Pengguna
* **Endpoint**: `DELETE /api/users/[id]`

#### 4. Metrik Analitik Keseluruhan Sulteng
* **Endpoint**: `GET /api/analytics`
