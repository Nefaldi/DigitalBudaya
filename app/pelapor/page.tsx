'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HeritageReportItem } from '@/components/HeritageCard';
import { optimizeCloudinaryUrl } from '@/lib/imageUtils';
import WorkflowStepper from '@/components/WorkflowStepper';
import ImageCompressorUpload from '@/components/ImageCompressorUpload';
import { SULTENG_KABUPATEN_KOTA } from '@/lib/sultengLocations';
import { UserSession } from '@/types';
import {
  FilePlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Loader2,
  Lock,
  Edit3,
  X,
} from 'lucide-react';

export default function PelaporDashboardPage() {
  const [reports, setReports] = useState<HeritageReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<HeritageReportItem | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editKategori, setEditKategori] = useState<'BENDA' | 'TAKBENDA'>('BENDA');
  const [editKabupaten, setEditKabupaten] = useState('');
  const [editLokasi, setEditLokasi] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editFoto, setEditFoto] = useState('');
  const [editLat, setEditLat] = useState<number | null>(null);
  const [editLng, setEditLng] = useState<number | null>(null);
  const [updatingReport, setUpdatingReport] = useState(false);
  const [editError, setEditError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function fetchMyReports() {
      try {
        // 1. Get Me
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        if (ignore) return;
        setUser(authData.user);

        // 2. Get My Reports
        const repRes = await fetch('/api/reports?myReports=true');
        if (repRes.ok) {
          const repData = await repRes.json();
          if (ignore) return;
          setReports(repData.reports || []);
        }
      } catch (err) {
        console.error('Error fetching pelapor dashboard:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchMyReports();

    return () => {
      ignore = true;
    };
  }, [router]);

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan dan menghapus laporan ini?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal membatalkan laporan');
      } else {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Terjadi kesalahan saat menghapus laporan');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (report: HeritageReportItem) => {
    setEditingReport(report);
    setEditJudul(report.judulPusaka);
    setEditKategori(report.kategori);
    setEditKabupaten(report.kabupatenKota);
    setEditLokasi(report.lokasiSpesifik);
    setEditDeskripsi(report.deskripsiKrisis);
    setEditFoto(report.fotoKondisiAwal);
    setEditLat(report.latitude || null);
    setEditLng(report.longitude || null);
    setEditError('');
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    setEditError('');
    setUpdatingReport(true);

    try {
      const res = await fetch(`/api/reports/${editingReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judulPusaka: editJudul,
          kategori: editKategori,
          kabupatenKota: editKabupaten,
          lokasiSpesifik: editLokasi,
          deskripsiKrisis: editDeskripsi,
          fotoKondisiAwal: editFoto,
          latitude: editLat,
          longitude: editLng,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui laporan');
      }

      setReports((prev) =>
        prev.map((r) => (r.id === editingReport.id ? { ...r, ...data.report } : r))
      );
      setEditingReport(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setUpdatingReport(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat dashboard Sahabat Budaya...</p>
      </div>
    );
  }

  const countMasuk = reports.filter((r) => r.status === 'LAPORAN_MASUK').length;
  const countDiproses = reports.filter((r) => r.status === 'DIPROSES').length;
  const countSelesai = reports.filter((r) => r.status === 'SELESAI').length;

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* Header Greeting */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid var(--border-hairline)',
            paddingBottom: '2rem',
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
                Dashboard Sahabat Budaya Sulteng
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
              Selamat Datang, {user?.nama}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0 }}>
              Pantau status verifikasi lapangan, investigasi fisik, dan preservasi digital laporan cagar budaya Anda.
            </p>
          </div>

          <Link href="/pelapor/lapor" className="btn btn-primary btn-lg">
            <FilePlus size={18} />
            <span>Kirim Laporan Pusaka Baru</span>
          </Link>
        </div>

        {/* Quick Stats Metric Cards */}
        <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
          <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--status-diproses-bg)',
                color: 'var(--status-diproses)',
                border: '1px solid var(--status-diproses-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 460, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {countMasuk}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Laporan Masuk (Antrean)
              </div>
            </div>
          </div>

          <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-terracotta-soft)',
                color: 'var(--action-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 460, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {countDiproses}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Sedang Ditangani Konservator
              </div>
            </div>
          </div>

          <div className="paper-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--status-selesai-bg)',
                color: 'var(--status-selesai)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 460, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {countSelesai}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Tuntas & Masuk Katalog Publik
              </div>
            </div>
          </div>
        </div>

        {/* List of User's Reports */}
        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              color: 'var(--text-primary)',
              marginBottom: '1.25rem',
              fontWeight: 460,
              letterSpacing: '-0.02em',
            }}
          >
            Daftar Tiket Pengaduan Cagar Budaya Anda ({reports.length})
          </h2>

          {reports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reports.map((report) => (
                <div key={report.id} className="paper-card" style={{ padding: 'clamp(1rem, 2.5vw, 1.75rem)' }}>
                  <div className="report-row">
                    {/* Thumbnail */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '140px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)',
                      }}
                    >
                      <Image
                        src={optimizeCloudinaryUrl(report.fotoKondisiAwal, 400)}
                        alt={report.judulPusaka}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 240px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>

                    {/* Report Information */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`}>
                            {report.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Pusaka Benda'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--border-hairline)' }}>/</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                            <MapPin size={13} style={{ color: 'var(--action-primary)' }} />
                            <span>{report.kabupatenKota} ({report.lokasiSpesifik})</span>
                          </div>
                        </div>

                        <h3
                          style={{
                            fontSize: '1.25rem',
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)',
                            fontWeight: 460,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {report.judulPusaka}
                        </h3>

                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem',
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {report.deskripsiKrisis}
                        </p>
                      </div>

                      {/* Stepper Preview */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <WorkflowStepper currentStatus={report.status} adminName={report.admin?.nama} />
                      </div>

                      {/* Actions Bar */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid var(--border-hairline)',
                          paddingTop: '1rem',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Dikirim pada {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>

                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <Link href={`/katalog/${report.id}`} className="btn btn-secondary btn-sm">
                            <ExternalLink size={13} />
                            <span>Lihat Detail</span>
                          </Link>

                          {/* Pelapor can edit or cancel only if status is LAPORAN_MASUK */}
                          {report.status === 'LAPORAN_MASUK' ? (
                            <>
                              <button
                                onClick={() => openEditModal(report)}
                                className="btn btn-secondary btn-sm"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <Edit3 size={13} />
                                <span>Koreksi</span>
                              </button>
                              <button
                                onClick={() => handleDeleteReport(report.id)}
                                disabled={deletingId === report.id}
                                className="btn btn-danger btn-sm"
                              >
                                <Trash2 size={13} />
                                <span>{deletingId === report.id ? 'Membatalkan...' : 'Batalkan'}</span>
                              </button>
                            </>
                          ) : (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                padding: '0.35rem 0.65rem',
                                background: 'var(--bg-canvas)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-hairline)',
                              }}
                            >
                              <Lock size={12} />
                              <span>Ditangani Konservator</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="paper-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--color-terracotta-soft)',
                  color: 'var(--action-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <FilePlus size={22} />
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                  fontWeight: 460,
                }}
              >
                Anda Belum Mengirimkan Laporan Pusaka
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '440px',
                  margin: '0 auto 1.75rem auto',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                Menemukan batu megalitikum yang tererosi, struktur kayu soura yang lapuk, atau sastra lisan suku lokal yang mulai langka? Laporkan untuk penanganan konservasi.
              </p>
              <Link href="/pelapor/lapor" className="btn btn-primary">
                <FilePlus size={16} />
                <span>Kirim Laporan Pertama</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Report Modal */}
      {editingReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            className="paper-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Edit3 size={18} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Koreksi Laporan Pusaka
                </h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
                aria-label="Tutup modal"
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-hairline)',
              }}
            >
              Laporan Anda masih berstatus <strong>LAPORAN MASUK</strong> dan dapat diperbarui sebelum dikunci oleh Konservator Lapangan.
            </div>

            {editError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--status-masuk-bg)',
                  color: 'var(--status-masuk)',
                  border: '1px solid var(--status-masuk-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateReport}>
              <div className="form-group">
                <label className="form-label">Judul Cagar Budaya</label>
                <input
                  type="text"
                  required
                  value={editJudul}
                  onChange={(e) => setEditJudul(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kategori Pusaka</label>
                  <select
                    value={editKategori}
                    onChange={(e) => setEditKategori(e.target.value as 'BENDA' | 'TAKBENDA')}
                    className="form-select"
                  >
                    <option value="BENDA">Benda (Megalit, Arsitektur, Artefak)</option>
                    <option value="TAKBENDA">Takbenda (Tradisi Lisan, Bahasa, Sastra)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kabupaten / Kota</label>
                  <select
                    value={editKabupaten}
                    onChange={(e) => setEditKabupaten(e.target.value)}
                    className="form-select"
                  >
                    {SULTENG_KABUPATEN_KOTA.map((kab) => (
                      <option key={kab} value={kab}>
                        {kab}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi Spesifik / Desa / Kecamatan</label>
                <input
                  type="text"
                  required
                  value={editLokasi}
                  onChange={(e) => setEditLokasi(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Kondisi Ancaman / Krisis</label>
                <textarea
                  required
                  rows={4}
                  value={editDeskripsi}
                  onChange={(e) => setEditDeskripsi(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <ImageCompressorUpload
                  label="Ganti Foto Bukti Kondisi Awal (Opsional)"
                  initialUrl={editFoto}
                  onUploadSuccess={(url) => setEditFoto(url)}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  borderTop: '1px solid var(--border-hairline)',
                  paddingTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="btn btn-secondary btn-sm"
                  disabled={updatingReport}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatingReport}
                  className="btn btn-primary btn-sm"
                >
                  {updatingReport ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
