# Testing Patterns

**Analysis Date:** 2025-01-23

## Test Framework

**Runner:**
- **Vitest** v3.2.4 - Primary test framework
- **Config**: `vitest.config.ts` (flat config with React plugin support)
- **Jest**: Legacy config in `jest.config.js` (not actively used, Vitest is primary)

**Environment:**
- **jsdom**: Browser-like environment for component and DOM testing
- **Setup file**: `src/test/setup.ts` - Runs before each test suite
- **Coverage Provider**: V8 (configured for HTML, JSON, text reports)

**Assertion Library:**
- **Vitest built-in**: `expect()` assertions from `vitest` package
- **Testing Library**: `@testing-library/react`, `@testing-library/dom` for component testing
- **Jest DOM matchers**: `@testing-library/jest-dom` extensions (`.toBeInTheDocument()`, etc.)

**Run Commands:**
```bash
npm test                  # Run tests in watch mode (continuous)
npm run test:run          # Run tests once (CI mode)
npm run test:ui           # Run tests with visual UI interface
npm run test:coverage     # Run tests with coverage report (V8)
```

## Test File Organization

**Location Pattern:**
- **Co-located with source**: `src/lib/tenant.test.ts` next to `src/lib/tenant.ts`
- **In `__tests__` directories**: `src/lib/auth/__tests__/tenant-access.test.ts`
- **Separate test folders**: `src/test/integration/`, `src/test/e2e/` for higher-level tests

**Naming:**
- `.test.ts` suffix for unit tests: `approval-service.test.ts`
- `.test.ts` in `__tests__` subdirectories for API/integration tests: `src/app/api/__tests__/approvals.test.ts`
- Descriptive names matching tested module

**Directory Structure:**
```
src/
├── lib/
│   ├── tenant.ts
│   ├── tenant.test.ts                    # Unit test next to source
│   ├── auth/
│   │   ├── tenant-access.ts
│   │   └── __tests__/
│   │       ├── tenant-access.test.ts     # Integration test in __tests__
│   │       └── auth.test.ts
│   └── services/
│       ├── approval-service.ts
│       └── (no dedicated test file - logic tested via integration)
├── test/
│   ├── setup.ts                          # Global test setup/mocks
│   ├── integration/
│   │   └── user-journeys.test.ts
│   └── e2e/
│       └── critical-paths.test.ts
└── app/
    └── api/
        └── __tests__/
            ├── approvals.test.ts
            └── multi-tenant-isolation.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();  // Reset mocks before each test
  });

  describe('Specific Behavior', () => {
    it('should do the thing', () => {
      // Arrange
      const input = setupData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

**Patterns:**
- **Nested describes**: Organize by feature then behavior
- **beforeEach**: Clear mocks using `vi.clearAllMocks()`
- **Arrange-Act-Assert**: Three-part test structure (comments optional in code)
- **Inline implementations**: Unit tests often inline code being tested for clarity

## Mocking

**Framework:** **Vitest** `vi` module (not Jest)

**Global Mocks (in `src/test/setup.ts`):**
```typescript
// NextAuth mock
vi.mock('@/lib/auth/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), ... }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: { findUnique: vi.fn(), findMany: vi.fn(), ... },
    tenant: { ... },
    timesheet: { ... },
    // ... all models with mock methods
  })),
}));

// Tenant database
vi.mock('@/lib/db/tenant-db', () => ({
  tenantDb: { ... },
}));

// Auth functions
vi.mock('@/lib/auth/tenant-access', () => ({
  getTenantContext: vi.fn(),
  requirePermission: vi.fn(),
  // ... all auth functions
}));
```

**Patterns:**
- **Setup.ts approach**: Global mocks for dependencies used across tests
- **Function-level mocks**: Use `vi.fn()` to create mock functions
- **Mock returns**: Set return values with `.mockResolvedValue()` or `.mockReturnValue()`
- **Clear between tests**: `vi.clearAllMocks()` in beforeEach to prevent test pollution

**Examples:**
```typescript
// In setup.ts - mock a complex dependency
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
    // ... other models
  })),
}));

// In test file - use the mock
it('should fetch user', async () => {
  const mockUser = { id: '1', email: 'test@example.com' };
  vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

  const user = await getUser('1');
  expect(user).toEqual(mockUser);
});
```

**What to Mock:**
- ✅ External services: Prisma, NextAuth, Stripe
- ✅ Next.js APIs: `next/navigation`, `next/headers`
- ✅ Environment-specific code: Auth, tenant access
- ✅ HTTP requests via `fetch()`

**What NOT to Mock:**
- ❌ Pure utility functions: `createTenantSlug()` - test the actual function
- ❌ Zod schemas: Test validation directly with `.safeParse()`
- ❌ Domain logic: Permission checks, access control - test real logic

## Fixtures and Factories

**Test Data:**
Test data is typically created inline or as helper functions in test files:

```typescript
// Inline in test
const timesheetData = {
  date: new Date('2024-01-15'),
  startTime: new Date('2024-01-15T09:00:00'),
  endTime: new Date('2024-01-15T17:30:00'),
  breakDuration: 30,
  description: 'Regular work day'
};

