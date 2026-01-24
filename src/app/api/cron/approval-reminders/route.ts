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
import { createLogger } from '@/lib/logger';

const logger = createLogger('cron-approval-reminders');

/**
 * GET handler for Vercel Cron
 * Vercel cron jobs send GET requests
 */
export async function GET(request: NextRequest) {
  logger.info('Starting execution');

  // Verify authorization - CRON_SECRET is required in production
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    logger.error('Unauthorized request');
    return auth.error!;
  }

  try {
    const result = await processApprovalReminders();

    logger.info('Completed', {
      totalManagers: result.totalManagers,
      emailsSent: result.emailsSent,
      errorCount: result.errors.length
    });

    return NextResponse.json({
      success: result.success,
      message: 'Approval reminders processed',
      totalManagers: result.totalManagers,
      emailsSent: result.emailsSent,
      errors: result.errors
    });

  } catch (error) {
    logger.error('Failed to process approval reminders', error);

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
