'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  X,
  RefreshCw,
} from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Synchronous lock to prevent concurrent double-upload execution
  const isProcessingRef = useRef(false);
  // Track temporary uploaded URL in this session to clean up if replaced
  const lastUploadedUrlRef = useRef<string | null>(null);

  // Synchronize previewUrl if initialUrl changes externally
  useEffect(() => {
    if (initialUrl && !lastUploadedUrlRef.current) {
      setPreviewUrl(initialUrl);
    }
  }, [initialUrl]);

  // Clean up Blob URLs to prevent browser memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const processAndUploadFile = useCallback(
    async (file: File) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      setErrorMsg('');
      setStatusMsg('');

      if (!file.type.startsWith('image/')) {
        setErrorMsg('Harap pilih berkas foto (JPG, PNG, atau WEBP).');
        isProcessingRef.current = false;
        return;
      }

      try {
        setCompressing(true);
        setStatusMsg('Menyiapkan foto...');

        const compressedBlob = await compressImage(file);

        const localPreview = URL.createObjectURL(compressedBlob);
        setPreviewUrl((prev) => {
          if (prev && prev.startsWith('blob:')) {
            URL.revokeObjectURL(prev);
          }
          return localPreview;
        });

        setCompressing(false);
        setUploading(true);
        setStatusMsg('Mengunggah foto...');

        const formData = new FormData();
        formData.append('file', compressedBlob, file.name.replace(/\.[^/.]+$/, '.jpg'));
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengunggah foto');
        }

        // Clean up previously uploaded session file if superseded
        if (lastUploadedUrlRef.current && lastUploadedUrlRef.current !== initialUrl) {
          fetch('/api/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: lastUploadedUrlRef.current }),
          }).catch(() => {});
        }
        lastUploadedUrlRef.current = data.url;

        setPreviewUrl(data.url);
        setStatusMsg('Foto berhasil diunggah');
        onUploadSuccess(data.url);
      } catch (err: unknown) {
        console.error('Upload failed:', err);
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengunggah foto.';
        setErrorMsg(msg);
      } finally {
        setCompressing(false);
        setUploading(false);
        isProcessingRef.current = false;
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
      }
    },
    [folder, initialUrl, onUploadSuccess]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (compressing || uploading || isProcessingRef.current) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!compressing && !uploading && !isProcessingRef.current) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Camera Handlers
  const startCamera = async (mode: 'environment' | 'user' = 'environment') => {
    setErrorMsg('');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      // Fallback directly to native device camera
      cameraInputRef.current?.click();
      return;
    }

    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setCameraActive(true);
      setFacingMode(mode);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      // If live camera viewfinder is not granted (e.g. permission denied or insecure context), fall back to native camera input
      stopCamera();
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const switchCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        stopCamera();
        if (blob) {
          const file = new File([blob], `pusaka_${Date.now()}.jpg`, { type: 'image/jpeg' });
          processAndUploadFile(file);
        }
      },
      'image/jpeg',
      0.88
    );
  };

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => startCamera('environment')}
          disabled={compressing || uploading}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--action-primary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: compressing || uploading ? 'not-allowed' : 'pointer',
            padding: '0.2rem 0.4rem',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <Camera size={14} />
          <span>Ambil dari Kamera</span>
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileChange}
        disabled={compressing || uploading}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onClick={(e) => e.stopPropagation()}
        onChange={handleFileChange}
        disabled={compressing || uploading}
      />

      {/* Main Upload Dropzone */}
      <div
        onClick={() => {
          if (compressing || uploading || isProcessingRef.current) return;
          fileInputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: isDragging ? '2px dashed var(--action-primary)' : '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          textAlign: 'center',
          cursor: compressing || uploading ? 'not-allowed' : 'pointer',
          background: isDragging ? 'var(--color-brand-soft)' : 'var(--bg-card)',
          transition: 'all 0.15s ease',
          position: 'relative',
        }}
      >
        {previewUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxHeight: '190px',
                borderRadius: '8px',
                objectFit: 'contain',
                border: '1px solid var(--border-subtle)',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="link-editorial" style={{ fontSize: '0.8rem' }}>
                Klik untuk mengganti foto
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera('environment');
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Camera size={13} />
                <span>Foto Ulang</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--color-terracotta-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--action-primary)',
              }}
            >
              <UploadCloud size={20} />
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Pilih foto, ambil dari kamera, atau seret ke sini
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Format berkas JPG, PNG, atau WEBP
            </div>
          </div>
        )}

        {(compressing || uploading) && (
          <div
            style={{
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
            }}
          >
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--action-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {statusMsg}
            </span>
          </div>
        )}
      </div>

      {/* Confirmation of Attached Photo */}
      {previewUrl && !uploading && !compressing && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.4rem 0.65rem',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.78rem',
            color: 'var(--status-selesai)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <CheckCircle2 size={14} />
          <span>Foto bukti telah terlampir</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.45rem 0.75rem',
            background: 'var(--status-masuk-bg)',
            border: '1px solid var(--status-masuk-border)',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.78rem',
            color: 'var(--status-masuk)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      {cameraActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              background: '#0c1421',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-hairline)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 500 }}>
                <Camera size={16} />
                <span>Kamera Dokumentasi Lapangan</span>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Feed */}
            <div style={{ position: 'relative', width: '100%', background: '#000000', aspectRatio: '4/3', overflow: 'hidden' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Viewfinder Target Guidelines */}
              <div
                style={{
                  position: 'absolute',
                  inset: '10%',
                  border: '1px dashed rgba(255,255,255,0.4)',
                  borderRadius: 'var(--radius-sm)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Camera Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: '#070c14',
              }}
            >
              <button
                type="button"
                onClick={switchCameraFacing}
                className="btn btn-secondary btn-sm"
                title="Ganti Kamera Depan / Belakang"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <RefreshCw size={14} />
                <span>Ganti Lensa</span>
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--action-primary)',
                  border: '3px solid #ffffff',
                  boxShadow: '0 0 14px rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
                title="Ambil Foto"
              >
                <Camera size={24} />
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
