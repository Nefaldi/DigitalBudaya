'use client';

import { UserSession } from '@/types';

let memoryUser: UserSession | null = null;
let isFetched = false;

export function getCachedUser(): UserSession | null {
  return memoryUser;
}

export function isSessionFetched(): boolean {
  return isFetched;
}

export function setCachedUser(user: UserSession | null) {
  memoryUser = user;
  isFetched = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('digiculture-auth-update', { detail: user }));
  }
}

export async function fetchUserSession(force = false): Promise<UserSession | null> {
  if (!force && isFetched) {
    return memoryUser;
  }
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      memoryUser = data.user || null;
    } else {
      memoryUser = null;
    }
  } catch {
    memoryUser = null;
  } finally {
    isFetched = true;
  }
  return memoryUser;
}
