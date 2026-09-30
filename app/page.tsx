import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import SultengMap from '@/components/SultengMap';
import {
  FilePlus,
  ArrowRight,
  Landmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Layers,
  MapPin,
  Shield,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = token ? verifyToken(token) : null;

  let reports: HeritageReportItem[] = [];
  let stats = {
    total: 0,
    selesai: 0,
    diproses: 0,
    masuk: 0,
    benda: 0,
    takbenda: 0,
    wilayahCount: 0,
    wilayahList: [] as { nama: string; total: number }[],
    tingkatSelesai: 0,
  };

  try {
    const [rawReports, statusGroups, categoryGroups, wilayahGroups] = await Promise.all([
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
      prisma.heritageReport.groupBy({
        by: ['kategori'],
        _count: { _all: true },
      }),
      prisma.heritageReport.groupBy({
        by: ['kabupatenKota'],
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

    let benda = 0;
    let takbenda = 0;
    for (const group of categoryGroups) {
      if (group.kategori === 'BENDA') benda = group._count._all;
      else if (group.kategori === 'TAKBENDA') takbenda = group._count._all;
    }

    const wilayahList = wilayahGroups
      .map((g) => ({ nama: g.kabupatenKota, total: g._count._all }))
      .sort((a, b) => b.total - a.total);

    const tingkatSelesai = total > 0 ? Math.round((selesai / total) * 100) : 0;

    stats = {
      total,
      selesai,
      diproses,
      masuk,
      benda,
      takbenda,
      wilayahCount: wilayahGroups.length,
      wilayahList,
      tingkatSelesai,
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
  }

  return (
    <div>
      {/* Editorial Hero Section (Central Sulawesi Cultural Earth) */}
      <section
        id="beranda"
        style={{
          paddingTop: 'clamp(2.5rem, 6vw, 4.5rem)',
          paddingBottom: 'clamp(2.5rem, 6vw, 4.5rem)',
          borderBottom: '1px solid var(--border-hairline)',
          scrollMarginTop: '90px',
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
            <span>Penyelamatan Cagar Budaya Sulawesi Tengah</span>
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
            Lestarikan Warisan Budaya Sulawesi Tengah
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2.25rem',
              maxWidth: '680px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Platform digital terpadu untuk pendataan, pemetaan, dan penyelamatan cagar budaya bersama masyarakat.
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
            <Link href={user ? '/katalog' : '/login'} className="btn btn-primary btn-lg btn-mobile-block">
              <span>Jelajah Katalog Budaya</span>
              <ArrowRight size={17} />
            </Link>
            {user?.role === 'ADMIN' ? (
              <Link href="/admin" className="btn btn-secondary btn-lg btn-mobile-block">
                <Shield size={17} />
                <span>Workbench Konservator</span>
              </Link>
            ) : user?.role === 'SUPERADMIN' ? (
              <Link href="/superadmin/analytics" className="btn btn-secondary btn-lg btn-mobile-block">
                <BarChart3 size={17} />
                <span>Analitik Provinsi</span>
              </Link>
            ) : (
              <Link href={user ? '/pelapor/lapor' : '/login'} className="btn btn-secondary btn-lg btn-mobile-block">
                <FilePlus size={17} />
                <span>Laporkan Cagar Budaya</span>
              </Link>
            )}
          </div>

          {/* Key Metrics Strip (Mobile: 2x2 grid, Desktop: 4 columns) */}
          <div
            className="paper-card grid-cols-2-mobile"
            style={{
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              gap: '1.25rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  marginBottom: '0.35rem',
                }}
              >
                <Landmark size={14} style={{ color: 'var(--action-primary)' }} />
                <span>Pusaka Terdata</span>
              </div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Arsip Terinventarisir
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--status-selesai)',
                  fontWeight: 500,
                  marginBottom: '0.35rem',
                }}
              >
                <CheckCircle2 size={14} style={{ color: 'var(--status-selesai)' }} />
                <span>Tuntas Konservasi</span>
              </div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 600, color: 'var(--status-selesai)', lineHeight: 1.1 }}>
                {stats.selesai}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {stats.tingkatSelesai}% Sukses Pemugaran
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--status-diproses)',
                  fontWeight: 500,
                  marginBottom: '0.35rem',
                }}
              >
                <Clock size={14} style={{ color: 'var(--status-diproses)' }} />
                <span>Dalam Penanganan</span>
              </div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 600, color: 'var(--status-diproses)', lineHeight: 1.1 }}>
                {stats.diproses}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Verifikasi & Riset
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: 'var(--status-masuk)',
                  fontWeight: 500,
                  marginBottom: '0.35rem',
                }}
              >
                <AlertCircle size={14} style={{ color: 'var(--status-masuk)' }} />
                <span>Antrean Kritis</span>
              </div>
              <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 600, color: 'var(--status-masuk)', lineHeight: 1.1 }}>
                {stats.masuk}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Laporan Masyarakat
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Band: Lindu Forest Emerald (Full-Bleed Map Section) */}
      <section id="peta" className="deep-lagoon-band" style={{ scrollMarginTop: '80px' }}>
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
              Peta Sebaran
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', marginBottom: '0.5rem', color: '#ffffff' }}>
              Peta Cagar Budaya
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
              Pantau sebaran situs sejarah dan tradisi lisan di 13 kabupaten/kota se-Sulawesi Tengah.
            </p>
          </div>

          {/* Interactive Leaflet Map (Safe Touch Scrolling) */}
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <SultengMap reports={reports} height="clamp(300px, 48vw, 500px)" />
          </div>
        </div>
      </section>

      {/* Featured Heritage Dossiers (Mobile: 1 col, Desktop: 3 cols) */}
      <section
        id="katalog"
        style={{
          paddingTop: 'clamp(2.5rem, 5vw, 4.5rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 4.5rem)',
          scrollMarginTop: '80px',
        }}
      >
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
                Katalog Terverifikasi
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', color: 'var(--text-primary)', margin: 0 }}>
                Arsip Cagar Budaya
              </h2>
            </div>

            <Link
              href={user ? '/katalog' : '/login'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--action-primary)',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              <span>Lihat Semua</span>
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
        id="alur-kerja"
        style={{
          paddingTop: 'clamp(2.5rem, 5vw, 4rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 4rem)',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-hairline)',
          scrollMarginTop: '80px',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '640px', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--action-primary)', fontWeight: 500, marginBottom: '0.35rem' }}>
              Alur Kerja
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.95rem)', marginBottom: '0.4rem' }}>
              Cara Kerja Sistem
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
              Proses terpadu dari laporan masyarakat hingga publikasi arsip digital.
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
                1. Lapor
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.55', color: 'var(--text-secondary)' }}>
                Kirim laporan temuan atau kondisi cagar budaya lengkap dengan foto dan titik lokasi.
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
                2. Verifikasi
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.55', color: 'var(--text-secondary)' }}>
                Tim konservator memvalidasi data dan melakukan tindakan pelestarian di lapangan.
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
                3. Publikasi
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.55', color: 'var(--text-secondary)' }}>
                Dokumentasi dan arsip digital diterbitkan ke katalog publik untuk masyarakat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Comprehensive Statistics & Conservation Metrics Section */}
      <section
        id="statistik"
        style={{
          paddingTop: 'clamp(2.5rem, 5vw, 4.5rem)',
          paddingBottom: 'clamp(2.5rem, 5vw, 4.5rem)',
          borderTop: '1px solid var(--border-hairline)',
          scrollMarginTop: '80px',
        }}
      >
        <div className="container">
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--action-primary)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}
              >
                <BarChart3 size={15} />
                <span>Transparansi & Metrik Data</span>
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  marginBottom: '0.35rem',
                }}
              >
                Statistik Konservasi & Sebaran Budaya
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px', lineHeight: 1.6 }}>
                Akumulasi data penanganan cagar budaya kebendaan dan perlindungan warisan takbenda di 13 kabupaten/kota se-Sulawesi Tengah secara terbuka.
              </p>
            </div>

            <Link
              href={user ? '/katalog' : '/login'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--action-primary)',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              <span>Telusuri Data Katalog</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* 4 Primary Metric Cards */}
          <div className="grid-cols-2-mobile" style={{ marginBottom: '2rem' }}>
            {/* 1. Total Terdata */}
            <div className="stat-card-tactile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Total Terdata
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-brand-soft)',
                    color: 'var(--action-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Landmark size={18} />
                </div>
              </div>
              <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stats.total}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Objek Warisan Budaya</span>
                <span style={{ color: 'var(--action-primary)', fontWeight: 600 }}>Tercatat Sistem</span>
              </div>
            </div>

            {/* 2. Tuntas Konservasi */}
            <div className="stat-card-tactile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Tuntas Konservasi
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-selesai-bg)',
                    color: 'var(--status-selesai)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 600, color: 'var(--status-selesai)', lineHeight: 1 }}>
                {stats.selesai}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hasil Lapangan Valid</span>
                <span style={{ color: 'var(--status-selesai)', fontWeight: 600 }}>{stats.tingkatSelesai}% Selesai</span>
              </div>
            </div>

            {/* 3. Dalam Penanganan */}
            <div className="stat-card-tactile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Dalam Penanganan
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-diproses-bg)',
                    color: 'var(--status-diproses)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 600, color: 'var(--status-diproses)', lineHeight: 1 }}>
                {stats.diproses}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Survei & Restorasi</span>
                <span style={{ color: 'var(--status-diproses)', fontWeight: 600 }}>Tahap Aktif</span>
              </div>
            </div>

            {/* 4. Antrean Laporan Masuk */}
            <div className="stat-card-tactile">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Antrean Masuk
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-masuk-bg)',
                    color: 'var(--status-masuk)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={18} />
                </div>
              </div>
              <div style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 600, color: 'var(--status-masuk)', lineHeight: 1 }}>
                {stats.masuk}
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Laporan Masyarakat</span>
                <span style={{ color: 'var(--status-masuk)', fontWeight: 600 }}>Menunggu Tim</span>
              </div>
            </div>
          </div>

          {/* Deep Insight Breakdown: 2 Cards (Klasifikasi & Sebaran Wilayah) */}
          <div className="grid-cols-2" style={{ alignItems: 'stretch' }}>
            {/* Panel 1: Klasifikasi Pusaka */}
            <div className="paper-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} style={{ color: 'var(--action-primary)' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      Distribusi Klasifikasi Budaya
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {stats.total} Objek Total
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  Perbandingan proporsi antara cagar budaya material kebendaan (megalit, candi, benteng, artefak) dan warisan budaya takbenda (tradisi lisan, adat istiadat, seni pertunjukan).
                </p>

                {/* Progress bar split */}
                <div
                  style={{
                    height: '10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--border-hairline)',
                    overflow: 'hidden',
                    display: 'flex',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      width: `${stats.total > 0 ? (stats.benda / stats.total) * 100 : 50}%`,
                      backgroundColor: 'var(--cat-benda)',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Cagar Budaya Benda: ${stats.benda}`}
                  />
                  <div
                    style={{
                      width: `${stats.total > 0 ? (stats.takbenda / stats.total) * 100 : 50}%`,
                      backgroundColor: 'var(--cat-takbenda)',
                      transition: 'width 0.4s ease',
                    }}
                    title={`Warisan Budaya Takbenda: ${stats.takbenda}`}
                  />
                </div>

                {/* Legend & Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--cat-benda-bg)',
                      border: '1px solid var(--cat-benda-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cat-benda)' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cat-benda)' }}>
                        Cagar Budaya Benda
                      </span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--cat-benda)' }}>
                      {stats.benda}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {stats.total > 0 ? Math.round((stats.benda / stats.total) * 100) : 0}% dari seluruh data
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--cat-takbenda-bg)',
                      border: '1px solid var(--cat-takbenda-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cat-takbenda)' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cat-takbenda)' }}>
                        Warisan Takbenda
                      </span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--cat-takbenda)' }}>
                      {stats.takbenda}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {stats.total > 0 ? Math.round((stats.takbenda / stats.total) * 100) : 0}% dari seluruh data
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.9rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Standar Pencatatan Ditjen Kebudayaan</span>
                <Link href={user ? '/katalog' : '/login'} style={{ fontSize: '0.82rem', color: 'var(--action-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Eksplorasi Objek</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Panel 2: Jangkauan Wilayah */}
            <div className="paper-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} style={{ color: 'var(--action-emerald)' }} />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      Jangkauan 13 Kabupaten & Kota
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--action-emerald)', fontWeight: 600 }}>
                    {stats.wilayahCount}/13 Terjangkau
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  Penyebaran inventarisasi dan partisipasi publik di seluruh teritori geografis Sulawesi Tengah.
                </p>

                {/* Progress bar coverage */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cakupan Teritorial Aktif</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {Math.round((stats.wilayahCount / 13) * 100)}% Wilayah
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--border-hairline)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.round((stats.wilayahCount / 13) * 100))}%`,
                        background: 'linear-gradient(90deg, var(--action-primary), var(--action-emerald))',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>

                {/* Top Regions tags */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    Wilayah dengan Aktivitas Pencatatan:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {stats.wilayahList.length > 0 ? (
                      stats.wilayahList.slice(0, 6).map((w, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-hairline)',
                            fontSize: '0.76rem',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{w.nama}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--action-primary)', fontWeight: 600 }}>
                            ({w.total})
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Belum ada data wilayah.</span>
                    )}
                    {stats.wilayahList.length > 6 && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        +{stats.wilayahList.length - 6} daerah lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.9rem', borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Peta spasial interaktif</span>
                <Link href="/#peta" style={{ fontSize: '0.82rem', color: 'var(--action-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>Buka Peta Wilayah</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
