'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type L from 'leaflet';
import { isWithinSulteng } from '@/lib/sultengLocations';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MapPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (loc: { lat: number; lng: number; isValid: boolean }) => void;
}

export default function MapPicker({
  initialLat = -1.43,
  initialLng = 120.30,
  onLocationSelect,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [lat, setLat] = useState<number | null>(initialLat);
  const [lng, setLng] = useState<number | null>(initialLng);
  const [isValid, setIsValid] = useState<boolean>(true);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

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

      const defaultPoint: [number, number] = [
        initialLat || -1.43,
        initialLng || 120.30,
      ];

      const map = L.map(mapContainerRef.current, {
        center: defaultPoint,
        zoom: 8,
        minZoom: 6,
        maxZoom: 16,
        scrollWheelZoom: false, // Prevents mobile touch scroll hijacking
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Tadulako Shield Navy pin (Harmonized with official logo #142948)
      const pinIcon = L.divIcon({
        className: 'picker-pin',
        html: `<div style="background:#142948;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><div style="width:9px;height:9px;background:#ffffff;border-radius:50%;"></div></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker(defaultPoint, { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      const updateCoordinates = (newLat: number, newLng: number) => {
        const roundedLat = parseFloat(newLat.toFixed(5));
        const roundedLng = parseFloat(newLng.toFixed(5));
        const valid = isWithinSulteng(roundedLat, roundedLng);

        setLat(roundedLat);
        setLng(roundedLng);
        setIsValid(valid);

        onLocationSelectRef.current({ lat: roundedLat, lng: roundedLng, isValid: valid });
      };

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng);
      });

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateCoordinates(pos.lat, pos.lng);
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
  }, [mounted, initialLat, initialLng]);

  if (!mounted) {
    return (
      <div style={{
        height: '320px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        Memuat Peta Pemilih Titik Koordinat...
      </div>
    );
  }

  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <MapPin size={15} style={{ color: 'var(--action-primary)' }} />
          <span>Sematkan Titik Koordinat GPS di Wilayah Sulteng</span>
        </label>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Klik pada peta atau geser pin
        </span>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: `1px solid ${isValid ? 'var(--border-subtle)' : 'var(--status-masuk)'}`,
      }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Readout Overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          padding: '0.45rem 0.85rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          zIndex: 999,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
        }}>
          <div>Lat: <strong>{lat ?? '-'}</strong></div>
          <div>Lng: <strong>{lng ?? '-'}</strong></div>
        </div>
      </div>

      {/* Validation Feedback */}
      <div style={{ marginTop: '0.5rem' }}>
        {isValid ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--status-selesai)' }}>
            <CheckCircle2 size={14} />
            <span>Koordinat valid berada dalam batas administratif Provinsi Sulawesi Tengah.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--status-masuk)' }}>
            <AlertCircle size={14} />
            <span>
              Peringatan: Titik koordinat berada di luar batas Sulawesi Tengah (Lat: -3.8 s.d 2.2, Lng: 119.0 s.d 124.5).
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
