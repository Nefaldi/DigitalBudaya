'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import {
  Shield,
  Compass,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  MapPin,
  GitBranch,
  FileText,
  FilePlus,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isSubPage = pathname.startsWith('/pelapor/lapor') || pathname.startsWith('/pelapor/profil');
  const backHref =
    user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user?.role === 'ADMIN'
      ? '/admin'
      : '/pelapor';

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

  // Observer stabil untuk mendeteksi seksi landingpage yang aktif tanpa flicker/glitch
  useEffect(() => {
    if (pathname !== '/') return;

    const sections = ['beranda', 'peta', 'katalog', 'alur-kerja', 'statistik'];
    const handleScroll = () => {
      // Abaikan event scroll jika sedang animasi manual scroll dari klik tombol
      if (isManualScroll.current) return;

      const scrollY = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollY) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }
      setActiveSection('beranda');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [pathname]);

  // Tutup drawer mobile saat navigasi berubah
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/me', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      // Hard redirect to clear all SPA router cache/session state and land cleanly on the homepage
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/';
    }
  };

  // Navigasi scroll yang halus, stabil tanpa bentrok dengan router Next.js
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === '/') {
      e.preventDefault();
      isManualScroll.current = true;
      setActiveSection(id);

      if (id === 'beranda') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(id);
        if (el) {
          const navHeight = 62;
          const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
        }
      }

      // Kunci selama durasi smooth scroll agar underline tidak loncat-loncat
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isManualScroll.current = false;
      }, 850);
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

  const dashboardHomeUrl = user
    ? user.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user.role === 'ADMIN'
      ? '/admin'
      : '/pelapor'
    : '/';

  return (
    <>
      {/* Header Standar Full-Width (Bentuk Asli Tanpa Glitch) */}
      <header className="navbar-header">
        <div className="container navbar-container">
          {/* 1. BAGIAN KIRI: Logo & Identitas Brand DigiCulture Care */}
          <div className="navbar-left">
            <Link
              href={pathname === '/' ? '/' : dashboardHomeUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
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
                  width={36}
                  height={36}
                  priority
                  className="logo-light-variant"
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />
                <Image
                  src="/logo-light-transparent.png"
                  alt="DigiCulture Care Logo"
                  width={36}
                  height={36}
                  priority
                  className="logo-dark-variant"
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    DigiCulture
                  </span>
                  <span style={{ color: 'var(--action-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                    Care
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                  Sulawesi Tengah Heritage
                </div>
              </div>
            </Link>
          </div>

          {/* 2. BAGIAN TENGAH: Navigasi (Role Dashboard saat Login vs Landingpage saat Tamu/di Landingpage) */}
          {user && pathname !== '/' ? (
            <nav className="navbar-center" aria-label="Navigasi Dashboard Role">
              {user.role === 'SUPERADMIN' && (
                <>
                  <Link
                    href="/superadmin/analytics"
                    className={`polaris-nav-link ${pathname.startsWith('/superadmin/analytics') ? 'active' : ''}`}
                  >
                    Analitik Provinsi
                  </Link>
                  <Link
                    href="/superadmin/users"
                    className={`polaris-nav-link ${pathname.startsWith('/superadmin/users') ? 'active' : ''}`}
                  >
                    Manajemen Pengguna
                  </Link>
                  <Link
                    href="/admin"
                    className={`polaris-nav-link ${pathname === '/admin' ? 'active' : ''}`}
                  >
                    Workbench Konservator
                  </Link>
                  <Link
                    href="/katalog"
                    className={`polaris-nav-link ${pathname.startsWith('/katalog') ? 'active' : ''}`}
                  >
                    Katalog Budaya
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className={`polaris-nav-link ${pathname === '/admin' ? 'active' : ''}`}
                  >
                    Workbench Konservator
                  </Link>
                  <Link
                    href="/superadmin/analytics"
                    className={`polaris-nav-link ${pathname.startsWith('/superadmin/analytics') ? 'active' : ''}`}
                  >
                    Analitik Wilayah
                  </Link>
                  <Link
                    href="/katalog"
                    className={`polaris-nav-link ${pathname.startsWith('/katalog') ? 'active' : ''}`}
                  >
                    Katalog Budaya
                  </Link>
                </>
              )}

              {user.role === 'PELAPOR' && (
                <>
                  <Link
                    href="/pelapor"
                    className={`polaris-nav-link ${pathname === '/pelapor' ? 'active' : ''}`}
                  >
                    Laporan Saya
                  </Link>
                  <Link
                    href="/katalog"
                    className={`polaris-nav-link ${pathname.startsWith('/katalog') ? 'active' : ''}`}
                  >
                    Katalog Budaya
                  </Link>
                  <Link
                    href="/pelapor/lapor"
                    className={`polaris-nav-link ${pathname.startsWith('/pelapor/lapor') ? 'active' : ''}`}
                  >
                    Lapor
                  </Link>
                </>
              )}
            </nav>
          ) : (
            <nav className="navbar-center" aria-label="Navigasi Bagian Landingpage">
              <Link
                href="/#beranda"
                onClick={(e) => scrollToSection(e, 'beranda')}
                className={`polaris-nav-link ${pathname === '/' && activeSection === 'beranda' ? 'active' : ''}`}
              >
                Beranda
              </Link>

              <Link
                href="/#peta"
                onClick={(e) => scrollToSection(e, 'peta')}
                className={`polaris-nav-link ${pathname === '/' && activeSection === 'peta' ? 'active' : ''}`}
              >
                Peta Sebaran
              </Link>

              <Link
                href={pathname === '/' ? '/#katalog' : '/katalog'}
                onClick={(e) => scrollToSection(e, 'katalog')}
                className={`polaris-nav-link ${
                  (pathname === '/' && activeSection === 'katalog') || pathname.startsWith('/katalog') ? 'active' : ''
                }`}
              >
                Katalog Terkini
              </Link>

              <Link
                href="/#alur-kerja"
                onClick={(e) => scrollToSection(e, 'alur-kerja')}
                className={`polaris-nav-link ${pathname === '/' && activeSection === 'alur-kerja' ? 'active' : ''}`}
              >
                Alur Kerja
              </Link>

              <Link
                href="/#statistik"
                onClick={(e) => scrollToSection(e, 'statistik')}
                className={`polaris-nav-link ${pathname === '/' && activeSection === 'statistik' ? 'active' : ''}`}
              >
                Statistik
              </Link>
            </nav>
          )}

          {/* 3. BAGIAN KANAN: Tombol Aksi & Autentikasi (Tata Letak & Tampilan Presisi 2 Tombol Seperti Landing Page) */}
          <div className="navbar-right">
            {!loading && user ? (
              <div className="polaris-desktop-actions">
                {/* Tombol Teks: Beranda jika sedang login di luar landingpage, Keluar jika di landingpage */}
                {pathname === '/' ? (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="polaris-login-link"
                    title={`Keluar dari akun (${user.nama})`}
                    style={{ opacity: isLoggingOut ? 0.6 : 1, cursor: isLoggingOut ? 'wait' : 'pointer' }}
                  >
                    {isLoggingOut ? 'Keluar...' : 'Keluar'}
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="polaris-login-link"
                    title="Kembali ke Beranda"
                  >
                    Beranda
                  </Link>
                )}

                {/* Tombol Solid CTA Aksi: Dashboard saat landingpage, Kembali saat form/profil, Profil saat dashboard */}
                {pathname === '/' ? (
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERADMIN' ? '/superadmin/analytics' : '/pelapor'}
                    className="polaris-cta-btn"
                    title="Masuk ke Dashboard"
                  >
                    {user.role === 'ADMIN' ? 'Workbench' : user.role === 'SUPERADMIN' ? 'Analitik' : 'Pelapor'}
                  </Link>
                ) : isSubPage ? (
                  <Link
                    href={backHref}
                    className="polaris-cta-btn"
                    title="Kembali ke Dashboard"
                  >
                    Kembali
                  </Link>
                ) : (
                  <Link href="/pelapor/profil" className="polaris-cta-btn" title="Profil Akun">
                    Profil
                  </Link>
                )}
              </div>
            ) : !loading ? (
              <div className="polaris-desktop-actions">
                {/* Masuk (Teks Polos seperti di referensi) */}
                <Link href="/login" className="polaris-login-link">
                  Masuk
                </Link>

                {/* Daftar (Tombol Solid menggantikan Start Free) */}
                <Link href="/register" className="polaris-cta-btn">
                  Daftar
                </Link>
              </div>
            ) : (
              <div className="polaris-desktop-actions" style={{ width: '140px', height: '36px' }} />
            )}

            {/* Theme Toggle (Hadir di Desktop & Mobile) */}
            <ThemeToggle />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-menu-btn"
              aria-label="Buka menu navigasi"
            >
              <Menu size={19} />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '1rem' }}>
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
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
          {user && pathname !== '/' ? (
            <>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.75rem' }}>
                Navigasi Dashboard
              </div>

              {/* Fitur Berdasarkan Role */}
              {user.role === 'PELAPOR' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname === '/' ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname === '/' ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname === '/' ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Compass size={16} />
                    <span>Beranda</span>
                  </Link>
                  <Link
                    href="/pelapor"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname === '/pelapor' ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname === '/pelapor' ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname === '/pelapor' ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <FileText size={16} />
                    <span>Laporan Saya</span>
                  </Link>
                  <Link
                    href="/katalog"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/katalog') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/katalog') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/katalog') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Compass size={16} />
                    <span>Katalog Budaya</span>
                  </Link>
                  <Link
                    href="/pelapor/lapor"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/pelapor/lapor') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/pelapor/lapor') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/pelapor/lapor') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <FilePlus size={16} />
                    <span>Lapor</span>
                  </Link>
                  {isSubPage ? (
                    <Link
                      href={backHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}
                    >
                      Kembali
                    </Link>
                  ) : (
                    <Link
                      href="/pelapor/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}
                    >
                      Profil
                    </Link>
                  )}
                </div>
              )}

              {user.role === 'ADMIN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname === '/' ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname === '/' ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname === '/' ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Compass size={16} />
                    <span>Beranda</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/admin') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/admin') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/admin') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Shield size={16} />
                    <span>Workbench Konservator</span>
                  </Link>
                  <Link
                    href="/superadmin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/superadmin/analytics') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/superadmin/analytics') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/superadmin/analytics') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <BarChart3 size={16} />
                    <span>Analitik Wilayah</span>
                  </Link>
                  <Link
                    href="/katalog"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/katalog') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/katalog') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/katalog') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Compass size={16} />
                    <span>Katalog Budaya</span>
                  </Link>
                  {isSubPage ? (
                    <Link
                      href={backHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}
                    >
                      Kembali
                    </Link>
                  ) : (
                    <Link
                      href="/pelapor/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}
                    >
                      Profil
                    </Link>
                  )}
                </div>
              )}

              {user.role === 'SUPERADMIN' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname === '/' ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname === '/' ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname === '/' ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Compass size={16} />
                    <span>Beranda</span>
                  </Link>
                  <Link
                    href="/superadmin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/superadmin/analytics') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/superadmin/analytics') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/superadmin/analytics') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <BarChart3 size={16} />
                    <span>Analitik Provinsi</span>
                  </Link>
                  <Link
                    href="/superadmin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/superadmin/users') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/superadmin/users') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/superadmin/users') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Users size={16} />
                    <span>Manajemen Pengguna</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname === '/admin' ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname === '/admin' ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname === '/admin' ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Shield size={16} />
                    <span>Workbench Konservator</span>
                  </Link>
                  <Link
                    href="/katalog"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: pathname.startsWith('/katalog') ? 'var(--color-brand-soft)' : 'transparent',
                      color: pathname.startsWith('/katalog') ? 'var(--action-primary)' : 'var(--text-primary)',
                      fontWeight: pathname.startsWith('/katalog') ? 600 : 500,
                      fontSize: '0.92rem',
                    }}
                  >
                    <Compass size={16} />
                    <span>Katalog Budaya</span>
                  </Link>
                  {isSubPage ? (
                    <Link
                      href={backHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}
                    >
                      Kembali
                    </Link>
                  ) : (
                    <Link
                      href="/pelapor/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}
                    >
                      Profil
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.75rem' }}>
                Bagian Landingpage
              </div>

              <Link
                href="/#beranda"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToSection(e, 'beranda');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/' && activeSection === 'beranda' ? 'var(--color-brand-soft)' : 'transparent',
                  color: pathname === '/' && activeSection === 'beranda' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/' && activeSection === 'beranda' ? 600 : 500,
                  fontSize: '0.92rem',
                }}
              >
                Beranda
              </Link>

              <Link
                href="/#peta"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToSection(e, 'peta');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/' && activeSection === 'peta' ? 'var(--color-brand-soft)' : 'transparent',
                  color: pathname === '/' && activeSection === 'peta' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/' && activeSection === 'peta' ? 600 : 500,
                  fontSize: '0.92rem',
                }}
              >
                <MapPin size={16} />
                <span>Peta Sebaran</span>
              </Link>

              <Link
                href={pathname === '/' ? '/#katalog' : '/katalog'}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToSection(e, 'katalog');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: ((pathname === '/' && activeSection === 'katalog') || pathname.startsWith('/katalog')) ? 'var(--color-brand-soft)' : 'transparent',
                  color: ((pathname === '/' && activeSection === 'katalog') || pathname.startsWith('/katalog')) ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: ((pathname === '/' && activeSection === 'katalog') || pathname.startsWith('/katalog')) ? 600 : 500,
                  fontSize: '0.92rem',
                }}
              >
                <Compass size={16} />
                <span>Katalog Terkini</span>
              </Link>

              <Link
                href="/#alur-kerja"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToSection(e, 'alur-kerja');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/' && activeSection === 'alur-kerja' ? 'var(--color-brand-soft)' : 'transparent',
                  color: pathname === '/' && activeSection === 'alur-kerja' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/' && activeSection === 'alur-kerja' ? 600 : 500,
                  fontSize: '0.92rem',
                }}
              >
                <GitBranch size={16} />
                <span>Alur Kerja Penyelamatan</span>
              </Link>

              <Link
                href="/#statistik"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  scrollToSection(e, 'statistik');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/' && activeSection === 'statistik' ? 'var(--color-brand-soft)' : 'transparent',
                  color: pathname === '/' && activeSection === 'statistik' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/' && activeSection === 'statistik' ? 600 : 500,
                  fontSize: '0.92rem',
                }}
              >
                <BarChart3 size={16} />
                <span>Statistik & Metrik</span>
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                {user ? (
                  <>
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : user.role === 'SUPERADMIN' ? '/superadmin/analytics' : '/pelapor'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="polaris-cta-btn"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {user.role === 'ADMIN' ? 'Workbench' : user.role === 'SUPERADMIN' ? 'Analitik' : 'Pelapor'}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="btn btn-outline"
                      style={{ width: '100%', color: 'var(--status-masuk)', borderColor: 'var(--border-hairline)' }}
                    >
                      {isLoggingOut ? 'Keluar...' : 'Keluar'}
                    </button>
                  </>
                ) : (
                  <>
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
                      className="polaris-cta-btn"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Logout Button at Drawer Bottom (saat di dalam dashboard) */}
        {user && pathname !== '/' && (
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="btn btn-outline"
              style={{
                width: '100%',
                color: 'var(--status-masuk)',
                borderColor: 'var(--border-hairline)',
                opacity: isLoggingOut ? 0.6 : 1,
              }}
            >
              <LogOut size={16} />
              <span>{isLoggingOut ? 'Keluar...' : 'Keluar Akun'}</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
