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

    const [statusGroup, kategoriGroup, kabupatenGroup, totalUsers] = await Promise.all([
      prisma.heritageReport.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.heritageReport.groupBy({
        by: ['kategori'],
        _count: { _all: true },
      }),
      prisma.heritageReport.groupBy({
        by: ['kabupatenKota'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.user.count(),
    ]);

    let totalReports = 0;
    let laporanMasukCount = 0;
    let diprosesCount = 0;
    let selesaiCount = 0;

    for (const item of statusGroup) {
      const count = item._count._all;
      totalReports += count;
      if (item.status === StatusPenyelamatan.LAPORAN_MASUK) laporanMasukCount = count;
      else if (item.status === StatusPenyelamatan.DIPROSES) diprosesCount = count;
      else if (item.status === StatusPenyelamatan.SELESAI) selesaiCount = count;
    }

    let bendaCount = 0;
    let takbendaCount = 0;
    for (const item of kategoriGroup) {
      const count = item._count._all;
      if (item.kategori === KategoriPusaka.BENDA) bendaCount = count;
      else if (item.kategori === KategoriPusaka.TAKBENDA) takbendaCount = count;
    }

    const kabupatenBreakdown = kabupatenGroup.map((item) => ({
      kabupatenKota: item.kabupatenKota,
      count: item._count.id,
    }));

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
