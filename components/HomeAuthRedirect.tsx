'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCachedUser, fetchUserSession, isSessionFetched } from '@/lib/clientSession';

export default function HomeAuthRedirect() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getCachedUser());

  useEffect(() => {
    const handleRedirect = (role?: string) => {
      if (role === 'SUPERADMIN') {
        router.replace('/superadmin/analytics');
      } else if (role === 'ADMIN') {
        router.replace('/admin');
      } else if (role === 'PELAPOR') {
        router.replace('/pelapor');
      }
    };

    const cached = getCachedUser();
    if (cached?.role) {
      setIsLoggedIn(true);
      handleRedirect(cached.role);
      return;
    }

    if (!isSessionFetched()) {
      fetchUserSession().then((u) => {
        if (u?.role) {
          setIsLoggedIn(true);
          handleRedirect(u.role);
        }
      });
    }
  }, [router]);

  if (isLoggedIn) {
    return (
      <style>{`
        .homepage-root {
          display: none !important;
        }
      `}</style>
    );
  }

  return null;
}
