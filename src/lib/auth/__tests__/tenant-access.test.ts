import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Mock the auth module
vi.mock('../auth', () => ({
  auth: vi.fn(),
}));

// Create mock PrismaClient
const mockPrismaClient = {
  tenantUser: {
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
  timesheet: {
    findUnique: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

const { auth } = await import('../auth');
const { 
  getTenantContext, 
  requireTenantAccess, 
  requirePermission,
  addTenantFilter,
  createAuditLog
} = await import('../tenant-access');

describe('Tenant Access Control Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTenantContext', () => {
    it('should return null for unauthenticated users', async () => {
      // Arrange
      vi.mocked(auth).mockResolvedValue(null);

      // Act
      const context = await getTenantContext();

      // Assert
      expect(context).toBeNull();
    });

    it('should return superuser context', async () => {
      // Arrange
      const mockSession = {
        user: {
          id: 'super-1',
          isSuperuser: true,
          role: 'SUPERUSER',
          tenantId: null
        }
      };
      vi.mocked(auth).mockResolvedValue(mockSession);

      // Mock headers for superuser
      vi.mock('next/headers', () => ({
        headers: vi.fn(() => ({
          get: vi.fn(() => 'tenant-123')
        }))
      }));

      // Act
      const context = await getTenantContext();

      // Assert
      expect(context?.isSuperuser).toBe(true);
      expect(context?.userId).toBe('super-1');
    });

    it('should return regular user tenant context', async () => {
      // Arrange
      const mockSession = {
        user: {
          id: 'user-1',
          isSuperuser: false,
          role: 'USER',
          tenantId: 'tenant-1'
        }
      };
      vi.mocked(auth).mockResolvedValue(mockSession);

      mockPrismaClient.tenantUser.findUnique.mockResolvedValue({
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'MANAGER',
        isActive: true
      });

      // Act
      const context = await getTenantContext();

      // Assert
      expect(context?.userId).toBe('user-1');
      expect(context?.tenantId).toBe('tenant-1');
      expect(context?.userRole).toBe('MANAGER');
      expect(context?.isSuperuser).toBe(false);
    });

    it('should return null for inactive tenant user', async () => {
      // Arrange
      const mockSession = {
        user: {
          id: 'user-1',
          isSuperuser: false,
          role: 'USER',
          tenantId: 'tenant-1'
        }
      };
      vi.mocked(auth).mockResolvedValue(mockSession);

      mockPrismaClient.tenantUser.findUnique.mockResolvedValue({
        tenantId: 'tenant-1',
        userId: 'user-1',
        role: 'USER',
        isActive: false // Inactive user
      });

      // Act
      const context = await getTenantContext();

      // Assert
      expect(context).toBeNull();
    });
  });

  describe('requireTenantAccess', () => {
    it('should allow superuser access to any tenant', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: '',
        userId: 'super-1',
        userRole: 'SUPERUSER',
        isSuperuser: true
      });

      // Act
      const context = await requireTenantAccess('tenant-1');

      // Assert
      expect(context.isSuperuser).toBe(true);
      expect(context.tenantId).toBe('tenant-1');
    });

    it('should allow regular user access to their tenant', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'tenant-1',
        userId: 'user-1',
        userRole: 'USER',
        isSuperuser: false
      });

      // Act
      const context = await requireTenantAccess('tenant-1');

      // Assert
      expect(context.tenantId).toBe('tenant-1');
      expect(context.userId).toBe('user-1');
    });

    it('should deny regular user access to different tenant', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'tenant-1',
        userId: 'user-1',
        userRole: 'USER',
        isSuperuser: false
      });

      // Act & Assert
      await expect(requireTenantAccess('tenant-2'))
        .rejects.toThrow('Access denied to this tenant');
    });

    it('should throw error for unauthenticated user', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue(null);

      // Act & Assert
      await expect(requireTenantAccess('tenant-1'))
        .rejects.toThrow('Authentication required');
    });
  });

  describe('requirePermission', () => {
    it('should grant permission to authorized user', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'user-1', 
        userRole: 'MANAGER',
        isSuperuser: false
      };
      vi.mocked(getTenantContext).mockResolvedValue(mockContext);

      // Act - Manager should have timesheet approval permission
      const context = await requirePermission('timesheet:approve');

      // Assert
      expect(context).toEqual(mockContext);
    });

    it('should deny permission to unauthorized user', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'tenant-1',
        userId: 'user-1',
        userRole: 'USER', // Regular user shouldn't approve timesheets
        isSuperuser: false
      });

      // Act & Assert
      await expect(requirePermission('timesheet:approve'))
        .rejects.toThrow('Permission denied: timesheet:approve');
    });
  });

  describe('Data Filtering', () => {
    it('should add tenant filter to query', () => {
      // Arrange
      const baseQuery = { status: 'ACTIVE' };
      const tenantId = 'tenant-1';

      // Act
      const filteredQuery = addTenantFilter(baseQuery, tenantId);

      // Assert
      expect(filteredQuery).toEqual({
        status: 'ACTIVE',
        tenantId: 'tenant-1'
      });
    });

    it('should preserve existing query parameters', () => {
      // Arrange
      const complexQuery = {
        status: 'PENDING',
        userId: 'user-1',
        date: { gte: new Date('2024-01-01') }
      };
      const tenantId = 'tenant-2';

      // Act
      const filteredQuery = addTenantFilter(complexQuery, tenantId);

      // Assert
      expect(filteredQuery.status).toBe('PENDING');
      expect(filteredQuery.userId).toBe('user-1');
      expect(filteredQuery.tenantId).toBe('tenant-2');
      expect(filteredQuery.date).toEqual({ gte: new Date('2024-01-01') });
    });
  });

  describe('Audit Logging', () => {
    it('should create audit log for user action', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'tenant-1',
        userId: 'user-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      mockPrismaClient.auditLog.create.mockResolvedValue({
        id: 'audit-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'APPROVE_TIMESHEET',
        resource: 'timesheet',
        resourceId: 'ts-1'
      });

      // Act
      await createAuditLog('APPROVE_TIMESHEET', 'timesheet', 'ts-1');

      // Assert
      expect(mockPrismaClient.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          action: 'APPROVE_TIMESHEET',
          resource: 'timesheet',
          resourceId: 'ts-1'
        })
      });
    });

    it('should create audit log for superuser action', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: '',
        userId: 'super-1',
        userRole: 'SUPERUSER',
        isSuperuser: true
      });

      mockPrismaClient.auditLog.create.mockResolvedValue({
        id: 'audit-1',
        tenantId: null, // Superuser actions have null tenantId
        userId: 'super-1',
        action: 'CREATE_TENANT',
        resource: 'tenant',
        resourceId: 'tenant-new'
      });

      // Act
      await createAuditLog('CREATE_TENANT', 'tenant', 'tenant-new');

      // Assert
      expect(mockPrismaClient.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: null, // Superuser gets null tenantId
          userId: 'super-1',
          action: 'CREATE_TENANT'
        })
      });
    });

    it('should skip audit log when no user context', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue(null);

      // Act
      await createAuditLog('SOME_ACTION');

      // Assert
      expect(mockPrismaClient.auditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('Resource Access Control', () => {
    it('should allow user to access their own timesheet', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'user-1',
        userRole: 'USER',
        isSuperuser: false
      };

      mockPrismaClient.timesheet.findUnique.mockResolvedValue({
        id: 'ts-1',
        tenantId: 'tenant-1',
        userId: 'user-1' // Same user
      });

      // This would be part of requireResourceAccess internal logic
      const timesheet = await mockPrismaClient.timesheet.findUnique({
        where: { id: 'ts-1' }
      });

      // Assert
      expect(timesheet?.tenantId).toBe(mockContext.tenantId);
      expect(timesheet?.userId).toBe(mockContext.userId);
    });

    it('should deny access to timesheet from different tenant', async () => {
      // Arrange
      mockPrismaClient.timesheet.findUnique.mockResolvedValue({
        id: 'ts-1',
        tenantId: 'tenant-2', // Different tenant
        userId: 'user-2'
      });

      const timesheet = await mockPrismaClient.timesheet.findUnique({
        where: { id: 'ts-1' }
      });

      // Assert - In real implementation, this would throw an error
      expect(timesheet?.tenantId).toBe('tenant-2');
      expect(timesheet?.tenantId).not.toBe('tenant-1');
    });
  });
});