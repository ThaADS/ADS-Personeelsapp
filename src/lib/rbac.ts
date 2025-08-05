import { UserRole } from '@/types';

export type Permission = 
  | 'tenant:create'
  | 'tenant:read'
  | 'tenant:update'
  | 'tenant:delete'
  | 'tenant:list'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'user:list'
  | 'user:invite'
  | 'timesheet:create'
  | 'timesheet:read'
  | 'timesheet:update'
  | 'timesheet:delete'
  | 'timesheet:approve'
  | 'billing:read'
  | 'billing:update'
  | 'billing:manage'
  | 'reports:basic'
  | 'reports:advanced'
  | 'system:admin'
  | 'advertisements:manage';

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPERUSER]: [
    'tenant:create',
    'tenant:read',
    'tenant:update',
    'tenant:delete',
    'tenant:list',
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'user:list',
    'user:invite',
    'timesheet:create',
    'timesheet:read',
    'timesheet:update',
    'timesheet:delete',
    'timesheet:approve',
    'billing:read',
    'billing:update',
    'billing:manage',
    'reports:basic',
    'reports:advanced',
    'system:admin',
    'advertisements:manage',
  ],
  [UserRole.TENANT_ADMIN]: [
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'user:list',
    'user:invite',
    'timesheet:create',
    'timesheet:read',
    'timesheet:update',
    'timesheet:delete',
    'timesheet:approve',
    'billing:read',
    'billing:update',
    'billing:manage',
    'reports:basic',
    'reports:advanced',
  ],
  [UserRole.MANAGER]: [
    'user:read',
    'user:list',
    'timesheet:create',
    'timesheet:read',
    'timesheet:update',
    'timesheet:approve',
    'reports:basic',
    'reports:advanced',
  ],
  [UserRole.USER]: [
    'timesheet:create',
    'timesheet:read',
    'timesheet:update',
    'reports:basic',
  ],
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[userRole];
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'user:create') && hasPermission(userRole, 'user:delete');
}

export function canApproveTimesheets(userRole: UserRole): boolean {
  return hasPermission(userRole, 'timesheet:approve');
}

export function canManageBilling(userRole: UserRole): boolean {
  return hasPermission(userRole, 'billing:manage');
}

export function canAccessAdvancedReports(userRole: UserRole): boolean {
  return hasPermission(userRole, 'reports:advanced');
}

export function canManageSystem(userRole: UserRole): boolean {
  return hasPermission(userRole, 'system:admin');
}

export function getRoleHierarchy(): UserRole[] {
  return [UserRole.SUPERUSER, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.USER];
}

export function isHigherRole(role1: UserRole, role2: UserRole): boolean {
  const hierarchy = getRoleHierarchy();
  return hierarchy.indexOf(role1) < hierarchy.indexOf(role2);
}

export function canManageRole(userRole: UserRole, targetRole: UserRole): boolean {
  // Superusers can manage all roles
  if (userRole === UserRole.SUPERUSER) return true;
  
  // Tenant admins can manage managers and users
  if (userRole === UserRole.TENANT_ADMIN) {
    return targetRole === UserRole.MANAGER || targetRole === UserRole.USER;
  }
  
  // Managers can only manage users
  if (userRole === UserRole.MANAGER) {
    return targetRole === UserRole.USER;
  }
  
  // Users cannot manage other roles
  return false;
}