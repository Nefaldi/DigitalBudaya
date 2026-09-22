import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'digiculture-care-sulteng-secret-key-2026-super-secure';

export interface UserTokenPayload {
  id: string;
  email: string;
  nama: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'PELAPOR';
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(password, hashed);
}

export function signToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export function getAuthenticatedUser(req: NextRequest): UserTokenPayload | null {
  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Check cookie
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}
