'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('digiculture-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('digiculture-theme-change', callback);
  };
}

function getSnapshot(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const currentAttr = document.documentElement.getAttribute('data-theme');
  if (currentAttr === 'dark' || currentAttr === 'light') {
    return currentAttr;
  }
  const saved = localStorage.getItem('digiculture_theme');
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light';
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('digiculture_theme', nextTheme);
    window.dispatchEvent(new Event('digiculture-theme-change'));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === 'dark' ? 'Beralih ke Mode Terang (Slate Paper)' : 'Beralih ke Mode Gelap (Tadulako Obsidian)'}
      aria-label="Toggle Theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        background: 'transparent',
        border: '1px solid var(--border-hairline)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--text-secondary)';
        e.currentTarget.style.background = 'var(--color-brand-soft)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hairline)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {theme === 'dark' ? (
        <Sun size={17} strokeWidth={1.8} style={{ color: 'var(--action-amber)' }} />
      ) : (
        <Moon size={17} strokeWidth={1.8} style={{ color: 'var(--action-primary)' }} />
      )}
    </button>
  );
}
