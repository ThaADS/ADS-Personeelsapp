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
import { verifyCronAuth } from '@/lib/security/cron-auth';
import { createLogger } from '@/lib/logger';

const logger = createLogger('cron-leave-expiration');

export async function GET(request: NextRequest) {
  // Verify authorization - CRON_SECRET is required in production
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return auth.error!;
  }

  const url = new URL(request.url);
  const includeManagers = url.searchParams.get('managers') !== 'false';

  const results: {
    employees?: Awaited<ReturnType<typeof processLeaveExpirationReminders>>;
    managers?: Awaited<ReturnType<typeof notifyManagersAboutExpiringLeave>>;
  } = {};

  try {
    logger.info('Processing leave expiration reminders');
    results.employees = await processLeaveExpirationReminders();

    if (includeManagers) {
      logger.info('Notifying managers about expiring leave');
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
    logger.error('Cron job failed', error);

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
