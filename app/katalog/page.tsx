'use client';

import React, { useState, useEffect } from 'react';
import HeritageCard, { HeritageReportItem } from '@/components/HeritageCard';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';
import { Search, Compass, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function KatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKab = searchParams.get('kabupatenKota') || 'Semua';
  const initialKat = searchParams.get('kategori') || 'Semua';

  const [authChecked, setAuthChecked] = useState(false);
  const [reports, setReports] = useState<HeritageReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState(initialKab);
  const [selectedKategori, setSelectedKategori] = useState(initialKat);
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // 1. Verifikasi otentikasi pengguna secara mandiri (mencegah double-fetch)
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const paramsString = searchParams.toString();
      const targetUrl = '/katalog' + (paramsString ? `?${paramsString}` : '');
      const loginUrl = `/login?redirect=${encodeURIComponent(targetUrl)}`;

      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace(loginUrl);
          return;
        }
        if (isMounted) {
          setAuthChecked(true);
        }
      } catch {
        router.replace(loginUrl);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

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

  // 2. Pengambilan data katalog berbasis filter & pagination (hanya berjalan setelah terotentikasi)
  useEffect(() => {
    if (!authChecked) return;

    let isMounted = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      setPage(1);
      try {
        const query = new URLSearchParams();
        if (selectedStatus !== 'Semua') query.set('status', selectedStatus);
        if (selectedKabupaten !== 'Semua') query.set('kabupatenKota', selectedKabupaten);
        if (selectedKategori !== 'Semua') query.set('kategori', selectedKategori);
        if (searchTerm) query.set('search', searchTerm);
        query.set('page', '1');
        query.set('limit', '12');

        const res = await fetch(`/api/reports?${query.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setReports(data.reports || []);
          if (data.pagination) {
            setHasMore(data.pagination.hasMore);
            setTotalCount(data.pagination.total);
          } else {
            setHasMore(false);
            setTotalCount(data.reports?.length || 0);
          }
        }
      } catch (err) {
        console.error('Error loading catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [authChecked, searchTerm, selectedKabupaten, selectedKategori, selectedStatus]);

  // 3. Muat data tambahan secara inkremental (Pagination / Load More)
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

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--action-primary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memverifikasi sesi pengguna...</p>
      </div>
    );
  }

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

        {/* Filter Bar */}
        <div className="paper-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Search size={13} style={{ color: 'var(--action-primary)' }} />
                <span>Cari Objek / Desa</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pokekea, Baruga, Ganda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            {/* Filter Kabupaten */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Wilayah Administratif</label>
              <select
                value={selectedKabupaten}
                onChange={(e) => setSelectedKabupaten(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.875rem' }}
              >
                <option value="Semua">Seluruh Kabupaten / Kota</option>
                {SULTENG_KABUPATEN_KOTA.map((kab) => (
                  <option key={kab} value={kab}>{kab}</option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Klasifikasi Pusaka</label>
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.875rem' }}
              >
                <option value="Semua">Semua Kategori</option>
                <option value="BENDA">Benda (Fisik/Megalitik/Struktur)</option>
                <option value="TAKBENDA">Takbenda (Lisan/Ritual/Musik)</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Tahap Penanganan</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.875rem' }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Menampilkan <strong style={{ color: 'var(--text-primary)' }}>{reports.length}</strong> dari <strong style={{ color: 'var(--text-primary)' }}>{totalCount || reports.length}</strong> entri arsip
              </span>
            </div>

            <div className="grid-cols-3">
              {reports.map((report) => (
                <HeritageCard key={report.id} report={report} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
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
