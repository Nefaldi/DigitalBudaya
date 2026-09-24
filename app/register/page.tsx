'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Mail, Key, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendaftar akun');
      }

      router.push('/pelapor');
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi.');
    } finally {
      setLoading(false);
    }
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
              Daftar Akun Pelapor
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Jadilah pelopor penyelamatan pusaka cagar budaya di Sulawesi Tengah
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

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} style={{ color: 'var(--action-primary)' }} /> Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Ahmad Kaili"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} style={{ color: 'var(--action-primary)' }} /> Alamat Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={15} style={{ color: 'var(--action-primary)' }} /> Kata Sandi (Minimal 6 Karakter)
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
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Daftar Akun Pelapor</span>
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sudah memiliki akun?{' '}
            <Link
              href="/login"
              style={{
                color: 'var(--action-primary)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
