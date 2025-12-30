import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { FleetProviderType, FLEET_PROVIDERS } from '@/lib/services/fleet-providers/types';

/**
 * GET /api/fleet-provider/[provider]/vehicles
 * Get vehicle mappings for a specific fleet provider
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;
    const providerType = provider as FleetProviderType;

    if (!FLEET_PROVIDERS[providerType]) {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    const vehicles = await prisma.vehicleMapping.findMany({
      where: {
        tenant_id: context.tenantId,
        provider_type: providerType,
      },
      include: {
        employee: {
          include: {
            users: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        registration: 'asc',
      },
    });

    return NextResponse.json(
      vehicles.map((v) => ({
        id: v.id,
        provider_vehicle_id: v.provider_vehicle_id || v.routevision_id, // Fallback for legacy
        registration: v.registration,
        vehicle_name: v.vehicle_name,
        employee_id: v.employee_id,
        employee_name: v.employee?.users?.name || null,
        is_active: v.is_active,
      }))
    );
  } catch (error) {
    console.error('Fleet provider vehicles error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get vehicles' },
      { status: 500 }
    );
  }
}
