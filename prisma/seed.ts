import { PrismaClient, Role, KategoriPusaka, StatusPenyelamatan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DigiCulture Care database...');

  // 1. Create Default Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@digiculture.id' },
    update: {},
    create: {
      nama: 'Dr. Iwan Haryanto (Superadmin)',
      email: 'superadmin@digiculture.id',
      password: hashedPassword,
      role: Role.SUPERADMIN,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@digiculture.id' },
    update: {},
    create: {
      nama: 'Siti Rahmawati (Konservator Wilayah)',
      email: 'admin@digiculture.id',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const pelapor = await prisma.user.upsert({
    where: { email: 'pelapor@digiculture.id' },
    update: {},
    create: {
      nama: 'Ahmad Kaili (Sahabat Budaya Sulteng)',
      email: 'pelapor@digiculture.id',
      password: hashedPassword,
      role: Role.PELAPOR,
    },
  });

  console.log('Users created:', { superadmin: superadmin.email, admin: admin.email, pelapor: pelapor.email });

  // 2. Clear existing reports to avoid duplicate seeds
  await prisma.heritageReport.deleteMany({});

  // 3. Create Demonstration Mock Reports (PRD Section 6)
  const report1 = await prisma.heritageReport.create({
    data: {
      judulPusaka: 'Situs Batu Megalitikum Pokekea',
      kategori: KategoriPusaka.BENDA,
      lokasiSpesifik: 'Desa Hangkeu, Lembah Besoa',
      kabupatenKota: 'Kabupaten Poso',
      latitude: -1.7083,
      longitude: 120.3015,
      deskripsiKrisis: 'Kompleks patung batu purba megalitikum dan Kalamba (tempayan batu purba) mengalami erosi permukaan akibat cuaca ekstrem serta berpotensi rusak karena tumbuhnya lumut tebal dan aktivitas manusia yang tak terkontrol.',
      fotoKondisiAwal: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80&w=1000',
      fotoDigitalisasi: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000',
      rekamanAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a74e50.mp3?filename=nature-ambient-110756.mp3',
      catatanPenanganan: 'Pembersihan lumut mikro dan konservasi bahan batu oleh tim arkeolog gabungan Sulteng. Pembatasan zonasi pagar pengaman dan pembuatan katalog pemetaan 3D koordinat Kalamba telah rampung dilaksanakan secara transparan.',
      status: StatusPenyelamatan.SELESAI,
      pelaporId: pelapor.id,
      adminId: admin.id,
    },
  });

  const report2 = await prisma.heritageReport.create({
    data: {
      judulPusaka: 'Rumah Adat Tambi Lore Lindu',
      kategori: KategoriPusaka.BENDA,
      lokasiSpesifik: 'Dataran Tinggi Lore, Taman Nasional Lore Lindu',
      kabupatenKota: 'Kabupaten Sigi',
      latitude: -1.4167,
      longitude: 120.1500,
      deskripsiKrisis: 'Struktur atap ijuk tradisional dan tiang penyangga kayu murni pada bangunan Soura & Tambi mulai mengalami pelapukan berat akibat termakan usia dan kelembapan udara tinggi.',
      fotoKondisiAwal: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
      fotoDigitalisasi: null,
      rekamanAudioUrl: null,
      catatanPenanganan: 'Tim konservator wilayah telah mendarat di lokasi Sigi untuk survei kelayakan kayu pengganti dan mengumpulkan dana restorasi atap ijuk bersama tokoh adat setempat.',
      status: StatusPenyelamatan.DIPROSES,
      pelaporId: pelapor.id,
      adminId: admin.id,
    },
  });

  const report3 = await prisma.heritageReport.create({
    data: {
      judulPusaka: 'Tradisi Lisan & Bahasa Daerah Rampi',
      kategori: KategoriPusaka.TAKBENDA,
      lokasiSpesifik: 'Wilayah Perbatasan Pegunungan Rampi',
      kabupatenKota: 'Kabupaten Morowali Utara',
      latitude: -2.0167,
      longitude: 121.2500,
      deskripsiKrisis: 'Penutur asli bahasa daerah Rampi dan cerita rakyat lisan generasi tua tersisa kurang dari 500 jiwa. Belum ada dokumentasi audio atau buku tata bahasa resmi yang memadai sehingga terancam punah total.',
      fotoKondisiAwal: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=1000',
      fotoDigitalisasi: null,
      rekamanAudioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=flute-ambient-14023.mp3',
      catatanPenanganan: null,
      status: StatusPenyelamatan.LAPORAN_MASUK,
      pelaporId: pelapor.id,
      adminId: null,
    },
  });

  console.log('Seed Heritage Reports created:', {
    report1: report1.judulPusaka,
    report2: report2.judulPusaka,
    report3: report3.judulPusaka,
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
