'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

export interface CarouselSlideItem {
  id: string | number;
  title: string;
  category: string;
  categoryColor?: string;
  imageUrl: string;
  timeAgo?: string;
  author?: string;
  href?: string;
  location?: string;
  description?: string;
}

export interface FeaturedCarouselProps {
  items?: CarouselSlideItem[];
  autoPlayInterval?: number; // millisecond, default 5000 (0 to disable)
  className?: string;
  style?: React.CSSProperties;
}

export default function FeaturedCarousel({
  items = [],
  autoPlayInterval = 5000,
  className = '',
  style = {},
}: FeaturedCarouselProps) {
  const slides = items;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe states
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  // Autoplay effect
  useEffect(() => {
    if (autoPlayInterval <= 0 || isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlayInterval, isPaused, nextSlide, totalSlides]);

  if (totalSlides === 0) return null;

  // Touch event handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  return (
    <div
      className={`featured-carousel-root ${className}`}
      style={style}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Sorotan Berita & Arsip Budaya"
    >
      <div className="featured-carousel-viewport">
        {/* Sliding track */}
        <div
          className="featured-carousel-track"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={slide.id || index}
                className={`featured-carousel-slide ${isActive ? 'is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} dari ${totalSlides}`}
                aria-hidden={!isActive}
              >
                {/* Background Image */}
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  unoptimized
                  className="featured-carousel-img"
                  sizes="(max-width: 1200px) 100vw, 1160px"
                />

                {/* Left & Bottom Vignette Overlays for Maximum Contrast */}
                <div className="featured-carousel-overlay-left" />
                <div className="featured-carousel-overlay-bottom" />

                {/* Left Aligned Content Overlay */}
                <div className="featured-carousel-content">
                  {/* Category Badge */}
                  {slide.category && (
                    <span
                      className="featured-carousel-badge"
                      style={{
                        backgroundColor: slide.categoryColor || '#4f46e5',
                      }}
                    >
                      {slide.category}
                    </span>
                  )}

                  {/* Headline Title */}
                  <h2 className="featured-carousel-title">
                    {slide.href ? (
                      <Link href={slide.href} style={{ color: 'inherit' }}>
                        {slide.title}
                      </Link>
                    ) : (
                      slide.title
                    )}
                  </h2>

                  {/* Meta Information Row */}
                  <div className="featured-carousel-meta">
                    {slide.timeAgo && (
                      <span className="featured-carousel-meta-item">
                        <Clock size={13} style={{ opacity: 0.9 }} />
                        <span>{slide.timeAgo}</span>
                      </span>
                    )}

                    {slide.author && (
                      <span className="featured-carousel-meta-item">
                        <User size={13} style={{ opacity: 0.9 }} />
                        <span>{slide.author}</span>
                      </span>
                    )}

                    {slide.location && (
                      <span className="featured-carousel-meta-item" style={{ opacity: 0.8 }}>
                        <span>•</span>
                        <span>{slide.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular Left Navigation Arrow */}
        {totalSlides > 1 && (
          <button
            type="button"
            className="featured-carousel-btn featured-carousel-btn-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Circular Right Navigation Arrow */}
        {totalSlides > 1 && (
          <button
            type="button"
            className="featured-carousel-btn featured-carousel-btn-next"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Bottom Pagination Indicator Dots */}
        {totalSlides > 1 && (
          <div className="featured-carousel-dots">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={`featured-carousel-dot ${
                  dotIndex === activeIndex ? 'is-active' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(dotIndex);
                }}
                aria-label={`Pindah ke slide ${dotIndex + 1}`}
                aria-current={dotIndex === activeIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
