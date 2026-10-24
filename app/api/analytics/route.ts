import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { StatusPenyelamatan, KategoriPusaka } from '@prisma/client';

interface CachedAnalyticsPayload {
  totalReports: number;
  statusBreakdown: {
    LAPORAN_MASUK: number;
    DIPROSES: number;
    SELESAI: number;
  };
  kategoriBreakdown: {
    BENDA: number;
    TAKBENDA: number;
  };
  kabupatenBreakdown: Array<{
    kabupatenKota: string;
    count: number;
  }>;
  totalUsers: number;
}

// In-Memory Server Cache for 20 seconds (reduces remote Supabase database load by ~90%)
let memoryAnalyticsCache: {
  payload: CachedAnalyticsPayload;
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 20_000;

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Akses khusus Admin / Superadmin' }, { status: 403 });
    }

    const now = Date.now();
    if (memoryAnalyticsCache && now - memoryAnalyticsCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(
        { analytics: memoryAnalyticsCache.payload },
        {
          headers: {
            'Cache-Control': 'private, s-maxage=20, stale-while-revalidate=40',
            'X-Data-Source': 'cache',
          },
        }
      );
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

    const payload: CachedAnalyticsPayload = {
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
    };

    memoryAnalyticsCache = {
      payload,
      timestamp: now,
    };

    return NextResponse.json(
      { analytics: payload },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=20, stale-while-revalidate=40',
          'X-Data-Source': 'database',
        },
      }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data analitik' }, { status: 500 });
  }
}
