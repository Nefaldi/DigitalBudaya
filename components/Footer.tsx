'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react';

function InstagramIcon({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

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

            {/* Logo Afiliasi Munas */}
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-hairline)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '52px',
                  height: '65px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '4px',
                  border: '1px solid var(--border-hairline)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src="/logo-munas.png"
                  alt="Logo MUNAS"
                  width={44}
                  height={58}
                  style={{ objectFit: 'contain', width: 'auto', height: '100%' }}
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '0.2rem',
                  }}
                >
                  Karya Inovasi Kegiatan
                </span>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'block',
                    lineHeight: 1.35,
                  }}
                >
                  Musyawarah Nasional (MUNAS)
                </span>
              </div>
            </div>
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

          {/* Kolom 3: Informasi Kontak & Media Sosial */}
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
              Informasi Kontak
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
                <InstagramIcon size={15} style={{ color: 'var(--action-primary)', flexShrink: 0 }} />
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  @digiculture_care
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
                <FacebookIcon size={15} style={{ color: 'var(--action-primary)', flexShrink: 0 }} />
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Digiculture Care
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
                <YoutubeIcon size={15} style={{ color: 'var(--action-primary)', flexShrink: 0 }} />
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Digiculture Care
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
                <Mail size={15} style={{ color: 'var(--action-primary)', flexShrink: 0 }} />
                <a
                  href="mailto:digiculturec@gmail.com"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  digiculturec@gmail.com
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: 'var(--text-secondary)' }}>
                <Phone size={15} style={{ color: 'var(--action-primary)', flexShrink: 0 }} />
                <span>Hotline: +62 822-1186-3324</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                <MapPin size={15} style={{ color: 'var(--action-primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>Jl. Soekarno Hatta No.KM. 9, Kota Palu, Sulawesi Tengah</span>
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
