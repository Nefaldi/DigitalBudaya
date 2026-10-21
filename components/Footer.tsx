'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="no-print"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-hairline)',
        paddingTop: '3rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid var(--border-hairline)',
          }}
        >
          {/* Kolom 1: Identitas & Visi Platform */}
          <div style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                <Image
                  src="/logo-transparent.png"
                  alt="Logo DigiCulture Care"
                  width={28}
                  height={28}
                  className="logo-light-variant"
                  style={{ objectFit: 'contain' }}
                />
                <Image
                  src="/logo-light-transparent.png"
                  alt="Logo DigiCulture Care"
                  width={28}
                  height={28}
                  className="logo-dark-variant"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                DigiCulture Care
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              Platform terintegrasi pelestarian, dokumentasi geospasial, dan penyelamatan cagar budaya megalitikum serta tradisi tutur lisan di 13 kabupaten dan kota Provinsi Sulawesi Tengah.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat & Eksplorasi */}
          <div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Navigasi Cepat
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li>
                <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Beranda Sistem
                </Link>
              </li>
              <li>
                <Link href="/katalog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Katalog Cagar Budaya
                </Link>
              </li>
              <li>
                <Link href="/#peta" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Peta Sebaran Geospasial
                </Link>
              </li>
              <li>
                <Link href="/#statistik" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Statistik & Preservasi
                </Link>
              </li>
              <li>
                <Link href="/pelapor/lapor" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Formulir Lapor Budaya
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Modul & Fitur Unggulan Lomba */}
          <div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Fitur & Modul Inovasi
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li>
                <Link href="/katalog?kategori=BENDA" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Cagar Budaya Benda (Megalitik & Situs)
                </Link>
              </li>
              <li>
                <Link href="/katalog?kategori=TAKBENDA" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  Warisan Takbenda (Tradisi Lisan & Bahasa)
                </Link>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>
                  Komparator Restorasi Before-After
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>
                  Ekspor Lembar Dossier Resmi Standar A4
                </span>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)' }}>
                  Kompresi Citra Canvas & Geofencing GPS
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} DigiCulture Care — Karya Inovasi Digital Pelestarian Budaya Daerah.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span>Sulawesi Tengah, Indonesia</span>
            <button
              onClick={scrollToTop}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
              }}
              title="Kembali ke bagian paling atas halaman"
            >
              <span>Ke Atas</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
