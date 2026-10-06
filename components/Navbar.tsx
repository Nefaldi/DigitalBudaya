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
  LogIn,
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

  // Center navigation rail (clean text typography without icons inside rail, matching Mantikole)
  const navLinks = [
    { label: 'Beranda', href: '/', active: pathname === '/' },
    { label: 'Katalog', href: '/katalog', active: pathname.startsWith('/katalog') },
    { label: 'Peta', href: '/#peta', active: false },
  ];

  if (user?.role === 'SUPERADMIN') {
    navLinks.push(
      { label: 'Analitik', href: '/superadmin/analytics', active: pathname.startsWith('/superadmin/analytics') },
      { label: 'Pengguna', href: '/superadmin/users', active: pathname.startsWith('/superadmin/users') }
    );
  } else if (user?.role === 'ADMIN') {
    navLinks.push({ label: 'Workbench', href: '/admin', active: pathname.startsWith('/admin') });
  } else if (user?.role === 'PELAPOR') {
    navLinks.push(
      { label: 'Laporan Saya', href: '/pelapor', active: pathname === '/pelapor' },
      { label: 'Profil', href: '/pelapor/profil', active: pathname.startsWith('/pelapor/profil') }
    );
  }

  const laporHref =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user
      ? '/pelapor/lapor'
      : '/login?redirect=/pelapor/lapor';

  const cmsHref =
    user?.role === 'ADMIN'
      ? '/admin'
      : user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user
      ? '/pelapor'
      : '/login';

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

        {/* Center Pill Navigation Rail (Desktop) - Clean typography text pills */}
        <nav className="mantikole-nav-rail">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mantikole-nav-item ${link.active ? 'is-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons Section (Right) - Exactly matching Mantikole dual button layout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Desktop Dual Action Buttons (Outline Pill + Solid Pill) */}
          <div className="mantikole-desktop-action" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Button 1: White Outline Pill with FileText icon (Lapor Pusaka / Lacak Resi) */}
            <Link
              href={laporHref}
              className="mantikole-action-pill mantikole-action-pill-outline"
            >
              <FileText size={13} className="text-slate-600 dark:text-zinc-400" />
              <span>Lapor Pusaka</span>
            </Link>

            {/* Button 2: Solid Dark Pill with LogIn icon (Masuk) */}
            <Link
              href={cmsHref}
              className="mantikole-action-pill mantikole-action-pill-primary"
            >
              <LogIn size={13} />
              <span>Masuk</span>
            </Link>

            {/* Optional Logout pill for logged in users */}
            {!loading && user && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mantikole-action-pill mantikole-action-pill-outline"
                style={{ color: 'var(--action-danger)', padding: '0.38rem 0.65rem' }}
                title={`Keluar Akun (${user.nama})`}
              >
                <LogOut size={13} />
                <span>{isLoggingOut ? '...' : 'Keluar'}</span>
              </button>
            )}
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`mantikole-mobile-item ${link.active ? 'mantikole-mobile-item-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          {/* Bottom Dual Action Buttons in Drawer */}
          <div
            style={{
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-hairline)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Link
              href={laporHref}
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
              href={cmsHref}
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

            {user && (
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
            )}
          </div>
        </div>
      )}
    </header>
  );
}
