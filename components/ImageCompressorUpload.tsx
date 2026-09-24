'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImageCompressorUploadProps {
  onUploadSuccess: (url: string) => void;
  folder?: string;
  label?: string;
  initialUrl?: string;
}

export default function ImageCompressorUpload({
  onUploadSuccess,
  folder = 'digiculture_care',
  label = 'Unggah Foto Bukti Cagar Budaya',
  initialUrl = '',
}: ImageCompressorUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savingsInfo, setSavingsInfo] = useState<{ origSize: string; compSize: string; ratio: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Canvas context failure'));
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setStatusMsg('');
    setSavingsInfo(null);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    try {
      setCompressing(true);
      setStatusMsg('Mengompresi gambar di browser agar hemat kuota server...');

      const originalSize = file.size;
      const compressedBlob = await compressImage(file);
      const compressedSize = compressedBlob.size;

      const savedPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
      setSavingsInfo({
        origSize: formatBytes(originalSize),
        compSize: formatBytes(compressedSize),
        ratio: `${savedPercent}%`,
      });

      const localPreview = URL.createObjectURL(compressedBlob);
      setPreviewUrl(localPreview);

      setCompressing(false);
      setUploading(true);
      setStatusMsg('Mengunggah berkas ke Cloudinary CDN...');

      const formData = new FormData();
      formData.append('file', compressedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah berkas');
      }

      setPreviewUrl(data.url);
      setStatusMsg('Unggah berhasil!');
      onUploadSuccess(data.url);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah foto.';
      setErrorMsg(msg);
    } finally {
      setCompressing(false);
      setUploading(false);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>

      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: compressing || uploading ? 'not-allowed' : 'pointer',
          background: 'var(--bg-card)',
          transition: 'border-color 0.15s ease',
          position: 'relative',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={compressing || uploading}
        />

        {previewUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxHeight: '180px',
                borderRadius: '8px',
                objectFit: 'contain',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <span className="link-editorial" style={{ fontSize: '0.8rem' }}>
              Klik untuk mengganti foto
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--color-terracotta-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--action-primary)',
            }}>
              <UploadCloud size={20} />
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Pilih foto atau seret ke sini
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              JPG, PNG, atau WEBP (Otomatis dikompresi sebelum diunggah)
            </div>
          </div>
        )}

        {(compressing || uploading) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            borderRadius: 'var(--radius-lg)',
          }}>
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--action-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Savings Metric Callout */}
      {savingsInfo && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.45rem 0.75rem',
          background: 'var(--status-selesai-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--status-selesai)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          <CheckCircle2 size={14} />
          <span>
            Kompresi: {savingsInfo.origSize} → <strong>{savingsInfo.compSize}</strong> (Hemat {savingsInfo.ratio})
          </span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.45rem 0.75rem',
          background: 'var(--status-masuk-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: 'var(--status-masuk)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
