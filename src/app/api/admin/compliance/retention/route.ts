import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  findExpiredDataForTenant,
  processDataRetentionForTenant,
  getGlobalRetentionStatus,
  findTerminatedEmployeesForDeletion,
  dataRetentionPolicies,
} from '@/lib/services/compliance-service';

/**
 * GET /api/admin/compliance/retention - Get data retention status
 *
 * Query params:
 * - scope: 'global' | 'tenant' (default: global for superuser, tenant for admin)
 * - tenantId: Required when scope=tenant
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') || (session.user.isSuperuser ? 'global' : 'tenant');
    const tenantId = url.searchParams.get('tenantId') || session.user.tenantId;

    // Global scope requires superuser
    if (scope === 'global' && !session.user.isSuperuser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Tenant scope requires tenantId
    if (scope === 'tenant' && !tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    if (scope === 'global') {
      const status = await getGlobalRetentionStatus();
      return NextResponse.json({
        scope: 'global',
        policies: dataRetentionPolicies,
        status,
      });
    }

    // Tenant-specific retention status
    const expiredData = await findExpiredDataForTenant(tenantId!);
    const terminatedEmployees = await findTerminatedEmployeesForDeletion(tenantId!);

    return NextResponse.json({
      scope: 'tenant',
      tenantId,
      policies: dataRetentionPolicies,
      expiredData: {
        count: expiredData.length,
        byType: expiredData.reduce((acc, item) => {
          acc[item.dataType] = (acc[item.dataType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        items: expiredData,
      },
      terminatedEmployees: {
        count: terminatedEmployees.length,
        employees: terminatedEmployees,
      },
    });
  } catch (error) {
    console.error('Error fetching retention status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/compliance/retention - Process data retention
 *
 * Body:
 * - tenantId: string (required)
 * - dryRun: boolean (default: true)
 * - action: 'process' | 'preview' (default: preview)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized - Superuser only' }, { status: 403 });
    }

    const body = await request.json();
    const { tenantId, dryRun = true, action = 'preview' } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const isDryRun = action === 'preview' || dryRun === true;

    const report = await processDataRetentionForTenant(tenantId, isDryRun);

    return NextResponse.json({
      success: true,
      dryRun: isDryRun,
      report,
      message: isDryRun
        ? `Preview: ${report.summary.itemsExpired} items would be processed`
        : `Processed: ${report.summary.itemsDeleted} deleted, ${report.summary.itemsAnonymized} anonymized`,
    });
  } catch (error) {
    console.error('Error processing retention:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
