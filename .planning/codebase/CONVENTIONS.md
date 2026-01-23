# Coding Conventions

**Analysis Date:** 2025-01-23

## Naming Patterns

**Files:**
- **Services**: `camelCase` with `-service` suffix: `approval-service.ts`, `email-service.ts`, `audit-service.ts`
- **Components**: PascalCase with `.tsx` extension: `StatusBadge.tsx`, `ApprovalList.tsx`, `SessionProvider.tsx`
- **Utilities**: `camelCase`: `accessibility.ts`, `performance.ts`, `encryption.ts`
- **API routes**: Kebab-case directories, nested under feature areas: `src/app/api/approvals/route.ts`, `src/app/api/user/profile/route.ts`
- **Tests**: Suffix with `.test.ts` or `.spec.ts` or in `__tests__` directories: `approval-service.test.ts`, `src/lib/auth/__tests__/auth.test.ts`
- **Type files**: `camelCase` or PascalCase for named exports: `types/index.ts`, `src/types/approval.ts`

**Functions:**
- **Async functions**: Prefix verbs describing the action: `fetchApprovals()`, `processApprovals()`, `getTenantContext()`, `createTenantSlug()`
- **Boolean functions**: Prefix with `is`, `can`, `has`: `canUserAccessTenant()`, `isSuperuser()`, `isSlugAvailable()`
- **Query functions**: `get`, `fetch`: `getTenantFromSlug()`, `getUserTenants()`, `fetchApprovals()`
- **Handlers**: Named with domain + action: `GET()`, `POST()` in route handlers

**Variables:**
- **camelCase**: Standard for all variables: `employeeContext`, `timesheetData`, `validatedApprovals`
- **Constants**: `camelCase` (not UPPER_CASE): `includeUser`, `whereTs` in code, but `UserRole` enum uses PascalCase
- **React hooks**: `use` prefix: Custom hooks follow React convention
- **Type aliases**: PascalCase: `TenantContext`, `ApprovalResponse`, `ApprovalActionPayload`

**Types:**
- **Interfaces**: PascalCase: `TenantContext`, `ApprovalResponse`, `StatusBadgeProps`
- **Enums**: PascalCase: `UserRole`, `PlanType`, `SubscriptionStatus`
- **Type aliases**: PascalCase: `VacationRequest`, `SickLeave`
- **Generic parameters**: Single uppercase letters: `T`, `R`, commonly used throughout
- **Prisma enums**: Imported directly as string literals: `timesheet_status`, `subscription_status`

**Prefixes & Patterns:**
- **Middleware functions**: `require*` or `with*`: `requirePermission()`, `requireTenantAccess()`, `withTenantAccess()`
- **Validation functions**: `validate*` or `*Validation`: `validateApproval()`
- **Creation functions**: `create*`: `createTenantSlug()`, `createAuditLog()`
- **Getter functions**: `get*` or `fetch*`: `getTenantContext()`, `fetchApprovals()`

## Code Style

**Formatting:**
- **Tool**: ESLint + Next.js rules (configured in `eslint.config.mjs`)
- **Parser**: TypeScript with strict mode enabled
- **Indentation**: 2 spaces (Tailwind CSS and imports use consistent spacing)
- **Line length**: No explicit limit observed, but API routes typically stay under 120 characters
- **Semicolons**: Included on all statements (enforced by ESLint)
- **Quotes**: Double quotes for strings and JSDoc

**Linting:**
- **Tool**: ESLint with `next/core-web-vitals` and `next/typescript` configurations
- **Key Rules**: Enforced via `eslint.config.mjs` - type safety, Next.js best practices
- **Run Command**: `npm run lint`
- **Configuration File**: `eslint.config.mjs` (flat config format)
- **Type Checking**: TypeScript strict mode (`tsconfig.json` line 8)

**Tailwind CSS:**
- Classes inline in `className` attributes
- Responsive prefixes: `sm:`, `md:`, `lg:`, `dark:` for theming
- Dynamic class construction with template literals or conditional expressions
- Example: `className={`inline-flex items-center font-semibold rounded-full ${config.bg} ${config.text} ${sizeClasses}`}`

## Import Organization

**Order:**
1. External libraries and dependencies: `import React`, `import NextAuth`, `import { prisma }`
2. Internal path aliases (`@/`): `import { getTenantContext } from '@/lib/auth/tenant-access'`
3. Type imports: `import { UserRole } from '@/types'` (can be mixed but typically grouped)
4. Named exports from modules: `import { handlers, auth, signIn, signOut } from NextAuth(...)`

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vitest.config.ts`)
- Used consistently across all files: `@/lib`, `@/components`, `@/types`, `@/app`
- Never use relative paths like `../../../` - always use `@/` alias

**Patterns:**
- Import type definitions at module level
- Group related imports together
- Separate external packages from internal imports by blank line

Example:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { withPermission, createAuditLog } from "@/lib/auth/tenant-access";
import { tenantDb } from "@/lib/db/tenant-db";
import { z } from "zod";
import { timesheet_status } from "@prisma/client";
```

## Error Handling

**Patterns:**
- **Try-catch blocks**: Used in async functions for database and API calls
- **Error propagation**: Services throw errors; callers decide how to handle (return empty array vs. throw)
- **HTTP responses**: Use `NextResponse.json()` with appropriate status codes (200, 403, 404, 500)
- **Fallback values**: Return `null` or empty arrays on error for resilience

