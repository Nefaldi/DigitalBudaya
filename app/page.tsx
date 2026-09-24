import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import SultengMap from '@/components/SultengMap';
import { FilePlus, ArrowRight, Landmark } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let reports: HeritageReportItem[] = [];
  let stats = { total: 0, selesai: 0, diproses: 0, masuk: 0 };

  try {
    const [rawReports, statusGroups] = await Promise.all([
      prisma.heritageReport.findMany({
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.heritageReport.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    reports = rawReports.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    let total = 0;
    let selesai = 0;
    let diproses = 0;
    let masuk = 0;

    for (const group of statusGroups) {
      const count = group._count._all;
      total += count;
      if (group.status === 'SELESAI') selesai = count;
      else if (group.status === 'DIPROSES') diproses = count;
      else if (group.status === 'LAPORAN_MASUK') masuk = count;
    }

    stats = { total, selesai, diproses, masuk };
  } catch (error) {
    console.error('Error fetching home data:', error);
  }

  return (
    <div>
      {/* Editorial Hero Section (Central Sulawesi Cultural Earth) */}
      <section
        style={{
          paddingTop: 'clamp(2.5rem, 6vw, 4.5rem)',
          paddingBottom: 'clamp(2.5rem, 6vw, 4.5rem)',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        <div className="container" style={{ maxWidth: '960px', textAlign: 'center' }}>
          {/* Institutional Header Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.85rem',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--color-terracotta-soft)',
              border: '1px solid var(--border-hairline)',
              fontSize: '0.78rem',
              color: 'var(--action-primary)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              marginBottom: '1.5rem',
            }}
          >
            <Landmark size={14} style={{ color: 'var(--action-primary)' }} />
            <span>Sistem Registrasi & Penyelamatan Cagar Budaya Sulawesi Tengah</span>
          </div>

          {/* Headline (Fluid Mobile-to-Desktop Scaling) */}
          <h1
            style={{
              fontSize: 'clamp(1.9rem, 5.2vw, 3.2rem)',
              fontWeight: 500,
              lineHeight: 1.12,
              letterSpacing: '-0.028em',
              marginBottom: '1.25rem',
              color: 'var(--text-primary)',
            }}
          >
            Menjaga Napas Peradaban Megalitik & Sastra Lisan Bumi Tadulako
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2.25rem',
              maxWidth: '720px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Platform geospasial terpadu untuk mendokumentasikan kalamba megalitikum Lembah Besoa, arsitektur vernakular Tambi, serta melindungi ratusan tradisi tutur dan bahasa lokal se-Provinsi Sulawesi Tengah.
          </p>

          {/* Action Hierarchy (Full width on mobile, side-by-side on desktop) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
              marginBottom: '3rem',
            }}
          >
            <Link href="/katalog" className="btn btn-primary btn-lg btn-mobile-block">
              <span>Jelajahi Direktori Pusaka</span>
              <ArrowRight size={17} />
            </Link>
            <Link href="/pelapor/lapor" className="btn btn-secondary btn-lg btn-mobile-block">
              <FilePlus size={17} />
              <span>Laporkan Ancaman Pusaka</span>
            </Link>
          </div>

          {/* Key Metrics Strip (Mobile: 2x2 grid, Desktop: 4 columns) */}
          <div
            className="paper-card grid-cols-2-mobile"
            style={{
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Pusaka Terdata
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--status-selesai)', lineHeight: 1.1 }}>
                {stats.selesai}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Tuntas Digitalisasi
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--status-diproses)', lineHeight: 1.1 }}>
                {stats.diproses}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Dalam Penanganan
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--status-masuk)', lineHeight: 1.1 }}>
                {stats.masuk}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Antrean Kritis
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Band: Lindu Forest Emerald (Full-Bleed Map Section) */}
      <section className="deep-lagoon-band">
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--color-sandstone)',
                fontWeight: 500,
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
              }}
            >
              Sebaran Geospasial Sulteng
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', marginBottom: '0.5rem', color: '#ffffff' }}>
              Peta Sebaran Pusaka Benda & Takbenda
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              Jelajahi titik koordinat situs megalitik purba, rumah adat, dan dokumentasi sastra lisan di 13 Kabupaten/Kota se-Sulawesi Tengah.
            </p>
          </div>

          {/* Interactive Leaflet Map (Safe Touch Scrolling) */}
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <SultengMap reports={reports} height="clamp(300px, 48vw, 500px)" />
          </div>
        </div>
      </section>

      {/* Featured Heritage Dossiers (Mobile: 1 col, Desktop: 3 cols) */}
      <section style={{ paddingTop: 'clamp(2.5rem, 5vw, 4.5rem)', paddingBottom: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--action-primary)', fontWeight: 500, marginBottom: '0.35rem' }}>
                Katalog Dokumentasi Terkini
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', color: 'var(--text-primary)', margin: 0 }}>
                Arsip Cagar Budaya Terverifikasi
              </h2>
            </div>

            <Link
              href="/katalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--action-primary)',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              <span>Lihat Semua Katalog</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {reports.length > 0 ? (
            <div className="grid-cols-3">
              {reports.map((report) => (
                <HeritageCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <div className="paper-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>Belum ada laporan cagar budaya yang dirilis.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3-Step Preservation Workflow Section */}
      <section
        style={{
          paddingTop: 'clamp(2.5rem, 5vw, 4rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 4rem)',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-hairline)',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--action-primary)', fontWeight: 500, marginBottom: '0.35rem' }}>
              Alur Kerja Transparan
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', marginBottom: '0.4rem' }}>
              Bagaimana Inisiatif Penyelamatan Berjalan?
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
              Mekanisme akuntabel dari partisipasi masyarakat hingga restorasi fisik dan pengarsipan digital terbuka.
            </p>
          </div>

          <div className="grid-cols-3">
            <div className="paper-card">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-terracotta-soft)',
                  color: 'var(--action-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', fontWeight: 500 }}>
                Laporan Partisipatif
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Masyarakat dan Sahabat Budaya melaporkan ancaman kerusakan fisik atau kepunahan tradisi dengan koordinat GPS dan foto bukti awal.
              </p>
            </div>

            <div className="paper-card">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-emerald-soft)',
                  color: 'var(--action-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', fontWeight: 500 }}>
                Investigasi Konservator
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Konservator wilayah memvalidasi laporan, mengambil alih tiket status, serta melakukan intervensi konservasi fisik maupun perekaman audio.
              </p>
            </div>

            <div className="paper-card">
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-sandstone-soft)',
                  color: 'var(--color-sandstone)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem', fontWeight: 500 }}>
                Digitalisasi Terbuka
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Hasil dokumentasi resolusi tinggi dan rekaman audio penutur asli diarsipkan secara digital dan dirilis ke Katalog Publik untuk edukasi dan riset.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
