import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Akses khusus Superadmin' }, { status: 403 });
    }

    const params = await props.params;
    const { id } = params;

    const body = await req.json();
    const { role, nama, email } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role ? (role as Role) : existingUser.role,
        nama: nama || existingUser.nama,
        email: email || existingUser.email,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ message: 'Data pengguna berhasil diperbarui', user: updated });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengguna' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Akses khusus Superadmin' }, { status: 403 });
    }

    const params = await props.params;
    const { id } = params;

    if (id === user.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Superadmin anda sendiri' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
