import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { isWithinSulteng } from '@/lib/sultengLocations';
import { checkRateLimit } from '@/lib/rateLimit';
import { Prisma, KategoriPusaka, StatusPenyelamatan } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const kabupatenKota = searchParams.get('kabupatenKota');
    const kategoriParam = searchParams.get('kategori');
    const search = searchParams.get('search');
    const myReports = searchParams.get('myReports') === 'true';

    // Pagination parameters
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '100', 10);
    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const limit = Math.min(100, Math.max(1, isNaN(limitParam) ? 100 : limitParam));
    const skip = (page - 1) * limit;

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
        { judulPusaka: { contains: search, mode: 'insensitive' } },
        { lokasiSpesifik: { contains: search, mode: 'insensitive' } },
        { deskripsiKrisis: { contains: search, mode: 'insensitive' } },
        { kabupatenKota: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalCount, reports] = await Promise.all([
      prisma.heritageReport.count({ where }),
      prisma.heritageReport.findMany({
        where,
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + reports.length < totalCount,
      },
    });
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

    if (user.role !== 'PELAPOR') {
      return NextResponse.json({ error: 'Fitur pelaporan hanya tersedia untuk peran Pelapor' }, { status: 403 });
    }

    // Rate limiting pembuatan laporan baru (maksimal 5 laporan per menit per pengguna)
    const rateLimit = checkRateLimit(`report-create:${user.id}`, { maxRequests: 5, intervalMs: 60_000 });
    if (!rateLimit.isAllowed) {
      const retrySeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak pengiriman laporan. Silakan tunggu ${retrySeconds} detik sebelum mengirimkan laporan kembali.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
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
        { error: 'Nama cagar budaya, lokasi spesifik, kabupaten/kota, deskripsi krisis, dan foto kondisi awal wajib diisi' },
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
