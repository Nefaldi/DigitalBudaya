import { PrismaClient, Role, KategoriPusaka, StatusPenyelamatan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DigiCulture Care database with authentic Central Sulawesi heritage...');

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

  // 3. Create Demonstration Mock Reports with Real Photos of Sulteng Heritage
  const report1 = await prisma.heritageReport.create({
    data: {
      judulPusaka: 'Situs Batu Megalitikum Pokekea',
      kategori: KategoriPusaka.BENDA,
      lokasiSpesifik: 'Desa Hangkeu, Lembah Besoa',
      kabupatenKota: 'Kabupaten Poso',
      latitude: -1.7083,
      longitude: 120.3015,
      deskripsiKrisis: 'Kompleks kalamba (tempayan kubur batu purba) dan patung megalitik di padang savana Lembah Besoa peninggalan peradaban ribuan tahun silam. Memerlukan pembersihan lumut kerak mikro dan pemantauan erosi permukaan tanah secara berkala.',
      fotoKondisiAwal: 'https://res.cloudinary.com/bhzprhkh/image/upload/v1792857227/digiculture_care/katalog/situs-megalitikum-pokekea.jpg',
      fotoDigitalisasi: 'https://res.cloudinary.com/bhzprhkh/image/upload/v1792857227/digiculture_care/katalog/situs-megalitikum-pokekea.jpg',
      rekamanAudioUrl: null,
      catatanPenanganan: 'Pembersihan lumut mikro dan konservasi bahan batu oleh tim arkeolog gabungan Sulteng. Pembuatan zonasi pagar pengaman dan pemetaan koordinat 3D Kalamba telah rampung dilaksanakan secara transparan.',
      status: StatusPenyelamatan.SELESAI,
      pelaporId: pelapor.id,
      adminId: admin.id,
    },
  });

  const report2 = await prisma.heritageReport.create({
    data: {
      judulPusaka: 'Rumah Adat Souraja (Banua Mbaso)',
      kategori: KategoriPusaka.BENDA,
      lokasiSpesifik: 'Kelurahan Lere, Kecamatan Palu Barat',
      kabupatenKota: 'Kota Palu',
      latitude: -0.8917,
      longitude: 119.8542,
      deskripsiKrisis: 'Rumah panggung kayu peninggalan Kerajaan Palu abad ke-19 dengan arsitektur tahan gempa tanpa menggunakan paku. Struktur tiang penopang kayu ulin dan atap sirap membutuhkan preservasi berkala dari risiko pelapukan kayu.',
      fotoKondisiAwal: 'https://res.cloudinary.com/bhzprhkh/image/upload/v1792857228/digiculture_care/katalog/rumah-adat-souraja.webp',
      fotoDigitalisasi: 'https://res.cloudinary.com/bhzprhkh/image/upload/v1792857228/digiculture_care/katalog/rumah-adat-souraja.webp',
      rekamanAudioUrl: null,
      catatanPenanganan: 'Proses pemugaran tiang ulin dan preservasi kayu alami anti rayap selesai dilakukan bersama balai pelestarian kebudayaan.',
      status: StatusPenyelamatan.SELESAI,
      pelaporId: pelapor.id,
      adminId: admin.id,
    },
  });

  const report3 = await prisma.heritageReport.create({
    data: {
      judulPusaka: 'Patung Megalitikum Palindo (Watu Palindo)',
      kategori: KategoriPusaka.BENDA,
      lokasiSpesifik: 'Desa Kolori, Lembah Bada, Lore Barat',
      kabupatenKota: 'Kabupaten Poso',
      latitude: -1.8667,
      longitude: 120.2500,
      deskripsiKrisis: 'Monolit batu raksasa berketinggian 4,5 meter dengan ekspresi wajah ceria yang berdiri megah di padang savana Lembah Bada. Mengalami potensi kemiringan mikro fondasi tanah akibat limpasan air hujan deras.',
      fotoKondisiAwal: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patung_Palindo_Lembah_Bada_Taman_Nasional_Lore_Lindu.jpg',
      fotoDigitalisasi: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Patung_Palindo_Lembah_Bada_Taman_Nasional_Lore_Lindu.jpg',
      rekamanAudioUrl: null,
      catatanPenanganan: 'Pemasangan patok pengukur stabilitas tanah dan penataan pagar perimeter konservasi cagar budaya nasional.',
      status: StatusPenyelamatan.SELESAI,
      pelaporId: pelapor.id,
      adminId: admin.id,
    },
  });

  console.log('Seed Heritage Reports created:', {
    report1: report1.judulPusaka,
    report2: report2.judulPusaka,
    report3: report3.judulPusaka,
  });

  console.log('Database seeding finished successfully (3 heritage cards)!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
