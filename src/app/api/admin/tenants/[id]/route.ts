import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PrismaClient } from '@prisma/client';
import { SubscriptionStatus } from '@/types';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  contactName: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  domain: z.string().optional(),
  subscriptionStatus: z.enum(['TRIAL', 'ACTIVE', 'FREEMIUM', 'CANCELED', 'PAST_DUE', 'UNPAID']).optional(),
  settings: z.object({}).optional(),
});

// GET /api/admin/tenants/[id] - Get tenant details (superuser only)
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

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        tenantUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        timesheets: {
          select: {
            id: true,
            date: true,
            status: true,
            user: {
              select: { name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            tenantUsers: { where: { isActive: true } },
            timesheets: true,
            auditLogs: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        contactEmail: tenant.contactEmail,
        contactName: tenant.contactName,
        address: tenant.address,
        phone: tenant.phone,
        subscriptionStatus: tenant.subscriptionStatus,
        currentPlan: tenant.currentPlan,
        trialEndsAt: tenant.trialEndsAt,
        settings: tenant.settings,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        users: tenant.tenantUsers.map(tu => ({
          id: tu.user.id,
          email: tu.user.email,
          name: tu.user.name,
          role: tu.role,
          isActive: tu.isActive,
          joinedAt: tu.createdAt,
        })),
        subscriptions: tenant.subscriptions,
        recentTimesheets: tenant.timesheets,
        stats: {
          activeUsers: tenant._count.tenantUsers,
          totalTimesheets: tenant._count.timesheets,
          auditLogsCount: tenant._count.auditLogs,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/tenants/[id] - Update tenant (superuser only)
export async function PUT(
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
    const validatedData = updateTenantSchema.parse(body);

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            tenantUsers: { where: { isActive: true } },
          },
        },
      },
    });

    // Log the update action
    await prisma.auditLog.create({
      data: {
        tenantId: id,
        userId: session.user.id,
        action: 'TENANT_UPDATE',
        resource: 'Tenant',
        resourceId: id,
        newValues: JSON.stringify(validatedData),
      },
    });

    return NextResponse.json({
      message: 'Tenant updated successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        contactEmail: updatedTenant.contactEmail,
        subscriptionStatus: updatedTenant.subscriptionStatus,
        currentPlan: updatedTenant.currentPlan,
        activeUsers: updatedTenant._count.tenantUsers,
        updatedAt: updatedTenant.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/tenants/[id] - Delete tenant (superuser only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tenantUsers: true,
            timesheets: true,
          },
        },
      },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Soft delete by deactivating all users and marking as canceled
    await prisma.$transaction(async (tx) => {
      // Deactivate all tenant users
      await tx.tenantUser.updateMany({
        where: { tenantId: id },
        data: { isActive: false },
      });

      // Update tenant status
      await tx.tenant.update({
        where: { id },
        data: {
          subscriptionStatus: SubscriptionStatus.CANCELED,
        },
      });

      // Log the deletion
      await tx.auditLog.create({
        data: {
          tenantId: id,
          userId: session.user.id,
          action: 'TENANT_DELETE',
          resource: 'Tenant',
          resourceId: id,
          oldValues: JSON.stringify({
            name: existingTenant.name,
            subscriptionStatus: existingTenant.subscriptionStatus,
          }),
        },
      });
    });

    return NextResponse.json({
      message: 'Tenant deactivated successfully',
      tenant: {
        id: existingTenant.id,
        name: existingTenant.name,
        usersAffected: existingTenant._count.tenantUsers,
        timesheetsAffected: existingTenant._count.timesheets,
      },
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}