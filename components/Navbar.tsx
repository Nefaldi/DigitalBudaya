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
  AlertTriangle,
} from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('/');
  const pathname = usePathname();

  // Scroll handler for floating island effect and active section detection
  useEffect(() => {
    let ticking = false;

    const getElementDocTop = (el: HTMLElement | null) => {
      if (!el) return Infinity;
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setScrolled(scrollY > 20);

          if (pathname === '/') {
            if (scrollY <= 100) {
              setActiveSection('/');
            } else {
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
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleScroll);
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

  const handleExecuteLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/me', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setShowLogoutConfirm(false);
      setIsLoggingOut(false);
      // Redirect ke Beranda sesuai permintaan pengguna
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/';
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

  // Navigation rail per role
  let navLinks: Array<{ label: string; href: string }> = [];

  if (!user) {
    if (pathname === '/') {
      navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Statistik', href: '/#statistik' },
        { label: 'Terkini', href: '/#katalog-terkini' },
        { label: 'Peta', href: '/#peta' },
      ];
    } else if (isKatalogPage || isLoginPage) {
      navLinks = [];
    } else {
      navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Katalog Budaya', href: '/katalog' },
      ];
    }
  } else if (user.role === 'PELAPOR') {
    navLinks = [
      { label: 'Beranda', href: '/' },
      { label: 'Laporan Saya', href: '/pelapor' },
      { label: 'Buat Laporan', href: '/pelapor/lapor' },
      { label: 'Katalog Budaya', href: '/katalog' },
    ];
  } else if (user.role === 'ADMIN') {
    navLinks = [
      { label: 'Beranda', href: '/' },
      { label: 'Workbench Verifikasi', href: '/admin' },
      { label: 'Analitik Wilayah', href: '/superadmin/analytics' },
      { label: 'Katalog Budaya', href: '/katalog' },
    ];
  } else if (user.role === 'SUPERADMIN') {
    // Menu disamakan menjadi 'Analitik Wilayah' agar seragam & tidak membingungkan
    navLinks = [
      { label: 'Beranda', href: '/' },
      { label: 'Analitik Wilayah', href: '/superadmin/analytics' },
      { label: 'Kelola Pengguna', href: '/superadmin/users' },
      { label: 'Workbench Admin', href: '/admin' },
      { label: 'Katalog Budaya', href: '/katalog' },
    ];
  }

  return (
    <>
      <header className="digiculture-header-wrapper no-print">
        <div
          className={`digiculture-nav-container ${
            scrolled ? 'digiculture-nav-scrolled' : 'digiculture-nav-unscrolled'
          }`}
        >
          {/* Brand Logo & Title: KONSISTEN di sebelah kiri untuk SEMUA role */}
          <div className="digiculture-nav-left">
            <Link
              href="/"
              className="group"
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}
              title="DigiCulture Care - Beranda Sistem"
            >
              <div className="digiculture-logo-badge">
                <Image
                  src="/logo-transparent.png"
                  alt="DigiCulture Care Logo"
                  width={24}
                  height={24}
                  priority
                  className="logo-light-variant"
                  style={{ objectFit: 'contain' }}
                />
                <Image
                  src="/logo-light-transparent.png"
                  alt="DigiCulture Care Logo"
                  width={24}
                  height={24}
                  priority
                  className="logo-dark-variant"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="digiculture-brand-title">DigiCulture Care</span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Rail - Terstruktur sesuai role */}
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

          {/* Right Section: URUTAN KONSISTEN (ThemeToggle -> User Profile Badge -> Action Button) */}
          <div className="digiculture-nav-right">
            {/* 1. Theme Toggle */}
            <ThemeToggle pill />

            {/* Desktop Actions */}
            <div className="digiculture-desktop-action" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {!loading && !user ? (
                /* Guest Action */
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
                  {/* 2. User Profile Badge (Akses Profil Mandiri / Pimpinan) */}
                  <Link
                    href="/pelapor/profil"
                    className="digiculture-action-pill digiculture-action-pill-outline"
                    style={{
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      borderColor: pathname === '/pelapor/profil' ? 'var(--action-primary)' : 'var(--border-hairline)',
                      maxWidth: '170px',
                      overflow: 'hidden',
                    }}
                    title={`Profil: ${user.nama} (${user.role})`}
                  >
                    <User size={13} style={{ flexShrink: 0, color: 'var(--action-primary)' }} />
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '90px',
                        fontWeight: 600,
                      }}
                    >
                      {user.nama}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {user.role === 'SUPERADMIN' ? 'ADM' : user.role === 'ADMIN' ? 'KONS' : 'USER'}
                    </span>
                  </Link>

                  {/* 3. Tombol Logout (Memicu Modal Konfirmasi) */}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    disabled={isLoggingOut}
                    className="digiculture-action-pill digiculture-action-pill-outline"
                    style={{ color: 'var(--action-danger)', padding: '0.35rem 0.65rem' }}
                    title="Keluar dari sesi akun Anda"
                  >
                    <LogOut size={12} />
                    <span>Keluar</span>
                  </button>
                </>
              ) : null}
            </div>

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
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
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
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal Konfirmasi Logout */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--action-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              Konfirmasi Keluar Akun
            </h3>

            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                margin: '0 0 1.5rem 0',
              }}
            >
              Apakah Anda yakin ingin mengakhiri sesi dan keluar dari sistem DigiCulture Care? Anda akan diarahkan kembali ke beranda.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={isLoggingOut}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteLogout}
                disabled={isLoggingOut}
                className="btn btn-danger btn-sm"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}
              >
                {isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
