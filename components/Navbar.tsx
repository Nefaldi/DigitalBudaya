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
  LogIn,
  User,
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

    const getElementDocTop = (el: HTMLElement | null) => {
      if (!el) return Infinity;
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    };

    const updateActiveByHashOrScroll = () => {
      const scrollY = window.scrollY;

      // When near or at top of page (hero area), active section is always Beranda ('/')
      if (scrollY <= 100) {
        setActiveSection('/');
        return;
      }

      const petaEl = document.getElementById('peta');
      const terkiniEl = document.getElementById('katalog-terkini');
      const statistikEl = document.getElementById('statistik');

      const offsetTolerance = 240;
      const petaTop = getElementDocTop(petaEl) - offsetTolerance;
      const terkiniTop = getElementDocTop(terkiniEl) - offsetTolerance;
      const statistikTop = getElementDocTop(statistikEl) - offsetTolerance;

      if (scrollY < statistikTop) {
        setActiveSection('/');
      } else if (petaEl && scrollY >= petaTop) {
        setActiveSection('/#peta');
      } else if (terkiniEl && scrollY >= terkiniTop) {
        setActiveSection('/#katalog-terkini');
      } else if (statistikEl && scrollY >= statistikTop) {
        setActiveSection('/#statistik');
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

  const isKatalogPage = pathname === '/katalog' || pathname.startsWith('/katalog/');
  const isLoginPage = pathname === '/login';

  // Center navigation rail strictly contains features of each respective role
  let navLinks: Array<{ label: string; href: string }> = [];

  if (!user) {
    if (pathname === '/') {
      // Fitur khusus landing page (tanpa tombol Katalog Budaya di navbar)
      navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Statistik', href: '/#statistik' },
        { label: 'Terkini', href: '/#katalog-terkini' },
        { label: 'Peta', href: '/#peta' },
      ];
    } else if (isKatalogPage || isLoginPage) {
      // Pada laman katalog budaya & halaman login, tombol navbar tengah dihilangkan
      navLinks = [];
    } else {
      // Halaman di luar landing page lainnya
      navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Katalog Budaya', href: '/katalog' },
      ];
    }
  } else if (user.role === 'PELAPOR') {
    // Dedicated features for Pelapor (Sahabat Budaya)
    navLinks = [
      { label: 'Laporan Saya', href: '/pelapor' },
      { label: 'Buat Laporan', href: '/pelapor/lapor' },
      { label: 'Katalog Budaya', href: '/katalog' },
    ];
  } else if (user.role === 'ADMIN') {
    // Dedicated features for Admin (Konservator Wilayah)
    navLinks = [
      { label: 'Workbench Verifikasi', href: '/admin' },
      { label: 'Analitik Wilayah', href: '/superadmin/analytics' },
      { label: 'Katalog Budaya', href: '/katalog' },
    ];
  } else if (user.role === 'SUPERADMIN') {
    // Dedicated features for Superadmin (Pimpinan & Eksekutif)
    navLinks = [
      { label: 'Analitik Intelijen', href: '/superadmin/analytics' },
      { label: 'Kelola Pengguna', href: '/superadmin/users' },
      { label: 'Workbench Admin', href: '/admin' },
      { label: 'Katalog Budaya', href: '/katalog' },
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
    <header className="digiculture-header-wrapper no-print">
      <div
        className={`digiculture-nav-container ${
          scrolled ? 'digiculture-nav-scrolled' : 'digiculture-nav-unscrolled'
        }`}
      >
        {/* Brand Logo & Title for Guest, or Profile Icon & Account Name for Authenticated Users */}
        <div className="digiculture-nav-left">
          {user ? (
            <Link
              href="/pelapor/profil"
              className="group"
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
              title={`Profil Akun ${
                user.role === 'SUPERADMIN'
                  ? 'Superadmin'
                  : user.role === 'ADMIN'
                  ? 'Konservator'
                  : 'Pelapor'
              }: ${user.nama}`}
            >
              <div
                className="digiculture-logo-badge"
                style={{
                  color: 'var(--text-primary)',
                  borderColor: pathname === '/pelapor/profil' ? 'var(--action-primary)' : 'var(--border-hairline)',
                }}
              >
                <User size={16} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="digiculture-brand-title" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.nama}
                </span>
                <span className="digiculture-brand-subtitle">
                  {user.role === 'SUPERADMIN'
                    ? 'Superadmin'
                    : user.role === 'ADMIN'
                    ? 'Konservator'
                    : 'Pelapor'}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href={brandHref}
              className="group"
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
              title="Digiculture Care"
            >
              <div className="digiculture-logo-badge">
                <Image
                  src="/logo-transparent.png"
                  alt="Digiculture Care Logo"
                  width={24}
                  height={24}
                  priority
                  className="logo-light-variant"
                  style={{ objectFit: 'contain' }}
                />
                <Image
                  src="/logo-light-transparent.png"
                  alt="Digiculture Care Logo"
                  width={24}
                  height={24}
                  priority
                  className="logo-dark-variant"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="digiculture-brand-title">Digiculture Care</span>
              </div>
            </Link>
          )}
        </div>

        {/* Center Pill Navigation Rail - Exclusively filtered per role */}
        <div className="digiculture-nav-center">
          {navLinks.length > 0 && (
            <nav className="digiculture-nav-rail">
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
                    className={`digiculture-nav-item ${active ? 'is-active' : ''}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Action Buttons Section (Right) */}
        <div className="digiculture-nav-right">
          {/* Desktop Actions */}
          <div className="digiculture-desktop-action" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!loading && !user ? (
              isKatalogPage || isLoginPage ? (
                <Link
                  href="/"
                  className="digiculture-action-pill digiculture-action-pill-primary"
                >
                  <span>Kembali</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="digiculture-action-pill digiculture-action-pill-primary"
                >
                  <LogIn size={13} />
                  <span>Masuk</span>
                </Link>
              )
            ) : !loading && user ? (
              <>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="digiculture-action-pill digiculture-action-pill-outline"
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
            className="p-1.5 text-slate-700 hover:text-slate-950 focus:outline-none dark:text-zinc-300 dark:hover:text-white digiculture-mobile-toggle-btn"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Floating Mobile Drawer Card */}
      {mobileMenuOpen && (
        <div className="digiculture-mobile-drawer">
          {/* User profile card in drawer when authenticated */}
          {user && (
            <Link
              href="/pelapor/profil"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.65rem 0.85rem',
                marginBottom: '0.5rem',
                borderRadius: '0.65rem',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
              }}
              title="Buka Pengaturan Profil Akun"
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
              <span className={`digiculture-role-badge digiculture-role-badge-${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </Link>
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
                className={`digiculture-mobile-item ${active ? 'is-active' : ''}`}
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
              isKatalogPage || isLoginPage ? (
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="digiculture-action-pill digiculture-action-pill-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.55rem',
                    borderRadius: '0.75rem',
                  }}
                >
                  <span>Kembali</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="digiculture-action-pill digiculture-action-pill-primary"
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
              )
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="digiculture-action-pill digiculture-action-pill-outline"
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
