import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import SultengMap from '@/components/SultengMap';
import HeroBackground from '@/components/HeroBackground';
import { FilePlus, MapPin, Compass, ChevronDown, Landmark, Sparkles, Layers, BookOpen } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  let reports: HeritageReportItem[] = [];
  let mapReports: HeritageReportItem[] = [];
  let totalVerified = 0;
  let countBenda = 0;
  let countTakbenda = 0;

  try {
    const [rawReports, count, bendaCount, takbendaCount, rawMapReports] = await Promise.all([
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
      prisma.heritageReport.findMany({
        where: {
          status: 'SELESAI',
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          id: true,
          judulPusaka: true,
          kategori: true,
          lokasiSpesifik: true,
          kabupatenKota: true,
          latitude: true,
          longitude: true,
          fotoKondisiAwal: true,
          fotoDigitalisasi: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
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
    mapReports = rawMapReports.map((r) => ({
      ...r,
      deskripsiKrisis: '',
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching home data:', error);
  }

  const catalogHref = '/katalog';
  const laporHref =
    user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user?.role === 'ADMIN'
      ? '/admin'
      : user
      ? '/pelapor/lapor'
      : '/login?redirect=/pelapor/lapor';

  return (
    <div className="homepage-root">
      {/* 1. HERO SECTION: Full-screen DigiCulture-style Immersive Hero */}
      <section className="digiculture-hero-section">
        {/* Dynamic Zoom-In and Scroll Zoom-Out Background (Rumah Adat Souraja) */}
        <HeroBackground src="/rumahadatsouraja.webp" alt="Rumah Adat Souraja Sulawesi Tengah" />

        {/* Center Content Container */}
        <div className="digiculture-hero-content">
          {/* Main Giant Headline */}
          <h1 className="digiculture-hero-title">
            DIGICULTURE CARE
          </h1>

          {/* Slogan */}
          <p className="digiculture-hero-slogan">
            Digitalisasi Warisan Budaya Sulteng yang Terancam Dilupakan
          </p>

          {/* Subtitle */}
          <p className="digiculture-hero-subtitle">
            Platform Penyelamatan & Dokumentasi Warisan Budaya Sulawesi Tengah
          </p>

          {/* Action Buttons */}
          <div className="digiculture-hero-actions">
            <Link href={catalogHref} className="digiculture-hero-btn-primary">
              <BookOpen size={15} />
              <span>Telusuri Katalog Budaya</span>
            </Link>

            <Link href={laporHref} className="digiculture-hero-btn-secondary">
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

          {/* Scroll Down Indicator */}
          <div className="digiculture-hero-scroll-wrap">
            <a href="#statistik" className="digiculture-hero-scroll">
              <span>scroll ke bawah</span>
              <ChevronDown size={16} className="digiculture-scroll-icon" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK & POTENSI WILAYAH (DigiCulture Stat Cards) */}
      <section id="statistik" className="container" style={{ scrollMarginTop: '90px' }}>
        <div className="digiculture-stats-header">
          <div className="digiculture-section-tag">
            <span className="digiculture-tag-dot" />
            <span className="mono">RINGKASAN PRESERVASI PROVINSI</span>
          </div>
          <h2 className="digiculture-stats-title">
            Cakupan Dokumentasi & Warisan Budaya
          </h2>
          <p className="digiculture-stats-desc">
            Agregasi data digitalisasi cagar budaya resmi Balai Pelestarian Kebudayaan Wilayah XVIII se-Sulawesi Tengah.
          </p>
        </div>

        <div className="digiculture-stats-grid">
          <div className="digiculture-stat-card">
            <div className="digiculture-stat-top">
              <span className="digiculture-stat-lbl">ARSIP TERVERIFIKASI</span>
              <div className="digiculture-stat-icon-wrap">
                <Landmark size={18} />
              </div>
            </div>
            <div className="digiculture-stat-val-row">
              <span className="digiculture-stat-val mono">{totalVerified}</span>
              <span className="digiculture-stat-unit">Dossier</span>
            </div>
            <p className="digiculture-stat-text">
              Objek cagar budaya yang telah diautentikasi dan terverifikasi secara formal oleh tim kurator.
            </p>
          </div>

          <div className="digiculture-stat-card">
            <div className="digiculture-stat-top">
              <span className="digiculture-stat-lbl">KABUPATEN & KOTA</span>
              <div className="digiculture-stat-icon-wrap">
                <Compass size={18} />
              </div>
            </div>
            <div className="digiculture-stat-val-row">
              <span className="digiculture-stat-val mono">13</span>
              <span className="digiculture-stat-unit">Wilayah</span>
            </div>
            <p className="digiculture-stat-text">
              Sebaran titik cagar budaya di seluruh kabupaten/kota dari Lore Lindu hingga Kepulauan Banggai.
            </p>
          </div>

          <div className="digiculture-stat-card">
            <div className="digiculture-stat-top">
              <span className="digiculture-stat-lbl">CAGAR BUDAYA BENDA</span>
              <div className="digiculture-stat-icon-wrap">
                <Layers size={18} />
              </div>
            </div>
            <div className="digiculture-stat-val-row">
              <span className="digiculture-stat-val mono">{countBenda}</span>
              <span className="digiculture-stat-unit">Situs & Objek</span>
            </div>
            <p className="digiculture-stat-text">
              Patung megalit purba, arsitektur Banawa/Souraja, benteng kolonial, dan artefak fisik.
            </p>
          </div>

          <div className="digiculture-stat-card">
            <div className="digiculture-stat-top">
              <span className="digiculture-stat-lbl">WARISAN TAKBENDA</span>
              <div className="digiculture-stat-icon-wrap">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="digiculture-stat-val-row">
              <span className="digiculture-stat-val mono">{countTakbenda}</span>
              <span className="digiculture-stat-unit">Tradisi Tutur</span>
            </div>
            <p className="digiculture-stat-text">
              Bahasa daerah, seni pertunjukan tradisional, ritus adat, dan sistem pengetahuan lokal.
            </p>
          </div>
        </div>
      </section>

      {/* 2. ETALASE ARSIP PILIHAN (Curated Heritage Showcase) */}
      <section id="katalog-terkini" className="container" style={{ scrollMarginTop: '80px' }}>
        <div
          style={{
            marginBottom: '1.75rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '0.75rem',
          }}
        >
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Katalog Terkini
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Objek cagar budaya yang telah tervalidasi dan terdokumentasi secara digital.
          </p>
        </div>

        {reports.length > 0 ? (
          <>
            <div className="grid-cols-3">
              {reports.map((report) => (
                <HeritageCard key={report.id} report={report} hideOpenArchive />
              ))}
            </div>

            <div style={{ marginTop: '2.25rem', textAlign: 'center' }}>
              <Link
                href="/katalog"
                className="digiculture-hero-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.75rem',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                }}
              >
                <BookOpen size={15} />
                <span>Lihat Seluruh Katalog Budaya ({totalVerified})</span>
              </Link>
            </div>
          </>
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
          <SultengMap reports={mapReports.length > 0 ? mapReports : reports} height="460px" />
        </div>
      </section>
    </div>
  );
}
