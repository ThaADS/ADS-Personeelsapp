import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
import {
  suspendTenant,
  reactivateTenant,
  archiveTenant,
  exportTenantData,
} from '@/lib/services/tenant-service';
import { SubscriptionStatus } from '@/types';

const actionSchema = z.object({
  action: z.enum(['suspend', 'reactivate', 'archive', 'export']),
  reason: z.string().optional(),
  newStatus: z.enum(['TRIAL', 'ACTIVE', 'FREEMIUM']).optional(),
});

/**
 * POST /api/admin/tenants/[id]/actions - Perform tenant lifecycle actions
 *
 * Actions:
 * - suspend: Temporarily block tenant access (reversible)
 * - reactivate: Restore suspended tenant
 * - archive: Soft delete tenant (data preserved for compliance)
 * - export: Export all tenant data for GDPR compliance
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, reason, newStatus } = actionSchema.parse(body);

    let result;

    switch (action) {
      case 'suspend':
        if (!reason) {
          return NextResponse.json(
            { error: 'Reason is required for suspension' },
            { status: 400 }
          );
        }
        result = await suspendTenant({
          tenantId: id,
          reason,
          suspendedBy: session.user.id,
        });
        break;

      case 'reactivate':
        result = await reactivateTenant({
          tenantId: id,
          reactivatedBy: session.user.id,
          newStatus: newStatus as SubscriptionStatus | undefined,
        });
        break;

      case 'archive':
        result = await archiveTenant({
          tenantId: id,
          archivedBy: session.user.id,
          reason,
        });
        break;

      case 'export':
        const exportResult = await exportTenantData(id);
        if (exportResult.success) {
          return NextResponse.json(
            {
              success: true,
              message: 'Data export generated',
              data: exportResult.data,
            },
            {
              headers: {
                'Content-Disposition': `attachment; filename="tenant-${id}-export.json"`,
              },
            }
          );
        }
        return NextResponse.json(
          { success: false, error: exportResult.error },
          { status: 500 }
        );

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      const statusCode = result.error === 'NOT_FOUND' ? 404 : 400;
      return NextResponse.json(
        { success: false, error: result.error, message: result.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error performing tenant action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/admin/tenants/[id]/actions - Get available actions for tenant
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { prisma } = await import('@/lib/db/prisma');

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        isArchived: true,
        suspendedAt: true,
        suspensionReason: true,
        archivedAt: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Determine available actions based on current state
    const availableActions = [];

    if (tenant.isArchived) {
      // Archived tenants can only export data
      availableActions.push({
        action: 'export',
        label: 'Export Data',
        description: 'Download all tenant data for compliance',
        requiresReason: false,
      });
    } else if (tenant.subscriptionStatus === 'SUSPENDED') {
      // Suspended tenants can be reactivated or archived
      availableActions.push(
        {
          action: 'reactivate',
          label: 'Reactivate',
          description: 'Restore tenant access',
          requiresReason: false,
        },
        {
          action: 'archive',
          label: 'Archive',
          description: 'Permanently archive tenant (data preserved)',
          requiresReason: true,
        },
        {
          action: 'export',
          label: 'Export Data',
          description: 'Download all tenant data for compliance',
          requiresReason: false,
        }
      );
    } else {
      // Active/Trial/Freemium tenants can be suspended or archived
      availableActions.push(
        {
          action: 'suspend',
          label: 'Suspend',
          description: 'Temporarily block tenant access',
          requiresReason: true,
        },
        {
          action: 'archive',
          label: 'Archive',
          description: 'Permanently archive tenant (data preserved)',
          requiresReason: true,
        },
        {
          action: 'export',
          label: 'Export Data',
          description: 'Download all tenant data for compliance',
          requiresReason: false,
        }
      );
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.subscriptionStatus,
        isArchived: tenant.isArchived,
        suspendedAt: tenant.suspendedAt,
        suspensionReason: tenant.suspensionReason,
        archivedAt: tenant.archivedAt,
      },
      availableActions,
    });
  } catch (error) {
    console.error('Error getting tenant actions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
