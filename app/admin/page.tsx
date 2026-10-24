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

  const [activeTab, setActiveTab] = useState<'ALL' | 'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI'>('ALL');

  // Modal State for Digitalization & Status Update
  const [selectedReport, setSelectedReport] = useState<HeritageReportItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<'LAPORAN_MASUK' | 'DIPROSES' | 'SELESAI'>('DIPROSES');
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
    setUpdatingStatus(report.status === 'LAPORAN_MASUK' ? 'DIPROSES' : report.status);
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

  const handleDirectValidate = async (reportId: string, targetStatus: 'SELESAI' | 'DIPROSES') => {
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
              ? 'Laporan dan hasil penanganan berhasil divalidasi dan disahkan Selesai (terbit di Katalog Budaya).'
              : 'Laporan dikembalikan ke status Sedang Ditangani.',
        });
      }
    } catch (err) {
      console.error('Validation error:', err);
      setWorkbenchFeedback({ type: 'error', message: 'Terjadi kesalahan saat memvalidasi laporan.' });
    }
  };

  const handleTakeOwnership = async (reportId: string) => {
    setWorkbenchFeedback(null);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DIPROSES' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWorkbenchFeedback({ type: 'error', message: data.error || 'Gagal mengambil alih laporan' });
      } else {
        setReports((prev) => {
          const updated = prev.map((r) => (r.id === reportId ? data.report : r));
          clientCachedReports = updated;
          return updated;
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('digiculture-reports-update'));
        }
        setWorkbenchFeedback({ type: 'success', message: 'Laporan berhasil diambil alih untuk penanganan konservasi.' });
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
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
                onClick={() => setActiveTab('SELESAI')}
                className={`btn btn-sm ${activeTab === 'SELESAI' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Selesai / Terverifikasi ({countSelesai})
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
                                : report.status === 'DIPROSES'
                                ? 'badge-diproses'
                                : 'badge-masuk'
                            }`}
                          >
                            {report.status === 'LAPORAN_MASUK'
                              ? 'Laporan Masuk'
                              : report.status === 'DIPROSES'
                              ? 'Sedang Ditangani'
                              : 'Selesai'}
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
                          minWidth: '200px',
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
                          {/* Superadmin: Tugaskan Petugas Konservator (Alur Sibersih) */}
                          {isSuperadmin && (
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

                          {/* Admin: Ambil alih penanganan jika belum ditugaskan */}
                          {!isSuperadmin && report.status === 'LAPORAN_MASUK' && !report.admin && (
                            <button
                              onClick={() => handleTakeOwnership(report.id)}
                              className="btn btn-outline btn-sm"
                              title="Ambil Alih Penanganan"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Play size={13} />
                              <span>Ambil Alih</span>
                            </button>
                          )}

                          {/* Superadmin: Validasi Langsung Selesai jika laporan sedang diproses/ditangani */}
                          {isSuperadmin && report.status === 'DIPROSES' && (
                            <button
                              onClick={() => handleDirectValidate(report.id, 'SELESAI')}
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: 'var(--status-selesai)', color: 'var(--status-selesai)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              title="Validasi & Sahkan Laporan Selesai (Publikasi ke Katalog)"
                            >
                              <CheckCircle2 size={13} />
                              <span>Validasi Selesai</span>
                            </button>
                          )}

                          <button
                            onClick={() => openActionModal(report)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Upload size={13} />
                            <span>{isSuperadmin ? 'Validasi / Tindak' : 'Tatalaksana'}</span>
                          </button>

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

                    {/* Jika sudah ada catatan penanganan lapangan (Gaya Sibersih) */}
                    {report.catatanPenanganan && (
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
