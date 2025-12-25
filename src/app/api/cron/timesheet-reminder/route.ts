/**
 * Timesheet Reminder Cron Endpoint
 *
 * GET /api/cron/timesheet-reminder
 *
 * Triggers automatic timesheet reminders based on the day of the week:
 * - Friday: Sends reminders for current week incomplete timesheets
 * - Monday: Sends escalations for previous week incomplete timesheets + manager notifications
 *
 * Security:
 * - Protected by CRON_SECRET environment variable
 * - Vercel Cron jobs include this secret automatically
 *
 * Schedule (configure in vercel.json):
 * - "0 15 * * 5" = Friday 15:00 UTC (16:00 CET)
 * - "0 8 * * 1"  = Monday 08:00 UTC (09:00 CET)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  processFridayReminders,
  processMondayEscalations,
  notifyManagersAboutIncompleteTimesheets,
} from '@/lib/services/timesheet-reminder';

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
  const forceType = url.searchParams.get('type');

  // Determine which reminder type to run based on day or force parameter
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday

  const results: {
    friday?: Awaited<ReturnType<typeof processFridayReminders>>;
    monday?: Awaited<ReturnType<typeof processMondayEscalations>>;
    managers?: Awaited<ReturnType<typeof notifyManagersAboutIncompleteTimesheets>>;
  } = {};

  try {
    // Friday reminders (or forced)
    if (forceType === 'friday' || (dayOfWeek === 5 && !forceType)) {
      console.log('Processing Friday reminders...');
      results.friday = await processFridayReminders();
    }

    // Monday escalations (or forced)
    if (forceType === 'monday' || forceType === 'all' || (dayOfWeek === 1 && !forceType)) {
      console.log('Processing Monday escalations...');
      results.monday = await processMondayEscalations();

      // Also notify managers on Monday
      console.log('Notifying managers...');
      results.managers = await notifyManagersAboutIncompleteTimesheets();
    }

    // If no specific day matched and no force type, just return info
    if (Object.keys(results).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No reminders scheduled for today',
        dayOfWeek,
        scheduledDays: {
          friday: 5,
          monday: 1,
        },
        hint: 'Use ?type=friday or ?type=monday to force a specific reminder type',
      });
    }

    // Calculate totals
    const totalEmailsSent =
      (results.friday?.emailsSent || 0) +
      (results.monday?.emailsSent || 0) +
      (results.managers?.emailsSent || 0);

    const allErrors = [
      ...(results.friday?.errors || []),
      ...(results.monday?.errors || []),
      ...(results.managers?.errors || []),
    ];

    return NextResponse.json({
      success: allErrors.length === 0,
      timestamp: new Date().toISOString(),
      dayOfWeek,
      results,
      summary: {
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
