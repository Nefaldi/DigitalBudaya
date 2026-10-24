import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CLOUDINARY_POKEKEA = 'https://res.cloudinary.com/bhzprhkh/image/upload/v1792857227/digiculture_care/katalog/situs-megalitikum-pokekea.jpg';
const CLOUDINARY_SOURAJA = 'https://res.cloudinary.com/bhzprhkh/image/upload/v1792857228/digiculture_care/katalog/rumah-adat-souraja.webp';

async function main() {
  console.log('Memperbarui gambar katalog warisan budaya ke URL Cloudinary resmi...');

  // 1. Update Situs Pokekea dengan URL Cloudinary resmi
  const updatedPokekea = await prisma.heritageReport.updateMany({
    where: {
      OR: [
        { judulPusaka: { contains: 'Pokekea', mode: 'insensitive' } },
        { lokasiSpesifik: { contains: 'Besoa', mode: 'insensitive' } },
      ],
    },
    data: {
      fotoKondisiAwal: CLOUDINARY_POKEKEA,
      fotoDigitalisasi: CLOUDINARY_POKEKEA,
      rekamanAudioUrl: null,
    },
  });
  console.log(`✓ Laporan Situs Pokekea diperbarui: ${updatedPokekea.count} baris.`);

  // 2. Update Rumah Adat Souraja
  const updatedSouraja = await prisma.heritageReport.updateMany({
    where: {
      OR: [
        { judulPusaka: { contains: 'Souraja', mode: 'insensitive' } },
        { judulPusaka: { contains: 'Banua Mbaso', mode: 'insensitive' } },
      ],
    },
    data: {
      fotoKondisiAwal: CLOUDINARY_SOURAJA,
      fotoDigitalisasi: CLOUDINARY_SOURAJA,
      rekamanAudioUrl: null,
    },
  });
  console.log(`✓ Laporan Rumah Adat Souraja diperbarui: ${updatedSouraja.count} baris.`);

  // 3. Bersihkan audio sisa dari semua laporan
  const cleanedAudio = await prisma.heritageReport.updateMany({
    where: {
      rekamanAudioUrl: { not: null },
    },
    data: {
      rekamanAudioUrl: null,
    },
  });
  console.log(`✓ Pembersihan rekamanAudioUrl: ${cleanedAudio.count} baris dibersihkan.`);

  console.log('Selesai memperbarui gambar autentik ke database dengan format Cloudinary.');
}

main()
  .catch((e) => {
    console.error('Gagal memperbarui database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
