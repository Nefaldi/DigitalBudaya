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
        minHeight: fullScreen ? '70vh' : '360px',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="digiculture-loading-wrapper"
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--action-primary) 0%, transparent 70%)',
          opacity: 0.12,
          filter: 'blur(40px)',
          animation: 'pulseGlow 3s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />

      {/* Central Emblem with pulsing ring */}
      <div
        style={{
          position: 'relative',
          width: '84px',
          height: '84px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.75rem',
        }}
      >
        {/* Outer orbital spinner ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--action-primary)',
            borderRightColor: 'rgba(194, 91, 59, 0.4)',
            animation: 'spin 1.4s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
          }}
        />

        {/* Pulse wave ring */}
        <div
          style={{
            position: 'absolute',
            inset: '-14px',
            borderRadius: '50%',
            border: '1px solid var(--action-primary)',
            opacity: 0.25,
            animation: 'pingWave 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />

        {/* Logo container badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-hairline)',
            boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            animation: 'breathe 2.4s ease-in-out infinite',
          }}
        >
          <Image
            src="/logo-transparent.png"
            alt="Logo DigiCulture Care"
            width={38}
            height={38}
            className="logo-light-variant"
            style={{ objectFit: 'contain' }}
            priority
          />
          <Image
            src="/logo-light-transparent.png"
            alt="Logo DigiCulture Care"
            width={38}
            height={38}
            className="logo-dark-variant"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>

      {/* Dynamic Progress Beam */}
      <div
        style={{
          width: '140px',
          height: '3px',
          background: 'var(--border-hairline)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '45%',
            background: 'linear-gradient(90deg, transparent, var(--action-primary), transparent)',
            borderRadius: '9999px',
            animation: 'beamSlide 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Text message */}
      <div style={{ textAlign: 'center', maxWidth: '360px', zIndex: 2 }}>
        <h3
          style={{
            fontSize: '0.98rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.015em',
          }}
        >
          {message}
        </h3>
        {submessage && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {submessage}
          </p>
        )}
      </div>

      {/* Scoped Keyframes for smooth animations */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes pingWave {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.35);
            opacity: 0;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }
        @keyframes pulseGlow {
          0% {
            transform: scale(0.9);
            opacity: 0.08;
          }
          100% {
            transform: scale(1.2);
            opacity: 0.18;
          }
        }
        @keyframes beamSlide {
          0% {
            left: -50%;
          }
          100% {
            left: 110%;
          }
        }
      `}</style>
    </div>
  );
}
