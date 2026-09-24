'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Shield,
  Compass,
  FilePlus,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  // Close mobile drawer on route change during render
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="badge badge-diproses">Superadmin</span>;
      case 'ADMIN':
        return <span className="badge badge-selesai">Konservator</span>;
      default:
        return <span className="badge badge-benda">Pelapor</span>;
    }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '62px',
          }}
        >
          {/* Logo & Identity (Sulawesi Tengah Cultural Brand) */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo-transparent.png"
                alt="DigiCulture Care Logo"
                width={38}
                height={38}
                priority
                className="logo-light-variant"
                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
              />
              <Image
                src="/logo-light-transparent.png"
                alt="DigiCulture Care Logo"
                width={38}
                height={38}
                priority
                className="logo-dark-variant"
                style={{ width: '38px', height: '38px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', lineHeight: 1.15 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  DigiCulture
                </span>
                <span style={{ color: 'var(--action-primary)', fontWeight: 500, fontSize: '0.95rem' }}>
                  Care
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                Sulawesi Tengah Heritage
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <Link
              href="/"
              style={{
                color: pathname === '/' ? 'var(--action-primary)' : 'var(--text-primary)',
                fontWeight: pathname === '/' ? 540 : 460,
                fontSize: '0.92rem',
              }}
            >
              Beranda
            </Link>
            <Link
              href="/katalog"
              style={{
                color: pathname.startsWith('/katalog') ? 'var(--action-primary)' : 'var(--text-primary)',
                fontWeight: pathname.startsWith('/katalog') ? 540 : 460,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Compass size={15} />
              <span>Katalog Pusaka</span>
            </Link>

            {/* Conditional Role Links */}
            {user?.role === 'PELAPOR' && (
              <>
                <Link
                  href="/pelapor"
                  style={{
                    color: pathname === '/pelapor' ? 'var(--action-primary)' : 'var(--text-primary)',
                    fontWeight: pathname === '/pelapor' ? 540 : 460,
                    fontSize: '0.92rem',
                  }}
                >
                  Laporan Saya
                </Link>
                <Link href="/pelapor/lapor" className="btn btn-primary btn-sm">
                  <FilePlus size={14} />
                  <span>Lapor Pusaka</span>
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  style={{
                    color: pathname === '/admin' ? 'var(--action-primary)' : 'var(--text-primary)',
                    fontWeight: pathname === '/admin' ? 540 : 460,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Shield size={15} />
                  <span>Workbench Konservator</span>
                </Link>
                <Link href="/pelapor/lapor" className="btn btn-secondary btn-sm">
                  <FilePlus size={14} />
                  <span>Input Laporan</span>
                </Link>
              </>
            )}

            {user?.role === 'SUPERADMIN' && (
              <>
                <Link
                  href="/admin"
                  style={{
                    color: pathname === '/admin' ? 'var(--action-primary)' : 'var(--text-primary)',
                    fontWeight: pathname === '/admin' ? 540 : 460,
                    fontSize: '0.92rem',
                  }}
                >
                  Workbench
                </Link>
                <Link
                  href="/superadmin/analytics"
                  style={{
                    color: pathname === '/superadmin/analytics' ? 'var(--action-primary)' : 'var(--text-primary)',
                    fontWeight: pathname === '/superadmin/analytics' ? 540 : 460,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <BarChart3 size={15} />
                  <span>Analitik</span>
                </Link>
                <Link
                  href="/superadmin/users"
                  style={{
                    color: pathname === '/superadmin/users' ? 'var(--action-primary)' : 'var(--text-primary)',
                    fontWeight: pathname === '/superadmin/users' ? 540 : 460,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Users size={15} />
                  <span>Kelola User</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Account, Theme Toggle & Mobile Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ThemeToggle />

            {!loading && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ textAlign: 'right', display: 'none' }} className="desktop-nav">
                  <span style={{ fontSize: '0.85rem', fontWeight: 540, color: 'var(--text-primary)', display: 'block' }}>
                    {user.nama.split(' ')[0]}
                  </span>
                  {getRoleBadge(user.role)}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm desktop-nav"
                  title="Keluar (Logout)"
                  style={{ padding: '0.4rem', height: '36px', width: '36px' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : !loading ? (
              <div style={{ display: 'none' }} className="desktop-nav">
                <Link href="/login" className="btn btn-sm btn-outline">
                  Masuk
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Daftar
                </Link>
              </div>
            ) : null}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'transparent',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
              aria-label="Buka menu navigasi"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Native Touch Drawer Experience) */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Image
                src="/logo-transparent.png"
                alt="DigiCulture Care Logo"
                width={32}
                height={32}
                className="logo-light-variant"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
              <Image
                src="/logo-light-transparent.png"
                alt="DigiCulture Care Logo"
                width={32}
                height={32}
                className="logo-dark-variant"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              DigiCulture <span style={{ color: 'var(--action-primary)' }}>Care</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* User Status Bar in Mobile Drawer */}
        {user && (
          <div
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 540, color: 'var(--text-primary)' }}>
                {user.nama}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.email}
              </div>
            </div>
            {getRoleBadge(user.role)}
          </div>
        )}

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: pathname === '/' ? 'var(--color-terracotta-soft)' : 'transparent',
              color: pathname === '/' ? 'var(--action-primary)' : 'var(--text-primary)',
              fontWeight: pathname === '/' ? 600 : 500,
              fontSize: '0.95rem',
            }}
          >
            Beranda
          </Link>

          <Link
            href="/katalog"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: pathname.startsWith('/katalog') ? 'var(--color-terracotta-soft)' : 'transparent',
              color: pathname.startsWith('/katalog') ? 'var(--action-primary)' : 'var(--text-primary)',
              fontWeight: pathname.startsWith('/katalog') ? 600 : 500,
              fontSize: '0.95rem',
            }}
          >
            <Compass size={17} />
            <span>Katalog Pusaka Sulteng</span>
          </Link>

          {user?.role === 'PELAPOR' && (
            <>
              <Link
                href="/pelapor"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/pelapor' ? 'var(--color-terracotta-soft)' : 'transparent',
                  color: pathname === '/pelapor' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/pelapor' ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              >
                Dashboard Laporan Saya
              </Link>
              <Link
                href="/pelapor/lapor"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                <FilePlus size={16} /> Lapor Pusaka Baru
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/admin' ? 'var(--color-terracotta-soft)' : 'transparent',
                  color: pathname === '/admin' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/admin' ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              >
                <Shield size={17} />
                <span>Workbench Konservator</span>
              </Link>
              <Link
                href="/pelapor/lapor"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                <FilePlus size={16} /> Input Laporan Lapangan
              </Link>
            </>
          )}

          {user?.role === 'SUPERADMIN' && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/admin' ? 'var(--color-terracotta-soft)' : 'transparent',
                  color: pathname === '/admin' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/admin' ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              >
                Workbench Konservator
              </Link>
              <Link
                href="/superadmin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/superadmin/analytics' ? 'var(--color-terracotta-soft)' : 'transparent',
                  color: pathname === '/superadmin/analytics' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/superadmin/analytics' ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              >
                <BarChart3 size={17} />
                <span>Analitik Provinsi</span>
              </Link>
              <Link
                href="/superadmin/users"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/superadmin/users' ? 'var(--color-terracotta-soft)' : 'transparent',
                  color: pathname === '/superadmin/users' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/superadmin/users' ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              >
                <Users size={17} />
                <span>Manajemen Pengguna</span>
              </Link>
            </>
          )}

          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Daftar Pelapor
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Logout Button at Drawer Bottom */}
        {user && (
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="btn btn-outline"
              style={{ width: '100%', color: 'var(--status-masuk)', borderColor: 'var(--border-hairline)' }}
            >
              <LogOut size={16} />
              <span>Keluar Akun</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
