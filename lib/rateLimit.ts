interface RateLimitOptions {
  intervalMs?: number; // default: 60,000ms (1 menit)
  maxRequests?: number; // default: 5 percobaan
}

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan data kedaluwarsa secara berkala setiap 5 menit
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300_000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 300_000);
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { isAllowed: boolean; remaining: number; resetMs: number } {
  const intervalMs = options.intervalMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 5;
  const now = Date.now();

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < intervalMs);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0];
    const resetMs = Math.max(0, intervalMs - (now - oldest));
    return {
      isAllowed: false,
      remaining: 0,
      resetMs,
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });

  return {
    isAllowed: true,
    remaining: maxRequests - activeTimestamps.length,
    resetMs: intervalMs,
  };
}
