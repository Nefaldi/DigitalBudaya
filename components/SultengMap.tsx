'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import type L from 'leaflet';
import { HeritageReportItem } from './HeritageCard';
import { SULTENG_BOUNDS } from '@/lib/sultengLocations';

interface SultengMapProps {
  reports: HeritageReportItem[];
  height?: string;
  selectedId?: string;
}

export default function SultengMap({
  reports,
  height = 'clamp(300px, 45vw, 480px)',
  selectedId,
}: SultengMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!mounted || !mapContainerRef.current) return;

    let isSubscribed = true;

    import('leaflet').then((leafletModule) => {
      if (!isSubscribed || !mapContainerRef.current) return;
      const L = leafletModule.default || leafletModule;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const sultengCenter: [number, number] = [-1.43, 120.8];

      const map = L.map(mapContainerRef.current, {
        center: sultengCenter,
        zoom: 7,
        minZoom: 6,
        maxZoom: 14,
        scrollWheelZoom: false, // Prevents mobile scroll trapping
        maxBounds: [
          [SULTENG_BOUNDS.minLat - 1.0, SULTENG_BOUNDS.minLng - 1.0],
          [SULTENG_BOUNDS.maxLat + 1.0, SULTENG_BOUNDS.maxLng + 1.0],
        ],
      });

      // Free CartoDB Voyager tiles (warm editorial light style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Cultural Pin Icons: Vector Landmark (#142948 Shield Navy) for Benda, Vector Wave (#1e4030) for Takbenda
      const terracottaIcon = L.divIcon({
        className: 'custom-pin-terracotta',
        html: `<div style="background:#142948;width:28px;height:28px;border-radius:50%;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10a2 2 0 1 1-4 0"/><path d="M19 10a2 2 0 1 1-4 0"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const emeraldIcon = L.divIcon({
        className: 'custom-pin-emerald',
        html: `<div style="background:#1e4030;width:28px;height:28px;border-radius:50%;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5v14"/><path d="M7 8v8"/><path d="M22 10v4"/><path d="M2 10v4"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      // Add Markers
      reports.forEach((rep) => {
        if (rep.latitude && rep.longitude) {
          const icon = rep.kategori === 'TAKBENDA' ? emeraldIcon : terracottaIcon;
          const marker = L.marker([rep.latitude, rep.longitude], { icon }).addTo(map);

          const popupContent = `
            <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:200px;max-width:240px;padding:4px;">
              <div style="font-size:11px;font-weight:600;color:${rep.kategori === 'TAKBENDA' ? '#1e4030' : '#142948'};margin-bottom:3px;">
                ${rep.kategori === 'TAKBENDA' ? 'Warisan Takbenda' : 'Pusaka Benda'} • ${rep.kabupatenKota}
              </div>
              <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px;line-height:1.3;">
                ${rep.judulPusaka}
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;line-height:1.4;">
                ${rep.lokasiSpesifik}
              </div>
              <a href="/katalog/${rep.id}" style="display:inline-block;background:#142948;color:#ffffff;padding:5px 12px;border-radius:4px;font-size:11px;font-weight:500;text-decoration:none;">
                Lihat Dossier →
              </a>
            </div>
          `;

          marker.bindPopup(popupContent);

          if (selectedId && rep.id === selectedId) {
            marker.openPopup();
            map.setView([rep.latitude, rep.longitude], 10);
          }
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, reports, selectedId]);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-hairline)',
        }}
      >
        Memuat Peta Sebaran Warisan Budaya Sulawesi Tengah...
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-hairline)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend (Compact and Mobile Friendly) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '0.5rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-hairline)',
          fontSize: '0.72rem',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.3rem',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          Legenda Pusaka Sulteng
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#142948', border: '1px solid #ffffff' }} />
          <span>Benda (Megalitik/Arsitektur)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1e4030', border: '1px solid #ffffff' }} />
          <span>Takbenda (Bahasa/Tradisi Lisan)</span>
        </div>
      </div>
    </div>
  );
}
