import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  suspendTenant,
  reactivateTenant,
  archiveTenant,
  exportTenantData,
  isTenantOperational,
} from '../tenant-service';
import { SubscriptionStatus } from '@/types';

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    tenant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tenantUser: {
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      tenant: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      tenantUser: {
        updateMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    })),
  },
}));

describe('Tenant Service', () => {
  const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('suspendTenant', () => {
    it('should successfully suspend an active tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      // Mock tenant lookup
      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        isArchived: false,
      });

      // Mock transaction
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
        const tx = {
          tenant: {
            update: vi.fn().mockResolvedValue({
              id: mockTenantId,
              name: 'Test Company',
              subscriptionStatus: SubscriptionStatus.SUSPENDED,
              suspendedAt: new Date(),
            }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await suspendTenant({
        tenantId: mockTenantId,
        reason: 'Non-payment',
        suspendedBy: mockUserId,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('has been suspended');
      expect(result.tenant?.subscriptionStatus).toBe(SubscriptionStatus.SUSPENDED);
    });

    it('should fail to suspend a non-existent tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await suspendTenant({
        tenantId: mockTenantId,
        reason: 'Test',
        suspendedBy: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should fail to suspend an already archived tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.CANCELED,
        isArchived: true,
      });

      const result = await suspendTenant({
        tenantId: mockTenantId,
        reason: 'Test',
        suspendedBy: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_ARCHIVED');
    });

    it('should fail to suspend an already suspended tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.SUSPENDED,
        isArchived: false,
      });

      const result = await suspendTenant({
        tenantId: mockTenantId,
        reason: 'Test',
        suspendedBy: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_SUSPENDED');
    });
  });

  describe('reactivateTenant', () => {
    it('should successfully reactivate a suspended tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.SUSPENDED,
        isArchived: false,
        currentPlan: 'FREEMIUM',
        trialEndsAt: null,
      });

      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
        const tx = {
          tenant: {
            update: vi.fn().mockResolvedValue({
              id: mockTenantId,
              name: 'Test Company',
              subscriptionStatus: SubscriptionStatus.FREEMIUM,
              suspendedAt: null,
            }),
          },
          tenantUser: {
            updateMany: vi.fn().mockResolvedValue({ count: 5 }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await reactivateTenant({
        tenantId: mockTenantId,
        reactivatedBy: mockUserId,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('has been reactivated');
    });

    it('should fail to reactivate a non-suspended tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        isArchived: false,
      });

      const result = await reactivateTenant({
        tenantId: mockTenantId,
        reactivatedBy: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_SUSPENDED');
    });

    it('should fail to reactivate an archived tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.SUSPENDED,
        isArchived: true,
      });

      const result = await reactivateTenant({
        tenantId: mockTenantId,
        reactivatedBy: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_ARCHIVED');
    });

    it('should use provided newStatus when reactivating', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.SUSPENDED,
        isArchived: false,
        currentPlan: 'FREEMIUM',
      });

      let capturedStatus: string | undefined;
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
        const tx = {
          tenant: {
            update: vi.fn().mockImplementation(({ data }) => {
              capturedStatus = data.subscriptionStatus;
              return Promise.resolve({
                id: mockTenantId,
                name: 'Test Company',
                subscriptionStatus: data.subscriptionStatus,
                suspendedAt: null,
              });
            }),
          },
          tenantUser: {
            updateMany: vi.fn().mockResolvedValue({ count: 5 }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      await reactivateTenant({
        tenantId: mockTenantId,
        reactivatedBy: mockUserId,
        newStatus: SubscriptionStatus.ACTIVE,
      });

      expect(capturedStatus).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('archiveTenant', () => {
    it('should successfully archive an active tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        isArchived: false,
        _count: {
          tenantUsers: 5,
          timesheets: 100,
          documents: 10,
        },
      });

      (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
        const tx = {
          tenantUser: {
            updateMany: vi.fn().mockResolvedValue({ count: 5 }),
          },
          tenant: {
            update: vi.fn().mockResolvedValue({
              id: mockTenantId,
              name: 'Test Company',
              subscriptionStatus: SubscriptionStatus.CANCELED,
              isArchived: true,
              archivedAt: new Date(),
            }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await archiveTenant({
        tenantId: mockTenantId,
        archivedBy: mockUserId,
        reason: 'Company closed',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('has been archived');
      expect(result.tenant?.archivedAt).toBeDefined();
    });

    it('should fail to archive an already archived tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        subscriptionStatus: SubscriptionStatus.CANCELED,
        isArchived: true,
      });

      const result = await archiveTenant({
        tenantId: mockTenantId,
        archivedBy: mockUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('ALREADY_ARCHIVED');
    });
  });

  describe('isTenantOperational', () => {
    it('should return operational for active tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        isArchived: false,
        suspendedAt: null,
        suspensionReason: null,
      });

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(true);
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should return non-operational for suspended tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionStatus: SubscriptionStatus.SUSPENDED,
        isArchived: false,
        suspendedAt: new Date(),
        suspensionReason: 'Non-payment',
      });

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(false);
      expect(result.status).toBe('SUSPENDED');
      expect(result.reason).toBe('Non-payment');
    });

    it('should return non-operational for archived tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionStatus: SubscriptionStatus.CANCELED,
        isArchived: true,
        suspendedAt: null,
        suspensionReason: null,
      });

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(false);
      expect(result.status).toBe('ARCHIVED');
    });

    it('should return non-operational for canceled tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionStatus: SubscriptionStatus.CANCELED,
        isArchived: false,
        suspendedAt: null,
        suspensionReason: null,
      });

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(false);
      expect(result.status).toBe('CANCELED');
    });

    it('should return non-operational for non-existent tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(false);
      expect(result.reason).toBe('Tenant not found');
    });

    it('should return operational for trial tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionStatus: SubscriptionStatus.TRIAL,
        isArchived: false,
        suspendedAt: null,
        suspensionReason: null,
      });

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(true);
      expect(result.status).toBe(SubscriptionStatus.TRIAL);
    });

    it('should return operational for freemium tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        subscriptionStatus: SubscriptionStatus.FREEMIUM,
        isArchived: false,
        suspendedAt: null,
        suspensionReason: null,
      });

      const result = await isTenantOperational(mockTenantId);

      expect(result.operational).toBe(true);
      expect(result.status).toBe(SubscriptionStatus.FREEMIUM);
    });
  });

  describe('exportTenantData', () => {
    it('should export tenant data successfully', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: mockTenantId,
        name: 'Test Company',
        slug: 'test-company',
        domain: null,
        contactEmail: 'contact@test.com',
        contactName: 'Test Contact',
        address: '123 Test St',
        phone: '+31612345678',
        createdAt: new Date(),
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        currentPlan: 'FREEMIUM',
        tenantUsers: [
          {
            role: 'TENANT_ADMIN',
            isActive: true,
            createdAt: new Date(),
            user: {
              id: mockUserId,
              name: 'Admin User',
              email: 'admin@test.com',
              phone: null,
              address: null,
              city: null,
              postalCode: null,
              employeeId: null,
              department: null,
              position: null,
              startDate: null,
              contractType: null,
              workHoursPerWeek: null,
              createdAt: new Date(),
            },
          },
        ],
        timesheets: [],
        employees: [],
        leaveRequests: [],
        vacations: [],
        sick_leaves: [],
        documents: [],
        auditLogs: [],
      });

      const result = await exportTenantData(mockTenantId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.exportFormat).toBe('GDPR_DATA_EXPORT_V1');
      expect(result.data?.tenant).toBeDefined();
      expect(result.data?.users).toBeDefined();
    });

    it('should fail to export non-existent tenant', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await exportTenantData(mockTenantId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tenant not found');
    });
  });
});
