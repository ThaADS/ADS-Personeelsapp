/**
 * Cron Endpoint: Manager Approval Reminders
 *
 * Schedule: Daily at 09:00 CET (08:00 UTC)
 * Purpose: Remind managers of pending approvals (vacations, timesheets, sick leaves)
 *
 * Security: Protected by CRON_SECRET header verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { processApprovalReminders } from '@/lib/services/approval-reminder-service';

/**
 * Verify cron secret for security
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request in development');
    return process.env.NODE_ENV === 'development';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET handler for Vercel Cron
 * Vercel cron jobs send GET requests
 */
export async function GET(request: NextRequest) {
  console.log('[Approval Reminders Cron] Starting execution...');

  // Verify cron secret
  if (!verifyCronSecret(request)) {
    console.error('[Approval Reminders Cron] Unauthorized request');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await processApprovalReminders();

    console.log('[Approval Reminders Cron] Completed:', {
      managersNotified: result.managersNotified,
      pendingVacations: result.pendingVacations,
      pendingTimesheets: result.pendingTimesheets,
      pendingSickLeaves: result.pendingSickLeaves,
      errors: result.errors.length
    });

    return NextResponse.json({
      success: true,
      message: 'Approval reminders processed',
      managersNotified: result.managersNotified,
      pendingVacations: result.pendingVacations,
      pendingTimesheets: result.pendingTimesheets,
      pendingSickLeaves: result.pendingSickLeaves,
      errors: result.errors
    });

  } catch (error) {
    console.error('[Approval Reminders Cron] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process approval reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for manual triggers
 * Allows admins to manually trigger reminders
 */
export async function POST(request: NextRequest) {
  // Same logic as GET, just different HTTP method for manual triggers
  return GET(request);
}
