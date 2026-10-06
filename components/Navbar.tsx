'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { UserSession } from '@/types';
import {
  Menu,
  X,
  LogOut,
  Compass,
  FilePlus,
  Shield,
  BarChart3,
  User,
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/me', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      setUser(null);
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
  };

  const navLinks = [
    { label: 'Katalog', href: '/katalog', active: pathname.startsWith('/katalog'), icon: Compass },
    { label: 'Peta', href: '/#peta', active: false },
    { label: 'Lapor', href: user?.role === 'ADMIN' ? '/admin' : user?.role === 'SUPERADMIN' ? '/superadmin/analytics' : user ? '/pelapor/lapor' : '/login?redirect=/pelapor/lapor', active: pathname.startsWith('/pelapor/lapor'), icon: FilePlus },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-hairline)',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo & Name */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '-0.02em',
          }}
        >
          <div style={{ position: 'relative', width: '28px', height: '28px' }}>
            <Image
              src="/logo-transparent.png"
              alt="Logo"
              width={28}
              height={28}
              priority
              className="logo-light-variant"
              style={{ objectFit: 'contain' }}
            />
            <Image
              src="/logo-light-transparent.png"
              alt="Logo"
              width={28}
              height={28}
              priority
              className="logo-dark-variant"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <span style={{ color: 'var(--text-primary)' }}>DigitalBudaya</span>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 400,
              paddingLeft: '0.25rem',
              borderLeft: '1px solid var(--border-hairline)',
            }}
          >
            Sulawesi Tengah
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: link.active ? 600 : 500,
                  color: link.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: link.active ? 'var(--bg-subtle)' : 'transparent',
                  transition: 'background-color 0.12s ease, color 0.12s ease',
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Role-Specific Workbenches */}
            {user?.role === 'SUPERADMIN' && (
              <>
                <Link
                  href="/superadmin/analytics"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: pathname.startsWith('/superadmin/analytics') ? 600 : 500,
                    color: pathname.startsWith('/superadmin/analytics') ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: pathname.startsWith('/superadmin/analytics') ? 'var(--bg-subtle)' : 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <BarChart3 size={14} />
                  <span>Analitik</span>
                </Link>
                <Link
                  href="/superadmin/users"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: pathname.startsWith('/superadmin/users') ? 600 : 500,
                    color: pathname.startsWith('/superadmin/users') ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: pathname.startsWith('/superadmin/users') ? 'var(--bg-subtle)' : 'transparent',
                  }}
                >
                  <span>Pengguna</span>
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: pathname.startsWith('/admin') ? 600 : 500,
                  color: pathname.startsWith('/admin') ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: pathname.startsWith('/admin') ? 'var(--bg-subtle)' : 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Shield size={14} />
                <span>Konservator</span>
              </Link>
            )}

            {user?.role === 'PELAPOR' && (
              <>
                <Link
                  href="/pelapor"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: pathname === '/pelapor' ? 600 : 500,
                    color: pathname === '/pelapor' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: pathname === '/pelapor' ? 'var(--bg-subtle)' : 'transparent',
                  }}
                >
                  <span>Laporan Saya</span>
                </Link>
                <Link
                  href="/pelapor/profil"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: pathname.startsWith('/pelapor/profil') ? 600 : 500,
                    color: pathname.startsWith('/pelapor/profil') ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: pathname.startsWith('/pelapor/profil') ? 'var(--bg-subtle)' : 'transparent',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <User size={14} />
                  <span>Profil</span>
                </Link>
              </>
            )}
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-hairline)', margin: '0 0.5rem' }} className="desktop-nav" />

          {/* Action & Sesi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle />

            {!loading && (
              <>
                {user ? (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="btn btn-outline btn-sm desktop-nav"
                    style={{ fontSize: '0.8rem' }}
                    title={`Keluar (${user.nama})`}
                  >
                    <LogOut size={13} />
                    <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="btn btn-primary btn-sm desktop-nav"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <span>Masuk</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline btn-sm mobile-toggle"
              aria-label="Menu"
              style={{ padding: '0.4rem', border: '1px solid var(--border-hairline)' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-hairline)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 999,
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border-hairline)',
              }}
            >
              {link.label}
            </Link>
          ))}

          {user?.role === 'SUPERADMIN' && (
            <>
              <Link
                href="/superadmin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-hairline)' }}
              >
                Analitik Provinsi
              </Link>
              <Link
                href="/superadmin/users"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-hairline)' }}
              >
                Manajemen Pengguna
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-hairline)' }}
            >
              Workbench Konservator
            </Link>
          )}

          {user?.role === 'PELAPOR' && (
            <>
              <Link
                href="/pelapor"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-hairline)' }}
              >
                Laporan Saya
              </Link>
              <Link
                href="/pelapor/profil"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-hairline)' }}
              >
                Profil Akun
              </Link>
            </>
          )}

          <div style={{ paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {user ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={14} />
                <span>Keluar Akun ({user.nama})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Media Queries inline for mobile toggle */}
      <style jsx>{`
        @media (max-width: 768px) {
          :global(.desktop-nav) {
            display: none !important;
          }
          :global(.mobile-toggle) {
            display: inline-flex !important;
          }
        }
        @media (min-width: 769px) {
          :global(.mobile-toggle) {
            display: none !important;
          }
          :global(.mobile-drawer) {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
