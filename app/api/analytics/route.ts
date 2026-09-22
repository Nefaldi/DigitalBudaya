import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { StatusPenyelamatan, KategoriPusaka } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Akses khusus Admin / Superadmin' }, { status: 403 });
    }

    const totalReports = await prisma.heritageReport.count();

    const laporanMasukCount = await prisma.heritageReport.count({
      where: { status: StatusPenyelamatan.LAPORAN_MASUK },
    });

    const diprosesCount = await prisma.heritageReport.count({
      where: { status: StatusPenyelamatan.DIPROSES },
    });

    const selesaiCount = await prisma.heritageReport.count({
      where: { status: StatusPenyelamatan.SELESAI },
    });

    const bendaCount = await prisma.heritageReport.count({
      where: { kategori: KategoriPusaka.BENDA },
    });

    const takbendaCount = await prisma.heritageReport.count({
      where: { kategori: KategoriPusaka.TAKBENDA },
    });

    const kabupatenGroup = await prisma.heritageReport.groupBy({
      by: ['kabupatenKota'],
      _count: { id: true },
    });

    const kabupatenBreakdown = kabupatenGroup.map((item) => ({
      kabupatenKota: item.kabupatenKota,
      count: item._count.id,
    }));

    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      analytics: {
        totalReports,
        statusBreakdown: {
          LAPORAN_MASUK: laporanMasukCount,
          DIPROSES: diprosesCount,
          SELESAI: selesaiCount,
        },
        kategoriBreakdown: {
          BENDA: bendaCount,
          TAKBENDA: takbendaCount,
        },
        kabupatenBreakdown,
        totalUsers,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data analitik' }, { status: 500 });
  }
}
