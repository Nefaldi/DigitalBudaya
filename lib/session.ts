import { cookies } from 'next/headers';
import { verifyToken, UserTokenPayload } from '@/lib/auth';

/**
 * Mendapatkan data sesi user aktif di Server Components.
 * Mengembalikan UserTokenPayload jika valid, atau null jika tidak login / token kedaluwarsa.
 */
export async function getCurrentUser(): Promise<UserTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    console.error('Error reading session cookie:', error);
    return null;
  }
}
