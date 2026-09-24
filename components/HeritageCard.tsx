'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Volume2, ShieldCheck, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
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

export { optimizeCloudinaryUrl };

export default function HeritageCard({ report }: { report: HeritageReportItem }) {
  const displayImage = report.fotoDigitalisasi || report.fotoKondisiAwal;
  const isRestored = Boolean(report.fotoDigitalisasi);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return (
          <span className="badge badge-selesai">
            <ShieldCheck size={12} />
            <span>Terverifikasi</span>
          </span>
        );
      case 'DIPROSES':
        return (
          <span className="badge badge-diproses">
            <Clock size={12} />
            <span>Ditangani</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-masuk">
            <AlertTriangle size={12} />
            <span>Antrean</span>
          </span>
        );
    }
  };

  return (
    <div className="paper-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
      {/* Photograph Container */}
      <div style={{ position: 'relative', width: '100%', height: '210px', overflow: 'hidden', background: 'var(--bg-subtle)' }}>
        <Image
          src={optimizeCloudinaryUrl(displayImage, 600)}
          alt={report.judulPusaka}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          style={{
            objectFit: 'cover',
          }}
          className="heritage-card-img"
        />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <span className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`} style={{ backdropFilter: 'blur(8px)' }}>
            {report.kategori === 'TAKBENDA' ? 'Takbenda' : 'Pusaka Benda'}
          </span>

          {isRestored && (
            <span style={{
              background: 'rgba(38, 82, 57, 0.92)',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 500,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
              letterSpacing: '0.02em',
            }}>
              Terdigitalisasi
            </span>
          )}
        </div>

        {/* Audio Indicator */}
        {report.rekamanAudioUrl && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(140, 53, 30, 0.92)',
            backdropFilter: 'blur(6px)',
            color: '#ffffff',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.72rem',
            fontWeight: 500,
          }}>
            <Volume2 size={12} />
            <span>Audio</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Status & Location Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem' }}>
          {getStatusBadge(report.status)}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <MapPin size={12} />
            <span>{report.kabupatenKota}</span>
          </div>
        </div>

        {/* Heritage Title */}
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text-primary)', fontWeight: 500 }}>
          {report.judulPusaka}
        </h3>

        {/* Specific Location subtitle */}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          {report.lokasiSpesifik}
        </div>

        {/* Description snippet */}
        <p style={{
          fontSize: '0.86rem',
          lineHeight: '1.5',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          flexGrow: 1,
        }}>
          {report.deskripsiKrisis}
        </p>

        {/* Card Footer Action */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>

          <Link
            href={`/katalog/${report.id}`}
            className="link-editorial"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.84rem' }}
          >
            <span>Buka Dossier</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
