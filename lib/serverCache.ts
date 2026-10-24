interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();

/**
 * Mendapatkan data cache server-side in-memory
 */
export function getCached<T>(key: string, maxAgeMs = 15_000): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    memoryStore.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Menyimpan data cache server-side in-memory
 */
export function setCached<T>(key: string, data: T) {
  memoryStore.set(key, { data, timestamp: Date.now() });
}

/**
 * Menghapus cache berdasarkan prefix (misalnya 'reports' atau 'analytics')
 */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    memoryStore.clear();
    return;
  }
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}
