import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email atau password tidak valid' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Email atau password tidak valid' }, { status: 401 });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role,
    };
    const token = signToken(tokenPayload);

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: tokenPayload,
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Gagal melakukan otentikasi' }, { status: 500 });
  }
}
