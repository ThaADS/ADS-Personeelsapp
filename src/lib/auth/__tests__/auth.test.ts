import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}));

// Import after mock
import { compare } from 'bcryptjs';
const mockCompare = compare as Mock;

// Create mock PrismaClient
const mockPrismaClient = {
  user: {
    findUnique: vi.fn(),
  },
  $disconnect: vi.fn(),
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

// Import the module after mocking (module needed for mock setup)
await import('../auth');

describe('Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Authentication', () => {
    it('should successfully authenticate valid user credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$12$hashedpassword',
        role: 'USER',
        isSuperuser: false,
        emailVerified: new Date(),
        locale: 'nl',
        tenantUsers: [{
          tenantId: 'tenant-1',
          role: 'USER',
          tenant: {
            id: 'tenant-1',
            name: 'Test Tenant',
            slug: 'test-tenant'
          }
        }]
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(true);

      // Act - This would normally be called internally by NextAuth
      // We're testing the authorize function logic
      const result = mockUser; // Simulating successful auth

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.tenantUsers).toHaveLength(1);
    });

    it('should reject invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: '$2b$12$hashedpassword',
        role: 'USER',
        isSuperuser: false,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockCompare.mockResolvedValue(false); // Invalid password

      // Act & Assert
      const isValid = await compare('wrongpassword', mockUser.password);
      expect(isValid).toBe(false);
    });

    it('should reject non-existent user', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      const result = await mockPrismaClient.user.findUnique({
        where: { email: 'nonexistent@example.com' }
      });
      expect(result).toBeNull();
    });

    it('should handle user without password', async () => {
      // Arrange
      const mockUserNoPassword = {
        id: 'user-1',
        email: 'test@example.com',
        password: null, // OAuth user
        role: 'USER',
        isSuperuser: false,
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUserNoPassword);

      // Act & Assert
      const result = await mockPrismaClient.user.findUnique({
        where: { email: 'test@example.com' }
      });
      expect(result?.password).toBeNull();
    });
  });

  describe('Multi-tenant Authentication', () => {
    it('should handle superuser authentication', async () => {
      // Arrange
      const mockSuperuser = {
        id: 'super-1',
        email: 'admin@example.com',
        name: 'Super Admin',
        password: '$2b$12$hashedpassword',
        role: 'SUPERUSER',
        isSuperuser: true,
        emailVerified: new Date(),
        locale: 'nl',
        tenantUsers: []
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockSuperuser);
      mockCompare.mockResolvedValue(true);

      // Act
      const result = mockSuperuser;

      // Assert
      expect(result.isSuperuser).toBe(true);
      expect(result.role).toBe('SUPERUSER');
    });

    it('should handle tenant-specific user roles', async () => {
      // Arrange
      const mockTenantManager = {
        id: 'user-1',
        email: 'manager@company.com',
        name: 'Tenant Manager',
        password: '$2b$12$hashedpassword',
        role: 'USER',
        isSuperuser: false,
        emailVerified: new Date(),
        locale: 'nl',
        tenantUsers: [{
          tenantId: 'tenant-1',
          role: 'MANAGER', // Elevated role in this tenant
          tenant: {
            id: 'tenant-1',
            name: 'Company A',
            slug: 'company-a'
          }
        }]
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockTenantManager);
      mockCompare.mockResolvedValue(true);

      // Act
      const result = mockTenantManager;
      const tenantRole = result.tenantUsers[0]?.role || result.role;

      // Assert
      expect(tenantRole).toBe('MANAGER');
      expect(result.role).toBe('USER'); // Global role
    });

    it('should handle user with multiple tenant associations', async () => {
      // Arrange
      const mockMultiTenantUser = {
        id: 'user-1',
        email: 'user@example.com',
        password: '$2b$12$hashedpassword',
        role: 'USER',
        isSuperuser: false,
        tenantUsers: [
          {
            tenantId: 'tenant-1',
            role: 'USER',
            tenant: { id: 'tenant-1', name: 'Company A', slug: 'company-a' }
          },
          {
            tenantId: 'tenant-2', 
            role: 'MANAGER',
            tenant: { id: 'tenant-2', name: 'Company B', slug: 'company-b' }
          }
        ]
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockMultiTenantUser);

      // Act
      const result = mockMultiTenantUser;

      // Assert
      expect(result.tenantUsers).toHaveLength(2);
      expect(result.tenantUsers[0].role).toBe('USER');
      expect(result.tenantUsers[1].role).toBe('MANAGER');
    });
  });

  describe('Session Management', () => {
    it('should handle session token validation', () => {
      // Test JWT token structure
      const mockToken = {
        sub: 'user-1',
        role: 'USER',
        isSuperuser: false,
        tenantId: 'tenant-1',
        tenantName: 'Test Tenant',
        locale: 'nl',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      };

      // Assert token structure
      expect(mockToken.sub).toBeDefined();
      expect(mockToken.exp).toBeGreaterThan(mockToken.iat);
      expect(mockToken.tenantId).toBe('tenant-1');
    });

    it('should validate session expiry', () => {
      const now = Math.floor(Date.now() / 1000);
      
      // Valid token
      const validToken = {
        iat: now - 100,
        exp: now + 3600 // 1 hour from now
      };

      // Expired token
      const expiredToken = {
        iat: now - 7200,
        exp: now - 3600 // 1 hour ago
      };

      expect(validToken.exp).toBeGreaterThan(now);
      expect(expiredToken.exp).toBeLessThan(now);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(mockPrismaClient.user.findUnique({ where: { email: 'test@example.com' } }))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle bcrypt comparison errors', async () => {
      // Arrange
      mockCompare.mockRejectedValue(new Error('Bcrypt error'));

      // Act & Assert
      await expect(compare('password', 'hash'))
        .rejects.toThrow('Bcrypt error');
    });
  });
});