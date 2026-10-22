import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * Healthcheck & Supabase Database Keep-Alive Endpoint
 * 
 * Executes an ultra-lightweight `SELECT 1` ping directly against PostgreSQL
 * to keep Supabase active and prevent the 7-day auto-pause on Free Tier.
 * 
 * Protected by a 60 requests/minute rate limit to prevent connection pool exhaustion.
 * Recommended cron frequency: Once every 24-48 hours via cron-job.org or GitHub Actions.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // Rate limiting: 60 pings per minute per IP
  const rateLimit = checkRateLimit(`health-ping:${ip}`, { maxRequests: 60, intervalMs: 60_000 });
  if (!rateLimit.isAllowed) {
    const retrySeconds = Math.ceil(rateLimit.resetMs / 1000);
    return NextResponse.json(
      {
        status: 'rate_limited',
        error: 'Terlalu banyak permintaan health ping. Silakan coba beberapa saat lagi.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retrySeconds),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  const startTime = Date.now();
  try {
    // Fast 1ms SQL ping to keep Supabase compute active
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        latencyMs: `${latencyMs}ms`,
        timestamp: new Date().toISOString(),
        service: 'DigiCulture Care API',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Database keep-alive ping failed:', error);
    const message = error instanceof Error ? error.message : 'Database ping failure';
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
