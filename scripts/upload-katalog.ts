import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

// Load Cloudinary configuration from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient();

async function uploadFile(filePath: string, publicId: string) {
  console.log(`Mengunggah ${filePath} ke Cloudinary...`);
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'digiculture_care/katalog',
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`✓ Berhasil diunggah: ${result.secure_url}`);
  return result.secure_url;
}

async function main() {
  const pokekeaFile = path.resolve('public/katalog/situs-pokekea.jpg');
  const sourajaFile = path.resolve('public/rumahadatsouraja.webp');

  if (!fs.existsSync(pokekeaFile)) {
    throw new Error(`File ${pokekeaFile} tidak ditemukan!`);
  }
  if (!fs.existsSync(sourajaFile)) {
    throw new Error(`File ${sourajaFile} tidak ditemukan!`);
  }

  // 1. Upload ke Cloudinary
  const pokekeaUrl = await uploadFile(pokekeaFile, 'situs-megalitikum-pokekea');
  const sourajaUrl = await uploadFile(sourajaFile, 'rumah-adat-souraja');

  console.log('\n--- Hasil URL Cloudinary ---');
  console.log('Pokekea URL:', pokekeaUrl);
  console.log('Souraja URL:', sourajaUrl);

  // 2. Update Database Supabase dengan URL Cloudinary
  console.log('\nMemperbarui data di database...');
  const updatedPokekea = await prisma.heritageReport.updateMany({
    where: {
      OR: [
        { judulPusaka: { contains: 'Pokekea', mode: 'insensitive' } },
        { lokasiSpesifik: { contains: 'Besoa', mode: 'insensitive' } },
      ],
    },
    data: {
      fotoKondisiAwal: pokekeaUrl,
      fotoDigitalisasi: pokekeaUrl,
    },
  });
  console.log(`✓ Database Pokekea diperbarui: ${updatedPokekea.count} baris.`);

  const updatedSouraja = await prisma.heritageReport.updateMany({
    where: {
      OR: [
        { judulPusaka: { contains: 'Souraja', mode: 'insensitive' } },
        { judulPusaka: { contains: 'Banua Mbaso', mode: 'insensitive' } },
      ],
    },
    data: {
      fotoKondisiAwal: sourajaUrl,
      fotoDigitalisasi: sourajaUrl,
    },
  });
  console.log(`✓ Database Souraja diperbarui: ${updatedSouraja.count} baris.`);

  console.log('\nSelesai! Format penyimpanan gambar sekarang 100% konsisten dengan Cloudinary.');
}

main()
  .catch((e) => {
    console.error('Error uploading to Cloudinary:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
