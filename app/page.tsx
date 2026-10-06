import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import SultengMap from '@/components/SultengMap';
import { ArrowRight, FilePlus, MapPin, Compass } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  let reports: HeritageReportItem[] = [];
  let totalVerified = 0;
  let countBenda = 0;
  let countTakbenda = 0;

  try {
    const [rawReports, count, bendaCount, takbendaCount] = await Promise.all([
      prisma.heritageReport.findMany({
        where: { status: 'SELESAI' },
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.heritageReport.count({
        where: { status: 'SELESAI' },
      }),
      prisma.heritageReport.count({
        where: { kategori: 'BENDA' },
      }),
      prisma.heritageReport.count({
        where: { kategori: 'TAKBENDA' },
      }),
    ]);

    totalVerified = count;
    countBenda = bendaCount;
    countTakbenda = takbendaCount;
    reports = rawReports.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching home data:', error);
  }

  const catalogHref = user ? '/katalog' : '/login?redirect=/katalog';
  const laporHref =
    user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user?.role === 'ADMIN'
      ? '/admin'
      : user
      ? '/pelapor/lapor'
      : '/login?redirect=/pelapor/lapor';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '6rem' }}>
      {/* 1. HERO SECTION: Curatorial Archival Frame */}
      <section className="archival-hero-section">
        <div className="container">
          <div className="archival-hero-frame">
            {/* Top Frame Meta Bar */}
            <div className="hero-meta-bar">
              <div className="hero-institution-pill">
                <span className="hero-dot-indicator" />
                <span>Balai Pelestarian Kebudayaan Wilayah XVIII</span>
                <span className="hero-separator">/</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>SULTENG ARCHIVE</span>
              </div>
              <div className="hero-geo-tag mono">
                <Compass size={13} style={{ color: 'var(--action-primary)' }} />
                <span>0°54′S 119°52′E • SULAWESI TENGAH</span>
              </div>
            </div>

            {/* Main Editorial Hero Body */}
            <div className="hero-body">
              <h1 className="hero-headline">
                Sistem Preservasi & Digitalisasi Cagar Budaya Sulawesi Tengah
              </h1>
              <p className="hero-subline">
                Dokumentasi terverifikasi megalitikum lembah purba, arsitektur pusaka, dan tradisi lisan di 13 kabupaten/kota untuk perlindungan arsip budaya komparatif.
              </p>

              {/* Action Buttons */}
              <div className="hero-actions">
                <Link href={catalogHref} className="btn btn-primary btn-lg hero-btn-primary">
                  <span>Telusuri Registri Publik</span>
                  <span className="hero-btn-count mono">[{totalVerified}]</span>
                  <ArrowRight size={15} />
                </Link>

                <Link href={laporHref} className="btn btn-secondary btn-lg hero-btn-secondary">
                  <FilePlus size={15} />
                  <span>
                    {user?.role === 'ADMIN'
                      ? 'Meja Kerja Konservator'
                      : user?.role === 'SUPERADMIN'
                      ? 'Analitik Provinsi'
                      : 'Kirim Laporan Temuan'}
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom Integrated Metrics Strip */}
            <div className="hero-metrics-strip">
              <div className="hero-metric-item">
                <span className="hero-metric-val mono">{totalVerified}</span>
                <span className="hero-metric-lbl">Arsip Terverifikasi</span>
              </div>
              <div className="hero-metric-item">
                <span className="hero-metric-val mono">13</span>
                <span className="hero-metric-lbl">Kabupaten & Kota</span>
              </div>
              <div className="hero-metric-item">
                <span className="hero-metric-val mono">{countBenda} Benda</span>
                <span className="hero-metric-lbl">Megalit & Bangunan</span>
              </div>
              <div className="hero-metric-item">
                <span className="hero-metric-val mono">{countTakbenda} Takbenda</span>
                <span className="hero-metric-lbl">Bahasa & Tradisi Tutur</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ETALASE ARSIP PILIHAN (Curated Heritage Showcase) */}
      <section className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '1.75rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '0.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              Koleksi Arsip Terverifikasi
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Objek cagar budaya yang telah tervalidasi dan terdokumentasi secara digital.
            </p>
          </div>

          <Link
            href={catalogHref}
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <span>Seluruh Katalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {reports.length > 0 ? (
          <div className="grid-cols-3">
            {reports.map((report) => (
              <HeritageCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="paper-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Belum ada arsip cagar budaya yang terverifikasi rilis publik.
            </p>
          </div>
        )}
      </section>

      {/* 3. PETA SEBARAN SITUS SULAWESI TENGAH */}
      <section id="peta" className="container" style={{ scrollMarginTop: '80px' }}>
        <div
          style={{
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            <MapPin size={13} />
            <span>Georeferensi Wilayah</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Peta Sebaran Situs & Warisan Adat
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Persebaran titik koordinat cagar budaya di 13 kabupaten dan kota se-Sulawesi Tengah.
          </p>
        </div>

        <div
          className="paper-card"
          style={{
            padding: '0.5rem',
            overflow: 'hidden',
          }}
        >
          <SultengMap reports={reports} height="460px" />
        </div>
      </section>
    </div>
  );
}
