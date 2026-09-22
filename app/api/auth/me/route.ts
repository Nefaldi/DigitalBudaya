import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Tidak terotentikasi' }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function POST() {
  const response = NextResponse.json({ message: 'Logout berhasil' });
  response.cookies.set('token', '', { expires: new Date(0), path: '/' });
  return response;
}
