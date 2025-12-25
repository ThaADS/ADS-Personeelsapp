/**
 * Leave Expiration Reminder Cron Endpoint
 *
 * GET /api/cron/leave-expiration
 *
 * Triggers automatic reminders for expiring leave balances.
 * Runs weekly on Monday mornings to inform employees about:
 * - Statutory leave (wettelijk verlof) expiring
 * - Extra leave (bovenwettelijk verlof) expiring
 * - Compensation hours (tijd-voor-tijd) expiring
 *
 * Security:
 * - Protected by CRON_SECRET environment variable
 * - Vercel Cron jobs include this secret automatically
 *
 * Schedule (configure in vercel.json):
 * - "0 9 * * 1" = Monday 09:00 UTC (10:00 CET)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  processLeaveExpirationReminders,
  notifyManagersAboutExpiringLeave,
} from '@/lib/services/leave-expiration-reminder';

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no secret is configured, allow in development
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check for Vercel Cron authorization
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Also check query parameter for manual testing
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  if (querySecret === cronSecret) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const includeManagers = url.searchParams.get('managers') !== 'false';

  const results: {
    employees?: Awaited<ReturnType<typeof processLeaveExpirationReminders>>;
    managers?: Awaited<ReturnType<typeof notifyManagersAboutExpiringLeave>>;
  } = {};

  try {
    console.log('Processing leave expiration reminders...');
    results.employees = await processLeaveExpirationReminders();

    if (includeManagers) {
      console.log('Notifying managers about expiring leave...');
      results.managers = await notifyManagersAboutExpiringLeave();
    }

    // Calculate totals
    const totalEmailsSent =
      (results.employees?.emailsSent || 0) +
      (results.managers?.emailsSent || 0);

    const allErrors = [
      ...(results.employees?.errors || []),
      ...(results.managers?.errors || []),
    ];

    return NextResponse.json({
      success: allErrors.length === 0,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        totalUsersWithExpiringLeave: results.employees?.totalUsers || 0,
        totalEmailsSent,
        errorCount: allErrors.length,
      },
    });
  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
