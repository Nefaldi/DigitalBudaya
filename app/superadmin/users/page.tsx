'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import UserManagementSection from '@/components/admin/UserManagementSection';
import { Shield } from 'lucide-react';

export default function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login?redirect=/superadmin/users');
          return;
        }
        const authData = await authRes.json();
        if (authData.user.role !== 'SUPERADMIN') {
          router.push('/admin');
          return;
        }
        if (ignore) return;
        setCurrentUser(authData.user);
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
    <div style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '1.75rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--action-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
                background: 'var(--color-terracotta-soft)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Shield size={14} /> Akses Pengguna
            </div>
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
