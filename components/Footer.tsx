import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0c192c',
        color: '#f8fafc',
        paddingTop: '48px',
        paddingBottom: '36px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '36px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <Image
                src="/logo-light-transparent.png"
                alt="DigiCulture Care Logo"
                width={36}
                height={36}
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.02em' }}>
                DigiCulture Care
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.72)', marginBottom: '1.25rem', maxWidth: '340px' }}>
              Platform partisipatif penyelamatan, restorasi, dan pengarsipan digital cagar budaya megalitikum, arsitektur kayu soura, dan tradisi tutur lisan Provinsi Sulawesi Tengah.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-sandstone)', fontWeight: 500 }}>
              Edisi Khusus Sulawesi Tengah • v3.1.0
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em' }}>
              Eksplorasi Arsip Pusaka
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li>
                <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.15s ease' }}>
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/katalog" style={{ color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.15s ease' }}>
                  Katalog Terpadu
                </Link>
              </li>
              <li>
                <Link href="/katalog?kategori=BENDA" style={{ color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.15s ease' }}>
                  Cagar Budaya Megalitikum (Benda)
                </Link>
              </li>
              <li>
                <Link href="/katalog?kategori=TAKBENDA" style={{ color: 'rgba(255, 255, 255, 0.75)', transition: 'color 0.15s ease' }}>
                  Tradisi Lisan & Bahasa Daerah (Takbenda)
                </Link>
              </li>
              <li>
                <Link href="/pelapor/lapor" style={{ color: 'var(--color-sandstone)', fontWeight: 500 }}>
                  Laporkan Ancaman Cagar Budaya →
                </Link>
              </li>
            </ul>
          </div>

          {/* 13 Wilayah Administratif Sulteng */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em' }}>
              13 Wilayah Konservasi
            </h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                fontSize: '0.78rem',
              }}
            >
              {SULTENG_KABUPATEN_KOTA.map((kab) => (
                <Link
                  key={kab}
                  href={`/katalog?kabupatenKota=${encodeURIComponent(kab)}`}
                  style={{
                    padding: '0.3rem 0.55rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {kab}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.55)',
            gap: '0.75rem',
          }}
        >
          <div>
            © {new Date().getFullYear()} DigiCulture Care • Preservasi Pusaka Sulawesi Tengah.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
            <span>Lembah Besoa</span>
            <span>•</span>
            <span>Dataran Lore</span>
            <span>•</span>
            <span>Lembah Bada</span>
            <span>•</span>
            <span>Soura Kaili</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
