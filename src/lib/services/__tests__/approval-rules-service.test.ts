import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateTimesheet,
  validateVacationRequest,
  checkAutoApproval,
  canUserApprove,
  defaultTimesheetRules,
  defaultVacationRules,
  defaultApprovalConfig,
} from '../approval-rules-service';
import { UserRole } from '@/types';

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    tenant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('Approval Rules Service', () => {
  const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('defaultTimesheetRules', () => {
    it('should have Dutch labor law compliant defaults', () => {
      expect(defaultTimesheetRules.maxHoursPerDay).toBe(12);
      expect(defaultTimesheetRules.minBreakMinutes).toBe(30);
      expect(defaultTimesheetRules.breakRequiredAfterHours).toBe(5.5);
      expect(defaultTimesheetRules.allowSelfApproval).toBe(false);
      expect(defaultTimesheetRules.autoApproveEnabled).toBe(false);
    });

    it('should have correct approval roles', () => {
      expect(defaultTimesheetRules.approvalRoles).toContain(UserRole.MANAGER);
      expect(defaultTimesheetRules.approvalRoles).toContain(UserRole.TENANT_ADMIN);
      expect(defaultTimesheetRules.approvalRoles).not.toContain(UserRole.USER);
    });
  });

  describe('defaultVacationRules', () => {
    it('should have reasonable vacation defaults', () => {
      expect(defaultVacationRules.minAdvanceNoticeDays).toBe(14);
      expect(defaultVacationRules.maxConsecutiveDays).toBe(20);
      expect(defaultVacationRules.autoApproveEnabled).toBe(false);
    });
  });

  describe('validateTimesheet', () => {
    it('should validate a normal 8-hour workday', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await validateTimesheet(mockTenantId, {
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'),
        breakMinutes: 30,
        description: 'Regular work day',
        userId: 'user-1',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject timesheet exceeding max hours', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await validateTimesheet(mockTenantId, {
        startTime: new Date('2024-01-15T06:00:00'),
        endTime: new Date('2024-01-15T20:00:00'), // 14 hours
        breakMinutes: 30,
        userId: 'user-1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('12 uur');
    });

    it('should reject timesheet with insufficient break', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await validateTimesheet(mockTenantId, {
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T18:00:00'), // 9 hours
        breakMinutes: 15, // Only 15 min break
        userId: 'user-1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Pauze'))).toBe(true);
    });

    it('should warn about long shifts', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await validateTimesheet(mockTenantId, {
        startTime: new Date('2024-01-15T07:00:00'),
        endTime: new Date('2024-01-15T18:00:00'), // 11 hours
        breakMinutes: 45,
        userId: 'user-1',
      });

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Lange dienst');
    });

    it('should respect custom tenant rules', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: {
          approvalRules: {
            timesheet: {
              requireDescription: true,
            },
          },
        },
      });

      const result = await validateTimesheet(mockTenantId, {
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'),
        breakMinutes: 30,
        description: '', // Empty description
        userId: 'user-1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Omschrijving'))).toBe(true);
    });
  });

  describe('validateVacationRequest', () => {
    it('should validate a standard vacation request', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

      const endDate = new Date(futureDate);
      endDate.setDate(endDate.getDate() + 5);

      const result = await validateVacationRequest(mockTenantId, {
        startDate: futureDate,
        endDate: endDate,
        totalDays: 5,
        userId: 'user-1',
      });

      expect(result.valid).toBe(true);
    });

    it('should reject last-minute vacation request', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = await validateVacationRequest(mockTenantId, {
        startDate: tomorrow,
        endDate: tomorrow,
        totalDays: 1,
        userId: 'user-1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('dagen van tevoren'))).toBe(true);
    });

    it('should reject excessive consecutive days', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = await validateVacationRequest(mockTenantId, {
        startDate: futureDate,
        endDate: futureDate,
        totalDays: 25, // Exceeds 20 day limit
        userId: 'user-1',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('opeenvolgende dagen'))).toBe(true);
    });
  });

  describe('checkAutoApproval', () => {
    it('should not auto-approve when disabled', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null, // Uses defaults where auto-approve is disabled
      });

      const result = await checkAutoApproval(mockTenantId, {
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'),
        breakMinutes: 30,
      });

      expect(result.autoApprove).toBe(false);
      expect(result.reason).toContain('uitgeschakeld');
    });

    it('should auto-approve when enabled and within limits', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: {
          approvalRules: {
            timesheet: {
              autoApproveEnabled: true,
              autoApproveMaxHours: 8,
            },
          },
        },
      });

      const result = await checkAutoApproval(mockTenantId, {
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:00:00'), // 8 hours
        breakMinutes: 30,
      });

      expect(result.autoApprove).toBe(true);
    });

    it('should not auto-approve when exceeding max hours', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: {
          approvalRules: {
            timesheet: {
              autoApproveEnabled: true,
              autoApproveMaxHours: 8,
            },
          },
        },
      });

      const result = await checkAutoApproval(mockTenantId, {
        startTime: new Date('2024-01-15T08:00:00'),
        endTime: new Date('2024-01-15T18:00:00'), // 10 hours
        breakMinutes: 30,
      });

      expect(result.autoApprove).toBe(false);
      expect(result.reason).toContain('limiet');
    });
  });

  describe('canUserApprove', () => {
    it('should allow MANAGER to approve', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await canUserApprove(mockTenantId, UserRole.MANAGER);

      expect(result.canApprove).toBe(true);
    });

    it('should allow TENANT_ADMIN to approve', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await canUserApprove(mockTenantId, UserRole.TENANT_ADMIN);

      expect(result.canApprove).toBe(true);
    });

    it('should not allow USER role to approve', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await canUserApprove(mockTenantId, UserRole.USER);

      expect(result.canApprove).toBe(false);
      expect(result.reason).toContain('goedkeuringsrechten');
    });

    it('should prevent self-approval by default', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: null,
      });

      const result = await canUserApprove(
        mockTenantId,
        UserRole.MANAGER,
        'user-123', // target user
        'user-123'  // current user (same)
      );

      expect(result.canApprove).toBe(false);
      expect(result.reason).toContain('Eigen tijdregistraties');
    });

    it('should allow self-approval when enabled in settings', async () => {
      const { prisma } = await import('@/lib/db/prisma');

      (prisma.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        settings: {
          approvalRules: {
            timesheet: {
              allowSelfApproval: true,
            },
          },
        },
      });

      const result = await canUserApprove(
        mockTenantId,
        UserRole.MANAGER,
        'user-123',
        'user-123'
      );

      expect(result.canApprove).toBe(true);
    });
  });

  describe('defaultApprovalConfig', () => {
    it('should have all required sections', () => {
      expect(defaultApprovalConfig.timesheet).toBeDefined();
      expect(defaultApprovalConfig.vacation).toBeDefined();
      expect(defaultApprovalConfig.sickLeave).toBeDefined();
    });

    it('should have UWV compliance in sick leave rules', () => {
      expect(defaultApprovalConfig.sickLeave.uwvReportDeadlineDays).toBe(42);
    });
  });
});
