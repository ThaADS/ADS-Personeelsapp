/**
 * Payroll Provider Specific API
 *
 * GET - Get provider configuration
 * PUT - Update provider configuration
 * DELETE - Remove provider configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { PayrollService } from '@/lib/integrations/payroll';
import type { PayrollProviderType, PayrollProviderCredentials } from '@/lib/integrations/payroll';

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
    const config = await service.getConfig(providerType);

    if (!config) {
      return NextResponse.json({ error: 'Provider niet geconfigureerd' }, { status: 404 });
    }

    // Don't expose sensitive credentials
    const safeConfig = {
      providerType: config.provider_type,
      displayName: config.display_name,
      syncEnabled: config.sync_enabled,
      syncEmployees: config.sync_employees,
      syncHours: config.sync_hours,
      syncLeave: config.sync_leave,
      syncInterval: config.sync_interval,
      lastSync: config.last_sync,
      lastSyncError: config.last_sync_error,
      connectionStatus: config.connection_status,
      isActive: config.is_active,
      hasCredentials: {
        apiToken: !!(config.credentials as PayrollProviderCredentials).apiToken,
        domain: !!(config.credentials as PayrollProviderCredentials).domain,
        companyId: !!(config.credentials as PayrollProviderCredentials).companyId,
        clientId: !!(config.credentials as PayrollProviderCredentials).clientId,
        clientSecret: !!(config.credentials as PayrollProviderCredentials).clientSecret,
      },
    };

    return NextResponse.json({ config: safeConfig });
  } catch (error) {
    console.error('[Payroll Provider API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

export async function PUT(
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

    const {
      credentials,
      displayName,
      syncEmployees,
      syncHours,
      syncLeave,
      syncEnabled,
      syncInterval,
    } = body;

    const service = new PayrollService(tenantId);

    // Get existing config to merge credentials
    const existingConfig = await service.getConfig(providerType);
    if (!existingConfig) {
      return NextResponse.json({ error: 'Provider niet geconfigureerd' }, { status: 404 });
    }

    // Merge new credentials with existing (only update provided fields)
    const mergedCredentials = {
      ...(existingConfig.credentials as PayrollProviderCredentials),
      ...(credentials || {}),
    };

    const config = await service.saveConfig(providerType, mergedCredentials, {
      displayName,
      syncEmployees,
      syncHours,
      syncLeave,
      syncEnabled,
      syncInterval,
    });

    return NextResponse.json({
      success: true,
      config: {
        providerType: config.provider_type,
        displayName: config.display_name,
        syncEnabled: config.sync_enabled,
        connectionStatus: config.connection_status,
      },
    });
  } catch (error) {
    console.error('[Payroll Provider API] PUT error:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.payrollProviderConfig.delete({
      where: {
        tenant_id_provider_type: {
          tenant_id: tenantId,
          provider_type: providerType,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Payroll Provider API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
}
