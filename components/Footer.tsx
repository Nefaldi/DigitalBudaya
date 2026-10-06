'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer
      className="no-print"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-hairline)',
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-hairline)',
          }}
        >
          {/* Identity */}
          <div style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                <Image
                  src="/logo-transparent.png"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="logo-light-variant"
                  style={{ objectFit: 'contain' }}
                />
                <Image
                  src="/logo-light-transparent.png"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="logo-dark-variant"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                DigitalBudaya
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Sistem inventarisasi dan penyelamatan cagar budaya kebendaan serta warisan takbenda di 13 kabupaten dan kota Provinsi Sulawesi Tengah.
            </p>
          </div>

          {/* Navigasi Arsip */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Arsip & Layanan
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>
                <Link href="/katalog" style={{ color: 'var(--text-secondary)' }}>
                  Katalog Cagar Budaya
                </Link>
              </li>
              <li>
                <Link href="/katalog?kategori=BENDA" style={{ color: 'var(--text-secondary)' }}>
                  Pusaka Benda (Megalitik & Arsitektur)
                </Link>
              </li>
              <li>
                <Link href="/katalog?kategori=TAKBENDA" style={{ color: 'var(--text-secondary)' }}>
                  Warisan Takbenda (Tradisi Lisan)
                </Link>
              </li>
              <li>
                <Link href="/pelapor/lapor" style={{ color: 'var(--text-secondary)' }}>
                  Formulir Laporan Lapangan
                </Link>
              </li>
            </ul>
          </div>

          {/* Instansi Pembina */}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instansi Pembina
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Balai Pelestarian Kebudayaan (BPK) Wilayah XVIII & Dinas Kebudayaan Provinsi Sulawesi Tengah.
            </p>
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
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} DigitalBudaya Sulawesi Tengah. Seluruh hak cipta dilindungi.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Standar Pencatatan Ditjen Kebudayaan RI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
