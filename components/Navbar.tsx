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
  FileText,
  FilePlus,
  LogIn,
  Shield,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('/');
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section on homepage via scroll and hash changes
  useEffect(() => {
    if (pathname !== '/') return;

    const updateActiveByHashOrScroll = () => {
      const hash = window.location.hash;
      const scrollY = window.scrollY;

      const petaEl = document.getElementById('peta');
      const statistikEl = document.getElementById('statistik');

      const petaTop = petaEl ? petaEl.offsetTop - 240 : Infinity;
      const statistikTop = statistikEl ? statistikEl.offsetTop - 240 : Infinity;

      if (petaEl && scrollY >= petaTop) {
        setActiveSection('/#peta');
      } else if (statistikEl && scrollY >= statistikTop) {
        setActiveSection('/#statistik');
      } else if (scrollY <= 50 && (hash === '#statistik' || hash === '#peta')) {
        setActiveSection(`/${hash}`);
      } else {
        setActiveSection('/');
      }
    };

    updateActiveByHashOrScroll();
    window.addEventListener('scroll', updateActiveByHashOrScroll, { passive: true });
    window.addEventListener('hashchange', updateActiveByHashOrScroll);

    return () => {
      window.removeEventListener('scroll', updateActiveByHashOrScroll);
      window.removeEventListener('hashchange', updateActiveByHashOrScroll);
    };
  }, [pathname]);

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

  const isLinkActive = (href: string) => {
    if (pathname === '/') {
      if (href === '/') {
        return activeSection === '/';
      }
      if (href.startsWith('/#')) {
        return activeSection === href;
      }
      return false;
    }

    if (href === '/' || href.startsWith('/#')) {
      return false;
    }

    if (pathname === href) {
      return true;
    }

    if (href === '/katalog' && pathname.startsWith('/katalog/')) {
      return true;
    }

    return false;
  };

  // Center navigation rail strictly contains features of each respective role
  let navLinks: Array<{ label: string; href: string }> = [];

  if (!user) {
    // Public / Guest features
    navLinks = [
      { label: 'Beranda', href: '/' },
      { label: 'Statistik', href: '/#statistik' },
      { label: 'Peta', href: '/#peta' },
      { label: 'Katalog', href: '/katalog' },
    ];
  } else if (user.role === 'PELAPOR') {
    // Dedicated features for Pelapor (Sahabat Budaya)
    navLinks = [
      { label: 'Laporan Saya', href: '/pelapor' },
      { label: 'Buat Laporan', href: '/pelapor/lapor' },
      { label: 'Katalog Budaya', href: '/katalog' },
      { label: 'Profil Saya', href: '/pelapor/profil' },
    ];
  } else if (user.role === 'ADMIN') {
    // Dedicated features for Admin (Konservator Wilayah)
    navLinks = [
      { label: 'Workbench Verifikasi', href: '/admin' },
      { label: 'Analitik Wilayah', href: '/superadmin/analytics' },
      { label: 'Katalog Pusaka', href: '/katalog' },
      { label: 'Profil Saya', href: '/pelapor/profil' },
    ];
  } else if (user.role === 'SUPERADMIN') {
    // Dedicated features for Superadmin (Pimpinan & Eksekutif)
    navLinks = [
      { label: 'Analitik Intelijen', href: '/superadmin/analytics' },
      { label: 'Kelola Pengguna', href: '/superadmin/users' },
      { label: 'Workbench Admin', href: '/admin' },
      { label: 'Katalog Pusaka', href: '/katalog' },
      { label: 'Profil Saya', href: '/pelapor/profil' },
    ];
  }

  const brandHref =
    user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'PELAPOR'
      ? '/pelapor'
      : '/';

  return (
    <header className="mantikole-header-wrapper no-print">
      <div
        className={`mantikole-nav-container ${
          scrolled ? 'mantikole-nav-scrolled' : 'mantikole-nav-unscrolled'
        }`}
      >
        {/* Brand Logo & Title (Links to Role Home for Authenticated, or Landing Page for Guest) */}
        <Link
          href={brandHref}
          className="group"
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          title={user ? `Kembali ke Beranda ${user.role}` : 'DigitalBudaya Sulawesi Tengah'}
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

        {/* Center Pill Navigation Rail - Exclusively filtered per role */}
        <nav className="mantikole-nav-rail">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.href.startsWith('/#') || link.href === '/') {
                    setActiveSection(link.href);
                  }
                }}
                className={`mantikole-nav-item ${active ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons Section (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Desktop Actions */}
          <div className="mantikole-desktop-action" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!loading && !user ? (
              <>
                {/* Guest Button 1: Outline Pill Lapor Pusaka */}
                <Link
                  href="/login?redirect=/pelapor/lapor"
                  className="mantikole-action-pill mantikole-action-pill-outline"
                >
                  <FileText size={13} className="text-slate-600 dark:text-zinc-400" />
                  <span>Lapor Pusaka</span>
                </Link>

                {/* Guest Button 2: Solid Pill Masuk */}
                <Link
                  href="/login"
                  className="mantikole-action-pill mantikole-action-pill-primary"
                >
                  <LogIn size={13} />
                  <span>Masuk</span>
                </Link>
              </>
            ) : !loading && user ? (
              <>
                {/* Role Badge Chip */}
                {user.role === 'SUPERADMIN' && (
                  <span className="mantikole-role-badge mantikole-role-badge-superadmin" title="Hak Akses: Superadmin">
                    <ShieldAlert size={11} />
                    <span>Superadmin</span>
                  </span>
                )}
                {user.role === 'ADMIN' && (
                  <span className="mantikole-role-badge mantikole-role-badge-admin" title="Hak Akses: Konservator Wilayah">
                    <Shield size={11} />
                    <span>Admin</span>
                  </span>
                )}
                {user.role === 'PELAPOR' && (
                  <span className="mantikole-role-badge mantikole-role-badge-pelapor" title="Hak Akses: Sahabat Budaya">
                    <UserCheck size={11} />
                    <span>Pelapor</span>
                  </span>
                )}

                {/* User Name Chip */}
                <span className="mantikole-user-name" title={`${user.nama} (${user.email})`}>
                  {user.nama}
                </span>

                {/* Quick Action Button for PELAPOR */}
                {user.role === 'PELAPOR' && (
                  <Link
                    href="/pelapor/lapor"
                    className="mantikole-action-pill mantikole-action-pill-primary"
                    style={{ padding: '0.35rem 0.75rem' }}
                  >
                    <FilePlus size={12} />
                    <span>Lapor</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="mantikole-action-pill mantikole-action-pill-outline"
                  style={{ color: 'var(--action-danger)', padding: '0.35rem 0.65rem' }}
                  title={`Keluar Akun (${user.nama})`}
                >
                  <LogOut size={12} />
                  <span>{isLoggingOut ? '...' : 'Keluar'}</span>
                </button>
              </>
            ) : null}
          </div>

          <ThemeToggle pill />

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-700 hover:text-slate-950 focus:outline-none dark:text-zinc-300 dark:hover:text-white mantikole-mobile-toggle-btn"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Drawer Card */}
      {mobileMenuOpen && (
        <div className="mantikole-mobile-drawer">
          {/* User profile card in drawer when authenticated */}
          {user && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                marginBottom: '0.5rem',
                borderRadius: '0.65rem',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.nama}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </div>
              </div>
              <span className={`mantikole-role-badge mantikole-role-badge-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
          )}

          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.href.startsWith('/#') || link.href === '/') {
                    setActiveSection(link.href);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`mantikole-mobile-item ${active ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Bottom Actions in Mobile Drawer */}
          <div
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-hairline)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {!user ? (
              <>
                <Link
                  href="/login?redirect=/pelapor/lapor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mantikole-action-pill mantikole-action-pill-outline"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.55rem',
                    borderRadius: '0.75rem',
                  }}
                >
                  <FileText size={14} className="text-slate-600 dark:text-zinc-400" />
                  <span>Lapor Pusaka Budaya</span>
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mantikole-action-pill mantikole-action-pill-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.55rem',
                    borderRadius: '0.75rem',
                  }}
                >
                  <LogIn size={14} />
                  <span>Masuk</span>
                </Link>
              </>
            ) : (
              <>
                {user.role === 'PELAPOR' && (
                  <Link
                    href="/pelapor/lapor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mantikole-action-pill mantikole-action-pill-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.55rem',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <FilePlus size={14} />
                    <span>Buat Laporan Baru</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="mantikole-action-pill mantikole-action-pill-outline"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.55rem',
                    borderRadius: '0.75rem',
                    color: 'var(--action-danger)',
                  }}
                >
                  <LogOut size={14} />
                  <span>Keluar Akun ({user.nama})</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
