'use client';

import React from 'react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = 'Memuat Sistem...',
  submessage = 'Digitalisasi Cagar Budaya Sulawesi Tengah',
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '65vh' : '220px',
        padding: '2rem 1rem',
      }}
      className="digiculture-loading-wrapper"
    >
      {/* Animasi Lingkaran Minimalis */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '3px solid var(--border-hairline)',
          borderTopColor: 'var(--action-primary)',
          animation: 'digicultureSpin 0.75s linear infinite',
          marginBottom: '1rem',
        }}
      />

      {/* Teks Status */}
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <h3
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.01em',
          }}
        >
          {message}
        </h3>
        {submessage && (
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {submessage}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes digicultureSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
