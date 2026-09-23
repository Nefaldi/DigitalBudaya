import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { isWithinSulteng } from '@/lib/sultengLocations';
import { Prisma, KategoriPusaka, StatusPenyelamatan } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const kabupatenKota = searchParams.get('kabupatenKota');
    const kategoriParam = searchParams.get('kategori');
    const search = searchParams.get('search');
    const myReports = searchParams.get('myReports') === 'true';

    const currentUser = getAuthenticatedUser(req);

    // Build filter criteria
    const where: Prisma.HeritageReportWhereInput = {};

    if (myReports) {
      if (!currentUser) {
        return NextResponse.json({ error: 'Harap login untuk melihat laporan anda' }, { status: 401 });
      }
      where.pelaporId = currentUser.id;
    } else {
      // By default for public directory, only show SELESAI status unless admin specifies filter or user is logged in as Admin/Superadmin
      if (statusParam) {
        where.status = statusParam as StatusPenyelamatan;
      } else if (!currentUser || currentUser.role === 'PELAPOR') {
        where.status = StatusPenyelamatan.SELESAI;
      }
    }

    if (kabupatenKota && kabupatenKota !== 'Semua') {
      where.kabupatenKota = kabupatenKota;
    }

    if (kategoriParam && kategoriParam !== 'Semua') {
      where.kategori = kategoriParam as KategoriPusaka;
    }

    if (search) {
      where.OR = [
        { judulPusaka: { contains: search } },
        { lokasiSpesifik: { contains: search } },
        { deskripsiKrisis: { contains: search } },
        { kabupatenKota: { contains: search } },
      ];
    }

    const reports = await prisma.heritageReport.findMany({
      where,
      include: {
        pelapor: { select: { id: true, nama: true, email: true } },
        admin: { select: { id: true, nama: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Gagal mengambil data laporan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu untuk membuat laporan' }, { status: 401 });
    }

    const body = await req.json();
    const {
      judulPusaka,
      kategori,
      lokasiSpesifik,
      kabupatenKota,
      latitude,
      longitude,
      deskripsiKrisis,
      fotoKondisiAwal,
    } = body;

    // Validation
    if (!judulPusaka || !lokasiSpesifik || !kabupatenKota || !deskripsiKrisis || !fotoKondisiAwal) {
      return NextResponse.json(
        { error: 'Judul pusaka, lokasi spesifik, kabupaten/kota, deskripsi krisis, dan foto kondisi awal wajib diisi' },
        { status: 400 }
      );
    }

    // Validate GPS location inside Sulteng region
    const latNum = latitude ? parseFloat(latitude) : null;
    const lngNum = longitude ? parseFloat(longitude) : null;

    if (!isWithinSulteng(latNum, lngNum)) {
      return NextResponse.json(
        { error: 'Koordinat GPS yang disematkan berada di luar batas wilayah administratif Provinsi Sulawesi Tengah' },
        { status: 400 }
      );
    }

    const report = await prisma.heritageReport.create({
      data: {
        judulPusaka,
        kategori: kategori === 'TAKBENDA' ? KategoriPusaka.TAKBENDA : KategoriPusaka.BENDA,
        lokasiSpesifik,
        kabupatenKota,
        latitude: latNum,
        longitude: lngNum,
        deskripsiKrisis,
        fotoKondisiAwal,
        status: StatusPenyelamatan.LAPORAN_MASUK,
        pelaporId: user.id,
      },
      include: {
        pelapor: { select: { id: true, nama: true, email: true } },
      },
    });

    return NextResponse.json({
      message: 'Laporan penyelamatan warisan budaya berhasil dikirimkan',
      report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Gagal mengirimkan laporan' }, { status: 500 });
  }
}
