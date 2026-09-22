import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Akses khusus Superadmin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');

    const where: any = {};
    if (roleParam && roleParam !== 'Semua') {
      where.role = roleParam as Role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            laporanDikirim: true,
            laporanDiproses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Gagal mengambil daftar pengguna' }, { status: 500 });
  }
}
