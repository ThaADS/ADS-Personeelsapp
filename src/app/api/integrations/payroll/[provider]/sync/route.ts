/**
 * Payroll Provider Sync API
 *
 * POST - Trigger sync with payroll provider
 * GET - Get sync history
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PayrollService } from '@/lib/integrations/payroll';
import type { PayrollProviderType } from '@/lib/integrations/payroll';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !['TENANT_ADMIN', 'SUPERUSER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId as string;
    const { provider } = await params;
    const providerType = provider as PayrollProviderType;

    const service = new PayrollService(tenantId);
    const history = await service.getSyncHistory(providerType, 20);

    return NextResponse.json({
      history: history.map((log) => ({
        id: log.id,
        syncType: log.sync_type,
        status: log.status,
        recordsSynced: log.records_synced,
        recordsFailed: log.records_failed,
        errorMessage: log.error_message,
        startedAt: log.started_at,
        completedAt: log.completed_at,
        createdAt: log.created_at,
      })),
    });
  } catch (error) {
    console.error('[Payroll Sync API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sync history' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !['TENANT_ADMIN', 'SUPERUSER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId as string;
    const { provider } = await params;
    const providerType = provider as PayrollProviderType;

    const body = await request.json();
    const { syncType, startDate, endDate } = body as {
      syncType?: 'employees' | 'hours' | 'leave' | 'full';
      startDate?: string;
      endDate?: string;
    };

    const service = new PayrollService(tenantId);
    const results: Array<{
      type: string;
      success: boolean;
      recordsSynced: number;
      recordsFailed: number;
      error?: string;
    }> = [];

    // Determine what to sync
    const syncEmployees = !syncType || syncType === 'employees' || syncType === 'full';
    const syncHours = syncType === 'hours' || syncType === 'full';

    // Sync employees
    if (syncEmployees) {
      try {
        const result = await service.syncEmployees(providerType);
        results.push({
          type: 'employees',
          success: result.success,
          recordsSynced: result.recordsSynced,
          recordsFailed: result.recordsFailed,
          error: result.errors?.[0]?.message,
        });
      } catch (error) {
        results.push({
          type: 'employees',
          success: false,
          recordsSynced: 0,
          recordsFailed: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Sync hours (push to provider)
    if (syncHours && startDate && endDate) {
      try {
        const result = await service.pushHours(
          providerType,
          new Date(startDate),
          new Date(endDate)
        );
        results.push({
          type: 'hours',
          success: result.success,
          recordsSynced: result.recordsSynced,
          recordsFailed: result.recordsFailed,
          error: result.errors?.[0]?.message,
        });
      } catch (error) {
        results.push({
          type: 'hours',
          success: false,
          recordsSynced: 0,
          recordsFailed: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const allSuccess = results.every((r) => r.success);
    const totalSynced = results.reduce((sum, r) => sum + r.recordsSynced, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.recordsFailed, 0);

    return NextResponse.json({
      success: allSuccess,
      results,
      summary: {
        totalSynced,
        totalFailed,
      },
    });
  } catch (error) {
    console.error('[Payroll Sync API] POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
