import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Healthcheck & Supabase Database Keep-Alive Endpoint
 * 
 * Executes an ultra-lightweight `SELECT 1` ping directly against PostgreSQL
 * to keep Supabase active and prevent the 7-day auto-pause on Free Tier.
 * 
 * Recommended cron frequency: Once every 24-48 hours via cron-job.org or GitHub Actions.
 */
export async function GET() {
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
