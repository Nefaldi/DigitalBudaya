'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole, UserSession } from '@/types';
import {
  Search,
  Shield,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface UserItem {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  createdAt: string;
  _count?: {
    laporanDikirim: number;
    laporanDiproses: number;
  };
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function fetchUsers() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        if (authData.user.role !== 'SUPERADMIN') {
          router.push('/admin');
          return;
        }
        if (ignore) return;
        setCurrentUser(authData.user);

        const res = await fetch(`/api/users?role=${roleFilter}`);
        if (res.ok) {
          const json = await res.json();
          if (ignore) return;
          setUsers(json.users || []);
        }
      } catch (err) {
        console.error('Fetch users error:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, [roleFilter, router]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengubah peran pengguna');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setFeedback({ type: 'success', message: 'Peran pengguna berhasil diperbarui.' });
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Gagal memperbarui peran.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userNama: string) => {
    if (userId === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Superadmin Anda sendiri!');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${userNama}" secara permanen?`)) {
      return;
    }

    setDeletingId(userId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus pengguna');
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setFeedback({ type: 'success', message: `Pengguna "${userNama}" berhasil dihapus.` });
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menghapus pengguna.' });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat Konsol Manajemen Pengguna...</p>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
              <Shield size={14} /> Konsol Akses & Otorisasi RBAC
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
              Manajemen Pengguna & Peran
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Kelola peran petugas konservator, pimpinan superadmin, dan akun masyarakat pelapor cagar budaya.
            </p>
          </div>

          <Link href="/superadmin/analytics" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} /> Ke Dasbor Analitik
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: feedback.type === 'success' ? 'var(--status-selesai-bg)' : 'var(--status-masuk-bg)',
              border: `1px solid ${feedback.type === 'success' ? 'var(--status-selesai-border)' : 'var(--status-masuk-border)'}`,
              color: feedback.type === 'success' ? 'var(--status-selesai)' : 'var(--status-masuk)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div
          className="paper-card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ padding: '0.55rem 0.85rem' }}
            />
          </div>

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Semua', 'SUPERADMIN', 'ADMIN', 'PELAPOR'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
              >
                {r === 'ADMIN' ? 'Konservator (Admin)' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table Card */}
        <div className="paper-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-hairline)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Nama Pengguna</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Alamat Email</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Peran Saat Ini (RBAC)</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Aktivitas</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>Ubah Hak Akses</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 500, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid var(--border-hairline)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {user.nama}
                    {user.id === currentUser?.id && (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.72rem',
                          color: 'var(--action-primary)',
                          background: 'var(--color-terracotta-soft)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 500,
                        }}
                      >
                        Anda
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span
                      className={`badge ${
                        user.role === 'SUPERADMIN'
                          ? 'badge-diproses'
                          : user.role === 'ADMIN'
                          ? 'badge-selesai'
                          : 'badge-takbenda'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>Lapor: {user._count?.laporanDikirim || 0}</div>
                    <div>Tangani: {user._count?.laporanDiproses || 0}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <select
                      value={user.role}
                      disabled={updatingId === user.id || user.id === currentUser?.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="form-select"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                    >
                      <option value="PELAPOR">PELAPOR (Masyarakat)</option>
                      <option value="ADMIN">ADMIN (Konservator)</option>
                      <option value="SUPERADMIN">SUPERADMIN (Pimpinan)</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    {user.id !== currentUser?.id ? (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.nama)}
                        disabled={deletingId === user.id}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.4rem 0.65rem' }}
                        title="Hapus Akun Pengguna"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Terkunci</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
