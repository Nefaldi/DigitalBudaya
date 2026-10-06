'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Volume2, ArrowRight } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/lib/imageUtils';

export interface HeritageReportItem {
  id: string;
  judulPusaka: string;
  kategori: 'BENDA' | 'TAKBENDA';
  lokasiSpesifik: string;
  kabupatenKota: string;
  latitude?: number | null;
  longitude?: number | null;
  deskripsiKrisis: string;
  fotoKondisiAwal: string;
  fotoDigitalisasi?: string | null;
  rekamanAudioUrl?: string | null;
  catatanPenanganan?: string | null;
  status: 'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI';
  createdAt: string;
  pelapor?: { id: string; nama: string; email: string };
  admin?: { id: string; nama: string; email: string } | null;
}

export default function HeritageCard({ report }: { report: HeritageReportItem }) {
  const displayImage = report.fotoDigitalisasi || report.fotoKondisiAwal;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return <span className="badge badge-selesai">Terverifikasi</span>;
      case 'DIPROSES':
        return <span className="badge badge-diproses">Diproses</span>;
      default:
        return <span className="badge badge-masuk">Laporan Masuk</span>;
    }
  };

  return (
    <article
      className="paper-card paper-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Photograph Container */}
      <Link
        href={`/katalog/${report.id}`}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-subtle)',
          display: 'block',
        }}
      >
        <Image
          src={optimizeCloudinaryUrl(displayImage, 600)}
          alt={report.judulPusaka}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          style={{ objectFit: 'cover' }}
        />

        {/* Minimal Category & Audio Markers */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <span className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`}>
            {report.kategori === 'TAKBENDA' ? 'Takbenda' : 'Benda'}
          </span>

          {report.rekamanAudioUrl && (
            <span
              style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 500,
                padding: '0.15rem 0.45rem',
                borderRadius: 'var(--radius-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Volume2 size={11} />
              <span>Audio</span>
            </span>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Status & Region Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
          {getStatusBadge(report.status)}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <MapPin size={11} />
            <span>{report.kabupatenKota}</span>
          </span>
        </div>

        {/* Heritage Title */}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.35rem 0', lineHeight: 1.35 }}>
          <Link href={`/katalog/${report.id}`} style={{ color: 'inherit' }}>
            {report.judulPusaka}
          </Link>
        </h3>

        {/* Specific Location */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
          {report.lokasiSpesifik}
        </div>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: '0 0 1rem 0',
            flexGrow: 1,
          }}
        >
          {report.deskripsiKrisis}
        </p>

        {/* Footer Row */}
        <div
          style={{
            borderTop: '1px solid var(--border-hairline)',
            paddingTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>

          <Link
            href={`/katalog/${report.id}`}
            style={{
              color: 'var(--text-primary)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>Buka Arsip</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
