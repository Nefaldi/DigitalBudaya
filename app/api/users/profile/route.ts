import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, hashPassword, comparePassword, signToken } from '@/lib/auth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const [totalReports, countMasuk, countDiproses, countSelesai] = await Promise.all([
      prisma.heritageReport.count({ where: { pelaporId: user.id } }),
      prisma.heritageReport.count({ where: { pelaporId: user.id, status: 'LAPORAN_MASUK' } }),
      prisma.heritageReport.count({ where: { pelaporId: user.id, status: 'DIPROSES' } }),
      prisma.heritageReport.count({ where: { pelaporId: user.id, status: 'SELESAI' } }),
    ]);

    return NextResponse.json({
      user,
      stats: {
        total: totalReports,
        masuk: countMasuk,
        diproses: countDiproses,
        selesai: countSelesai,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const { nama, email, currentPassword, newPassword } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const updateData: { nama?: string; email?: string; password?: string } = {};

    // Validasi & Update Nama
    if (nama !== undefined) {
      const trimmedNama = String(nama).trim();
      if (!trimmedNama || trimmedNama.length < 2) {
        return NextResponse.json({ error: 'Nama lengkap minimal terdiri dari 2 karakter' }, { status: 400 });
      }
      updateData.nama = trimmedNama;
    }

    // Validasi & Update Email
    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json({ error: 'Format alamat email tidak valid' }, { status: 400 });
      }

      if (normalizedEmail !== existingUser.email) {
        const emailTaken = await prisma.user.findFirst({
          where: {
            email: normalizedEmail,
            NOT: { id: authUser.id },
          },
        });
        if (emailTaken) {
          return NextResponse.json({ error: 'Alamat email sudah terdaftar pada akun lain' }, { status: 409 });
        }
        updateData.email = normalizedEmail;
      }
    }

    // Validasi & Update Kata Sandi
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Kata sandi saat ini wajib diisi untuk mengubah kata sandi' }, { status: 400 });
      }

      const isPasswordValid = await comparePassword(currentPassword, existingUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Kata sandi saat ini tidak tepat' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Kata sandi baru minimal terdiri dari 6 karakter' }, { status: 400 });
      }

      updateData.password = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Tidak ada perubahan data' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Refresh JWT session payload & token cookie jika nama atau email diperbarui
    const newPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      nama: updatedUser.nama,
      role: updatedUser.role,
    };
    const newToken = signToken(newPayload);

    const response = NextResponse.json({
      message: 'Profil dan informasi akun berhasil diperbarui',
      user: updatedUser,
      token: newToken,
    });

    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil pengguna' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
    }

    if (authUser.role !== 'PELAPOR') {
      return NextResponse.json({ error: 'Penghapusan mandiri hanya tersedia untuk akun Pelapor' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Konfirmasi kata sandi wajib diisi untuk menghapus akun' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const isPasswordValid = await comparePassword(password, existingUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Kata sandi konfirmasi tidak sesuai' }, { status: 400 });
    }

    // Bersihkan aset media Cloudinary milik laporan pengguna
    const userReports = await prisma.heritageReport.findMany({
      where: { pelaporId: authUser.id },
      select: { fotoKondisiAwal: true, fotoDigitalisasi: true, rekamanAudioUrl: true },
    });

    const deletePromises: Promise<boolean>[] = [];
    for (const r of userReports) {
      if (r.fotoKondisiAwal) deletePromises.push(deleteFromCloudinary(r.fotoKondisiAwal, 'image'));
      if (r.fotoDigitalisasi) deletePromises.push(deleteFromCloudinary(r.fotoDigitalisasi, 'image'));
      if (r.rekamanAudioUrl) deletePromises.push(deleteFromCloudinary(r.rekamanAudioUrl, 'video'));
    }
    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    // Hapus akun dari database (cascade laporan)
    await prisma.user.delete({
      where: { id: authUser.id },
    });

    const response = NextResponse.json({ message: 'Akun Anda berhasil dihapus secara permanen' });
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Gagal memproses penghapusan akun' }, { status: 500 });
  }
}
