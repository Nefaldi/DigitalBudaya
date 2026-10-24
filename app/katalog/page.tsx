'use client';

import React, { useState, useEffect } from 'react';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';
import { Search, Compass, Loader2, RotateCcw, X, MapPin, SlidersHorizontal, Layers, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Module-level in-memory cache for default catalog view
let defaultCatalogCache: { reports: HeritageReportItem[]; total: number; hasMore: boolean; timestamp: number } | null = null;

function KatalogContent() {
  const searchParams = useSearchParams();
  const initialKab = searchParams.get('kabupatenKota') || 'Semua';
  const initialKat = searchParams.get('kategori') || 'Semua';

  const isDefaultView = initialKab === 'Semua' && initialKat === 'Semua';
  const cachedReports = isDefaultView ? defaultCatalogCache?.reports : undefined;
  const cachedHasMore = isDefaultView ? defaultCatalogCache?.hasMore : undefined;
  const cachedTotal = isDefaultView ? defaultCatalogCache?.total : undefined;

  const [reports, setReports] = useState<HeritageReportItem[]>(cachedReports ?? []);
  const [loading, setLoading] = useState(cachedReports === undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(cachedHasMore ?? false);
  const [totalCount, setTotalCount] = useState(cachedTotal ?? 0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState(initialKab);
  const [selectedKategori, setSelectedKategori] = useState(initialKat);
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  const isFiltered = Boolean(
    searchTerm ||
    selectedKabupaten !== 'Semua' ||
    selectedKategori !== 'Semua' ||
    selectedStatus !== 'Semua'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedKabupaten('Semua');
    setSelectedKategori('Semua');
    setSelectedStatus('Semua');
  };

  // Sinkronisasi state filter jika parameter URL berubah (misalnya navigasi dari footer/navbar)
  useEffect(() => {
    const timer = setTimeout(() => {
      const kab = searchParams.get('kabupatenKota') || 'Semua';
      const kat = searchParams.get('kategori') || 'Semua';
      const st = searchParams.get('status') || 'Semua';
      setSelectedKabupaten(kab);
      setSelectedKategori(kat);
      if (st !== 'Semua') setSelectedStatus(st);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Pengambilan data katalog berbasis filter & pagination
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      const isDefault = !searchTerm && selectedKabupaten === 'Semua' && selectedKategori === 'Semua' && selectedStatus === 'Semua';
      const now = Date.now();

      // Skip fetch if default catalog is fresh within 20 seconds
      if (isDefault && defaultCatalogCache && now - defaultCatalogCache.timestamp < 20_000) {
        if (isMounted) {
          setReports(defaultCatalogCache.reports);
          setHasMore(defaultCatalogCache.hasMore);
          setTotalCount(defaultCatalogCache.total);
          setLoading(false);
        }
        return;
      }

      if (!isDefault || !defaultCatalogCache) {
        setLoading(true);
      }
      setPage(1);
      try {
        const query = new URLSearchParams();
        if (selectedStatus !== 'Semua') query.set('status', selectedStatus);
        if (selectedKabupaten !== 'Semua') query.set('kabupatenKota', selectedKabupaten);
        if (selectedKategori !== 'Semua') query.set('kategori', selectedKategori);
        if (searchTerm) query.set('search', searchTerm);
        query.set('page', '1');
        query.set('limit', '12');

        const res = await fetch(`/api/reports?${query.toString()}`, { signal: controller.signal });
        if (res.ok && isMounted) {
          const data = await res.json();
          const items = data.reports || [];
          const more = Boolean(data.pagination ? data.pagination.hasMore : false);
          const total = data.pagination ? data.pagination.total : items.length;

          if (isDefault) {
            defaultCatalogCache = {
              reports: items,
              hasMore: more,
              total,
              timestamp: Date.now(),
            };
          }

          setReports(items);
          setHasMore(more);
          setTotalCount(total);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error loading catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm, selectedKabupaten, selectedKategori, selectedStatus]);

  useEffect(() => {
    const handleUpdate = () => {
      defaultCatalogCache = null;
    };
    window.addEventListener('digiculture-reports-update', handleUpdate);
    return () => window.removeEventListener('digiculture-reports-update', handleUpdate);
  }, []);

  // Muat data tambahan secara inkremental (Pagination / Load More)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const query = new URLSearchParams();
      if (selectedStatus !== 'Semua') query.set('status', selectedStatus);
      if (selectedKabupaten !== 'Semua') query.set('kabupatenKota', selectedKabupaten);
      if (selectedKategori !== 'Semua') query.set('kategori', selectedKategori);
      if (searchTerm) query.set('search', searchTerm);
      query.set('page', String(nextPage));
      query.set('limit', '12');

      const res = await fetch(`/api/reports?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports((prev) => [...prev, ...(data.reports || [])]);
        setPage(nextPage);
        setHasMore(Boolean(data.pagination?.hasMore));
      }
    } catch (err) {
      console.error('Error loading more catalog data:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div style={{ paddingTop: '1.25rem', paddingBottom: '3.5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 600, letterSpacing: '-0.025em' }}>
            Katalog Publik Warisan Leluhur
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', fontSize: '0.925rem', lineHeight: 1.55, margin: 0 }}>
            Telusuri kompleks megalitikum Besoa & Bada, arsitektur suku Lore dan Kaili, serta tradisi lisan di 13 Kabupaten dan Kota se-Sulawesi Tengah.
          </p>
        </div>

        {/* Quick Kategori Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedKategori('Semua')}
            className={`btn btn-sm ${selectedKategori === 'Semua' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', fontSize: '0.78rem', padding: '0.35rem 0.95rem' }}
          >
            Semua Warisan
          </button>
          <button
            type="button"
            onClick={() => setSelectedKategori('BENDA')}
            className={`btn btn-sm ${selectedKategori === 'BENDA' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', fontSize: '0.78rem', padding: '0.35rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Layers size={13} />
            <span>Cagar Budaya Benda</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedKategori('TAKBENDA')}
            className={`btn btn-sm ${selectedKategori === 'TAKBENDA' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '9999px', fontSize: '0.78rem', padding: '0.35rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Sparkles size={13} />
            <span>Warisan Takbenda</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="paper-card" style={{ padding: '1.15rem 1.25rem', marginBottom: '1.15rem', borderRadius: 'var(--radius-md, 12px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Search size={13} style={{ color: 'var(--action-primary)' }} />
                <span>Cari Objek / Situs / Desa</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Contoh: Pokekea, Baruga, Kaili..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: searchTerm ? '2rem' : '0.85rem' }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Hapus pencarian"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Kabupaten */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} style={{ color: 'var(--action-primary)' }} />
                <span>Wilayah Administratif</span>
              </label>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="form-select"
              >
                <option value="Semua">Seluruh Kabupaten / Kota (13)</option>
                {SULTENG_KABUPATEN_KOTA.map((kab) => (
                  <option key={kab} value={kab}>{kab}</option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <SlidersHorizontal size={13} style={{ color: 'var(--action-primary)' }} />
                <span>Tahap Penanganan</span>
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
              >
                <option value="Semua">Semua Status</option>
                <option value="SELESAI">Terverifikasi (Selesai)</option>
                <option value="DIPROSES">Dalam Penanganan (Diproses)</option>
                <option value="LAPORAN_MASUK">Laporan Baru (Masuk)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Items Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mengambil data cagar budaya...</p>
          </div>
        ) : reports.length > 0 ? (
          <>
            {isFiltered && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-hairline)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Reset Filter</span>
                </button>
              </div>
            )}

            <div className="grid-cols-3">
              {reports.map((report) => (
                <HeritageCard key={report.id} report={report} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn btn-secondary"
                  style={{ minWidth: '180px' }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Memuat Data...</span>
                    </>
                  ) : (
                    <span>Muat Lebih Banyak</span>
                  )}
                </button>
              </div>
            )}
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
              Tidak ditemukan data cagar budaya dengan kombinasi filter yang Anda pilih.
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
          <Loader2 className="animate-spin" size={32} style={{ color: 'var(--action-primary)' }} />
        </div>
      }
    >
      <KatalogContent />
    </React.Suspense>
  );
}
