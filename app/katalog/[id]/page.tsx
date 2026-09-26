import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import AudioWavePlayer from '@/components/AudioWavePlayer';
import WorkflowStepper from '@/components/WorkflowStepper';
import SultengMap from '@/components/SultengMap';
import { HeritageReportItem } from '@/components/HeritageCard';
import { optimizeCloudinaryUrl } from '@/lib/imageUtils';
import PrintDossierButton from '@/components/PrintDossierButton';
import {
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  ArrowLeft,
  FileText,
  AlertCircle,
  Compass,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HeritageDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  let report = null;
  try {
    report = await prisma.heritageReport.findUnique({
      where: { id },
      include: {
        pelapor: { select: { id: true, nama: true, email: true } },
        admin: { select: { id: true, nama: true, email: true } },
      },
    });
  } catch (error) {
    console.error('Error fetching single report:', error);
  }

  if (!report) {
    notFound();
  }

  const hasRestorationComparison = Boolean(report.fotoKondisiAwal && report.fotoDigitalisasi);

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Official Print Dossier Header (Only visible on print) */}
        <div className="print-only official-print-header" style={{ marginBottom: '1.5rem', borderBottom: '2px solid #222', paddingBottom: '0.85rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Pemerintah Provinsi Sulawesi Tengah
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Dinas Kebudayaan & Balai Pelestarian Kebudayaan Wilayah XVIII
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.5rem', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
              Lembar Registrasi Dan Dokumentasi Cagar Budaya
            </div>
            <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '0.25rem' }}>
              No. Registrasi: REG-{report.id.substring(0, 8).toUpperCase()} • Tanggal Unduh Arsip: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Action Bar (Back Link & Print Button) */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link
            href="/katalog"
            className="no-print"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--action-primary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Katalog Pusaka</span>
          </Link>
          <PrintDossierButton />
        </div>

        {/* Header Metadata */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
            <span className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`}>
              {report.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Pusaka Benda'}
            </span>
            <span style={{ color: 'var(--border-hairline)', fontSize: '0.85rem' }}>/</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {report.kabupatenKota}
            </span>
            <span style={{ color: 'var(--border-hairline)', fontSize: '0.85rem' }}>/</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }} className="mono">
              REG-{report.id.substring(0, 8).toUpperCase()}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.85rem)',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: 1.15,
              fontWeight: 460,
              letterSpacing: '-0.028em',
            }}
          >
            {report.judulPusaka}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} style={{ color: 'var(--action-primary)' }} />
              <span>{report.lokasiSpesifik}, {report.kabupatenKota}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Dilaporkan {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} style={{ color: 'var(--text-muted)' }} />
              <span>Oleh: {report.pelapor?.nama}</span>
            </div>
          </div>
        </div>

        {/* Media Presentation: Before-After Slider or Single Photo */}
        <div style={{ marginBottom: '2.5rem' }}>
          {hasRestorationComparison ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Komparasi Visual Pemugaran Cagar Budaya
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Interaktif: Geser handle untuk meninjau
                </span>
              </div>
              <BeforeAfterSlider
                beforeImage={optimizeCloudinaryUrl(report.fotoKondisiAwal, 1200)}
                afterImage={optimizeCloudinaryUrl(report.fotoDigitalisasi!, 1200)}
                beforeLabel="Kondisi Krisis Awal"
                afterLabel="Hasil Konservasi Lapangan"
              />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: 'clamp(280px, 45vw, 440px)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--border-hairline)',
                background: 'var(--bg-surface)',
                position: 'relative',
              }}
            >
              <Image
                src={optimizeCloudinaryUrl(report.fotoKondisiAwal, 1200)}
                alt={report.judulPusaka}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 800px"
                style={{ objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(12, 20, 33, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                Foto Kondisi Awal Saat Dilaporkan
              </div>
            </div>
          )}
        </div>

        {/* Audio Player if available (Takbenda) */}
        {report.rekamanAudioUrl && (
          <div style={{ marginBottom: '2.5rem' }}>
            <AudioWavePlayer
              audioUrl={report.rekamanAudioUrl}
              title={`Rekaman Tradisi Lisan: ${report.judulPusaka}`}
              subtitle={`Arsip Penuturan Budaya — ${report.kabupatenKota}, Sulawesi Tengah`}
            />
          </div>
        )}

        {/* Workflow State Machine Stepper */}
        <div style={{ marginBottom: '2.5rem' }}>
          <WorkflowStepper
            currentStatus={report.status}
            adminName={report.admin?.nama}
            updatedAt={report.updatedAt ? report.updatedAt.toISOString() : undefined}
          />
        </div>

        {/* Two-Column Information Dossier */}
        <div className="dossier-grid">
          {/* Main Column: Descriptions & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Crisis Description */}
            <div className="paper-card" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <AlertCircle size={18} style={{ color: 'var(--action-primary)' }} />
                <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                  Deskripsi Ancaman & Krisis Cagar Budaya
                </h2>
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.75', color: 'var(--text-secondary)', whiteSpace: 'pre-line', margin: 0 }}>
                {report.deskripsiKrisis}
              </p>
            </div>

            {/* Conservator Field Handling Notes */}
            {report.catatanPenanganan && (
              <div
                className="paper-card"
                style={{
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                  borderLeft: '3px solid var(--action-emerald)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--action-emerald)' }} />
                  <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                    Catatan Investigasi & Tindakan Konservator Wilayah
                  </h2>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.75', color: 'var(--text-secondary)', whiteSpace: 'pre-line', margin: 0 }}>
                  {report.catatanPenanganan}
                </p>
                {report.admin && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-hairline)',
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Konservator Penanggung Jawab:{' '}
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {report.admin.nama}
                    </strong>{' '}
                    ({report.admin.email})
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column: Geolocation & Registry Facts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Geolocation Card */}
            <div className="paper-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                <Compass size={17} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                  Titik Geospasial Sulteng
                </h3>
              </div>

              <div style={{ fontSize: '0.875rem', marginBottom: '0.85rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  Wilayah Administratif
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {report.kabupatenKota}
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  Koordinat GPS
                </div>
                <div className="mono" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Lat: {report.latitude ?? '-'} <br />
                  Lng: {report.longitude ?? '-'}
                </div>
              </div>

              {/* Mini Map */}
              {report.latitude && report.longitude && (
                <div style={{ height: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                  <SultengMap reports={[report as unknown as HeritageReportItem]} height="200px" selectedId={report.id} />
                </div>
              )}
            </div>

            {/* Preservation Registry Card */}
            <div className="paper-card" style={{ padding: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.15rem' }}>
                <FileText size={17} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                  Informasi Registri
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status Registri:</span>
                  <span
                    style={{
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      background: report.status === 'SELESAI' ? 'var(--status-selesai-bg)' : 'var(--status-proses-bg)',
                      color: report.status === 'SELESAI' ? 'var(--status-selesai)' : 'var(--status-proses)',
                      border: `1px solid ${report.status === 'SELESAI' ? 'var(--status-selesai-border)' : 'var(--status-proses-border)'}`,
                    }}
                  >
                    {report.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kategori:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {report.kategori === 'TAKBENDA' ? 'Takbenda' : 'Pusaka Benda'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tingkat Ancaman:</span>
                  <span style={{ color: 'var(--action-primary)', fontWeight: 500 }}>
                    Kritis (Prioritas Lapangan)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Print Dossier Signatures (Only visible on print) */}
        <div className="print-only official-print-footer" style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #999', breakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ width: '45%' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Pelapor Lapangan / Komunitas:</p>
              <div style={{ height: '48px' }} />
              <p style={{ margin: 0, borderTop: '1px dashed #666', paddingTop: '0.3rem' }}>
                {report.pelapor?.nama || 'Masyarakat Partisipan'}
              </p>
            </div>
            <div style={{ width: '45%', textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Tim Konservator / Kurator Wilayah XVIII:</p>
              <div style={{ height: '48px' }} />
              <p style={{ margin: 0, borderTop: '1px dashed #666', paddingTop: '0.3rem' }}>
                {report.admin?.nama || 'Petugas Balai Pelestarian Kebudayaan'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
