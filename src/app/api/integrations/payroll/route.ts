/**
 * Payroll Integration API
 *
 * GET - List configured payroll providers
 * POST - Save payroll provider configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { PayrollService } from '@/lib/integrations/payroll';
import type { PayrollProviderType, PayrollProviderCredentials } from '@/lib/integrations/payroll';

const SUPPORTED_PROVIDERS = [
  {
    type: 'nmbrs',
    name: 'Nmbrs',
    description: 'Nederlandse salarisadministratie software',
    logo: '/integrations/nmbrs.svg',
    requiredFields: ['apiToken', 'domain', 'companyId'],
    features: {
      syncEmployees: true,
      syncHours: true,
      syncLeave: true,
      pushHours: true,
    },
  },
  {
    type: 'afas',
    name: 'AFAS Software',
    description: 'ERP en HR software voor Nederland en België',
    logo: '/integrations/afas.svg',
    requiredFields: ['apiToken', 'environment'],
    features: {
      syncEmployees: true,
      syncHours: false,
      syncLeave: true,
      pushHours: false,
    },
    comingSoon: true,
  },
  {
    type: 'loket',
    name: 'Loket.nl',
    description: 'Online salarisadministratie',
    logo: '/integrations/loket.svg',
    requiredFields: ['clientId', 'clientSecret'],
    features: {
      syncEmployees: true,
      syncHours: true,
      syncLeave: true,
      pushHours: true,
    },
    comingSoon: true,
  },
  {
    type: 'exact',
    name: 'Exact Online',
    description: 'Cloud business software',
    logo: '/integrations/exact.svg',
    requiredFields: ['clientId', 'clientSecret'],
    features: {
      syncEmployees: true,
      syncHours: true,
      syncLeave: false,
      pushHours: true,
    },
    comingSoon: true,
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !['TENANT_ADMIN', 'SUPERUSER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId as string;

    // Get configured providers for this tenant
    const configs = await prisma.payrollProviderConfig.findMany({
      where: { tenant_id: tenantId },
      select: {
        provider_type: true,
        display_name: true,
        sync_enabled: true,
        sync_employees: true,
        sync_hours: true,
        sync_leave: true,
        sync_interval: true,
        last_sync: true,
        last_sync_error: true,
        connection_status: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Merge with supported providers
    const providers = SUPPORTED_PROVIDERS.map((provider) => {
      const config = configs.find((c) => c.provider_type === provider.type);
      return {
        ...provider,
        configured: !!config,
        config: config
          ? {
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
            }
          : null,
      };
    });

    return NextResponse.json({ providers });
  } catch (error) {
    console.error('[Payroll API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !['TENANT_ADMIN', 'SUPERUSER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId as string;
    const body = await request.json();

    const {
      providerType,
      credentials,
      displayName,
      syncEmployees,
      syncHours,
      syncLeave,
      syncEnabled,
      syncInterval,
    } = body as {
      providerType: PayrollProviderType;
      credentials: PayrollProviderCredentials;
      displayName?: string;
      syncEmployees?: boolean;
      syncHours?: boolean;
      syncLeave?: boolean;
      syncEnabled?: boolean;
      syncInterval?: number;
    };

    // Validate provider type
    const provider = SUPPORTED_PROVIDERS.find((p) => p.type === providerType);
    if (!provider) {
      return NextResponse.json({ error: 'Onbekende provider' }, { status: 400 });
    }

    if (provider.comingSoon) {
      return NextResponse.json({ error: 'Deze provider is nog niet beschikbaar' }, { status: 400 });
    }

    // Validate required fields
    const missingFields = provider.requiredFields.filter(
      (field) => !credentials[field as keyof PayrollProviderCredentials]
    );
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Ontbrekende velden: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const service = new PayrollService(tenantId);
    const config = await service.saveConfig(providerType, credentials, {
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
    console.error('[Payroll API] POST error:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
