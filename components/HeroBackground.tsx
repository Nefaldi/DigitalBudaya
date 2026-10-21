'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface HeroBackgroundProps {
  src?: string;
  alt?: string;
}

export default function HeroBackground({
  src = '/rumahadatsouraja.webp',
  alt = 'Rumah Adat Souraja Sulawesi Tengah',
}: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const scrollY = window.scrollY;
            // Target scroll range for the zoom-out animation
            const scrollRange = Math.max(window.innerHeight * 0.85, 600);
            const progress = Math.min(1, Math.max(0, scrollY / scrollRange));

            // Initial view is zoomed in at 1.28, zooms out smoothly to 1.00 as user scrolls
            const currentScale = 1.28 - progress * 0.28;
            containerRef.current.style.transform = `scale(${currentScale.toFixed(4)})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="digiculture-hero-bg-wrap" aria-hidden="true">
      <div ref={containerRef} className="digiculture-hero-zoom-container">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="digiculture-hero-bg-img"
        />
      </div>
      <div className="digiculture-hero-overlay" />
    </div>
  );
}
