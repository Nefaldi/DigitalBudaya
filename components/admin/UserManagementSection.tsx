'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, UserSession } from '@/types';
import LoadingScreen from '@/components/LoadingScreen';
import {
  Search,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  X,
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

interface UserManagementSectionProps {
  currentUser: UserSession | null;
}

// Module-level in-memory cache for user list per role
const clientUserCache: Record<string, { users: UserItem[]; timestamp: number }> = {};

export default function UserManagementSection({ currentUser }: UserManagementSectionProps) {
  const initialCache = clientUserCache['Semua']?.users || [];
  const [users, setUsers] = useState<UserItem[]>(initialCache);
  const [loading, setLoading] = useState(!clientUserCache['Semua']);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ADMIN');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ id: string; nama: string } | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchUsers() {
      const now = Date.now();
      const cached = clientUserCache[roleFilter];

      if (cached && now - cached.timestamp < 15_000) {
        if (!ignore) {
          setUsers(cached.users);
          setLoading(false);
        }
        return;
      }

      try {
        if (!cached) {
          setLoading(true);
        }
        const res = await fetch(`/api/users?role=${roleFilter}`);
        if (res.ok) {
          const json = await res.json();
          if (ignore) return;
          const userList = json.users || [];
          clientUserCache[roleFilter] = { users: userList, timestamp: Date.now() };
          setUsers(userList);
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
  }, [roleFilter]);

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

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const { id: userId, nama: userNama } = userToDelete;

    if (userId === currentUser?.id) {
      setFeedback({ type: 'error', message: 'Anda tidak dapat menghapus akun Superadmin Anda sendiri.' });
      setUserToDelete(null);
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
      setUserToDelete(null);
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menghapus pengguna.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreatingUser(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: newNama,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan pengguna');
      }

      setUsers((prev) => [data.user, ...prev]);
      const roleDisplayName = newRole === 'SUPERADMIN' ? 'Superadmin' : newRole === 'PELAPOR' ? 'Pelapor' : 'Admin (Konservator)';
      setFeedback({ type: 'success', message: `Pengguna "${newNama}" berhasil didaftarkan sebagai ${roleDisplayName}.` });
      setAddModalOpen(false);
      setNewNama('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('ADMIN');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div>
      {/* Sub-header & Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Daftar Pengguna Sistem
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Kelola peran hak akses (Role-Based Access Control) dan akun staf konservator maupun pelapor.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError('');
            setAddModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
        >
          <UserPlus size={14} />
          <span>Tambah Pengguna</span>
        </button>
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
              {r === 'ADMIN' ? 'Admin (Konservator)' : r === 'SUPERADMIN' ? 'Superadmin' : r === 'PELAPOR' ? 'Pelapor' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state for users */}
      {loading ? (
        <div style={{ padding: '3rem 0' }}>
          <LoadingScreen message="Memuat daftar pengguna..." submessage="Sinkronisasi akun pengelola" fullScreen={false} />
        </div>
      ) : (
        /* Users Table Card */
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid var(--border-hairline)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {u.nama}
                      {u.id === currentUser?.id && (
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
                      {u.email}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        className={`badge ${
                          u.role === 'SUPERADMIN'
                            ? 'badge-diproses'
                            : u.role === 'ADMIN'
                            ? 'badge-selesai'
                            : 'badge-takbenda'
                        }`}
                      >
                        {u.role === 'SUPERADMIN' ? 'Superadmin' : u.role === 'PELAPOR' ? 'Pelapor' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>Lapor: {u._count?.laporanDikirim || 0}</div>
                      <div>Tangani: {u._count?.laporanDiproses || 0}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <select
                        value={u.role}
                        disabled={updatingId === u.id || u.id === currentUser?.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="form-select"
                        style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="PELAPOR">Pelapor (Masyarakat)</option>
                        <option value="ADMIN">Admin (Konservator)</option>
                        <option value="SUPERADMIN">Superadmin (Pimpinan)</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {u.id !== currentUser?.id ? (
                        <button
                          onClick={() => setUserToDelete({ id: u.id, nama: u.nama })}
                          disabled={deletingId === u.id}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {addModalOpen && (
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
              maxWidth: '480px',
              padding: 'clamp(1.5rem, 4vw, 2rem)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <UserPlus size={18} style={{ color: 'var(--action-primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Tambah Pengguna Baru
                </h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
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

            {createError && (
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
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat Email</label>
                <input
                  type="email"
                  required
                  placeholder="nama@instansi.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Sandi (Password Awal)</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Peran & Hak Akses</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="form-select"
                >
                  <option value="ADMIN">Admin (Konservator - Petugas Wilayah)</option>
                  <option value="PELAPOR">Pelapor (Masyarakat Umum)</option>
                  <option value="SUPERADMIN">Superadmin (Pimpinan / Pengelola Sistem)</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Admin berhak memverifikasi antrean dan mengunggah digitalisasi; Pelapor berhak mengirim laporan budaya.
                </span>
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
                  onClick={() => setAddModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={creatingUser}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="btn btn-primary btn-sm"
                >
                  {creatingUser ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Buat Pengguna</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div className="paper-card" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Konfirmasi Hapus Akun
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Apakah Anda yakin ingin menghapus akun pengguna <strong>&ldquo;{userToDelete.nama}&rdquo;</strong> secara permanen? Seluruh riwayat laporan terkait akan dibersihkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setUserToDelete(null)}
                className="btn btn-secondary btn-sm"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={confirmDeleteUser}
                className="btn btn-danger btn-sm"
              >
                {deletingId ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
