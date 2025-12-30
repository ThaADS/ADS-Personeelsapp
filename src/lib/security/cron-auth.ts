/**
 * Cron Authentication Utility
 *
 * Provides secure authentication for cron endpoints.
 * CRON_SECRET is REQUIRED in production environments.
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CronAuthResult {
  authorized: boolean;
  error?: NextResponse;
}

/**
 * Verify cron request authorization
 *
 * Security policy:
 * - Production: CRON_SECRET is REQUIRED
 * - Development: Falls back to allowing if no secret is set
 *
 * Accepts authorization via:
 * - Authorization header: Bearer {CRON_SECRET}
 * - Query parameter: ?secret={CRON_SECRET} (for manual testing only)
 */
export function verifyCronAuth(request: NextRequest): CronAuthResult {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // CRON_SECRET is required in production
  if (!cronSecret) {
    if (isDevelopment) {
      console.warn('[Cron Auth] CRON_SECRET not set - allowing in development mode');
      return { authorized: true };
    }

    console.error('[Cron Auth] CRON_SECRET environment variable is not configured');
    return {
      authorized: false,
      error: NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'CRON_SECRET is not configured. Contact system administrator.',
        },
        { status: 500 }
      ),
    };
  }

  // Check Authorization header (primary method - used by Vercel Cron)
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true };
  }

  // Check query parameter (secondary method - for manual testing)
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret === cronSecret) {
    return { authorized: true };
  }

  // Unauthorized access attempt
  console.warn('[Cron Auth] Unauthorized access attempt', {
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    path: url.pathname,
  });

  return {
    authorized: false,
    error: NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    ),
  };
}

/**
 * Wrapper to simplify cron handler implementation
 * Returns early if unauthorized, otherwise runs the handler
 */
export async function withCronAuth(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = verifyCronAuth(request);

  if (!auth.authorized) {
    return auth.error!;
  }

  return handler();
}
