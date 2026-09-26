import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, password } = body;

    if (!nama || !email || !password) {
      return NextResponse.json({ error: 'Nama, email, dan password wajib diisi' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedNama = nama.trim();

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
