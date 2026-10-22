'use client';

import React from 'react';
import Image from 'next/image';

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
        minHeight: fullScreen ? '70vh' : '260px',
        padding: '2rem 1rem',
        position: 'relative',
      }}
      className="digiculture-loading-wrapper"
    >
      {/* Clean Emblem with Single Smooth Spinner */}
      <div
        style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {/* Subtle, single spinning ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--border-hairline)',
            borderTopColor: 'var(--action-primary)',
            animation: 'digicultureSpin 0.9s linear infinite',
          }}
        />

        {/* Clean Logo Container */}
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Image
            src="/logo-transparent.png"
            alt="DigiCulture Care Logo"
            width={26}
            height={26}
            className="logo-light-variant"
            style={{ objectFit: 'contain' }}
            priority
          />
          <Image
            src="/logo-light-transparent.png"
            alt="DigiCulture Care Logo"
            width={26}
            height={26}
            className="logo-dark-variant"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* Clean, Legible Status Text */}
      <div style={{ textAlign: 'center', maxWidth: '340px' }}>
        <h3
          style={{
            fontSize: '0.925rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.015em',
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

      {/* Single Keyframe */}
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
