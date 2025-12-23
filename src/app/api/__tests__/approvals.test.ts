import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../approvals/route';

// Mock dependencies
vi.mock('@/lib/auth/tenant-access', () => ({
  requirePermission: vi.fn(),
  createAuditLog: vi.fn(),
  withPermission: vi.fn((permission, handler) => handler({ tenantId: 'tenant-1', userId: 'user-1', userRole: 'MANAGER', isSuperuser: false })),
  getTenantContext: vi.fn(),
  requireTenantAccess: vi.fn(),
  requireResourceAccess: vi.fn(),
  addTenantFilter: vi.fn(),
  withTenantAccess: vi.fn(),
  getUserTenantRole: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    timesheet: {
      findMany: vi.fn(() => Promise.resolve([])),
      update: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(() => Promise.resolve([])),
      create: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    $disconnect: vi.fn(),
  })),
}));

const { requirePermission, createAuditLog } = await import('@/lib/auth/tenant-access');
const { PrismaClient } = await import('@prisma/client');

describe('Approvals API Tests', () => {
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('GET /api/approvals', () => {
    it('should return approvals list for authorized user', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);
      
      const mockTimesheets = [
        {
          id: 'ts-1',
          userId: 'user-1',
          date: new Date('2024-01-15'),
          startTime: new Date('2024-01-15T09:00:00'),
          endTime: new Date('2024-01-15T17:00:00'),
          status: 'PENDING',
          description: 'Regular work day',
          breakDuration: 30,
          user: { email: 'user@example.com', name: 'Test User' }
        }
      ];

      mockPrisma.timesheet.findMany.mockResolvedValue(mockTimesheets);

      const url = new URL('http://localhost:3000/api/approvals?status=PENDING&page=1&limit=10');
      const request = new NextRequest(url);

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].type).toBe('timesheet');
      expect(data.items[0].status).toBe('PENDING');
      expect(requirePermission).toHaveBeenCalledWith('timesheet:approve');
    });

    it('should return empty list for unauthenticated user', async () => {
      // Arrange
      const error = new Error('Authentication required');
      vi.mocked(requirePermission).mockRejectedValue(error);

      const url = new URL('http://localhost:3000/api/approvals');
      const request = new NextRequest(url);

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.items).toEqual([]);
      expect(data.pagination.total).toBe(0);
    });

    it('should return 403 for permission denied', async () => {
      // Arrange
      const error = new Error('Permission denied: timesheet:approve');
      vi.mocked(requirePermission).mockRejectedValue(error);

      const url = new URL('http://localhost:3000/api/approvals');
      const request = new NextRequest(url);

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Onvoldoende rechten');
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);
      mockPrisma.timesheet.findMany.mockResolvedValue([]);

      const url = new URL('http://localhost:3000/api/approvals?page=2&limit=20');
      const request = new NextRequest(url);

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(20);
    });
  });

  describe('POST /api/approvals (Bulk Actions)', () => {
    it('should approve multiple timesheets', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      mockPrisma.timesheet.update.mockResolvedValue({
        id: 'ts-1',
        status: 'APPROVED'
      });

      const requestBody = {
        ids: ['ts-1', 'ts-2'],
        action: 'approve',
        comment: 'All looks good'
      };

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.processed).toBe(2);
      expect(mockPrisma.timesheet.update).toHaveBeenCalledTimes(2);
      expect(createAuditLog).toHaveBeenCalledTimes(2);
    });

    it('should reject multiple timesheets', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);
      vi.mocked(createAuditLog).mockResolvedValue(undefined);

      mockPrisma.timesheet.update.mockResolvedValue({
        id: 'ts-1',
        status: 'REJECTED'
      });

      const requestBody = {
        ids: ['ts-1'],
        action: 'reject',
        comment: 'Invalid hours submitted'
      };

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.timesheet.update).toHaveBeenCalledWith({
        where: { id: 'ts-1' },
        data: { status: 'REJECTED' }
      });
    });

    it('should validate input schema', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);

      // Invalid request - missing required fields
      const invalidRequestBody = {
        ids: [], // Empty array
        action: 'invalid-action' // Invalid action
      };

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid input');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);
      mockPrisma.timesheet.update.mockRejectedValue(new Error('Database error'));

      const requestBody = {
        ids: ['ts-1'],
        action: 'approve'
      };

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should require proper permissions for bulk actions', async () => {
      // Arrange
      const error = new Error('Permission denied: timesheet:approve');
      vi.mocked(requirePermission).mockRejectedValue(error);

      const requestBody = {
        ids: ['ts-1'],
        action: 'approve'
      };

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Onvoldoende rechten');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: 'invalid-json{',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should handle missing Content-Type header', async () => {
      // Arrange
      const mockContext = {
        tenantId: 'tenant-1',
        userId: 'manager-1',
        userRole: 'MANAGER',
        isSuperuser: false
      };

      vi.mocked(requirePermission).mockResolvedValue(mockContext);

      const request = new NextRequest('http://localhost:3000/api/approvals', {
        method: 'POST',
        body: JSON.stringify({ ids: ['ts-1'], action: 'approve' })
        // No Content-Type header
      });

      // Act
      const response = await POST(request);
      
      // Assert - Should still work as JSON.parse is used internally
      expect(response.status).toBeLessThan(500);
    });
  });
});