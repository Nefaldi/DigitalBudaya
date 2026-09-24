'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Users,
  ShieldCheck,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Loader2,
  ExternalLink,
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

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        if (authData.user.role !== 'SUPERADMIN' && authData.user.role !== 'ADMIN') {
          router.push('/pelapor');
          return;
        }

        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [router]);

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Merekapitulasi data intelijen cagar budaya Sulawesi Tengah...</p>
      </div>
    );
  }

  const completionRate = data.totalReports > 0
    ? Math.round((data.statusBreakdown.SELESAI / data.totalReports) * 100)
    : 0;

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '1.75rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--action-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '0.5rem',
                background: 'var(--color-terracotta-soft)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <BarChart3 size={14} /> Konsol Intelijen Pelestarian Budaya
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
                fontWeight: 460,
                letterSpacing: '-0.028em',
              }}
            >
              Metrik Regional Sulawesi Tengah
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Statistik pemulihan krisis, rasio cagar budaya benda vs takbenda, serta sebaran 13 Kabupaten/Kota.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/superadmin/users" className="btn btn-primary btn-sm">
              <Users size={14} /> Kelola Pengguna
            </Link>
            <Link href="/admin" className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Meja Konservator
            </Link>
          </div>
        </div>

        {/* Top 4 Key Metric Cards */}
        <div className="grid-cols-4" style={{ marginBottom: '2.25rem' }}>
          <div className="paper-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Total Laporan
              </span>
              <Layers size={18} style={{ color: 'var(--action-primary)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 460, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
              {data.totalReports}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Pusaka terdaftar di database
            </div>
          </div>

          <div className="paper-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Tingkat Pemulihan
              </span>
              <ShieldCheck size={18} style={{ color: 'var(--action-emerald)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 460, color: 'var(--action-emerald)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
              {completionRate}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {data.statusBreakdown.SELESAI} dari {data.totalReports} tuntas digitalisasi
            </div>
          </div>

          <div className="paper-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Investigasi Aktif
              </span>
              <Clock size={18} style={{ color: 'var(--status-diproses)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 460, color: 'var(--status-diproses)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
              {data.statusBreakdown.DIPROSES}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Sedang dikonservasi di lapangan
            </div>
          </div>

          <div className="paper-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Sahabat Budaya
              </span>
              <Users size={18} style={{ color: 'var(--action-emerald)' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 460, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
              {data.totalUsers}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Pengguna aktif terdaftar
            </div>
          </div>
        </div>

        {/* Pipeline & Category Split Grid */}
        <div className="analytics-row" style={{ marginBottom: '2.25rem' }}>
          {/* Status Pipeline */}
          <div className="paper-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--action-primary)' }} />
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 460, margin: 0 }}>
                Pipa Alur Penyelamatan Cagar Budaya
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Laporan Masuk */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--status-masuk)', fontWeight: 500 }}>1. Antrean Laporan Masuk (Kritis)</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.statusBreakdown.LAPORAN_MASUK}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-canvas)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                  <div
                    style={{
                      width: `${data.totalReports ? (data.statusBreakdown.LAPORAN_MASUK / data.totalReports) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--status-masuk)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              {/* Diproses */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--status-diproses)', fontWeight: 500 }}>2. Investigasi & Restorasi Lapangan</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.statusBreakdown.DIPROSES}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-canvas)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                  <div
                    style={{
                      width: `${data.totalReports ? (data.statusBreakdown.DIPROSES / data.totalReports) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--status-diproses)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              {/* Selesai */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--action-emerald)', fontWeight: 500 }}>3. Tuntas & Digitalisasi Arsip Publik</span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{data.statusBreakdown.SELESAI}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-canvas)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-hairline)' }}>
                  <div
                    style={{
                      width: `${data.totalReports ? (data.statusBreakdown.SELESAI / data.totalReports) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--action-emerald)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kategori Breakdown */}
          <div className="paper-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Layers size={16} style={{ color: 'var(--action-primary)' }} />
              <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 460, margin: 0 }}>
                Komposisi Benda vs Takbenda
              </h2>
            </div>

            <div className="analytics-subgrid">
              <div
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                }}
              >
                <span className="badge badge-benda" style={{ marginBottom: '0.85rem' }}>Pusaka Benda</span>
                <div style={{ fontSize: '2.1rem', fontWeight: 460, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {data.kategoriBreakdown.BENDA}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Megalitikum & Struktur Bangunan
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                }}
              >
                <span className="badge badge-takbenda" style={{ marginBottom: '0.85rem' }}>Warisan Takbenda</span>
                <div style={{ fontSize: '2.1rem', fontWeight: 460, color: 'var(--action-emerald)', lineHeight: 1.1 }}>
                  {data.kategoriBreakdown.TAKBENDA}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Bahasa & Tradisi Tutur Lisan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kabupaten Breakdown Bar Chart */}
        <div className="paper-card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <MapPin size={16} style={{ color: 'var(--action-primary)' }} />
            <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 460, margin: 0 }}>
              Sebaran Cagar Budaya Terdata Berdasarkan 13 Kabupaten/Kota
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.kabupatenBreakdown.map((kab) => (
              <div
                key={kab.kabupatenKota}
                className="analytics-breakdown-row"
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {kab.kabupatenKota}
                </span>

                <div
                  className="breakdown-bar"
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-canvas)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <div
                    style={{
                      width: `${data.totalReports ? (kab.count / data.totalReports) * 100 : 0}%`,
                      height: '100%',
                      background: 'var(--action-primary)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>

                <span className="breakdown-count" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {kab.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
