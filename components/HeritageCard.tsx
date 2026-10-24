'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
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
  status: 'LAPORAN_MASUK' | 'DIPROSES' | 'MENUNGGU_VALIDASI' | 'SELESAI';
  createdAt: string;
  updatedAt?: string | Date;
  pelapor?: { id: string; nama: string; email: string };
  admin?: { id: string; nama: string; email: string } | null;
}

export interface HeritageCardProps {
  report: HeritageReportItem;
  hideOpenArchive?: boolean;
}

export default function HeritageCard({ report, hideOpenArchive = false }: HeritageCardProps) {
  const displayImage = report.fotoDigitalisasi || report.fotoKondisiAwal;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return <span className="badge badge-selesai">Selesai & Terbit</span>;
      case 'MENUNGGU_VALIDASI':
        return <span className="badge badge-validasi">Menunggu Validasi</span>;
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
        borderRadius: 'var(--radius-md, 12px)',
      }}
    >
      {/* Photograph Container */}
      <Link
        href={`/katalog/${report.id}`}
        className="heritage-card-img-wrap"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-subtle)',
          display: 'block',
        }}
        title={`Buka arsip ${report.judulPusaka}`}
      >
        <Image
          src={optimizeCloudinaryUrl(displayImage, 600)}
          alt={report.judulPusaka}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          style={{ objectFit: 'cover' }}
        />

        {/* Minimal Category & Digitalization Markers */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`}
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.16)',
              fontWeight: 600,
            }}
          >
            {report.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Cagar Budaya Benda'}
          </span>

          {report.fotoDigitalisasi && (
            <span
              className="badge"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.72)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                fontSize: '0.68rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                gap: '0.25rem',
              }}
            >
              <Sparkles size={11} style={{ color: '#fbbf24' }} />
              <span>Terdigitalisasi</span>
            </span>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Status & Region Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          {getStatusBadge(report.status)}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <MapPin size={12} style={{ color: 'var(--action-primary)' }} />
            <span>{report.kabupatenKota}</span>
          </span>
        </div>

        {/* Heritage Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 0.25rem 0',
            lineHeight: 1.35,
          }}
        >
          <Link
            href={`/katalog/${report.id}`}
            style={{
              color: 'inherit',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            className="heritage-card-title-link"
          >
            {report.judulPusaka}
          </Link>
        </h3>

        {/* Specific Location */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
          {report.lokasiSpesifik}
        </div>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.84rem',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: '0 0 1rem 0',
          }}
        >
          {report.deskripsiKrisis}
        </p>

        {/* Footer Row */}
        <div
          style={{
            borderTop: '1px solid var(--border-hairline)',
            paddingTop: '0.75rem',
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            {report.pelapor?.nama && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Oleh <strong style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{report.pelapor.nama}</strong>
              </span>
            )}
          </div>

          {!hideOpenArchive && (
            <Link
              href={`/katalog/${report.id}`}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.76rem',
                padding: '0.35rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <span>Buka Arsip</span>
              <ArrowRight size={12} className="heritage-card-arrow" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
