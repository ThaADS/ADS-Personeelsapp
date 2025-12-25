/**
 * UWV Alerts Cron Endpoint
 *
 * GET /api/cron/uwv-alerts
 *
 * Monitors sick leaves approaching the 6-week UWV notification deadline
 * (Wet Verbetering Poortwachter - Dutch labor law requirement).
 *
 * Alerts are sent to managers and admins when:
 * - 7 days before deadline: First warning
 * - 3 days before deadline: Urgent reminder
 * - 1 day before deadline: Critical alert
 * - Past deadline: Overdue escalation
 *
 * Security:
 * - Protected by CRON_SECRET environment variable
 * - Vercel Cron jobs include this secret automatically
 *
 * Schedule (configure in vercel.json):
 * - "0 8 * * *" = Daily at 08:00 UTC (09:00 CET)
 */

import { NextRequest, NextResponse } from 'next/server';
import { processUwvAlerts } from '@/lib/services/uwv-alert-service';

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

  try {
    console.log('Processing UWV deadline alerts...');
    const result = await processUwvAlerts();

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      summary: {
        totalCasesNearingDeadline: result.totalCases,
        emailsSent: result.emailsSent,
        errorCount: result.errors.length,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
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
