import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hashPassword } from '@/lib/auth';
import { Prisma, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Akses khusus Superadmin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');

    const where: Prisma.UserWhereInput = {};
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

export async function POST(req: NextRequest) {
  try {
    const currentUser = getAuthenticatedUser(req);
    if (!currentUser || currentUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Akses khusus Superadmin' }, { status: 403 });
    }

    const body = await req.json();
    const { nama, email, password, role } = body;

    if (!nama || !email || !password || !role) {
      return NextResponse.json({ error: 'Nama, email, password, dan peran wajib diisi' }, { status: 400 });
    }

    if (!['SUPERADMIN', 'ADMIN', 'PELAPOR'].includes(role)) {
      return NextResponse.json({ error: 'Peran pengguna tidak valid' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal terdiri dari 6 karakter' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Alamat email sudah terdaftar' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        nama: nama.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: 'Pengguna berhasil dibuat', user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan pengguna baru' }, { status: 500 });
  }
}
