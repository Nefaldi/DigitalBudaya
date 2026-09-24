'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Kondisi Krisis Awal',
  afterLabel = 'Hasil Restorasi / Digitalisasi',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(280px, 45vw, 440px)',
        overflow: 'hidden',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-hairline)',
        cursor: 'ew-resize',
        userSelect: 'none',
        background: 'var(--bg-subtle)',
        touchAction: 'pan-y', // allows vertical page scroll while sliding horizontally
      }}
    >
      {/* Background: After Image (Digitalized/Restored) */}
      <Image
        src={afterImage}
        alt={afterLabel}
        fill
        unoptimized
        sizes="(max-width: 1024px) 100vw, 800px"
        style={{
          objectFit: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'var(--status-selesai-bg)',
          border: '1px solid var(--status-selesai-border)',
          backdropFilter: 'blur(6px)',
          color: 'var(--status-selesai-text)',
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-xs)',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        {afterLabel}
      </div>

      {/* Foreground: Before Image clipped with clipPath */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 800px"
          style={{
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'var(--status-masuk-bg)',
            border: '1px solid var(--status-masuk-border)',
            backdropFilter: 'blur(6px)',
            color: 'var(--status-masuk-text)',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-xs)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          {beforeLabel}
        </div>
      </div>

      {/* Draggable Divider Handle (Enlarged for touch ergonomics on mobile) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#ffffff',
            boxShadow: '0 0 6px rgba(0, 0, 0, 0.4)',
          }}
        />
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--action-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            border: '2px solid #ffffff',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 2,
          }}
        >
          ↔
        </div>
      </div>

      {/* Bottom helper tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: 'var(--text-primary)',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-xs)',
          fontSize: '0.72rem',
          pointerEvents: 'none',
          border: '1px solid var(--border-hairline)',
          whiteSpace: 'nowrap',
        }}
      >
        Geser garis untuk meninjau pemugaran
      </div>
    </div>
  );
}
