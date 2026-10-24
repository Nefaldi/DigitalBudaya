'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FilePlus } from 'lucide-react';
import { getCachedUser, isSessionFetched, fetchUserSession } from '@/lib/clientSession';
import { UserSession } from '@/types';

export default function HeroActionButtons() {
  const [user, setUser] = useState<UserSession | null>(getCachedUser());
  const [ready, setReady] = useState<boolean>(isSessionFetched());

  useEffect(() => {
    if (!isSessionFetched()) {
      fetchUserSession().then((u) => {
        setUser(u);
        setReady(true);
      });
    }
    const onAuthUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserSession | null>;
      setUser(customEvent.detail !== undefined ? customEvent.detail : getCachedUser());
      setReady(true);
    };
    window.addEventListener('digiculture-auth-update', onAuthUpdate);
    return () => window.removeEventListener('digiculture-auth-update', onAuthUpdate);
  }, []);

  // Sembunyikan tombol hero setelah login untuk semua role (PELAPOR, ADMIN, SUPERADMIN)
  if (!ready || user) {
    return null;
  }

  return (
    <div className="digiculture-hero-actions">
      <Link href="/katalog" className="digiculture-hero-btn-primary">
        <BookOpen size={15} />
        <span>Telusuri Katalog Budaya</span>
      </Link>

      <Link href="/login?redirect=/pelapor/lapor" className="digiculture-hero-btn-secondary">
        <FilePlus size={15} />
        <span>Kirim Laporan Temuan</span>
      </Link>
    </div>
  );
}
