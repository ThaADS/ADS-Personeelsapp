/**
 * Payroll Provider Connection Test API
 *
 * POST - Test connection to payroll provider
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PayrollService } from '@/lib/integrations/payroll';
import type { PayrollProviderType } from '@/lib/integrations/payroll';

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

    const service = new PayrollService(tenantId);
    const result = await service.testConnection(providerType);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Payroll Test API] Error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Verbinding mislukt' },
      { status: 500 }
    );
  }
}
