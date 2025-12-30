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
import { verifyCronAuth } from '@/lib/security/cron-auth';

export async function GET(request: NextRequest) {
  // Verify authorization - CRON_SECRET is required in production
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return auth.error!;
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
