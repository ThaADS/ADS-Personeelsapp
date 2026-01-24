/**
 * Tenant Service
 *
 * Handles tenant lifecycle operations including:
 * - Suspension (reversible)
 * - Reactivation (from suspended state)
 * - Archival (soft delete, GDPR compliant)
 * - Data export for GDPR compliance
 */

import { prisma } from '@/lib/db/prisma';
import { SubscriptionStatus } from '@/types';

export interface SuspendTenantInput {
  tenantId: string;
  reason: string;
  suspendedBy: string;
}

export interface ReactivateTenantInput {
  tenantId: string;
  reactivatedBy: string;
  newStatus?: SubscriptionStatus;
}

export interface ArchiveTenantInput {
  tenantId: string;
  archivedBy: string;
  reason?: string;
}

export interface TenantActionResult {
  success: boolean;
  message: string;
  tenant?: {
    id: string;
    name: string;
    subscriptionStatus: string;
    suspendedAt?: Date | null;
    archivedAt?: Date | null;
  };
  error?: string;
}

/**
 * Suspend a tenant - reversible action that blocks user access
 * Users can still login but see a suspension notice
 */
export async function suspendTenant(input: SuspendTenantInput): Promise<TenantActionResult> {
  const { tenantId, reason, suspendedBy } = input;

  try {
    // Check tenant exists and is not already archived
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        isArchived: true,
      },
    });

    if (!tenant) {
      return { success: false, message: 'Tenant not found', error: 'NOT_FOUND' };
    }

    if (tenant.isArchived) {
      return { success: false, message: 'Cannot suspend archived tenant', error: 'ALREADY_ARCHIVED' };
    }

    if (tenant.subscriptionStatus === SubscriptionStatus.SUSPENDED) {
      return { success: false, message: 'Tenant is already suspended', error: 'ALREADY_SUSPENDED' };
    }

    // Suspend tenant in transaction
    const updatedTenant = await prisma.$transaction(async (tx) => {
      // Update tenant status
      const updated = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: SubscriptionStatus.SUSPENDED,
          suspendedAt: new Date(),
          suspendedBy,
          suspensionReason: reason,
        },
      });

      // Log the suspension
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: suspendedBy,
          action: 'TENANT_SUSPENDED',
          resource: 'Tenant',
          resourceId: tenantId,
          oldValues: { subscriptionStatus: tenant.subscriptionStatus },
          newValues: {
            subscriptionStatus: SubscriptionStatus.SUSPENDED,
            suspensionReason: reason,
          },
        },
      });

      return updated;
    });

    return {
      success: true,
      message: `Tenant "${updatedTenant.name}" has been suspended`,
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        subscriptionStatus: updatedTenant.subscriptionStatus as string,
        suspendedAt: updatedTenant.suspendedAt,
      },
    };
  } catch (error) {
    console.error('Error suspending tenant:', error);
    return {
      success: false,
      message: 'Failed to suspend tenant',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Reactivate a suspended tenant - restores previous subscription status
 */
export async function reactivateTenant(input: ReactivateTenantInput): Promise<TenantActionResult> {
  const { tenantId, reactivatedBy, newStatus } = input;

  try {
    // Check tenant exists and is suspended
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        isArchived: true,
        currentPlan: true,
        trialEndsAt: true,
      },
    });

    if (!tenant) {
      return { success: false, message: 'Tenant not found', error: 'NOT_FOUND' };
    }

    if (tenant.isArchived) {
      return { success: false, message: 'Cannot reactivate archived tenant', error: 'ALREADY_ARCHIVED' };
    }

    if (tenant.subscriptionStatus !== SubscriptionStatus.SUSPENDED) {
      return { success: false, message: 'Tenant is not suspended', error: 'NOT_SUSPENDED' };
    }

    // Determine the status to restore to
    let statusToRestore = newStatus;
    if (!statusToRestore) {
      // Default to FREEMIUM if no status provided
      // In production, you might want to restore to previous status from audit log
      if (tenant.currentPlan === 'STANDARD') {
        statusToRestore = SubscriptionStatus.ACTIVE;
      } else if (tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()) {
        statusToRestore = SubscriptionStatus.TRIAL;
      } else {
        statusToRestore = SubscriptionStatus.FREEMIUM;
      }
    }

    // Reactivate tenant in transaction
    const updatedTenant = await prisma.$transaction(async (tx) => {
      // Update tenant status
      const updated = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: statusToRestore,
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null,
        },
      });

      // Reactivate all tenant users
      await tx.tenantUser.updateMany({
        where: { tenantId },
        data: { isActive: true },
      });

      // Log the reactivation
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: reactivatedBy,
          action: 'TENANT_REACTIVATED',
          resource: 'Tenant',
          resourceId: tenantId,
          oldValues: { subscriptionStatus: SubscriptionStatus.SUSPENDED },
          newValues: { subscriptionStatus: statusToRestore },
        },
      });

      return updated;
    });

    return {
      success: true,
      message: `Tenant "${updatedTenant.name}" has been reactivated`,
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        subscriptionStatus: updatedTenant.subscriptionStatus as string,
        suspendedAt: null,
      },
    };
  } catch (error) {
    console.error('Error reactivating tenant:', error);
    return {
      success: false,
      message: 'Failed to reactivate tenant',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Archive a tenant - soft delete that preserves data for compliance
 * This is a permanent action (data preserved but tenant cannot be reactivated)
 */
export async function archiveTenant(input: ArchiveTenantInput): Promise<TenantActionResult> {
  const { tenantId, archivedBy, reason } = input;

  try {
    // Check tenant exists and is not already archived
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        isArchived: true,
        _count: {
          select: {
            tenantUsers: true,
            timesheets: true,
            documents: true,
          },
        },
      },
    });

    if (!tenant) {
      return { success: false, message: 'Tenant not found', error: 'NOT_FOUND' };
    }

    if (tenant.isArchived) {
      return { success: false, message: 'Tenant is already archived', error: 'ALREADY_ARCHIVED' };
    }

    // Archive tenant in transaction
    const updatedTenant = await prisma.$transaction(async (tx) => {
      // Deactivate all tenant users
      await tx.tenantUser.updateMany({
        where: { tenantId },
        data: { isActive: false },
      });

      // Update tenant to archived state
      const updated = await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: SubscriptionStatus.CANCELED,
          isArchived: true,
          archivedAt: new Date(),
          archivedBy,
          // Clear suspension data if previously suspended
          suspendedAt: null,
          suspendedBy: null,
          suspensionReason: null,
        },
      });

      // Log the archival
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: archivedBy,
          action: 'TENANT_ARCHIVED',
          resource: 'Tenant',
          resourceId: tenantId,
          oldValues: {
            subscriptionStatus: tenant.subscriptionStatus,
            isArchived: false,
          },
          newValues: {
            subscriptionStatus: SubscriptionStatus.CANCELED,
            isArchived: true,
            archiveReason: reason || 'No reason provided',
            usersAffected: tenant._count.tenantUsers,
            timesheetsPreserved: tenant._count.timesheets,
            documentsPreserved: tenant._count.documents,
          },
        },
      });

      return updated;
    });

    return {
      success: true,
      message: `Tenant "${updatedTenant.name}" has been archived. Data preserved for compliance.`,
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        subscriptionStatus: updatedTenant.subscriptionStatus as string,
        archivedAt: updatedTenant.archivedAt,
      },
    };
  } catch (error) {
    console.error('Error archiving tenant:', error);
    return {
      success: false,
      message: 'Failed to archive tenant',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Export tenant data for GDPR compliance
 * Returns all tenant data in a structured format for data portability
 */
export async function exportTenantData(tenantId: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                postalCode: true,
                employeeId: true,
                department: true,
                position: true,
                startDate: true,
                contractType: true,
                workHoursPerWeek: true,
                createdAt: true,
              },
            },
          },
        },
        timesheets: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            break_minutes: true,
            description: true,
            total_hours: true,
            status: true,
            approved_at: true,
            createdAt: true,
          },
        },
        employees: {
          select: {
            id: true,
            employee_number: true,
            position: true,
            contract_type: true,
            hours_per_week: true,
            start_date: true,
            end_date: true,
            phone_number: true,
            emergency_contact: true,
            emergency_phone: true,
            created_at: true,
          },
        },
        leaveRequests: {
          select: {
            id: true,
            type: true,
            startDate: true,
            endDate: true,
            totalDays: true,
            description: true,
            status: true,
            reviewedAt: true,
            createdAt: true,
          },
        },
        vacations: {
          select: {
            id: true,
            type: true,
            start_date: true,
            end_date: true,
            total_days: true,
            description: true,
            status: true,
            approved_at: true,
            created_at: true,
          },
        },
        sick_leaves: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            reason: true,
            medical_certificate: true,
            uwv_reported: true,
            status: true,
            created_at: true,
          },
        },
        documents: {
          select: {
            id: true,
            type: true,
            name: true,
            file_name: true,
            file_size: true,
            mime_type: true,
            created_at: true,
          },
        },
        auditLogs: {
          select: {
            id: true,
            action: true,
            resource: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1000, // Limit audit logs for performance
        },
      },
    });

    if (!tenant) {
      return { success: false, error: 'Tenant not found' };
    }

    // Structure data for export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportFormat: 'GDPR_DATA_EXPORT_V1',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        contactEmail: tenant.contactEmail,
        contactName: tenant.contactName,
        address: tenant.address,
        phone: tenant.phone,
        createdAt: tenant.createdAt,
        subscriptionStatus: tenant.subscriptionStatus,
        currentPlan: tenant.currentPlan,
      },
      users: tenant.tenantUsers.map(tu => ({
        ...tu.user,
        role: tu.role,
        isActive: tu.isActive,
        joinedAt: tu.createdAt,
      })),
      employees: tenant.employees,
      timesheets: tenant.timesheets,
      leaveRequests: tenant.leaveRequests,
      vacations: tenant.vacations,
      sickLeaves: tenant.sick_leaves,
      documents: tenant.documents,
      auditLogSummary: {
        totalLogs: tenant.auditLogs.length,
        recentLogs: tenant.auditLogs.slice(0, 100),
      },
    };

    return { success: true, data: exportData };
  } catch (error) {
    console.error('Error exporting tenant data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed'
    };
  }
}

/**
 * Check if tenant can perform operations (not suspended/archived)
 */
export async function isTenantOperational(tenantId: string): Promise<{
  operational: boolean;
  reason?: string;
  status?: string;
}> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionStatus: true,
        isArchived: true,
        suspendedAt: true,
        suspensionReason: true,
      },
    });

    if (!tenant) {
      return { operational: false, reason: 'Tenant not found' };
    }

    if (tenant.isArchived) {
      return {
        operational: false,
        reason: 'Tenant has been archived',
        status: 'ARCHIVED',
      };
    }

    if (tenant.subscriptionStatus === SubscriptionStatus.SUSPENDED) {
      return {
        operational: false,
        reason: tenant.suspensionReason || 'Tenant is suspended',
        status: 'SUSPENDED',
      };
    }

    if (tenant.subscriptionStatus === SubscriptionStatus.CANCELED) {
      return {
        operational: false,
        reason: 'Subscription has been canceled',
        status: 'CANCELED',
      };
    }

    return { operational: true, status: tenant.subscriptionStatus as string };
  } catch (error) {
    console.error('Error checking tenant status:', error);
    return { operational: false, reason: 'Error checking tenant status' };
  }
}
