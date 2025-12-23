# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint linting

# Testing (Vitest)
npm test                 # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Run tests with UI interface
npm run test:coverage    # Run tests with coverage report

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema changes to database
npm run prisma:seed      # Seed database with initial data
```

## Architecture Overview

This is a multi-tenant SaaS HR management application built with Next.js App Router and Prisma. The architecture is designed around tenant isolation with role-based access control.

### Multi-Tenant Architecture

- **Tenant Isolation**: All data models include `tenantId` for complete data separation
- **User-Tenant Relationships**: Users can belong to multiple tenants via `TenantUser` junction table
- **Role Hierarchy**: SUPERUSER > TENANT_ADMIN > MANAGER > USER
- **Subscription Management**: Freemium and Standard plans with Stripe integration

### Authentication & Authorization

- **NextAuth.js v5** with credentials provider (`src/lib/auth/auth.ts:8`)
- **Session Strategy**: JWT tokens with tenant context
- **Tenant Context**: Managed via `getTenantContext()` in `src/lib/auth/tenant-access.ts:20`
- **Permission System**: Role-based permissions with resource-level access control
- **Middleware**: Currently simplified but supports route protection (`src/middleware.ts`)

### Database Schema (Prisma)

Key models and relationships:
- **User**: Global user accounts with superuser capability
- **Tenant**: Organization/company data with subscription status
- **TenantUser**: Many-to-many junction with role and active status
- **Timesheet**: GPS-enabled time tracking with approval workflow
- **Subscription**: Stripe integration for billing management
- **AuditLog**: Compliance tracking for all actions

### App Router Structure

```
src/app/
├── (dashboard)/     # Protected dashboard routes with layout
├── admin/           # Superuser admin interface
├── login/           # Authentication pages
├── marketing/       # Public marketing pages
└── api/            # API routes with tenant isolation
```

### Key Components

- **Providers**: Session, Theme, Locale providers in `src/components/providers/`
- **Tenant Context**: Authentication and authorization middleware
- **Multi-language**: Dutch (nl) primary, with internationalization support
- **Responsive Design**: Tailwind CSS with mobile-first approach

## Important Implementation Notes

### Authentication Flow
1. Login via credentials provider with email/password
2. User lookup includes tenant relationships
3. JWT token contains tenant context and role
4. Session callbacks populate user with tenant info

### Tenant Access Patterns
- Always use `getTenantContext()` for user/tenant context
- API routes should use `withTenantAccess()` or `withPermission()` middlewares  
- Database queries must include tenant filtering via `addTenantFilter()`
- Audit logging via `createAuditLog()` for compliance

### Database Operations
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` for development schema updates
- Seed data available via `npm run prisma:seed`

### Development Notes
- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Test environment setup with Vitest, jsdom, and Testing Library
- Turbopack enabled for fast development builds
- Test coverage thresholds set to 80% (branches, functions, lines, statements)
- Path alias `@` configured to point to `./src`

### Testing Framework
- **Test Runner**: Vitest with jsdom environment
- **Test Setup**: `src/test/setup.ts` contains global test configuration
- **Coverage**: V8 provider with HTML, JSON, and text reports
- **Test Commands**:
  - `npm test` - Watch mode for development
  - `npm run test:run` - Single run for CI/CD
  - `npm run test:ui` - Visual test interface
  - `npm run test:coverage` - Generate coverage reports

### Test Credentials (Development)
- Admin: `admin@ckw.nl` / `Admin123!`
- User: `gebruiker@ckw.nl` / `Gebruiker123!`

## Common Patterns

### API Route with Tenant Access
```typescript
import { withTenantAccess } from '@/lib/auth/tenant-access';

export async function GET() {
  return withTenantAccess(async (context) => {
    // context.tenantId, context.userId, context.userRole available
    const data = await prisma.model.findMany({
      where: { tenantId: context.tenantId }
    });
    return Response.json(data);
  });
}
```

### Permission-Based Access
```typescript
import { requirePermission } from '@/lib/auth/tenant-access';

const context = await requirePermission(Permission.APPROVE_TIMESHEETS);
```

### Multi-tenant Database Queries
```typescript
const timesheets = await prisma.timesheet.findMany({
  where: addTenantFilter({ status: 'PENDING' }, context.tenantId)
});
```