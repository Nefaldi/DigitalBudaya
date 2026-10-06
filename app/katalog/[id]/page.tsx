import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
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

export const revalidate = 60;

export default async function HeritageDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // Wajib login untuk melihat detail arsip katalog cagar budaya
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const currentUser = token ? verifyToken(token) : null;
  if (!currentUser) {
    redirect(`/login?redirect=${encodeURIComponent(`/katalog/${id}`)}`);
  }

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
      <div className="container" style={{ maxWidth: '1040px' }}>
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
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Katalog</span>
          </Link>
          <PrintDossierButton />
        </div>

        {/* Header Metadata */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`}>
              {report.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Cagar Budaya Benda'}
            </span>
            <span style={{ color: 'var(--border-hairline)' }}>/</span>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {report.kabupatenKota}
            </span>
            <span style={{ color: 'var(--border-hairline)' }}>/</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} className="mono">
              REG-{report.id.substring(0, 8).toUpperCase()}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)',
              color: 'var(--text-primary)',
              marginBottom: '0.85rem',
              lineHeight: 1.2,
              fontWeight: 500,
              letterSpacing: '-0.025em',
            }}
          >
            {report.judulPusaka}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{report.lokasiSpesifik}, {report.kabupatenKota}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              <span>Tercatat {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={14} style={{ color: 'var(--text-muted)' }} />
              <span>Pelapor: {report.pelapor?.nama}</span>
            </div>
          </div>
        </div>

        {/* Media Presentation: Before-After Slider or Single Photo */}
        <div style={{ marginBottom: '2.5rem' }}>
          {hasRestorationComparison ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Komparasi Visual Pemugaran Cagar Budaya
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Interaktif: Geser pemisah untuk melihat perubahan
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
                backgroundColor: 'var(--bg-surface)',
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
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#ffffff',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
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

        {/* Workflow Stepper */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Crisis Description */}
            <div className="paper-card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={16} style={{ color: 'var(--status-masuk)' }} />
                <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                  Deskripsi Ancaman & Kondisi Lapangan
                </h2>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', margin: 0 }}>
                {report.deskripsiKrisis}
              </p>
            </div>

            {/* Conservator Field Handling Notes */}
            {report.catatanPenanganan && (
              <div
                className="paper-card"
                style={{
                  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                  borderLeft: '3px solid var(--status-selesai)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--status-selesai)' }} />
                  <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                    Catatan Investigasi & Tindakan Konservator
                  </h2>
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line', margin: 0 }}>
                  {report.catatanPenanganan}
                </p>
                {report.admin && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-hairline)',
                      fontSize: '0.8rem',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Geolocation Card */}
            <div className="paper-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                <Compass size={15} style={{ color: 'var(--text-primary)' }} />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                  Titik Geospasial Situs
                </h3>
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                  Wilayah Administratif
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {report.kabupatenKota}
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                  Koordinat GPS
                </div>
                <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Lat: {report.latitude ?? '-'} <br />
                  Lng: {report.longitude ?? '-'}
                </div>
              </div>

              {/* Mini Map */}
              {report.latitude && report.longitude && (
                <div style={{ height: '180px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                  <SultengMap reports={[report as unknown as HeritageReportItem]} height="180px" selectedId={report.id} />
                </div>
              )}
            </div>

            {/* Preservation Registry Card */}
            <div className="paper-card" style={{ padding: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1rem' }}>
                <FileText size={15} style={{ color: 'var(--text-primary)' }} />
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                  Informasi Registri
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status Registri:</span>
                  <span
                    className={`badge ${
                      report.status === 'SELESAI'
                        ? 'badge-selesai'
                        : report.status === 'DIPROSES'
                        ? 'badge-diproses'
                        : 'badge-masuk'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kategori:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {report.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Cagar Budaya Benda'}
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
