import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { Role } from '@prisma/client';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateLimit = checkRateLimit(`register:${ip}`, { maxRequests: 5, intervalMs: 60_000 });
    if (!rateLimit.isAllowed) {
      const retrySeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan pendaftaran akun. Silakan coba kembali dalam ${retrySeconds} detik.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
    }

    const body = await req.json();
    const { nama, email, password } = body;

    if (!nama || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedNama = nama.trim();

    if (normalizedNama.length < 2 || normalizedNama.length > 70) {
      return NextResponse.json({ error: 'Nama harus berdurasi antara 2 hingga 70 karakter' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal 6 karakter' }, { status: 400 });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar dalam sistem' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        nama: normalizedNama,
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.PELAPOR,
      },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
    };
    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      message: 'Registrasi berhasil',
      user: tokenPayload,
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Gagal memproses pendaftaran' }, { status: 500 });
  }
}