**Examples:**
```typescript
// Service-level: Try, catch, log, throw
try {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  return tenant;
} catch (error) {
  console.error('Error fetching tenant:', error);
  return null;  // Graceful fallback
}

// API route: Check auth, handle permission errors with 403
try {
  context = await requirePermission('timesheet:approve');
} catch (err) {
  if (err instanceof Error && err.message.includes('Permission denied')) {
    return NextResponse.json({ error: 'Onvoldoende rechten' }, { status: 403 });
  }
  throw err;
}
```

**Error Types:**
- `Error` with descriptive messages for expected failures
- HTTP status codes: 403 (forbidden), 404 (not found), 500 (server error)
- Zod validation errors: Use `.safeParse()` for non-throwing validation

## Logging

**Framework:** `console` methods directly (no custom logger framework)

**Methods Used:**
- `console.log()`: Info-level logging, context information
- `console.error()`: Error logging for exceptions and failures
- `console.warn()`: Used minimally, if at all
- No structured logging or log levels beyond console methods

**Patterns:**
- Log in error handlers: `console.error('Error fetching approvals:', error)`
- Add context prefix in critical paths: `console.log('[getTenantContext] Session user:', session?.user)`
- Log authentication/authorization decisions for debugging
- Avoid logging sensitive data (passwords, tokens)

**Examples from codebase:**
```typescript
// In auth.ts:
console.log('[Authorize] Starting with email:', credentials?.email);
console.log('[Authorize] User not found or no password');

// In services:
console.error("Error fetching approvals:", error);
```

## Comments

**When to Comment:**
- **JSDoc for public functions**: Add comments above exported functions explaining purpose and parameters
- **Complex logic**: Explain "why" not "what" - code should be self-documenting
- **Business rules**: Comment domain-specific validation or approval workflows
- **Type assertions**: Explain why `as` is needed: `// Type assertion needed because API returns ApprovalItem`
- **TODO/FIXME**: Only if there's a clear improvement path; avoid orphaned TODOs

**JSDoc/TSDoc:**
- **Usage**: Applied consistently to functions and services
- **Format**: Multi-line comments starting with `/**` and ending with `*/`
- **Content**: Describe function purpose in Dutch or English (mixed in codebase)
- **Parameters**: Not always documented (code clarity takes precedence)

**Examples:**
```typescript
/**
 * Service voor het ophalen en verwerken van goedkeuringen
 */
export async function fetchApprovals(...): Promise<ApprovalResponse>

/**
 * Haalt goedkeuringen op van de API
 */

/**
 * Verwerkt goedkeuringen (goedkeuren of afkeuren)
 */

/**
 * Ensure the user has access to the specified tenant
 */
export async function requireTenantAccess(tenantId: string): Promise<TenantContext>

/**
 * NOTE: These tests focus on the pure utility functions.
 * Integration testing of getTenantContext, requirePermission, etc.
 * should be done via e2e or integration tests with a real database.
 */
```

**Comment Languages:**
- Dutch comments dominate in business logic: `// Bouw de query parameters`, `// Haal de gegevens op`
- English comments in technical code: `// Type assertion needed`, `// Preserve existing query parameters`
- Mixed approach accepted - follow local code patterns

## Function Design

**Size:**
- Functions generally 10-40 lines for services, up to 80+ lines for complex route handlers
- Long functions acceptable when handling multiple async operations (e.g., approvals route combining timesheets + vacations)

**Parameters:**
- Use object parameters for functions with 3+ parameters: `{ ids, action, comment }`
- Destructure in function signature when appropriate
- Zod schemas validate input in route handlers

**Return Values:**
- **Promise-based**: All async functions return `Promise<T>` where T is explicit type
- **Result objects**: `{ success: boolean; message: string }` pattern for status feedback
- **Null for missing data**: Return `null` instead of throwing for non-critical lookups
- **Void for mutations**: Side-effect functions often return void or the created/updated entity

**Examples:**
```typescript
// Multiple params → object
export async function fetchApprovals(
  type: string = "all",
  status: string = "PENDING",
  page: number = 1,
  limit: number = 10
): Promise<ApprovalResponse>

// Result object pattern
export async function processApprovals(
  payload: ApprovalActionPayload
): Promise<{ success: boolean; message: string }>

// Null return pattern
export async function getTenantFromSlug(slug: string): Promise<TenantContext | null>
```

## Module Design

**Exports:**
- **Named exports**: Preferred for functions and types: `export async function`, `export interface`
- **Default exports**: Not used in this codebase
- **Barrel files**: Some index files re-export from subdirectories: `src/lib/services/fleet-providers/index.ts`

**Barrel Files:**
- Used sparingly in fleet provider abstraction
- Simplify imports when managing multiple providers
- Pattern: `export { FleetProvider } from './base-provider'`

**Module Organization:**
- **Services**: `src/lib/services/` - business logic and external integrations
- **Auth**: `src/lib/auth/` - authentication and authorization logic
- **Database**: `src/lib/db/` - database clients (Prisma, tenant-specific)
- **Utilities**: `src/lib/utils/` - pure utility functions (accessibility, performance)
- **Validation**: `src/lib/validation/` - Zod schemas and validation logic
- **Types**: `src/types/` - shared type definitions

**Single Responsibility:**
- Each file has clear purpose: approval service doesn't handle emails
- Database operations centralized in service layer
- Type definitions isolated in `src/types/`
- Tenant isolation enforced via `addTenantFilter()` in all queries

---

*Convention analysis: 2025-01-23*
