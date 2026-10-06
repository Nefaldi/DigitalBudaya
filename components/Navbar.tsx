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
  LogIn,
  MapPin,
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

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

  const laporHref =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user
      ? '/pelapor/lapor'
      : '/login?redirect=/pelapor/lapor';

  return (
    <header className="mantikole-header-wrapper no-print">
      <div
        className={`mantikole-nav-container ${
          scrolled ? 'mantikole-nav-scrolled' : 'mantikole-nav-unscrolled'
        }`}
      >
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="group"
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
        >
          <div className="mantikole-logo-badge">
            <Image
              src="/logo-transparent.png"
              alt="DigitalBudaya Logo"
              width={24}
              height={24}
              priority
              className="logo-light-variant"
              style={{ objectFit: 'contain' }}
            />
            <Image
              src="/logo-light-transparent.png"
              alt="DigitalBudaya Logo"
              width={24}
              height={24}
              priority
              className="logo-dark-variant"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="mantikole-brand-title">DigitalBudaya</span>
            <span className="mantikole-brand-subtitle">Sulawesi Tengah</span>
          </div>
        </Link>

        {/* Center Pill Navigation Rail (Desktop) */}
        <nav className="mantikole-nav-rail">
          <Link
            href="/katalog"
            className={`mantikole-nav-item ${
              pathname.startsWith('/katalog') ? 'is-active' : ''
            }`}
          >
            <Compass size={13} />
            <span>Katalog</span>
          </Link>

          <Link
            href="/#peta"
            className="mantikole-nav-item"
          >
            <MapPin size={13} />
            <span>Peta</span>
          </Link>

          <Link
            href={laporHref}
            className={`mantikole-nav-item ${
              pathname.startsWith('/pelapor/lapor') ? 'is-active' : ''
            }`}
          >
            <FilePlus size={13} />
            <span>Lapor</span>
          </Link>

          {/* Role-Specific Navigation */}
          {user?.role === 'SUPERADMIN' && (
            <>
              <Link
                href="/superadmin/analytics"
                className={`mantikole-nav-item ${
                  pathname.startsWith('/superadmin/analytics') ? 'is-active' : ''
                }`}
              >
                <BarChart3 size={13} />
                <span>Analitik</span>
              </Link>
              <Link
                href="/superadmin/users"
                className={`mantikole-nav-item ${
                  pathname.startsWith('/superadmin/users') ? 'is-active' : ''
                }`}
              >
                <User size={13} />
                <span>Pengguna</span>
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className={`mantikole-nav-item ${
                pathname.startsWith('/admin') ? 'is-active' : ''
              }`}
            >
              <Shield size={13} />
              <span>Konservator</span>
            </Link>
          )}

          {user?.role === 'PELAPOR' && (
            <>
              <Link
                href="/pelapor"
                className={`mantikole-nav-item ${
                  pathname === '/pelapor' ? 'is-active' : ''
                }`}
              >
                <span>Laporan Saya</span>
              </Link>
              <Link
                href="/pelapor/profil"
                className={`mantikole-nav-item ${
                  pathname.startsWith('/pelapor/profil') ? 'is-active' : ''
                }`}
              >
                <User size={13} />
                <span>Profil</span>
              </Link>
            </>
          )}
        </nav>

        {/* Action Controls & Sesi (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ThemeToggle pill />

          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mantikole-action-pill mantikole-action-pill-outline mantikole-desktop-action"
                  title={`Keluar (${user.nama})`}
                >
                  <LogOut size={13} />
                  <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
                </button>
              ) : (
                <div
                  className="mantikole-desktop-action"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Link
                    href="/login"
                    className="mantikole-action-pill mantikole-action-pill-primary"
                  >
                    <LogIn size={13} />
                    <span>Masuk</span>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mantikole-action-pill mantikole-action-pill-outline mantikole-mobile-toggle-btn"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Drawer Card */}
      {mobileMenuOpen && (
        <div className="mantikole-mobile-drawer">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`mantikole-mobile-item ${pathname === '/' ? 'mantikole-mobile-item-active' : ''}`}
          >
            <span>Beranda</span>
          </Link>
          <Link
            href="/katalog"
            onClick={() => setMobileMenuOpen(false)}
            className={`mantikole-mobile-item ${
              pathname.startsWith('/katalog') ? 'mantikole-mobile-item-active' : ''
            }`}
          >
            <Compass size={15} />
            <span>Katalog Warisan</span>
          </Link>
          <Link
            href="/#peta"
            onClick={() => setMobileMenuOpen(false)}
            className="mantikole-mobile-item"
          >
            <MapPin size={15} />
            <span>Peta Interaktif</span>
          </Link>
          <Link
            href={laporHref}
            onClick={() => setMobileMenuOpen(false)}
            className={`mantikole-mobile-item ${
              pathname.startsWith('/pelapor/lapor') ? 'mantikole-mobile-item-active' : ''
            }`}
          >
            <FilePlus size={15} />
            <span>Lapor Pusaka Baru</span>
          </Link>

          {/* Role Workbenches in Mobile Drawer */}
          {user?.role === 'SUPERADMIN' && (
            <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-hairline)' }}>
              <Link
                href="/superadmin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className={`mantikole-mobile-item ${
                  pathname.startsWith('/superadmin/analytics') ? 'mantikole-mobile-item-active' : ''
                }`}
              >
                <BarChart3 size={15} />
                <span>Analitik Provinsi</span>
              </Link>
              <Link
                href="/superadmin/users"
                onClick={() => setMobileMenuOpen(false)}
                className={`mantikole-mobile-item ${
                  pathname.startsWith('/superadmin/users') ? 'mantikole-mobile-item-active' : ''
                }`}
              >
                <User size={15} />
                <span>Manajemen Pengguna</span>
              </Link>
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-hairline)' }}>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`mantikole-mobile-item ${
                  pathname.startsWith('/admin') ? 'mantikole-mobile-item-active' : ''
                }`}
              >
                <Shield size={15} />
                <span>Workbench Konservator</span>
              </Link>
            </div>
          )}

          {user?.role === 'PELAPOR' && (
            <div style={{ paddingTop: '0.4rem', borderTop: '1px solid var(--border-hairline)' }}>
              <Link
                href="/pelapor"
                onClick={() => setMobileMenuOpen(false)}
                className={`mantikole-mobile-item ${
                  pathname === '/pelapor' ? 'mantikole-mobile-item-active' : ''
                }`}
              >
                <FilePlus size={15} />
                <span>Laporan Saya</span>
              </Link>
              <Link
                href="/pelapor/profil"
                onClick={() => setMobileMenuOpen(false)}
                className={`mantikole-mobile-item ${
                  pathname.startsWith('/pelapor/profil') ? 'mantikole-mobile-item-active' : ''
                }`}
              >
                <User size={15} />
                <span>Profil Akun</span>
              </Link>
            </div>
          )}

          {/* Auth Action in Mobile Drawer */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-hairline)' }}>
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="mantikole-action-pill mantikole-action-pill-outline"
                style={{ width: '100%', justifyContent: 'center', padding: '0.55rem' }}
              >
                <LogOut size={14} />
                <span>Keluar ({user.nama})</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mantikole-action-pill mantikole-action-pill-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.55rem' }}
              >
                <LogIn size={14} />
                <span>Masuk ke Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
