'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MapPicker from '@/components/MapPicker';
import ImageCompressorUpload from '@/components/ImageCompressorUpload';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';
import { fetchUserSession, getCachedUser } from '@/lib/clientSession';
import {
  AlertCircle,
  Loader2,
  Send,
  BookmarkCheck,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'digiculture_field_draft_v1';

export default function LaporBudayaPage() {
  const [judulPusaka, setJudulPusaka] = useState('');
  const [kategori, setKategori] = useState<'BENDA' | 'TAKBENDA'>('BENDA');
  const [kabupatenKota, setKabupatenKota] = useState('Kabupaten Poso');
  const [lokasiSpesifik, setLokasiSpesifik] = useState('');
  const [deskripsiKrisis, setDeskripsiKrisis] = useState('');
  const [fotoKondisiAwal, setFotoKondisiAwal] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number; isValid: boolean }>({
    lat: -1.7083,
    lng: 120.3015,
    isValid: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'PELAPOR' | 'ADMIN' | 'SUPERADMIN'>(() => {
    const cached = getCachedUser();
    return (cached?.role as 'PELAPOR' | 'ADMIN' | 'SUPERADMIN') || 'PELAPOR';
  });
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    let ignore = false;

    async function checkAuth() {
      try {
        const cached = getCachedUser();
        if (cached) {
          if (cached.role === 'ADMIN') {
            router.replace('/admin');
            return;
          }
          if (cached.role === 'SUPERADMIN') {
            router.replace('/superadmin/analytics');
            return;
          }
        }

        const user = await fetchUserSession();
        if (!user) {
          router.push('/login?redirect=/pelapor/lapor');
          return;
        }
        if (ignore) return;

        if (user.role === 'ADMIN') {
          router.replace('/admin');
          return;
        }
        if (user.role === 'SUPERADMIN') {
          router.replace('/superadmin/analytics');
          return;
        }
        setUserRole(user.role as 'PELAPOR' | 'ADMIN' | 'SUPERADMIN');
      } catch {
        router.push('/login?redirect=/pelapor/lapor');
      }
    }
    checkAuth();

    return () => {
      ignore = true;
    };
  }, [router]);

  const dashboardHref =
    userRole === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : userRole === 'ADMIN'
      ? '/admin'
      : '/pelapor';

  // Check for existing field draft on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.judulPusaka || parsed.deskripsiKrisis || parsed.lokasiSpesifik) {
            setHasSavedDraft(true);
            if (parsed.savedAt) {
              setDraftTimestamp(
                new Date(parsed.savedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
              );
            }
          }
        }
      } catch {
        // LocalStorage access may fail in private browsing mode
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save draft whenever field inputs change
  useEffect(() => {
    if (!judulPusaka && !lokasiSpesifik && !deskripsiKrisis && !fotoKondisiAwal) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            judulPusaka,
            kategori,
            kabupatenKota,
            lokasiSpesifik,
            deskripsiKrisis,
            fotoKondisiAwal,
            coordinates,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore storage quota errors
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [judulPusaka, kategori, kabupatenKota, lokasiSpesifik, deskripsiKrisis, fotoKondisiAwal, coordinates]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.judulPusaka) setJudulPusaka(parsed.judulPusaka);
        if (parsed.kategori) setKategori(parsed.kategori);
        if (parsed.kabupatenKota) setKabupatenKota(parsed.kabupatenKota);
        if (parsed.lokasiSpesifik) setLokasiSpesifik(parsed.lokasiSpesifik);
        if (parsed.deskripsiKrisis) setDeskripsiKrisis(parsed.deskripsiKrisis);
        if (parsed.fotoKondisiAwal) setFotoKondisiAwal(parsed.fotoKondisiAwal);
        if (parsed.coordinates) setCoordinates(parsed.coordinates);
      }
    } catch {
      // Ignore
    }
    setHasSavedDraft(false);
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setHasSavedDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!judulPusaka || !lokasiSpesifik || !kabupatenKota || !deskripsiKrisis || !fotoKondisiAwal) {
      setErrorMsg('Harap lengkapi semua kolom formulir serta unggah foto bukti kondisi awal.');
      return;
    }

    if (!coordinates.isValid) {
      setErrorMsg('Titik koordinat GPS harus berada di dalam batas Provinsi Sulawesi Tengah.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judulPusaka,
          kategori,
          kabupatenKota,
          lokasiSpesifik,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          deskripsiKrisis,
          fotoKondisiAwal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan laporan');
      }

      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
      }

      router.push(dashboardHref);
      router.refresh();
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Paper White Card Container */}
        <div className="paper-card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
          {/* Header */}
          <div
            style={{
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--border-hairline)',
              paddingBottom: '1rem',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 1.85rem)',
                color: 'var(--text-primary)',
                margin: '0 0 0.25rem 0',
                fontWeight: 600,
                letterSpacing: '-0.025em',
              }}
            >
              Laporkan Budaya
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              Kirimkan laporan kondisi cagar budaya untuk ditindaklanjuti oleh tim konservator.
            </p>
          </div>

          {hasSavedDraft && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-parchment)',
                border: '1px solid var(--border-neutral)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookmarkCheck size={18} style={{ color: 'var(--action-primary)' }} />
                <span>
                  Ada draf laporan tersimpan {draftTimestamp ? `(${draftTimestamp})` : ''}.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Pulihkan Draf
                </button>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.5rem',
                  }}
                >
                  Abaikan
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--status-masuk-bg)',
                border: '1px solid var(--status-masuk-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--status-masuk)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.75rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Nama Budaya & Kategori */}
            <div className="form-row-2-1">
              <div className="form-group">
                <label className="form-label">Nama Cagar Budaya *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Situs Megalitikum Pokekea"
                  value={judulPusaka}
                  onChange={(e) => setJudulPusaka(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as 'BENDA' | 'TAKBENDA')}
                  className="form-select"
                >
                  <option value="BENDA">Benda</option>
                  <option value="TAKBENDA">Takbenda</option>
                </select>
              </div>
            </div>

            {/* 2. Wilayah Administratif & Lokasi Spesifik */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kabupaten / Kota (Sulawesi Tengah) *</label>
                <select
                  value={kabupatenKota}
                  onChange={(e) => setKabupatenKota(e.target.value)}
                  className="form-select"
                >
                  {SULTENG_KABUPATEN_KOTA.map((kab) => (
                    <option key={kab} value={kab}>{kab}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi Spesifik / Desa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Desa Hangkeu, Lembah Besoa"
                  value={lokasiSpesifik}
                  onChange={(e) => setLokasiSpesifik(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* 3. Interactive Map Coordinate Picker */}
            <div style={{ marginBottom: '1.75rem' }}>
              <MapPicker
                initialLat={coordinates.lat}
                initialLng={coordinates.lng}
                onLocationSelect={(loc) => setCoordinates(loc)}
              />
            </div>

            {/* 4. Deskripsi Krisis / Kerusakan */}
            <div className="form-group">
              <label className="form-label">Deskripsi Krisis & Ancaman Kerusakan *</label>
              <textarea
                required
                placeholder="Jelaskan kondisi ancaman cagar budaya. Misalnya: patung megalitikum mengalami erosi berat akibat lumut tebal, struktur atap soura mulai runtuh, atau penutur asli bahasa daerah tersisa kurang dari 500 orang..."
                value={deskripsiKrisis}
                onChange={(e) => setDeskripsiKrisis(e.target.value)}
                className="form-textarea"
                style={{ minHeight: '130px' }}
              />
            </div>

            {/* 5. Client-Side Image Compressor & Upload */}
            <div style={{ marginBottom: '2.25rem' }}>
              <ImageCompressorUpload
                label="Unggah Foto Bukti Kondisi Awal (Krisis Lapangan) *"
                folder="digiculture/laporan_awal"
                initialUrl={fotoKondisiAwal}
                onUploadSuccess={(url) => setFotoKondisiAwal(url)}
              />
            </div>

            {/* Submit Button */}
            <div
              style={{
                borderTop: '1px solid var(--border-hairline)',
                paddingTop: '1.75rem',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
              }}
            >
              <Link href={dashboardHref} className="btn btn-secondary">
                Batal
              </Link>

              <button
                type="submit"
                disabled={loading || !fotoKondisiAwal}
                className="btn btn-primary btn-lg"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Mengirimkan Laporan...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim Laporan Resmi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
