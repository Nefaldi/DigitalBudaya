'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Edit3,
  Settings,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface UserProfileData {
  id: string;
  nama: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'PELAPOR';
  createdAt: string;
  updatedAt: string;
}

type ProfileTab = 'info' | 'edit' | 'settings';

export default function PelaporProfilPage() {
  const router = useRouter();

  // Initial State
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Tab: 3 fitur utama (Informasi Pribadi, Edit Profil, Pengaturan Akun)
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');

  // Form State: Edit Profile
  const [nama, setNama] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Form State: Settings (Password)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Modal State: Delete Account
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      try {
        const res = await fetch('/api/users/profile');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Gagal memuat profil');
        }
        const data = await res.json();
        if (ignore) return;

        setProfile(data.user);
        setNama(data.user.nama);
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

  // Handle Save Profile Information (Edit Profil)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    if (!nama.trim() || nama.trim().length < 2) {
      setProfileErrorMsg('Nama lengkap minimal terdiri dari 2 karakter.');
      return;
    }

    setSavingProfile(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan perubahan profil.');
      }

      setProfile(data.user);
      setNama(data.user.nama);
      setProfileSuccessMsg('Nama profil berhasil diperbarui!');
    } catch (err) {
      setProfileErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password (Pengaturan Akun)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg('');
    setPasswordErrorMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMsg('Kata sandi baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui kata sandi.');
      }

      setPasswordSuccessMsg('Kata sandi Anda berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Delete Account (Pengaturan Akun)
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteErrorMsg('');

    if (!deletePassword) {
      setDeleteErrorMsg('Harap masukkan kata sandi akun untuk konfirmasi.');
      return;
    }

    setDeletingAccount(true);

    try {
      const res = await fetch('/api/users/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus akun.');
      }

      setDeleteSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (err) {
      setDeleteErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus akun.');
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--action-primary)', margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat profil akun...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* User Identity Banner Card */}
        <div
          className="paper-card"
          style={{
            padding: '1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            border: '1px solid var(--border-hairline)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-brand-soft)',
                border: '2px solid var(--action-primary)',
                color: 'var(--action-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {profile?.nama ? profile.nama.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {profile?.nama}
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-brand-soft)',
                    color: 'var(--action-primary)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  {profile?.role === 'SUPERADMIN'
                    ? 'Superadmin Sistem'
                    : profile?.role === 'ADMIN'
                    ? 'Konservator Cagar Budaya'
                    : 'Pelapor Cagar Budaya'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                <span>{profile?.email}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                <Calendar size={13} />
                <span>Terdaftar sejak {formatDate(profile?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 FITUR TABS: INFORMASI PRIBADI, EDIT PROFIL, PENGATURAN AKUN */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-hairline)',
            marginBottom: '1.75rem',
          }}
        >
          {/* Fitur 1: Informasi Pribadi */}
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.7rem 1.1rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'info' ? 'var(--action-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'info' ? '2px solid var(--action-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-1px',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={16} />
            <span>Informasi Pribadi</span>
          </button>

          {/* Fitur 2: Edit Profil */}
          <button
            onClick={() => setActiveTab('edit')}
            style={{
              padding: '0.7rem 1.1rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'edit' ? 'var(--action-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'edit' ? '2px solid var(--action-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-1px',
              transition: 'all 0.15s ease',
            }}
          >
            <Edit3 size={16} />
            <span>Edit Profil</span>
          </button>

          {/* Fitur 3: Pengaturan Akun */}
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.7rem 1.1rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              border: 'none',
              background: 'transparent',
              color: activeTab === 'settings' ? 'var(--action-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'settings' ? '2px solid var(--action-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-1px',
              transition: 'all 0.15s ease',
            }}
          >
            <Settings size={16} />
            <span>Pengaturan Akun</span>
          </button>
        </div>

        {/* KONTEN FITUR 1: INFORMASI PRIBADI */}
        {activeTab === 'info' && (
          <div className="paper-card" style={{ padding: '2rem', border: '1px solid var(--border-hairline)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Informasi Pribadi
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Informasi akun terdaftar pengguna portal.
              </p>
            </div>

            {/* Hanya berisi Nama, Email, Peran */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <User size={14} style={{ color: 'var(--action-primary)' }} />
                  <span>Nama</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.nama}
                </div>
              </div>

              <div
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <Mail size={14} style={{ color: 'var(--action-primary)' }} />
                  <span>Email</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.email}
                </div>
              </div>

              <div
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--action-primary)' }} />
                  <span>Peran</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {profile?.role === 'SUPERADMIN' ? 'Superadmin' : profile?.role === 'ADMIN' ? 'Konservator' : 'Pelapor'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KONTEN FITUR 2: EDIT PROFIL */}
        {activeTab === 'edit' && (
          <div className="paper-card" style={{ padding: '2rem', border: '1px solid var(--border-hairline)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Edit Profil Pengguna
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Perbarui nama tampilan akun Anda.
              </p>
            </div>

            {profileSuccessMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--status-selesai-bg)',
                  border: '1px solid var(--status-selesai-border)',
                  color: 'var(--status-selesai)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Check size={16} />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--status-masuk-bg)',
                  border: '1px solid var(--status-masuk-border)',
                  color: 'var(--status-masuk)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={16} />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={15} style={{ color: 'var(--action-primary)' }} />
                  <span>Nama</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Anda"
                  className="form-input"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Hanya nama yang dapat diedit pada profil ini.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={15} style={{ color: 'var(--action-primary)' }} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="form-input"
                  style={{ background: 'var(--bg-canvas)', opacity: 0.85, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Alamat email tidak dapat diubah.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={15} style={{ color: 'var(--action-primary)' }} />
                  <span>Peran</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.role || 'PELAPOR'}
                  className="form-input"
                  style={{ background: 'var(--bg-canvas)', opacity: 0.85, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Peran akun tidak dapat diubah.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setNama(profile?.nama || '');
                    setProfileErrorMsg('');
                    setProfileSuccessMsg('');
                    setActiveTab('info');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.9rem' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* KONTEN FITUR 3: PENGATURAN AKUN */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Card 1: Ganti Kata Sandi */}
            <div className="paper-card" style={{ padding: '2rem', border: '1px solid var(--border-hairline)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Keamanan & Kata Sandi
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akses portal.
                </p>
              </div>

              {passwordSuccessMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-selesai-bg)',
                    border: '1px solid var(--status-selesai-border)',
                    color: 'var(--status-selesai)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Check size={16} />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-masuk-bg)',
                    border: '1px solid var(--status-masuk-border)',
                    color: 'var(--status-masuk)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={15} style={{ color: 'var(--action-primary)' }} />
                    <span>Kata Sandi Saat Ini</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi saat ini"
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                      aria-label={showCurrentPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <KeyRound size={15} style={{ color: 'var(--action-primary)' }} />
                    <span>Kata Sandi Baru</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="form-input"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                      aria-label={showNewPass ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} style={{ color: 'var(--action-primary)' }} />
                    <span>Konfirmasi Kata Sandi Baru</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'center' }}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Memperbarui...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} />
                        <span>Perbarui Kata Sandi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Card 2: Zona Berbahaya (Hapus Akun Mandiri - Khusus Role PELAPOR) */}
            {profile?.role === 'PELAPOR' ? (
              <div
                className="paper-card"
                style={{
                  padding: '2rem',
                  border: '1px solid var(--status-masuk-border)',
                  background: 'var(--status-masuk-bg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-masuk)', marginBottom: '0.35rem' }}>
                      <AlertTriangle size={18} />
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                        Zona Berbahaya: Hapus Akun
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--status-masuk)', maxWidth: '580px', margin: 0, lineHeight: 1.5 }}>
                      Menghapus akun Anda akan membatalkan seluruh data profil dan menghapus riwayat laporan cagar budaya Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setDeletePassword('');
                      setDeleteErrorMsg('');
                    }}
                    className="btn btn-outline"
                    style={{
                      color: 'var(--status-masuk)',
                      borderColor: 'var(--status-masuk-border)',
                      background: 'var(--color-card)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Trash2 size={15} />
                    <span>Hapus Akun Saya</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="paper-card"
                style={{
                  padding: '1.5rem',
                  border: '1px solid var(--border-hairline)',
                  background: 'var(--bg-canvas)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--action-primary)' }} />
                  <span style={{ fontSize: '0.875rem' }}>
                    Akun {profile?.role === 'SUPERADMIN' ? 'Superadmin' : 'Konservator'} dikelola langsung pada konsol administrasi sistem dan tidak dapat dihapus secara mandiri.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Konfirmasi Hapus Akun */}
        {isDeleteModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
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
                maxWidth: '460px',
                padding: '2rem',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {deleteSuccess ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-selesai-bg)',
                      color: 'var(--status-selesai)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      border: '1px solid var(--status-selesai-border)',
                    }}
                  >
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Akun Berhasil Dihapus
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Seluruh data profil dan arsip laporan Anda telah dibersihkan secara permanen. Anda sedang dialihkan ke beranda...
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--status-masuk)', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={22} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>
                      Konfirmasi Hapus Akun
                    </h3>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Apakah Anda benar-benar yakin ingin menghapus akun Anda? Seluruh riwayat laporan cagar budaya Anda akan dihapus secara permanen.
                  </p>

                  {deleteErrorMsg && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--status-masuk-bg)',
                        border: '1px solid var(--status-masuk-border)',
                        color: 'var(--status-masuk)',
                        fontSize: '0.825rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <AlertTriangle size={15} />
                      <span>{deleteErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleDeleteAccount}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">
                        Masukkan Kata Sandi untuk Konfirmasi:
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showDeletePass ? 'text' : 'password'}
                          required
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Kata sandi akun Anda"
                          className="form-input"
                          style={{ paddingRight: '2.5rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePass(!showDeletePass)}
                          style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.2rem',
                          }}
                        >
                          {showDeletePass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        disabled={deletingAccount}
                        onClick={() => {
                          setIsDeleteModalOpen(false);
                          setDeletePassword('');
                          setDeleteErrorMsg('');
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={deletingAccount}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: 'var(--status-masuk)',
                          color: '#ffffff',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        {deletingAccount ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Menghapus...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            <span>Hapus Permanen</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
