'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogIn, Key, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal melakukan otentikasi');
      }

      // Redirect according to role
      const role = data.user?.role;
      if (role === 'SUPERADMIN') {
        router.push('/superadmin/analytics');
      } else if (role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/pelapor');
      }
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 5vw, 3rem) 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Paper White Floating Card */}
        <div className="paper-card" style={{ padding: 'clamp(1.5rem, 5vw, 2.5rem)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Image
                src="/logo-transparent.png"
                alt="DigiCulture Care Logo"
                width={54}
                height={54}
                priority
                className="logo-light-variant"
                style={{ width: '54px', height: '54px', objectFit: 'contain' }}
              />
              <Image
                src="/logo-light-transparent.png"
                alt="DigiCulture Care Logo"
                width={54}
                height={54}
                priority
                className="logo-dark-variant"
                style={{ width: '54px', height: '54px', objectFit: 'contain' }}
              />
            </div>
            <h1
              style={{
                fontSize: '1.6rem',
                marginBottom: '0.4rem',
                color: 'var(--text-primary)',
                fontWeight: 500,
                letterSpacing: '-0.025em',
              }}
            >
              Masuk Akun
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Portal Pengaduan & Preservasi Cagar Budaya Sulawesi Tengah
            </p>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--status-masuk-bg)',
                border: '1px solid var(--status-masuk-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-masuk)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} style={{ color: 'var(--action-primary)' }} /> Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@instansi.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={15} style={{ color: 'var(--action-primary)' }} /> Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Accounts for Fast Testing */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-hairline)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                fontWeight: 500,
              }}
            >
              <KeyRound size={14} style={{ color: 'var(--action-primary)' }} />
              <span>Akses Cepat (Akun Demo Seeder):</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('pelapor@digiculture.id')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.78rem' }}
              >
                <span>Pelapor (Masyarakat)</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>pelapor@digiculture.id</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@digiculture.id')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.78rem' }}
              >
                <span>Konservator Wilayah (Admin)</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>admin@digiculture.id</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('superadmin@digiculture.id')}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', fontSize: '0.78rem' }}
              >
                <span>Superadmin (Pimpinan)</span>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>superadmin@digiculture.id</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Belum memiliki akun Pelapor?{' '}
            <Link
              href="/register"
              style={{
                color: 'var(--action-primary)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Daftar Mandiri di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
