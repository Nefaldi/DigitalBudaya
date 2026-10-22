import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimit = checkRateLimit(`login-ip:${ip}`, { maxRequests: 5, intervalMs: 60_000 });
    if (!rateLimit.isAllowed) {
      const retrySeconds = Math.ceil(rateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login dari jaringan ini. Silakan coba kembali dalam ${retrySeconds} detik.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Dual-Key Rate Limit: Protect specific account from distributed brute-force across rotating IPs
    const accountRateLimit = checkRateLimit(`login-account:${normalizedEmail}`, { maxRequests: 5, intervalMs: 60_000 });
    if (!accountRateLimit.isAllowed) {
      const retrySeconds = Math.ceil(accountRateLimit.resetMs / 1000);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan masuk pada akun ini. Silakan coba kembali dalam ${retrySeconds} detik.` },
        { status: 429, headers: { 'Retry-After': String(retrySeconds) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Gagal melakukan otentikasi' }, { status: 500 });
  }
}
