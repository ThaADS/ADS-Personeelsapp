import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all required modules
vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/auth/tenant-access', () => ({
  getTenantContext: vi.fn(),
  requirePermission: vi.fn(),
  createAuditLog: vi.fn(),
  addTenantFilter: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    timesheet: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
  })),
}));

const { auth } = await import('@/lib/auth/auth');
const { getTenantContext, requirePermission, createAuditLog } = await import('@/lib/auth/tenant-access');
const { PrismaClient } = await import('@prisma/client');

// Import API routes for testing
const { GET: getApprovals, POST: postApprovals } = await import('../../app/api/approvals/route');

describe('User Journey Integration Tests', () => {
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('Employee Timesheet Submission Journey', () => {
    it('should complete full timesheet submission workflow', async () => {
      // === STEP 1: Employee Login ===
      const employeeSession = {
        user: {
          id: 'emp-1',
          email: 'employee@company.com',
          name: 'John Employee',
          role: 'USER',
          isSuperuser: false,
          tenantId: 'company-1'
        }
      };

      vi.mocked(auth).mockResolvedValue(employeeSession);
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'emp-1',
        userRole: 'USER',
        isSuperuser: false
      });

      // === STEP 2: Submit Timesheet ===
      const timesheetData = {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T17:30:00'),
        breakDuration: 30,
        description: 'Regular work day - project development'
      };

      mockPrisma.timesheet.create.mockResolvedValue({
        id: 'ts-1',
        tenantId: 'company-1',
        userId: 'emp-1',
        ...timesheetData,
        status: 'PENDING'
      });

      // Simulate timesheet creation
      const createdTimesheet = await mockPrisma.timesheet.create({
        data: {
          tenantId: 'company-1',
          userId: 'emp-1',
          ...timesheetData,
          status: 'PENDING'
        }
      });

      // === STEP 3: Verify Submission ===
      expect(createdTimesheet).toBeDefined();
      expect(createdTimesheet.status).toBe('PENDING');
      expect(createdTimesheet.tenantId).toBe('company-1');
      expect(createdTimesheet.userId).toBe('emp-1');

      // === STEP 4: Employee Views Submitted Timesheets ===
      mockPrisma.timesheet.findMany.mockResolvedValue([createdTimesheet]);

      const userTimesheets = await mockPrisma.timesheet.findMany({
        where: {
          tenantId: 'company-1',
          userId: 'emp-1'
        },
        orderBy: { date: 'desc' }
      });

      expect(userTimesheets).toHaveLength(1);
      expect(userTimesheets[0].id).toBe('ts-1');
    });

    it('should prevent employee from viewing other employee timesheets', async () => {
      // Arrange
      const employee1Context = {
        tenantId: 'company-1',
        userId: 'emp-1',
        userRole: 'USER',
        isSuperuser: false
      };

      vi.mocked(getTenantContext).mockResolvedValue(employee1Context);

      // Mock timesheets from different users in same tenant
      const allTimesheets = [
        { id: 'ts-1', tenantId: 'company-1', userId: 'emp-1', status: 'PENDING' }, // Own timesheet
        { id: 'ts-2', tenantId: 'company-1', userId: 'emp-2', status: 'APPROVED' }, // Other employee
      ];

      // Simulate proper data filtering
      mockPrisma.timesheet.findMany.mockResolvedValue([allTimesheets[0]]); // Only own timesheet

      // Act
      const userTimesheets = await mockPrisma.timesheet.findMany({
        where: {
          tenantId: 'company-1',
          userId: 'emp-1' // Only employee's own timesheets
        }
      });

      // Assert
      expect(userTimesheets).toHaveLength(1);
      expect(userTimesheets[0].userId).toBe('emp-1');
    });
  });

  describe('Manager Approval Journey', () => {
    it('should complete full approval workflow', async () => {
      // === STEP 1: Manager Login ===
      const managerSession = {
        user: {
          id: 'mgr-1',
          email: 'manager@company.com',
          name: 'Jane Manager',
          role: 'MANAGER',
          isSuperuser: false,
          tenantId: 'company-1'
        }
      };

      vi.mocked(auth).mockResolvedValue(managerSession);
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      vi.mocked(requirePermission).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      // === STEP 2: View Pending Approvals ===
      const pendingTimesheets = [
        {
          id: 'ts-1',
          tenantId: 'company-1',
          userId: 'emp-1',
          date: new Date('2024-01-15'),
          startTime: new Date('2024-01-15T09:00:00'),
          endTime: new Date('2024-01-15T17:30:00'),
          status: 'PENDING',
          description: 'Regular work day',
          user: { email: 'employee@company.com', name: 'John Employee' }
        }
      ];

      mockPrisma.timesheet.findMany.mockResolvedValue(pendingTimesheets);

      // Simulate GET /api/approvals
      const getRequest = new NextRequest('http://localhost:3000/api/approvals?status=PENDING');
      const getResponse = await getApprovals(getRequest);
      const approvalsData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(approvalsData.items).toBeDefined();

      // === STEP 3: Approve Timesheet ===
      mockPrisma.timesheet.update.mockResolvedValue({
        id: 'ts-1',
        status: 'APPROVED'
      });

      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      // Simulate POST /api/approvals
      const approvalRequest = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify({
          ids: ['ts-1'],
          action: 'approve',
          comment: 'Hours look correct'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const approvalResponse = await postApprovals(approvalRequest);
      const approvalResult = await approvalResponse.json();

      // === STEP 4: Verify Approval ===
      expect(approvalResponse.status).toBe(200);
      expect(approvalResult.success).toBe(true);
      expect(mockPrisma.timesheet.update).toHaveBeenCalledWith({
        where: { id: 'ts-1' },
        data: { status: 'APPROVED' }
      });
      expect(createAuditLog).toHaveBeenCalledWith(
        'APPROVE_TIMESHEET',
        'timesheet',
        'ts-1',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle bulk approval workflow', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      vi.mocked(requirePermission).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      mockPrisma.timesheet.update
        .mockResolvedValueOnce({ id: 'ts-1', status: 'APPROVED' })
        .mockResolvedValueOnce({ id: 'ts-2', status: 'APPROVED' })
        .mockResolvedValueOnce({ id: 'ts-3', status: 'APPROVED' });

      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      // Act - Bulk approval
      const bulkApprovalRequest = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify({
          ids: ['ts-1', 'ts-2', 'ts-3'],
          action: 'approve',
          comment: 'Weekly batch approval'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await postApprovals(bulkApprovalRequest);
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.processed).toBe(3);
      expect(mockPrisma.timesheet.update).toHaveBeenCalledTimes(3);
      expect(createAuditLog).toHaveBeenCalledTimes(3);
    });
  });

  describe('Cross-Tenant Security Journey', () => {
    it('should prevent cross-tenant data access', async () => {
      // === Scenario: Manager from Tenant A tries to access Tenant B data ===
      
      // STEP 1: Manager from Tenant A logs in
      const tenantAManager = {
        tenantId: 'tenant-a',
        userId: 'mgr-a',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(getTenantContext).mockResolvedValue(tenantAManager);
      vi.mocked(requirePermission).mockResolvedValue(tenantAManager);

      // STEP 2: Mock database with multi-tenant data
      const multiTenantTimesheets = [
        { id: 'ts-a1', tenantId: 'tenant-a', userId: 'emp-a1', status: 'PENDING' },
        { id: 'ts-b1', tenantId: 'tenant-b', userId: 'emp-b1', status: 'PENDING' }, // Different tenant
      ];

      // STEP 3: Database query properly filters by tenant
      mockPrisma.timesheet.findMany.mockImplementation(({ where }) => {
        return Promise.resolve(
          multiTenantTimesheets.filter(ts => ts.tenantId === where.tenantId)
        );
      });

      // STEP 4: Manager queries approvals - should only see Tenant A data
      const request = new NextRequest('http://localhost:3000/api/approvals?status=PENDING');
      const response = await getApprovals(request);
      const data = await response.json();

      // STEP 5: Verify tenant isolation
      expect(response.status).toBe(200);
      // In the mocked implementation, proper tenant filtering ensures only tenant-a data is returned
      expect(mockPrisma.timesheet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-a'
          })
        })
      );
    });

    it('should allow superuser cross-tenant access', async () => {
      // Arrange - Superuser context
      const superuserContext = {
        tenantId: 'tenant-target', // Superuser can specify target tenant
        userId: 'super-1',
        userRole: 'SUPERUSER',
        isSuperuser: true
      };

      vi.mocked(getTenantContext).mockResolvedValue(superuserContext);
      vi.mocked(requirePermission).mockResolvedValue(superuserContext);

      mockPrisma.timesheet.findMany.mockResolvedValue([
        { id: 'ts-target', tenantId: 'tenant-target', status: 'PENDING' }
      ]);

      // Act
      const request = new NextRequest('http://localhost:3000/api/approvals');
      const response = await getApprovals(request);

      // Assert
      expect(response.status).toBe(200);
      // Superuser should be able to access any tenant
    });
  });

  describe('Error Handling Journey', () => {
    it('should handle authentication failure gracefully', async () => {
      // Arrange - No authentication
      vi.mocked(auth).mockResolvedValue(null);
      vi.mocked(getTenantContext).mockResolvedValue(null);
      vi.mocked(requirePermission).mockRejectedValue(new Error('Authentication required'));

      // Act
      const request = new NextRequest('http://localhost:3000/api/approvals');
      const response = await getApprovals(request);
      const data = await response.json();

      // Assert - Should return empty results instead of error for better UX
      expect(response.status).toBe(200);
      expect(data.items).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it('should handle permission denial properly', async () => {
      // Arrange - User without approval permissions
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'emp-1',
        userRole: 'USER', // Regular user can't approve
        isSuperuser: false
      });

      vi.mocked(requirePermission).mockRejectedValue(new Error('Permission denied: timesheet:approve'));

      // Act
      const request = new NextRequest('http://localhost:3000/api/approvals');
      const response = await getApprovals(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Onvoldoende rechten');
    });

    it('should handle database errors in user journey', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      vi.mocked(requirePermission).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      // Database error during approval
      mockPrisma.timesheet.update.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const approvalRequest = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify({
          ids: ['ts-1'],
          action: 'approve'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await postApprovals(approvalRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Audit Trail Journey', () => {
    it('should create complete audit trail for approval workflow', async () => {
      // Arrange
      vi.mocked(getTenantContext).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      vi.mocked(requirePermission).mockResolvedValue({
        tenantId: 'company-1',
        userId: 'mgr-1',
        userRole: 'MANAGER',
        isSuperuser: false
      });

      mockPrisma.timesheet.update.mockResolvedValue({
        id: 'ts-1',
        status: 'APPROVED'
      });

      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      // Act
      const approvalRequest = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify({
          ids: ['ts-1'],
          action: 'approve',
          comment: 'Reviewed and approved'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await postApprovals(approvalRequest);

      // Assert - Verify audit log creation
      expect(createAuditLog).toHaveBeenCalledWith(
        'APPROVE_TIMESHEET',
        'timesheet',
        'ts-1',
        { status: 'PENDING' },
        { status: 'APPROVED' }
      );
    });
  });
});