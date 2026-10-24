'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import UserManagementSection from '@/components/admin/UserManagementSection';
import { fetchUserSession, getCachedUser } from '@/lib/clientSession';

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getCachedUser());
  const [loading, setLoading] = useState<boolean>(() => !getCachedUser());
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const cached = getCachedUser();
        if (cached && cached.role !== 'SUPERADMIN') {
          router.push('/admin');
          return;
        }

        const user = await fetchUserSession();
        if (!user) {
          router.push('/login?redirect=/superadmin/users');
          return;
        }
        if (user.role !== 'SUPERADMIN') {
          router.push('/admin');
          return;
        }
        if (ignore) return;
        setCurrentUser(user);
      } catch (err) {
        console.error('Auth error:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      ignore = true;
    };
  }, [router]);

  if (loading) {
    return (
      <LoadingScreen
        message="Memuat Konsol Pengguna..."
        submessage="Sinkronisasi akun pengelola dan sahabat budaya"
      />
    );
  }

  return (
    <div style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '1.15rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
                fontWeight: 460,
                letterSpacing: '-0.028em',
              }}
            >
              Manajemen Pengguna
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Kelola hak akses dan akun pengguna sistem.
            </p>
          </div>
        </div>

        <UserManagementSection currentUser={currentUser} />
      </div>
    </div>
  );
}
