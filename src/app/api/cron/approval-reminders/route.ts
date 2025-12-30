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
import { verifyCronAuth } from '@/lib/security/cron-auth';

/**
 * GET handler for Vercel Cron
 * Vercel cron jobs send GET requests
 */
export async function GET(request: NextRequest) {
  console.log('[Approval Reminders Cron] Starting execution...');

  // Verify authorization - CRON_SECRET is required in production
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    console.error('[Approval Reminders Cron] Unauthorized request');
    return auth.error!;
  }

  try {
    const result = await processApprovalReminders();

    console.log('[Approval Reminders Cron] Completed:', {
      totalManagers: result.totalManagers,
      emailsSent: result.emailsSent,
      errors: result.errors.length
    });

    return NextResponse.json({
      success: result.success,
      message: 'Approval reminders processed',
      totalManagers: result.totalManagers,
      emailsSent: result.emailsSent,
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
