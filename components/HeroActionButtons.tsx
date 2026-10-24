'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FilePlus } from 'lucide-react';
import { getCachedUser, isSessionFetched, fetchUserSession } from '@/lib/clientSession';
import { UserSession } from '@/types';

export default function HeroActionButtons() {
  const [user, setUser] = useState<UserSession | null>(getCachedUser());

  useEffect(() => {
    if (!isSessionFetched()) {
      fetchUserSession().then((u) => setUser(u));
    }
    const onAuthUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserSession | null>;
      setUser(customEvent.detail !== undefined ? customEvent.detail : getCachedUser());
    };
    window.addEventListener('digiculture-auth-update', onAuthUpdate);
    return () => window.removeEventListener('digiculture-auth-update', onAuthUpdate);
  }, []);

  const laporHref =
    user?.role === 'SUPERADMIN'
      ? '/superadmin/analytics'
      : user?.role === 'ADMIN'
      ? '/admin'
      : user
      ? '/pelapor/lapor'
      : '/login?redirect=/pelapor/lapor';

  const laporLabel =
    user?.role === 'ADMIN'
      ? 'Meja Kerja Konservator'
      : user?.role === 'SUPERADMIN'
      ? 'Analitik Provinsi'
      : 'Kirim Laporan Temuan';

  return (
    <div className="digiculture-hero-actions">
      <Link href="/katalog" className="digiculture-hero-btn-primary">
        <BookOpen size={15} />
        <span>Telusuri Katalog Budaya</span>
      </Link>

      <Link href={laporHref} className="digiculture-hero-btn-secondary">
        <FilePlus size={15} />
        <span>{laporLabel}</span>
      </Link>
    </div>
  );
}
