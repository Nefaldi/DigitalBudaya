import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import FeaturedCarousel, { CarouselSlideItem } from '@/components/FeaturedCarousel';
import SultengMap from '@/components/SultengMap';
import HeroBackground from '@/components/HeroBackground';
import { ArrowRight, FilePlus, MapPin, Compass, ChevronDown, Landmark, Sparkles, Layers } from 'lucide-react';

export const revalidate = 60;

function formatRelativeTime(dateInput: string | Date): string {
  const now = new Date();
  const date = new Date(dateInput);
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  const diffInHours = Math.floor(diffInSeconds / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} hari yang lalu`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} bulan yang lalu`;
  return `${Math.floor(diffInMonths / 12)} tahun yang lalu`;
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  let reports: HeritageReportItem[] = [];
  let totalVerified = 0;
  let countBenda = 0;
  let countTakbenda = 0;
  let carouselItems: CarouselSlideItem[] = [];

  try {
    const [rawReports, count, bendaCount, takbendaCount, latestDbReports] = await Promise.all([
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
        include: {
          pelapor: { select: { id: true, nama: true, email: true } },
          admin: { select: { id: true, nama: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
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

    const spotlightReports = rawReports.length >= 2 ? rawReports : latestDbReports;
    carouselItems = spotlightReports.map((r) => ({
      id: r.id,
      title: r.judulPusaka,
      category:
        r.kategori === 'BENDA'
          ? (r.status === 'SELESAI' ? 'BENDA PUSAKA' : 'CAGAR BUDAYA')
          : (r.status === 'SELESAI' ? 'TRADISI TAKBENDA' : 'WARISAN TUTUR'),
      categoryColor: r.kategori === 'BENDA' ? '#18181b' : '#166534',
      imageUrl: r.fotoDigitalisasi || r.fotoKondisiAwal,
      timeAgo: formatRelativeTime(r.createdAt),
      author: r.pelapor?.nama || 'Kontributor Budaya',
      href: `/katalog/${r.id}`,
      location: r.kabupatenKota,
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
    <div className="homepage-root">
      {/* 1. HERO SECTION: Full-screen Mantikole-style Immersive Hero */}
      <section className="mantikole-hero-section">
        {/* Dynamic Zoom-In and Scroll Zoom-Out Background (Rumah Adat Banawa - Souraja) */}
        <HeroBackground src="/rumahadat.jpeg" alt="Rumah Adat Banawa (Souraja) Sulawesi Tengah" />

        {/* Center Content Container */}
        <div className="mantikole-hero-content">
          {/* Institutional Badge Pill */}
          <div className="mantikole-hero-badge">
            <span className="mantikole-hero-badge-dot" />
            <span>Balai Pelestarian Kebudayaan Wilayah XVIII</span>
            <span className="mantikole-hero-badge-sep">/</span>
            <span className="mono">0°54′S 119°52′E • SULAWESI TENGAH</span>
          </div>

          {/* Main Giant Headline */}
          <h1 className="mantikole-hero-title">
            DIGICULTURE
          </h1>

          {/* Slogan */}
          <p className="mantikole-hero-slogan">
            Sistem Preservasi & Digitalisasi Cagar Budaya Sulawesi Tengah
          </p>

          {/* Subtitle */}
          <p className="mantikole-hero-subtitle">
            Dokumentasi terverifikasi megalitikum lembah purba, arsitektur pusaka, dan tradisi lisan di 13 kabupaten/kota untuk perlindungan arsip budaya komparatif.
          </p>

          {/* Action Buttons */}
          <div className="mantikole-hero-actions">
            <Link href={catalogHref} className="mantikole-hero-btn-primary">
              <span>Telusuri Katalog Terkini</span>
              <span className="mantikole-hero-btn-count mono">[{totalVerified}]</span>
              <ArrowRight size={15} />
            </Link>

            <Link href={laporHref} className="mantikole-hero-btn-secondary">
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
          <div className="mantikole-hero-scroll-wrap">
            <a href="#ringkasan-preservasi" className="mantikole-hero-scroll">
              <span>scroll ke bawah</span>
              <ChevronDown size={16} className="mantikole-scroll-icon" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK & POTENSI WILAYAH (Mantikole Stat Cards) */}
      <section id="ringkasan-preservasi" className="container" style={{ scrollMarginTop: '90px' }}>
        <div className="mantikole-stats-header">
          <div className="mantikole-section-tag">
            <span className="mantikole-tag-dot" />
            <span className="mono">RINGKASAN PRESERVASI PROVINSI</span>
          </div>
          <h2 className="mantikole-stats-title">
            Cakupan Dokumentasi & Warisan Budaya
          </h2>
          <p className="mantikole-stats-desc">
            Agregasi data digitalisasi cagar budaya resmi Balai Pelestarian Kebudayaan Wilayah XVIII se-Sulawesi Tengah.
          </p>
        </div>

        <div className="mantikole-stats-grid">
          <div className="mantikole-stat-card">
            <div className="mantikole-stat-top">
              <span className="mantikole-stat-lbl">ARSIP TERVERIFIKASI</span>
              <div className="mantikole-stat-icon-wrap">
                <Landmark size={18} />
              </div>
            </div>
            <div className="mantikole-stat-val-row">
              <span className="mantikole-stat-val mono">{totalVerified}</span>
              <span className="mantikole-stat-unit">Dossier</span>
            </div>
            <p className="mantikole-stat-text">
              Objek cagar budaya yang telah diautentikasi dan terverifikasi secara formal oleh tim kurator.
            </p>
          </div>

          <div className="mantikole-stat-card">
            <div className="mantikole-stat-top">
              <span className="mantikole-stat-lbl">KABUPATEN & KOTA</span>
              <div className="mantikole-stat-icon-wrap">
                <Compass size={18} />
              </div>
            </div>
            <div className="mantikole-stat-val-row">
              <span className="mantikole-stat-val mono">13</span>
              <span className="mantikole-stat-unit">Wilayah</span>
            </div>
            <p className="mantikole-stat-text">
              Sebaran titik cagar budaya di seluruh kabupaten/kota dari Lore Lindu hingga Kepulauan Banggai.
            </p>
          </div>

          <div className="mantikole-stat-card">
            <div className="mantikole-stat-top">
              <span className="mantikole-stat-lbl">CAGAR BUDAYA BENDA</span>
              <div className="mantikole-stat-icon-wrap">
                <Layers size={18} />
              </div>
            </div>
            <div className="mantikole-stat-val-row">
              <span className="mantikole-stat-val mono">{countBenda}</span>
              <span className="mantikole-stat-unit">Situs & Objek</span>
            </div>
            <p className="mantikole-stat-text">
              Patung megalit purba, arsitektur Banawa/Souraja, benteng kolonial, dan artefak fisik.
            </p>
          </div>

          <div className="mantikole-stat-card">
            <div className="mantikole-stat-top">
              <span className="mantikole-stat-lbl">WARISAN TAKBENDA</span>
              <div className="mantikole-stat-icon-wrap">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="mantikole-stat-val-row">
              <span className="mantikole-stat-val mono">{countTakbenda}</span>
              <span className="mantikole-stat-unit">Tradisi Tutur</span>
            </div>
            <p className="mantikole-stat-text">
              Bahasa daerah, seni pertunjukan tradisional, ritus adat, dan sistem pengetahuan lokal.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SOROTAN UTAMA / FEATURED HEADLINE BANNER (Carousel) */}
      <section className="container">
        <div
          style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-masuk)',
                display: 'inline-block',
              }}
            />
            <span
              className="mono"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Sorotan Berita & Pusaka Budaya
            </span>
          </div>
        </div>
        <FeaturedCarousel items={carouselItems} />
      </section>

      {/* 3. ETALASE ARSIP PILIHAN (Curated Heritage Showcase) */}
      <section id="katalog-terkini" className="container" style={{ scrollMarginTop: '80px' }}>
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
              Katalog Terkini
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
