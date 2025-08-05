import { auth } from '@/lib/auth/auth';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@/types';
import { canUserAccessTenant, isSuperuser } from '@/lib/tenant';
import { hasPermission, Permission } from '@/lib/rbac';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: UserRole;
  isSuperuser: boolean;
}

/**
 * Get the current tenant context from the authenticated session
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  // Superusers can access any tenant
  if (session.user.isSuperuser) {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id') || session.user.tenantId;
    
    if (!tenantId) {
      return {
        tenantId: '', // Superuser without specific tenant
        userId: session.user.id,
        userRole: session.user.role,
        isSuperuser: true,
      };
    }

    return {
      tenantId,
      userId: session.user.id,
      userRole: session.user.role,
      isSuperuser: true,
    };
  }

  // Regular users must have tenant context
  if (!session.user.tenantId) {
    return null;
  }

  // Get user's role in this tenant
  const tenantUser = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
      },
    },
  });

  if (!tenantUser?.isActive) {
    return null;
  }

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    userRole: tenantUser.role,
    isSuperuser: false,
  };
}

/**
 * Ensure the user has access to the specified tenant
 */
export async function requireTenantAccess(tenantId: string): Promise<TenantContext> {
  const context = await getTenantContext();
  
  if (!context) {
    throw new Error('Authentication required');
  }

  // Superusers can access any tenant
  if (context.isSuperuser) {
    return {
      ...context,
      tenantId,
    };
  }

  // Regular users must match the tenant
  if (context.tenantId !== tenantId) {
    throw new Error('Access denied to this tenant');
  }

  return context;
}

/**
 * Check if the current user has a specific permission
 */
export async function requirePermission(permission: Permission): Promise<TenantContext> {
  const context = await getTenantContext();
  
  if (!context) {
    throw new Error('Authentication required');
  }

  if (!hasPermission(context.userRole, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return context;
}

/**
 * Check if the current user can access a specific resource
 */
export async function requireResourceAccess(
  resourceType: 'timesheet' | 'user' | 'tenant',
  resourceId: string,
  permission: Permission
): Promise<TenantContext> {
  const context = await requirePermission(permission);

  // Superusers can access any resource
  if (context.isSuperuser) {
    return context;
  }

  // Check resource ownership/access based on type
  switch (resourceType) {
    case 'timesheet':
      await requireTimesheetAccess(resourceId, context);
      break;
    case 'user':
      await requireUserAccess(resourceId, context);
      break;
    case 'tenant':
      await requireTenantAccess(resourceId);
      break;
    default:
      throw new Error('Unknown resource type');
  }

  return context;
}

/**
 * Ensure the user can access a specific timesheet
 */
async function requireTimesheetAccess(timesheetId: string, context: TenantContext) {
  const timesheet = await prisma.timesheet.findUnique({
    where: { id: timesheetId },
    select: { tenantId: true, userId: true },
  });

  if (!timesheet) {
    throw new Error('Timesheet not found');
  }

  // Must be in the same tenant
  if (timesheet.tenantId !== context.tenantId) {
    throw new Error('Access denied to this timesheet');
  }

  // Users can only access their own timesheets (unless they have approval permissions)
  if (context.userRole === UserRole.USER && timesheet.userId !== context.userId) {
    throw new Error('Access denied to this timesheet');
  }
}

/**
 * Ensure the user can access a specific user record
 */
async function requireUserAccess(userId: string, context: TenantContext) {
  // Users can always access their own record
  if (userId === context.userId) {
    return;
  }

  // Check if target user is in the same tenant
  const targetUser = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId: context.tenantId,
        userId,
      },
    },
  });

  if (!targetUser) {
    throw new Error('User not found in this tenant');
  }

  // Check role hierarchy - users can only manage lower roles
  const canManage = 
    context.userRole === UserRole.TENANT_ADMIN ||
    (context.userRole === UserRole.MANAGER && targetUser.role === UserRole.USER);

  if (!canManage) {
    throw new Error('Access denied to this user');
  }
}

/**
 * Filter query to only include tenant-specific data
 */
export function addTenantFilter<T extends Record<string, any>>(
  where: T,
  tenantId: string
): T & { tenantId: string } {
  return {
    ...where,
    tenantId,
  };
}

/**
 * Create audit log entry for tenant actions
 */
export async function createAuditLog(
  action: string,
  resource?: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any
) {
  const context = await getTenantContext();
  
  if (!context) {
    return; // Skip audit log if no user context
  }

  try {
    await prisma.auditLog.create({
      data: {
        tenantId: context.isSuperuser ? null : context.tenantId,
        userId: context.userId,
        action,
        resource,
        resourceId,
        oldValues,
        newValues,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error for audit logging failures
  }
}

/**
 * Middleware helper for API routes to ensure tenant access
 */
export async function withTenantAccess<T>(
  handler: (context: TenantContext) => Promise<T>
): Promise<T> {
  const context = await getTenantContext();
  
  if (!context) {
    throw new Error('Authentication required');
  }

  return handler(context);
}

/**
 * Middleware helper for API routes that require specific permissions
 */
export async function withPermission<T>(
  permission: Permission,
  handler: (context: TenantContext) => Promise<T>
): Promise<T> {
  const context = await requirePermission(permission);
  return handler(context);
}

/**
 * Get user's effective role in the current tenant context
 */
export async function getUserTenantRole(userId: string, tenantId: string): Promise<UserRole | null> {
  // Check if user is superuser
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperuser: true, role: true },
  });

  if (user?.isSuperuser) {
    return UserRole.SUPERUSER;
  }

  // Get tenant-specific role
  const tenantUser = await prisma.tenantUser.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
    select: { role: true, isActive: true },
  });

  return tenantUser?.isActive ? tenantUser.role : null;
}