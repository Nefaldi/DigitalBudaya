'use client';

import React, { useState, useEffect } from 'react';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';
import { Search, Compass, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function KatalogContent() {
  const searchParams = useSearchParams();
  const initialKab = searchParams.get('kabupatenKota') || 'Semua';
  const initialKat = searchParams.get('kategori') || 'Semua';

  const [reports, setReports] = useState<HeritageReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState(initialKab);
  const [selectedKategori, setSelectedKategori] = useState(initialKat);
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (selectedStatus !== 'Semua') query.set('status', selectedStatus);
        if (selectedKabupaten !== 'Semua') query.set('kabupatenKota', selectedKabupaten);
        if (selectedKategori !== 'Semua') query.set('kategori', selectedKategori);
        if (searchTerm) query.set('search', searchTerm);

        const res = await fetch(`/api/reports?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchReports, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedKabupaten, selectedKategori, selectedStatus]);

  return (
    <div style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--action-primary)',
            background: 'var(--color-terracotta-soft)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-hairline)',
            fontSize: '0.8rem',
            fontWeight: 500,
            marginBottom: '0.75rem',
          }}>
            <Compass size={14} />
            <span>Direktori Cagar Budaya Sulawesi Tengah</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--text-primary)', marginBottom: '0.65rem', fontWeight: 460 }}>
            Katalog Publik Warisan Leluhur
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', fontSize: '0.96rem', margin: 0 }}>
            Telusuri kompleks megalitikum Besoa & Bada, arsitektur suku Lore dan Kaili, serta tradisi lisan di 13 Kabupaten dan Kota se-Sulawesi Tengah.
          </p>
        </div>

        {/* Filter & Search Bar (Paper White Card, Hairline Border) */}
        <div className="paper-card" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Search size={14} />
                <span>Cari Kata Kunci</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pokekea, Tambi, Rampi, Kalamba..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Kabupaten / Kota Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Wilayah Administratif</label>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="form-select"
              >
                <option value="Semua">Semua Wilayah (13 Kab/Kota)</option>
                {SULTENG_KABUPATEN_KOTA.map((kab) => (
                  <option key={kab} value={kab}>{kab}</option>
                ))}
              </select>
            </div>

            {/* Kategori Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Kategori Pusaka</label>
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="form-select"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="BENDA">Benda (Fisik / Megalitik)</option>
                <option value="TAKBENDA">Takbenda (Tradisi Lisan)</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status Penyelamatan</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
              >
                <option value="Semua">Semua Status</option>
                <option value="SELESAI">Selesai / Terverifikasi</option>
                <option value="DIPROSES">Dalam Penanganan</option>
                <option value="LAPORAN_MASUK">Antrean Laporan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Results Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mengambil data cagar budaya...</p>
          </div>
        ) : reports.length > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Ditemukan <strong style={{ color: 'var(--text-primary)' }}>{reports.length}</strong> entri arsip
              </span>
            </div>

            <div className="grid-cols-3">
              {reports.map((report) => (
                <HeritageCard key={report.id} report={report} />
              ))}
            </div>
          </>
        ) : (
          <div className="paper-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Tidak Ada Cagar Budaya Ditemukan
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.86rem' }}>
              Tidak ditemukan data pusaka dengan kombinasi filter yang Anda pilih.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedKabupaten('Semua');
                setSelectedKategori('Semua');
                setSelectedStatus('Semua');
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KatalogPage() {
  return (
    <React.Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}>
          <Loader2 className="spin" size={32} style={{ color: 'var(--action-primary)' }} />
        </div>
      }
    >
      <KatalogContent />
    </React.Suspense>
  );
}

