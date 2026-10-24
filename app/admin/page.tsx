'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeritageReportItem } from '@/components/HeritageCard';
import { optimizeCloudinaryUrl } from '@/lib/imageUtils';
import ImageCompressorUpload from '@/components/ImageCompressorUpload';
import LoadingScreen from '@/components/LoadingScreen';
import UserManagementSection from '@/components/admin/UserManagementSection';
import { UserSession } from '@/types';
import { fetchUserSession, getCachedUser } from '@/lib/clientSession';
import {
  Shield,
  Play,
  Upload,
  X,
  ExternalLink,
  MapPin,
  ClipboardList,
  Users,
  UserCheck,
  CheckCircle2,
  Hourglass,
  Trash2,
  RotateCcw,
} from 'lucide-react';

// Module-level in-memory cache for instantaneous client navigation (SWR)
let clientCachedReports: HeritageReportItem[] | null = null;
let lastReportsFetched = 0;

export default function AdminWorkbenchPage() {
  const [reports, setReports] = useState<HeritageReportItem[]>(clientCachedReports || []);
  const [loading, setLoading] = useState<boolean>(!clientCachedReports);
  const [user, setUser] = useState<UserSession | null>(getCachedUser());

  const searchParams = useSearchParams();
  const initialSection = searchParams.get('tab') === 'users' ? 'users' : 'laporan';
  const [activeSection, setActiveSection] = useState<'laporan' | 'users'>(initialSection);

  const [activeTab, setActiveTab] = useState<'ALL' | 'LAPORAN_MASUK' | 'DIPROSES' | 'MENUNGGU_VALIDASI' | 'SELESAI'>('ALL');

  // Modal State for Digitalization & Status Update
  const [selectedReport, setSelectedReport] = useState<HeritageReportItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<'LAPORAN_MASUK' | 'DIPROSES' | 'MENUNGGU_VALIDASI' | 'SELESAI'>('MENUNGGU_VALIDASI');
  const [fotoDigitalisasi, setFotoDigitalisasi] = useState('');
  const [catatanPenanganan, setCatatanPenanganan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [workbenchFeedback, setWorkbenchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Penugasan Konservator & Validasi Laporan (Alur Sibersih)
  const [conservators, setConservators] = useState<Array<{ id: string; nama: string; email: string }>>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reportToAssign, setReportToAssign] = useState<HeritageReportItem | null>(null);
  const [selectedConservatorId, setSelectedConservatorId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'users') {
      setActiveSection('users');
    } else if (tabParam === 'validasi') {
      setActiveSection('laporan');
      setActiveTab('MENUNGGU_VALIDASI');
    } else if (tabParam === 'laporan') {
      setActiveSection('laporan');
    }
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const sessionUser = await fetchUserSession();
        if (!sessionUser) {
          router.push('/login?redirect=/admin');
          return;
        }
        if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'SUPERADMIN') {
          router.push('/pelapor');
          return;
        }
        if (ignore) return;
        setUser(sessionUser);

        // Ambil daftar Konservator untuk penugasan petugas
        fetch('/api/users?role=ADMIN')
          .then((res) => (res.ok ? res.json() : null))
          .then((d) => {
            if (!ignore && d?.users) {
              setConservators(d.users);
            }
          })
          .catch(() => {});

        const now = Date.now();
        // Skip background fetch if data is fresh within 15 seconds
        if (clientCachedReports && now - lastReportsFetched < 15_000) {
          if (!ignore) {
            setReports(clientCachedReports);
            setLoading(false);
          }
          return;
        }

        const repRes = await fetch('/api/reports?status=Semua');
        if (repRes.ok && !ignore) {
          const repData = await repRes.json();
          const items = repData.reports || [];
          clientCachedReports = items;
          lastReportsFetched = Date.now();
          setReports(items);
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
    if (user?.role === 'SUPERADMIN') {
      setUpdatingStatus(report.status === 'LAPORAN_MASUK' ? 'DIPROSES' : report.status);
    } else {
      // Petugas Konservator: alur penyelesaian otomatis diajukan ke MENUNGGU_VALIDASI
      setUpdatingStatus(report.status === 'SELESAI' ? 'SELESAI' : 'MENUNGGU_VALIDASI');
    }
    setFotoDigitalisasi(report.fotoDigitalisasi || '');
    setCatatanPenanganan(report.catatanPenanganan || '');
    setActionError('');
    setModalOpen(true);
  };

  const openAssignModal = (report: HeritageReportItem) => {
    setReportToAssign(report);
    setSelectedConservatorId(report.admin?.id || '');
    setAssignError('');
    setAssignModalOpen(true);
  };

  const handleAssignConservator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportToAssign) return;
    setAssigning(true);
    setAssignError('');

    try {
      const res = await fetch(`/api/reports/${reportToAssign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: selectedConservatorId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menugaskan konservator');
      }

      setReports((prev) => {
        const updated = prev.map((r) => (r.id === reportToAssign.id ? data.report : r));
        clientCachedReports = updated;
        return updated;
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
      }
      setAssignModalOpen(false);
      const chosen = conservators.find((c) => c.id === selectedConservatorId);
      setWorkbenchFeedback({
        type: 'success',
        message: chosen
          ? `Laporan berhasil ditugaskan kepada ${chosen.nama}. Status otomatis dialihkan ke Sedang Ditangani.`
          : 'Penugasan petugas berhasil direset menjadi Belum Ditugaskan.',
      });
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menugaskan');
    } finally {
      setAssigning(false);
    }
  };

  const handleDirectValidate = async (reportId: string, targetStatus: 'SELESAI' | 'DIPROSES' | 'MENUNGGU_VALIDASI') => {
    setWorkbenchFeedback(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWorkbenchFeedback({ type: 'error', message: data.error || 'Gagal memvalidasi laporan' });
      } else {
        setReports((prev) => {
          const updated = prev.map((r) => (r.id === reportId ? data.report : r));
          clientCachedReports = updated;
          return updated;
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
        }
        setWorkbenchFeedback({
          type: 'success',
          message:
            targetStatus === 'SELESAI'
              ? 'Laporan dan hasil penanganan berhasil divalidasi dan disahkan Selesai (resmi terbit di Katalog Budaya).'
              : targetStatus === 'DIPROSES'
              ? 'Laporan dikembalikan ke status Sedang Ditangani untuk direvisi petugas.'
              : 'Laporan dialihkan ke status Menunggu Validasi.',
        });
      }
    } catch (err) {
      console.error('Validation error:', err);
      setWorkbenchFeedback({ type: 'error', message: 'Terjadi kesalahan saat memvalidasi laporan.' });
    }
  };

  const handleRejectReport = async (reportId: string, judul: string) => {
    if (!window.confirm(`Tolak dan hapus laporan "${judul}" secara permanen dari sistem? Seluruh foto dan rekaman akan dihapus dari server.`)) {
      return;
    }
    setWorkbenchFeedback(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setWorkbenchFeedback({ type: 'error', message: data.error || 'Gagal menolak laporan' });
      } else {
        setReports((prev) => {
          const updated = prev.filter((r) => r.id !== reportId);
          clientCachedReports = updated;
          return updated;
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
        }
        setWorkbenchFeedback({
          type: 'success',
          message: `Laporan "${judul}" berhasil ditolak dan dihapus permanen dari sistem (ala tolak laporan palsu).`,
        });
      }
    } catch (err) {
      console.error('Reject report error:', err);
      setWorkbenchFeedback({ type: 'error', message: 'Terjadi kesalahan saat menolak laporan.' });
    }
  };

  const handleTakeOwnership = async (report: HeritageReportItem) => {
    setWorkbenchFeedback(null);
    // Langsung buka laman/modal Tatalaksana Digitalisasi & Restorasi seketika
    openActionModal(report);

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DIPROSES' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWorkbenchFeedback({ type: 'error', message: data.error || 'Gagal menangani laporan' });
      } else {
        setReports((prev) => {
          const updated = prev.map((r) => (r.id === report.id ? data.report : r));
          clientCachedReports = updated;
          return updated;
        });
        setSelectedReport(data.report);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
        }
      }
    } catch (err) {
      console.error('Take ownership error:', err);
      setWorkbenchFeedback({ type: 'error', message: 'Terjadi kesalahan saat memproses laporan.' });
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
          catatanPenanganan: catatanPenanganan || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui data penanganan');
      }

      setReports((prev) => {
        const updated = prev.map((r) => (r.id === selectedReport.id ? data.report : r));
        clientCachedReports = updated;
        return updated;
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan pembaruan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        message="Memuat Workbench Konservator..."
        submessage="Sinkronisasi antrean laporan dan arsip pemulihan cagar budaya"
      />
    );
  }

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  const countMasuk = reports.filter((r) => r.status === 'LAPORAN_MASUK').length;
  const countDiproses = reports.filter((r) => r.status === 'DIPROSES').length;
  const countMenungguValidasi = reports.filter((r) => r.status === 'MENUNGGU_VALIDASI').length;
  const countSelesai = reports.filter((r) => r.status === 'SELESAI').length;

  const isSuperadmin = user?.role === 'SUPERADMIN';

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
            marginBottom: '1.5rem',
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
              <Shield size={14} /> Meja Konservator
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
              {isSuperadmin ? 'Workbench Admin' : 'Workbench Verifikasi'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Petugas:{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {user?.nama}
              </strong>{' '}
              ({isSuperadmin ? 'Superadmin' : 'Konservator'})
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs (Khusus Superadmin: Manajemen Laporan & Kelola Pengguna) */}
        {isSuperadmin && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-hairline)',
              marginBottom: '2rem',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSection('laporan')}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                color: activeSection === 'laporan' ? 'var(--action-primary)' : 'var(--text-muted)',
                borderBottom: activeSection === 'laporan' ? '2px solid var(--action-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              <ClipboardList size={16} />
              <span>Manajemen Laporan ({reports.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('users')}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                color: activeSection === 'users' ? 'var(--action-primary)' : 'var(--text-muted)',
                borderBottom: activeSection === 'users' ? '2px solid var(--action-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '-1px',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={16} />
              <span>Kelola Pengguna</span>
            </button>
          </div>
        )}

        {/* Content: Kelola Pengguna (Superadmin) */}
        {isSuperadmin && activeSection === 'users' ? (
          <UserManagementSection currentUser={user} />
        ) : (
          /* Content: Manajemen Laporan Konservasi */
          <div>
            {workbenchFeedback && (
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: workbenchFeedback.type === 'success' ? 'var(--status-selesai-bg)' : 'var(--status-masuk-bg)',
                  color: workbenchFeedback.type === 'success' ? 'var(--status-selesai)' : 'var(--status-masuk)',
                  border: `1px solid ${workbenchFeedback.type === 'success' ? 'var(--status-selesai-border)' : 'var(--status-masuk-border)'}`,
                  fontSize: '0.875rem',
                }}
              >
                <span>{workbenchFeedback.message}</span>
                <button
                  onClick={() => setWorkbenchFeedback(null)}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Tab Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Semua ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('LAPORAN_MASUK')}
                className={`btn btn-sm ${activeTab === 'LAPORAN_MASUK' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Laporan Masuk ({countMasuk})
              </button>
              <button
                onClick={() => setActiveTab('DIPROSES')}
                className={`btn btn-sm ${activeTab === 'DIPROSES' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Sedang Ditangani ({countDiproses})
              </button>
              <button
                onClick={() => setActiveTab('MENUNGGU_VALIDASI')}
                className={`btn btn-sm ${activeTab === 'MENUNGGU_VALIDASI' ? 'btn-primary' : 'btn-secondary'}`}
                style={
                  countMenungguValidasi > 0 && activeTab !== 'MENUNGGU_VALIDASI'
                    ? { borderColor: 'var(--border-strong)', color: 'var(--color-terracotta)', background: 'var(--color-terracotta-soft)', fontWeight: 600 }
                    : undefined
                }
              >
                <Hourglass size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Menunggu Validasi ({countMenungguValidasi})
              </button>
              <button
                onClick={() => setActiveTab('SELESAI')}
                className={`btn btn-sm ${activeTab === 'SELESAI' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Selesai & Terbit ({countSelesai})
              </button>
            </div>

            {/* List Reports */}
            {filteredReports.length === 0 ? (
              <div className="paper-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                  Tidak ada laporan cagar budaya pada filter status ini.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="paper-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1.25rem',
                      gap: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      {/* Thumbnail Foto Awal */}
                      <div
                        style={{
                          width: '130px',
                          height: '95px',
                          position: 'relative',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--border-hairline)',
                        }}
                      >
                        <Image
                          src={optimizeCloudinaryUrl(report.fotoKondisiAwal, 300)}
                          alt={report.judulPusaka}
                          fill
                          sizes="130px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>

                      {/* Info Laporan */}
                      <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                          <span
                            className={`badge ${
                              report.status === 'SELESAI'
                                ? 'badge-selesai'
                                : report.status === 'MENUNGGU_VALIDASI'
                                ? 'badge-validasi'
                                : report.status === 'DIPROSES'
                                ? 'badge-diproses'
                                : 'badge-masuk'
                            }`}
                          >
                            {report.status === 'LAPORAN_MASUK'
                              ? 'Laporan Masuk'
                              : report.status === 'DIPROSES'
                              ? 'Sedang Ditangani'
                              : report.status === 'MENUNGGU_VALIDASI'
                              ? 'Butuh Review Validasi'
                              : 'Selesai & Terbit'}
                          </span>
                          <span className={`badge ${report.kategori === 'BENDA' ? 'badge-benda' : 'badge-takbenda'}`}>
                            {report.kategori === 'BENDA' ? 'Benda / Cagar' : 'Takbenda / Tradisi'}
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: '0 0 0.35rem 0',
                            lineHeight: 1.3,
                          }}
                        >
                          {report.judulPusaka}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                          <MapPin size={13} />
                          <span>{report.lokasiSpesifik}, {report.kabupatenKota}</span>
                        </div>

                        <p
                          style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            lineHeight: 1.5,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {report.deskripsiKrisis}
                        </p>
                      </div>

                      {/* Aksi & Status Penanganan (Alur Sibersih) */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                          alignItems: 'flex-end',
                          marginLeft: 'auto',
                          flexShrink: 0,
                          minWidth: '220px',
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Pelapor: </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{report.pelapor?.nama || 'Masyarakat'}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Petugas: </span>
                            {report.admin ? (
                              <strong style={{ color: 'var(--action-primary)' }}>{report.admin.nama}</strong>
                            ) : (
                              <span style={{ color: 'var(--status-masuk)', fontStyle: 'italic', fontWeight: 600 }}>Belum Ditugaskan</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                          {/* Superadmin Actions ala Sibersih */}
                          {isSuperadmin && (
                            <>
                              {/* Tugaskan Petugas pada LAPORAN_MASUK atau DIPROSES */}
                              {(report.status === 'LAPORAN_MASUK' || report.status === 'DIPROSES') && (
                                <button
                                  onClick={() => openAssignModal(report)}
                                  className="btn btn-secondary btn-sm"
                                  title={report.admin ? 'Ubah Petugas Konservator' : 'Tugaskan Petugas Konservator'}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <UserCheck size={13} style={{ color: 'var(--action-primary)' }} />
                                  <span>{report.admin ? 'Ubah Petugas' : 'Tugaskan'}</span>
                                </button>
                              )}

                              {/* Validasi Selesai HANYA pada laporan yang sudah selesai dikerjakan petugas (MENUNGGU_VALIDASI) */}
                              {report.status === 'MENUNGGU_VALIDASI' && (
                                <button
                                  onClick={() => handleDirectValidate(report.id, 'SELESAI')}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: 'var(--status-selesai-bg)',
                                    color: 'var(--status-selesai)',
                                    border: '1px solid var(--status-selesai-border)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    fontWeight: 600,
                                  }}
                                  title="Validasi & Sahkan Laporan Selesai (Publikasi ke Katalog)"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Setujui Selesai</span>
                                </button>
                              )}

                              {/* Kembalikan ke Petugas jika MENUNGGU_VALIDASI */}
                              {report.status === 'MENUNGGU_VALIDASI' && (
                                <button
                                  onClick={() => handleDirectValidate(report.id, 'DIPROSES')}
                                  className="btn btn-outline btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                  title="Kembalikan ke status Sedang Ditangani untuk revisi petugas"
                                >
                                  <RotateCcw size={13} />
                                  <span>Revisi</span>
                                </button>
                              )}

                              {/* Tolak Laporan Palsu / Hapus permanen (Hanya untuk laporan yang belum disetujui selesai) */}
                              {report.status !== 'SELESAI' && (
                                <button
                                  onClick={() => handleRejectReport(report.id, report.judulPusaka)}
                                  className="btn btn-sm"
                                  style={{
                                    backgroundColor: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                  }}
                                  title="Tolak dan hapus laporan palsu secara permanen"
                                >
                                  <Trash2 size={13} />
                                  <span>Tolak</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Admin (Konservator) Actions ala Sibersih */}
                          {!isSuperadmin && (
                            <>
                              {report.status === 'LAPORAN_MASUK' && !report.admin && (
                                <button
                                  onClick={() => handleTakeOwnership(report)}
                                  className="btn btn-outline btn-sm"
                                  title="Tangani Laporan Ini (Buka Tatalaksana & Restorasi)"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <Play size={13} />
                                  <span>Tangani</span>
                                </button>
                              )}

                              {report.status === 'DIPROSES' && (
                                <button
                                  onClick={() => openActionModal(report)}
                                  className="btn btn-primary btn-sm"
                                  title="Buka Laman Tatalaksana Digitalisasi & Restorasi"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <Upload size={13} />
                                  <span>Tangani</span>
                                </button>
                              )}

                              {report.status === 'MENUNGGU_VALIDASI' && (
                                <button
                                  onClick={() => openActionModal(report)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <Upload size={13} />
                                  <span>Perbarui Bukti</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Link Pratinjau Dossier Publik */}
                          <Link
                            href={`/katalog/${report.id}`}
                            className="btn btn-secondary btn-sm"
                            target="_blank"
                            title="Pratinjau Dossier Publik"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Perbandingan Sebelum vs Sesudah (Tampilan Khusus Validasi Sibersih) */}
                    {(report.status === 'MENUNGGU_VALIDASI' || (report.status === 'SELESAI' && report.fotoDigitalisasi)) && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: '1rem',
                          padding: '0.9rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-hairline)',
                          marginTop: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }} /> Sebelum (Laporan Awal)
                          </div>
                          <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}>
                            <Image src={optimizeCloudinaryUrl(report.fotoKondisiAwal, 400)} alt="Sebelum" fill sizes="260px" style={{ objectFit: 'cover' }} />
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.4, margin: '0.4rem 0 0 0' }}>
                            {report.deskripsiKrisis}
                          </p>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--status-selesai)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-selesai)' }} /> Sesudah (Hasil Penanganan Petugas)
                          </div>
                          <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}>
                            {report.fotoDigitalisasi ? (
                              <Image src={optimizeCloudinaryUrl(report.fotoDigitalisasi, 400)} alt="Sesudah" fill sizes="260px" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', background: 'var(--bg-canvas)' }}>
                                (Belum ada foto digitalisasi)
                              </div>
                            )}
                          </div>
                          {report.catatanPenanganan && (
                            <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-hairline)' }}>
                              <strong style={{ fontSize: '0.7rem', color: 'var(--status-selesai)', display: 'block', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Catatan Petugas:</strong>
                              <span style={{ color: 'var(--text-secondary)' }}>{report.catatanPenanganan}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Jika ada catatan penanganan lapangan dan bukan mode validasi gambar */}
                    {report.catatanPenanganan && report.status !== 'MENUNGGU_VALIDASI' && !(report.status === 'SELESAI' && report.fotoDigitalisasi) && (
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: 'var(--bg-canvas)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.825rem',
                          color: 'var(--text-secondary)',
                          borderLeft: '3px solid var(--action-primary)',
                          marginTop: '0.85rem',
                        }}
                      >
                        <strong style={{ color: 'var(--action-primary)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em', display: 'block', marginBottom: '0.2rem' }}>
                          Catatan Petugas:
                        </strong>
                        {report.catatanPenanganan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Tatalaksana Konservasi & Digitalisasi */}
        {modalOpen && selectedReport && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="paper-card"
              style={{
                width: '100%',
                maxWidth: '620px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-hairline)',
                  paddingBottom: '0.75rem',
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
                    Cagar Budaya: <strong style={{ color: 'var(--text-primary)' }}>{selectedReport.judulPusaka}</strong>
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
                  <label className="form-label">
                    {isSuperadmin ? 'Ubah Status Validasi Laporan' : 'Status Pengajuan Tugas'}
                  </label>
                  {isSuperadmin ? (
                    <select
                      value={updatingStatus}
                      onChange={(e) => setUpdatingStatus(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="SELESAI">SELESAI (Validasi Disetujui & Terbitkan ke Katalog)</option>
                      <option value="MENUNGGU_VALIDASI">MENUNGGU_VALIDASI (Butuh Review Hasil Petugas)</option>
                      <option value="DIPROSES">DIPROSES (Kembalikan ke Penanganan Petugas)</option>
                      <option value="LAPORAN_MASUK">LAPORAN_MASUK (Kembalikan ke Antrean Baru)</option>
                    </select>
                  ) : (
                    <select
                      value={updatingStatus}
                      onChange={(e) => setUpdatingStatus(e.target.value as any)}
                      className="form-select"
                    >
                      <option value="MENUNGGU_VALIDASI">
                        Ajukan Penyelesaian untuk Divalidasi Superadmin
                      </option>
                      <option value="DIPROSES">
                        Simpan Sebagai Draf Penanganan (Masih Berlangsung)
                      </option>
                    </select>
                  )}
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
                    {submitting
                      ? 'Menyimpan...'
                      : isSuperadmin
                      ? 'Simpan Validasi'
                      : updatingStatus === 'MENUNGGU_VALIDASI'
                      ? 'Ajukan untuk Validasi Superadmin'
                      : 'Simpan Draf Penanganan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Penugasan Petugas Konservator (Alur Sibersih) */}
        {assignModalOpen && reportToAssign && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="paper-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-hairline)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      margin: '0 0 0.25rem 0',
                    }}
                  >
                    Tugaskan Petugas Konservasi
                  </h3>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Laporan: <strong style={{ color: 'var(--text-primary)' }}>{reportToAssign.judulPusaka}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalOpen(false)}
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

              {assignError && (
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
                  {assignError}
                </div>
              )}

              <form onSubmit={handleAssignConservator}>
                <div className="form-group">
                  <label className="form-label">Pilih Petugas / Konservator Wilayah</label>
                  <select
                    value={selectedConservatorId}
                    onChange={(e) => setSelectedConservatorId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Belum Ditugaskan (Kosongkan) --</option>
                    {conservators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama} ({c.email})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                    Menugaskan petugas akan otomatis memperbarui status laporan menjadi &quot;Sedang Ditangani&quot;.
                  </span>
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
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="btn btn-secondary btn-sm"
                    disabled={assigning}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={assigning}
                  >
                    {assigning ? 'Menugaskan...' : 'Tetapkan Petugas'}
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
