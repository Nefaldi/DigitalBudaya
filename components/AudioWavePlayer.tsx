'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface AudioWavePlayerProps {
  audioUrl: string;
  title?: string;
  subtitle?: string;
}

export default function AudioWavePlayer({
  audioUrl,
  title = 'Rekaman Tradisi Lisan / Bahasa Daerah',
  subtitle = 'Arsip Audio Warisan Budaya Takbenda Sulawesi Tengah',
}: AudioWavePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error('Audio playback error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-sm)',
      padding: '1.25rem 1.5rem',
    }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-takbenda" style={{ fontSize: '0.72rem' }}>
              Dokumentasi Audio
            </span>
          </div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
            {title}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            {subtitle}
          </p>
        </div>

        {/* Minimal Editorial Waveform Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
          {[10, 20, 14, 22, 16, 9, 18, 12, 22, 14].map((h, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: isPlaying ? `${h}px` : '4px',
                background: isPlaying ? 'var(--action-emerald)' : 'var(--border-hairline)',
                borderRadius: '2px',
                transition: 'height 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrubber Range */}
      <div style={{ marginBottom: '0.85rem' }}>
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            accentColor: 'var(--action-emerald)',
            height: '6px',
            cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={togglePlay}
            className="btn btn-primary"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isPlaying ? 'Jeda' : 'Putar'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: '2px' }} />}
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem', width: '34px', height: '34px' }}
            title="Ulangi dari awal"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <button
          onClick={toggleMute}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem', width: '34px', height: '34px' }}
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
}
