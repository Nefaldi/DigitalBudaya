export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'PELAPOR';

export interface UserSession {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
}
