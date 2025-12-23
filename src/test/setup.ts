import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock NextAuth
vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    tenant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    timesheet: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    tenantUser: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    subscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    invitation: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    $disconnect: vi.fn(),
  })),
}));

// Mock tenant database
vi.mock('@/lib/db/tenant-db', () => ({
  tenantDb: {
    timesheet: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(() => Promise.resolve(0)),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

// Mock tenant-access functions
vi.mock('@/lib/auth/tenant-access', () => ({
  getTenantContext: vi.fn(),
  requireTenantAccess: vi.fn(),
  requirePermission: vi.fn(),
  requireResourceAccess: vi.fn(),
  addTenantFilter: vi.fn(),
  createAuditLog: vi.fn(),
  withTenantAccess: vi.fn(),
  withPermission: vi.fn(),
  getUserTenantRole: vi.fn(),
}));

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';