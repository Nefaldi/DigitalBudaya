'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';
import LoadingScreen from '@/components/LoadingScreen';
import { fetchUserSession } from '@/lib/clientSession';
import {
  BarChart3,
  ShieldCheck,
  Clock,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  totalReports: number;
  statusBreakdown: {
    LAPORAN_MASUK: number;
    DIPROSES: number;
    SELESAI: number;
  };
  kategoriBreakdown: {
    BENDA: number;
    TAKBENDA: number;
  };
  kabupatenBreakdown: Array<{
    kabupatenKota: string;
    count: number;
  }>;
  totalUsers: number;
}

// Module-level in-memory cache for instantaneous client navigation (SWR)
let clientCachedAnalytics: AnalyticsData | null = null;
let lastAnalyticsFetched = 0;

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(clientCachedAnalytics);
  const [loading, setLoading] = useState<boolean>(!clientCachedAnalytics);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function fetchAnalytics() {
      try {
        const user = await fetchUserSession();
        if (!user) {
          router.push('/login?redirect=/superadmin/analytics');
          return;
        }
        if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
          router.push('/pelapor');
          return;
        }

        const now = Date.now();
        // Skip background fetch if data is fresh within 15 seconds
        if (clientCachedAnalytics && now - lastAnalyticsFetched < 15_000) {
          if (!ignore) {
            setData(clientCachedAnalytics);
            setLoading(false);
          }
          return;
        }

        const res = await fetch('/api/analytics');
        if (res.ok && !ignore) {
          const json = await res.json();
          clientCachedAnalytics = json.analytics;
          lastAnalyticsFetched = Date.now();
          setData(json.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    fetchAnalytics();

    const onUpdate = () => {
      clientCachedAnalytics = null;
      lastAnalyticsFetched = 0;
      fetchAnalytics();
    };
    window.addEventListener('digiculture-reports-update', onUpdate);

    return () => {
      ignore = true;
      window.removeEventListener('digiculture-reports-update', onUpdate);
    };
  }, [router]);

  const fullKabupatenBreakdown = useMemo(() => {
    if (!data) return [];
    return SULTENG_KABUPATEN_KOTA.map((name) => {
      const found = data.kabupatenBreakdown?.find((item) => item.kabupatenKota === name);
      return {
        kabupatenKota: name,
        count: found ? found.count : 0,
      };
    }).sort((a, b) => b.count - a.count);
  }, [data]);

  if (loading || !data) {
    return (
      <LoadingScreen
        message="Memuat Analitik Wilayah..."
        submessage="Konsolidasi data sebaran cagar budaya 13 kabupaten/kota Sulawesi Tengah"
      />
    );
  }

  const completionRate = data.totalReports > 0
    ? Math.round((data.statusBreakdown.SELESAI / data.totalReports) * 100)
    : 0;

  const bendaPct = data.totalReports > 0
    ? Math.round((data.kategoriBreakdown.BENDA / data.totalReports) * 100)
    : 0;
  const takbendaPct = 100 - bendaPct;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div className="container">
        {/* Header Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.75rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--action-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '0.4rem',
                background: 'var(--color-terracotta-soft)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
              }}
            >
              <BarChart3 size={13} /> Analitik Wilayah
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                color: 'var(--text-primary)',
                marginBottom: '0.3rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
              }}
            >
              Sebaran & Preservasi Cagar Budaya
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Ringkasan data pelaporan, verifikasi lapangan, dan sebaran 13 kabupaten/kota se-Sulawesi Tengah.
            </p>
          </div>
        </div>

        {/* 4 Compact KPI Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Card 1: Total */}
          <div className="paper-card" style={{ padding: '1.15rem 1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Budaya Terdata
              </span>
              <Layers size={16} style={{ color: 'var(--action-primary)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {data.totalReports}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Objek terdata di 13 kab/kota
            </div>
          </div>

          {/* Card 2: Selesai */}
          <div className="paper-card" style={{ padding: '1.15rem 1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Selesai / Publik
              </span>
              <ShieldCheck size={16} style={{ color: 'var(--status-selesai)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--status-selesai)', lineHeight: 1 }}>
                {data.statusBreakdown.SELESAI}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--status-selesai)', background: 'var(--status-selesai-bg)', padding: '0.15rem 0.45rem', borderRadius: '9999px' }}>
                {completionRate}% tuntas
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Telah melalui digitalisasi
            </div>
          </div>

          {/* Card 3: Sedang Ditangani */}
          <div className="paper-card" style={{ padding: '1.15rem 1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Investigasi Lapangan
              </span>
              <Clock size={16} style={{ color: 'var(--status-diproses)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--status-diproses)', lineHeight: 1 }}>
              {data.statusBreakdown.DIPROSES}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Ditangani konservator
            </div>
          </div>

          {/* Card 4: Laporan Masuk */}
          <div className="paper-card" style={{ padding: '1.15rem 1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Laporan Baru Masuk
              </span>
              <AlertCircle size={16} style={{ color: 'var(--status-masuk)' }} />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--status-masuk)', lineHeight: 1 }}>
              {data.statusBreakdown.LAPORAN_MASUK}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Menunggu verifikasi lapangan
            </div>
          </div>
        </div>

        {/* 2-Column Balanced Dashboard Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) 1fr',
            gap: '1.25rem',
            alignItems: 'start',
          }}
          className="analytics-grid-balanced"
        >
          {/* Kolom Kiri: Status Pipeline & Kategori Composition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Status Breakdown Box */}
            <div className="paper-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Alur Tahapan Penanganan
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {/* 1. Selesai */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--status-selesai)', fontWeight: 600 }}>Tuntas & Terverifikasi</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {data.statusBreakdown.SELESAI} ({data.totalReports ? Math.round((data.statusBreakdown.SELESAI / data.totalReports) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-canvas)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${data.totalReports ? (data.statusBreakdown.SELESAI / data.totalReports) * 100 : 0}%`,
                        height: '100%',
                        background: 'var(--status-selesai)',
                      }}
                    />
                  </div>
                </div>

                {/* 2. Diproses */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--status-diproses)', fontWeight: 600 }}>Sedang Ditangani Lapangan</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {data.statusBreakdown.DIPROSES} ({data.totalReports ? Math.round((data.statusBreakdown.DIPROSES / data.totalReports) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-canvas)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${data.totalReports ? (data.statusBreakdown.DIPROSES / data.totalReports) * 100 : 0}%`,
                        height: '100%',
                        background: 'var(--status-diproses)',
                      }}
                    />
                  </div>
                </div>

                {/* 3. Masuk */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--status-masuk)', fontWeight: 600 }}>Laporan Baru Masuk</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {data.statusBreakdown.LAPORAN_MASUK} ({data.totalReports ? Math.round((data.statusBreakdown.LAPORAN_MASUK / data.totalReports) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-canvas)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${data.totalReports ? (data.statusBreakdown.LAPORAN_MASUK / data.totalReports) * 100 : 0}%`,
                        height: '100%',
                        background: 'var(--status-masuk)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kategori Benda vs Takbenda */}
            <div className="paper-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Layers size={16} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Komposisi Kategori
                </h3>
              </div>

              {/* Visual Split Ratio Bar */}
              <div style={{ display: 'flex', width: '100%', height: '8px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ width: `${bendaPct}%`, background: 'var(--action-primary)', transition: 'width 0.4s ease' }} title={`Benda: ${bendaPct}%`} />
                <div style={{ width: `${takbendaPct}%`, background: 'var(--action-emerald)', transition: 'width 0.4s ease' }} title={`Takbenda: ${takbendaPct}%`} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <span className="badge badge-benda" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>Benda</span>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1 }}>
                    {data.kategoriBreakdown.BENDA}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {bendaPct}% dari total
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <span className="badge badge-takbenda" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>Takbenda</span>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--action-emerald)', marginTop: '0.35rem', lineHeight: 1 }}>
                    {data.kategoriBreakdown.TAKBENDA}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {takbendaPct}% dari total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Distribusi 13 Kabupaten/Kota (Padat & Rapi) */}
          <div className="paper-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Sebaran Wilayah (13 Kabupaten & Kota)
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Urut berdasarkan jumlah terbanyak
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.5rem 1.25rem',
              }}
            >
              {fullKabupatenBreakdown.map((kab, idx) => {
                const pct = data.totalReports > 0 ? (kab.count / data.totalReports) * 100 : 0;
                const hasData = kab.count > 0;

                return (
                  <div
                    key={kab.kabupatenKota}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      background: hasData ? 'var(--bg-subtle)' : 'transparent',
                      border: `1px solid ${hasData ? 'var(--border-hairline)' : 'transparent'}`,
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: idx < 3 && hasData ? 'var(--action-primary)' : 'var(--text-muted)',
                          width: '18px',
                          textAlign: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: hasData ? 500 : 400,
                          color: hasData ? 'var(--text-primary)' : 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {kab.kabupatenKota}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <div
                        style={{
                          width: '45px',
                          height: '5px',
                          background: 'var(--bg-canvas)',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: idx === 0 ? 'var(--action-primary)' : 'var(--text-secondary)',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: hasData ? 'var(--text-primary)' : 'var(--text-muted)',
                          minWidth: '20px',
                          textAlign: 'right',
                        }}
                      >
                        {kab.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .analytics-grid-balanced {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