// Simulated creation (no external factory)
const createTimesheet = (context, data) => ({
  id: 'ts-1',
  tenantId: context.tenantId,
  userId: context.userId,
  ...data,
  status: 'PENDING',
  createdAt: new Date()
});
```

**Factory Patterns:**
No dedicated factory files found. Tests use:
- **Mock objects**: `const mockContext = { tenantId: 'tenant-1', userId: 'user-1', ... }`
- **Helper functions**: Functions that generate test data inline
- **Partial objects**: Only include necessary fields for test clarity

**Location:**
- Data created inline in test files (not extracted to fixtures directory)
- Some tests use constants for repeated values: `'company-1'`, `'emp-1'`, `'PENDING'`

## Coverage

**Requirements:**
- **Thresholds**: 80% for branches, functions, lines, statements (enforced in `vitest.config.ts`)
- **Enforcement**: V8 provider, tests fail if coverage drops below 80%

**View Coverage:**
```bash
npm run test:coverage              # Generate coverage reports
# Reports generated in coverage/ directory:
# - coverage/index.html (browse locally)
# - coverage/coverage-final.json
# - coverage/cobertura-coverage.xml
```

**Excluded from Coverage:**
- `node_modules/`
- `src/test/` - test setup files themselves
- `**/*.d.ts` - type definitions
- `**/*.config.{js,ts}` - configuration files
- `**/*.test.{js,ts,tsx}` - test files (don't count tests in coverage)
- `src/app/api/auth/` - NextAuth routes (complex mocking)
- `.next/` - build artifacts
- `coverage/` - coverage reports

## Test Types

**Unit Tests:**
- **Scope**: Pure functions, utilities, isolated components
- **Approach**: Test input → output without side effects
- **Location**: `src/lib/tenant.test.ts`, `src/lib/auth/__tests__/`
- **Examples**:
  - `createTenantSlug()` - string transformation
  - Permission checking logic
  - Zod schema validation
  - Data structure tests (interfaces, enums)

**Integration Tests:**
- **Scope**: Multi-component workflows, database + service interactions
- **Approach**: Simulate user journeys without real API calls
- **Location**: `src/test/integration/user-journeys.test.ts`, `src/app/api/__tests__/`
- **Patterns**:
  - Timesheet submission workflow
  - Approval processing with access control
  - Multi-tenant isolation enforcement
  - Database query patterns with filters

**E2E Tests:**
- **Framework**: Playwright (configured in `package.json`)
- **Scope**: Full user flows through actual API routes
- **Location**: `src/test/e2e/critical-paths.test.ts`
- **Approach**: Real browser automation, real database interactions
- **Status**: Infrastructure in place but tests are sparse in codebase

## Common Patterns

**Async Testing:**
```typescript
// Using async/await with expect
it('should complete full workflow', async () => {
  const result = await fetchApprovals('timesheet', 'PENDING');
  expect(result.items).toBeDefined();
  expect(result.pagination).toBeDefined();
});

// Testing promise rejections
it('should throw on invalid input', async () => {
  await expect(processApprovals(invalidData)).rejects.toThrow();
});

// Simulating async operations
const mockAsync = vi.fn().mockResolvedValue({ success: true });
const result = await mockAsync();
expect(result.success).toBe(true);
```

**Error Testing:**
```typescript
// Zod validation errors
it('should reject invalid approval request', () => {
  const invalidRequest = { ids: [], action: 'approve' };
  const result = approvalActionSchema.safeParse(invalidRequest);

  expect(result.success).toBe(false);
  // Schema provides error details
});

// Function error patterns
it('should handle permission errors', async () => {
  const error = new Error('Permission denied');
  vi.mocked(requirePermission).mockRejectedValue(error);

  await expect(restrictedFunction()).rejects.toThrow('Permission denied');
});

// Graceful null returns
try {
  const tenant = await getTenantFromSlug('invalid');
  expect(tenant).toBeNull();
} catch (error) {
  // Catch errors and assert
}
```

**Access Control Testing:**
```typescript
it('should prevent cross-tenant access', () => {
  const canAccess = (
    userTenantId: string,
    targetTenantId: string,
    isSuperuser: boolean
  ): boolean => {
    if (isSuperuser) return true;
    return userTenantId === targetTenantId;
  };

  expect(canAccess('tenant-1', 'tenant-1', false)).toBe(true);   // Own tenant
  expect(canAccess('tenant-1', 'tenant-2', false)).toBe(false);  // Different tenant
  expect(canAccess(null, 'tenant-1', true)).toBe(true);          // Superuser bypass
});
```

**Test Data Validation:**
```typescript
// Mock context pattern
const employeeContext = {
  tenantId: 'company-1',
  userId: 'emp-1',
  userRole: 'USER',
  isSuperuser: false
};

// Simulate workflows
const createdTimesheet = createTimesheet(employeeContext, timesheetData);
expect(createdTimesheet.tenantId).toBe('company-1');
expect(createdTimesheet.status).toBe('PENDING');
```

## Known Testing Gaps

**Not Currently Tested:**
- API routes with complex Prisma queries (mocking difficulties)
- NextAuth integration (complex setup requirements)
- Third-party integrations (Stripe, Routevision, etc.)
- React component rendering (focus on logic, not UI)

**Testing Strategy:**
- Unit tests for pure functions and validation
- Integration tests for workflows and access control
- E2E tests (Playwright) for critical user paths
- Manual testing for complex integrations

## Test Environment Setup

**Process Environment:**
```typescript
// Set in src/test/setup.ts
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
```

**Jest-DOM Extensions:**
```typescript
import '@testing-library/jest-dom';
```

**Global Vitest Setup:**
```typescript
// vitest.config.ts
test: {
  globals: true,        // Use global describe/it/expect
  environment: 'jsdom', // Browser environment
  setupFiles: ['./src/test/setup.ts'],
  // ... coverage config
}
```

---

*Testing analysis: 2025-01-23*
