'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  MapPin,
  GitBranch,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
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

  // Observer stabil untuk mendeteksi seksi landingpage yang aktif tanpa flicker/glitch
  useEffect(() => {
    if (pathname !== '/') return;

    const sections = ['beranda', 'statistik', 'peta', 'katalog', 'alur-kerja'];
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
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
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

  return (
    <>
      {/* Header Standar Full-Width (Bentuk Asli Tanpa Glitch) */}
      <header className="navbar-header">
        <div className="container navbar-container">
          {/* 1. BAGIAN KIRI: Logo & Identitas Brand DigiCulture Care */}
          <div className="navbar-left">
            <Link
              href="/"
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

          {/* 2. BAGIAN TENGAH: Tombol Fitur / Bagian Landingpage (Gaya Polaris dengan Underline Stabil) */}
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
              href="/#katalog"
              onClick={(e) => scrollToSection(e, 'katalog')}
              className={`polaris-nav-link ${
                pathname === '/' && activeSection === 'katalog' ? 'active' : ''
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

          {/* 3. BAGIAN KANAN: Tombol Log in & Register (Solid Button) */}
          <div className="navbar-right">
            {!loading && user ? (
              <div className="polaris-desktop-actions">
                {/* Tautan Dashboard Role */}
                {user.role === 'PELAPOR' && (
                  <Link href="/pelapor" className="polaris-login-link">
                    Laporan Saya
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="polaris-login-link">
                    Workbench
                  </Link>
                )}
                {user.role === 'SUPERADMIN' && (
                  <Link href="/superadmin/analytics" className="polaris-login-link">
                    Analitik
                  </Link>
                )}

                {/* Tombol Solid CTA Aksi */}
                {user.role === 'PELAPOR' && (
                  <Link href="/pelapor/lapor" className="polaris-cta-btn">
                    <FilePlus size={15} />
                    <span>Lapor Pusaka</span>
                  </Link>
                )}
                {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                  <Link href="/pelapor/lapor" className="polaris-cta-btn">
                    <FilePlus size={15} />
                    <span>Input Laporan</span>
                  </Link>
                )}

                {/* Profil Pengguna Ringkas */}
                <div className="polaris-user-chip">
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.nama.split(' ')[0]}
                  </span>
                  {getRoleBadge(user.role)}
                </div>

                {/* Tombol Logout */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Keluar (Logout)"
                  style={{ padding: '0.4rem', height: '36px', width: '36px' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : !loading ? (
              <div className="polaris-desktop-actions">
                {/* Log in (Teks Polos seperti di referensi) */}
                <Link href="/login" className="polaris-login-link">
                  Log in
                </Link>

                {/* Register (Tombol Solid menggantikan Start Free) */}
                <Link href="/register" className="polaris-cta-btn">
                  Register
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

        {/* Navigation Links (Fitur Landingpage) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
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
            <span>Peta Sebaran Pusaka</span>
          </Link>

          <Link
            href="/#katalog"
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
              background: pathname === '/' && activeSection === 'katalog' ? 'var(--color-brand-soft)' : 'transparent',
              color: pathname === '/' && activeSection === 'katalog' ? 'var(--action-primary)' : 'var(--text-primary)',
              fontWeight: pathname === '/' && activeSection === 'katalog' ? 600 : 500,
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

          {/* Fitur Berdasarkan Role */}
          {user?.role === 'PELAPOR' && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
              <Link
                href="/pelapor"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: pathname === '/pelapor' ? 'var(--color-brand-soft)' : 'transparent',
                  color: pathname === '/pelapor' ? 'var(--action-primary)' : 'var(--text-primary)',
                  fontWeight: pathname === '/pelapor' ? 600 : 500,
                  fontSize: '0.92rem',
                }}
              >
                Dashboard Laporan Saya
              </Link>
              <Link
                href="/pelapor/lapor"
                onClick={() => setMobileMenuOpen(false)}
                className="polaris-cta-btn"
                style={{ marginTop: '0.65rem', width: '100%' }}
              >
                <FilePlus size={16} /> Lapor Pusaka Baru
              </Link>
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
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
                href="/pelapor/lapor"
                onClick={() => setMobileMenuOpen(false)}
                className="polaris-cta-btn"
                style={{ marginTop: '0.65rem', width: '100%' }}
              >
                <FilePlus size={16} /> Input Laporan Lapangan
              </Link>
            </div>
          )}

          {user?.role === 'SUPERADMIN' && (
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)' }}>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
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
            </div>
          )}

          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="polaris-cta-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Register
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
