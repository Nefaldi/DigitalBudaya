'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HeritageReportItem } from '@/components/HeritageCard';
import { optimizeCloudinaryUrl } from '@/lib/imageUtils';
import ImageCompressorUpload from '@/components/ImageCompressorUpload';
import { UserSession } from '@/types';
import {
  Shield,
  Play,
  Upload,
  X,
  ExternalLink,
  Loader2,
  Music,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function AdminWorkbenchPage() {
  const [reports, setReports] = useState<HeritageReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI'>('ALL');

  // Modal State for Digitalization & Status Update
  const [selectedReport, setSelectedReport] = useState<HeritageReportItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI'>('DIPROSES');
  const [fotoDigitalisasi, setFotoDigitalisasi] = useState('');
  const [rekamanAudioUrl, setRekamanAudioUrl] = useState('');
  const [catatanPenanganan, setCatatanPenanganan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState('');

  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        if (authData.user.role !== 'ADMIN' && authData.user.role !== 'SUPERADMIN') {
          router.push('/pelapor');
          return;
        }
        if (ignore) return;
        setUser(authData.user);

        // Fetch all reports without public restriction
        const repRes = await fetch('/api/reports?status=Semua');
        if (repRes.ok) {
          const repData = await repRes.json();
          if (ignore) return;
          setReports(repData.reports || []);
        }
      } catch (err) {
        console.error('Admin workbench fetch error:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [router]);

  const openActionModal = (report: HeritageReportItem) => {
    setSelectedReport(report);
    setUpdatingStatus(report.status === 'LAPORAN_MASUK' ? 'DIPROSES' : report.status);
    setFotoDigitalisasi(report.fotoDigitalisasi || '');
    setRekamanAudioUrl(report.rekamanAudioUrl || '');
    setCatatanPenanganan(report.catatanPenanganan || '');
    setActionError('');
    setModalOpen(true);
  };

  const handleTakeOwnership = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DIPROSES' }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal mengambil alih laporan');
      } else {
        setReports((prev) => prev.map((r) => (r.id === reportId ? data.report : r)));
      }
    } catch (err) {
      console.error('Take ownership error:', err);
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.type.startsWith('audio/') &&
      !file.name.endsWith('.mp3') &&
      !file.name.endsWith('.wav') &&
      !file.name.endsWith('.m4a') &&
      !file.name.endsWith('.ogg')
    ) {
      setAudioUploadError('Berkas harus berupa audio (MP3, WAV, M4A, OGG).');
      return;
    }

    if (file.size > 4.5 * 1024 * 1024) {
      setAudioUploadError('Ukuran berkas audio maksimal 4.5 MB (Batas Serverless).');
      return;
    }

    setUploadingAudio(true);
    setAudioUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'digiculture/audio');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah berkas audio');
      }

      setRekamanAudioUrl(data.url);
    } catch (err) {
      setAudioUploadError(err instanceof Error ? err.message : 'Gagal mengunggah audio');
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    setActionError('');

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updatingStatus,
          fotoDigitalisasi: fotoDigitalisasi || null,
          rekamanAudioUrl: rekamanAudioUrl || null,
          catatanPenanganan: catatanPenanganan || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui data penanganan');
      }

      setReports((prev) => prev.map((r) => (r.id === selectedReport.id ? data.report : r)));
      setModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan pembaruan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat Workbench Konservator Wilayah...</p>
      </div>
    );
  }

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  const countMasuk = reports.filter((r) => r.status === 'LAPORAN_MASUK').length;
  const countDiproses = reports.filter((r) => r.status === 'DIPROSES').length;
  const countSelesai = reports.filter((r) => r.status === 'SELESAI').length;

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
            marginBottom: '2rem',
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
              <Shield size={14} /> Meja Kerja Konservator Wilayah Sulawesi Tengah
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
              Antrean & Investigasi Lapangan
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Masuk sebagai:{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {user?.nama}
              </strong>{' '}
              ({user?.role === 'SUPERADMIN' ? 'Superadmin Pimpinan' : 'Konservator Wilayah'})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/katalog" className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Buka Katalog Publik
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Semua Tiket ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('LAPORAN_MASUK')}
            className={`btn btn-sm ${activeTab === 'LAPORAN_MASUK' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Antrean Masuk ({countMasuk})
          </button>
          <button
            onClick={() => setActiveTab('DIPROSES')}
            className={`btn btn-sm ${activeTab === 'DIPROSES' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Sedang Investigasi ({countDiproses})
          </button>
          <button
            onClick={() => setActiveTab('SELESAI')}
            className={`btn btn-sm ${activeTab === 'SELESAI' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Selesai / Terbit ({countSelesai})
          </button>
        </div>

        {/* Reports Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReports.map((report) => (
            <div key={report.id} className="paper-card" style={{ padding: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
              <div className="admin-row">
                {/* Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '115px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <Image
                    src={optimizeCloudinaryUrl(report.fotoDigitalisasi || report.fotoKondisiAwal, 300)}
                    alt={report.judulPusaka}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 200px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                    <span
                      className={`badge ${
                        report.status === 'SELESAI'
                          ? 'badge-selesai'
                          : report.status === 'DIPROSES'
                          ? 'badge-diproses'
                          : 'badge-masuk'
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className={`badge ${report.kategori === 'TAKBENDA' ? 'badge-takbenda' : 'badge-benda'}`}>
                      {report.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Pusaka Benda'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} style={{ color: 'var(--action-primary)' }} />
                      {report.kabupatenKota} ({report.lokasiSpesifik})
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.15rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.35rem',
                      fontWeight: 460,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {report.judulPusaka}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '0.65rem',
                      maxWidth: '750px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {report.deskripsiKrisis}
                  </p>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    <span>Pelapor: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{report.pelapor?.nama}</strong></span>
                    <span>Konservator: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{report.admin?.nama || 'Belum Diambil'}</strong></span>
                    <span>Tanggal: {new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>

                {/* Actions Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '175px' }}>
                  {report.status === 'LAPORAN_MASUK' && (
                    <button
                      onClick={() => handleTakeOwnership(report.id)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Play size={13} />
                      <span>Mulai Investigasi</span>
                    </button>
                  )}

                  <button
                    onClick={() => openActionModal(report)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Upload size={13} />
                    <span>Tindak Lanjut / Restorasi</span>
                  </button>

                  <Link
                    href={`/katalog/${report.id}`}
                    target="_blank"
                    className="btn btn-sm"
                    style={{
                      width: '100%',
                      fontSize: '0.78rem',
                      justifyContent: 'center',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <ExternalLink size={12} />
                    <span>Lihat Dossier</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Tatalaksana Penanganan & Digitalisasi */}
        {modalOpen && selectedReport && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(24, 23, 22, 0.65)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '1.5rem',
            }}
          >
            <div
              className="paper-card"
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2.25rem',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.5rem',
                  borderBottom: '1px solid var(--border-hairline)',
                  paddingBottom: '1rem',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      color: 'var(--text-primary)',
                      fontWeight: 460,
                      margin: '0 0 0.25rem 0',
                    }}
                  >
                    Tatalaksana Digitalisasi & Restorasi
                  </h3>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Pusaka: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.judulPusaka}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
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

              {actionError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--status-masuk-bg)',
                    color: 'var(--status-masuk)',
                    border: '1px solid var(--status-masuk-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {actionError}
                </div>
              )}

              <form onSubmit={handleSaveResolution}>
                {/* Status Transition Selector */}
                <div className="form-group">
                  <label className="form-label">Ubah Status Alur Kerja (Workflow State)</label>
                  <select
                    value={updatingStatus}
                    onChange={(e) => setUpdatingStatus(e.target.value as 'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI')}
                    className="form-select"
                  >
                    <option value="DIPROSES">DIPROSES (Investigasi Lapangan Sedang Berjalan)</option>
                    <option value="SELESAI">SELESAI (Konservasi Tuntas & Rilis ke Publik)</option>
                    <option value="LAPORAN_MASUK">LAPORAN_MASUK (Kembalikan ke Antrean)</option>
                  </select>
                </div>

                {/* Foto Hasil Digitalisasi / Pemugaran */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <ImageCompressorUpload
                    label="Unggah Foto Hasil Digitalisasi / Restorasi Lapangan"
                    folder="digiculture/digitalisasi"
                    initialUrl={fotoDigitalisasi}
                    onUploadSuccess={(url) => setFotoDigitalisasi(url)}
                  />
                </div>

                {/* Audio URL / Direct Upload (For Takbenda) */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Music size={14} style={{ color: 'var(--action-emerald)' }} /> Rekaman Audio Lapangan (Khusus Warisan Takbenda)
                  </label>

                  {audioUploadError && (
                    <div style={{ color: 'var(--status-masuk)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                      {audioUploadError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                      type="url"
                      placeholder="https://domain-arsip.id/audio/rekaman.mp3"
                      value={rekamanAudioUrl}
                      onChange={(e) => setRekamanAudioUrl(e.target.value)}
                      className="form-input"
                      style={{ flex: 1 }}
                    />
                    <label
                      className="btn btn-secondary btn-sm"
                      style={{
                        cursor: uploadingAudio ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {uploadingAudio ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>Unggah Audio</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        onChange={handleAudioFileUpload}
                        disabled={uploadingAudio}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {rekamanAudioUrl && (
                    <div
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-canvas)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-hairline)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--action-emerald)', overflow: 'hidden' }}>
                        <CheckCircle2 size={14} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          Audio terpasang: {rekamanAudioUrl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRekamanAudioUrl('')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.2rem',
                        }}
                        title="Hapus tautan audio"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                    Bisa unggah langsung file audio MP3/WAV penutur lokal (maks. 4.5 MB) atau masukkan tautan CDN.
                  </span>
                </div>

                {/* Catatan Penanganan Konservator */}
                <div className="form-group">
                  <label className="form-label">Catatan Lapangan & Laporan Teknis Konservasi</label>
                  <textarea
                    placeholder="Tuliskan tindakan yang telah dilakukan. Misalnya: Pembersihan lumut mikro dengan larutan kimiawi khusus oleh tim arkeolog, pematokan pagar zonasi pengaman, atau perekaman 12 cerita lisan penutur bahasa asli..."
                    value={catatanPenanganan}
                    onChange={(e) => setCatatanPenanganan(e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: '120px' }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    marginTop: '1.75rem',
                    borderTop: '1px solid var(--border-hairline)',
                    paddingTop: '1.25rem',
                  }}
                >
                  <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                    Batal
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? 'Menyimpan...' : 'Simpan Pembaruan Penanganan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
