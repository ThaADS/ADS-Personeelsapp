# Architecture

**Analysis Date:** 2025-01-23

## Pattern Overview

**Overall:** Multi-tenant SaaS with Next.js App Router, following domain-driven design with clear separation between authentication/authorization, business logic, and API layers.

**Key Characteristics:**
- Multi-tenant isolation at database level via `tenantId` on all models
- Role-based access control (RBAC) with 4-tier hierarchy: SUPERUSER > TENANT_ADMIN > MANAGER > USER
- JWT session strategy with NextAuth.js v5 credentials provider
- Domain-based and subdomain-based tenant routing
- Resource-level permission checking on sensitive operations
- Audit logging for compliance and data integrity

## Layers

**Presentation Layer:**
- Purpose: Client-facing components and pages using Next.js App Router
- Location: `src/app/`, `src/components/`
- Contains: Server components, client components, layouts, forms, UI elements
- Depends on: Hooks, providers, API routes
- Used by: Browsers, mobile clients

**API/Route Handler Layer:**
- Purpose: RESTful endpoints for data operations with tenant isolation
- Location: `src/app/api/`
- Contains: GET/POST/PUT/DELETE handlers with validation and error handling
- Depends on: Tenant context, Prisma ORM, business logic services
- Used by: Frontend components, external integrations, webhooks

**Business Logic/Service Layer:**
- Purpose: Domain-specific business rules and operations
- Location: `src/lib/services/` (40+ service files for different domains)
- Contains: Email service, approval service, compliance service, fleet providers, audit logging
- Depends on: Prisma ORM, external APIs (Stripe, RouteVision, Supabase)
- Used by: API routes, cron jobs, webhooks

**Authentication & Authorization Layer:**
- Purpose: User identity, session management, tenant access control, permission checking
- Location: `src/lib/auth/`, `src/lib/rbac.ts`
- Contains: NextAuth config, JWT token handling, tenant context resolution, permission system
- Depends on: Prisma ORM, bcryptjs for password hashing
- Used by: Middleware, API routes, server components

**Data Access Layer (Prisma):**
- Purpose: Database abstraction and multi-tenant data isolation
- Location: `schema.prisma`, `src/lib/db/prisma.ts`
- Contains: Data models with relationship definitions, tenant filtering utilities
- Depends on: PostgreSQL database
- Used by: API routes, services, authentication

**Infrastructure/Integration Layer:**
- Purpose: External service integrations and utility functions
- Location: `src/lib/` (stripe, email, validation, routevision, rate-limit)
- Contains: Stripe payment processing, email sending, form validation, third-party API clients
- Depends on: External APIs (Stripe, SendGrid/Nodemailer, RouteVision)
- Used by: Services, API routes, cron jobs

## Data Flow

**User Authentication Flow:**

1. User submits credentials on `/login` page
2. NextAuth credentials provider calls `authorize()` in `src/lib/auth/auth.ts:15`
3. User lookup includes tenant relationships from `TenantUser` junction table
4. Password verified with bcryptjs, JWT token created with tenant context
5. Session populated with user ID, role, tenant ID, and superuser status
6. User redirected to `/dashboard` with authenticated session cookie

**Protected Route Access Flow:**

1. Middleware at `src/middleware.ts:4` adds security headers to all responses
2. Dashboard layout checks session via `useSession()` from NextAuth
3. Navigation items conditionally displayed based on `session.user.role`
4. Page components or API routes call `getTenantContext()` from `src/lib/auth/tenant-access.ts:17`
5. Tenant context validation ensures user has access to requested tenant
6. `addTenantFilter()` automatically adds tenant filtering to database queries

**API Request Flow (Tenant-Isolated):**

1. Client sends request to `/api/[resource]` with optional query parameters
2. API route calls `getTenantContext()` to extract tenant and user info
3. Database query built with `addTenantFilter()` to restrict to current tenant
4. Role-based access checked: MANAGER/ADMIN can see team data, USER sees only own
5. Zod schema validates request payload against type definitions
6. Operation executed (create, read, update, delete)
7. Audit log created via `createAuditLog()` for compliance tracking
8. Response returned with pagination metadata if applicable

**State Management:**

- **Session State**: Managed by NextAuth.js JWT cookies, stored in encrypted session token
- **Tenant Context**: Resolved per-request from session + database lookup
- **User Preferences**: Stored in database (locale, theme), synced via `LocaleSync` component
- **UI State**: React hooks in client components for temporary UI state (modals, filters)
- **Form State**: React Hook Form with Zod schema validation

## Key Abstractions

**TenantContext:**
- Purpose: Encapsulates authenticated user and tenant information for request scope
- Examples: `src/lib/auth/tenant-access.ts:7`
- Pattern: Async function resolving to object with tenantId, userId, userRole, isSuperuser; returned as `null` if unauthenticated

**Permission System (RBAC):**
- Purpose: Declarative permission checking for resource-level access control
- Examples: `src/lib/rbac.ts` implements `hasPermission()` and `Permission` enum
- Pattern: Check permissions with `requirePermission(Permission.APPROVE_TIMESHEETS)` before sensitive operations

**Service Layer Pattern:**
- Purpose: Encapsulate domain logic separate from API routes
- Examples: `src/lib/services/approval-service.ts`, `src/lib/services/email-service.ts`
- Pattern: Export async functions that take context parameters and execute business logic

**Tenant Filter Utility:**
- Purpose: Automatic tenant isolation on database queries
- Examples: `addTenantFilter({ status: 'PENDING' }, tenantId)` in `src/lib/auth/tenant-access.ts`
- Pattern: Inject tenantId into where clauses to prevent data leakage across tenants

**Multi-Tenant Lookup:**
- Purpose: Route users to correct tenant based on domain or subdomain
- Examples: `getTenantFromSlug()`, `getTenantFromDomain()` in `src/lib/tenant.ts:13-53`
- Pattern: Extract tenant identifier from request host, look up Tenant model, cache result

## Entry Points

**Web Application:**
- Location: `src/app/layout.tsx`
- Triggers: Browser navigation to any route
- Responsibilities: Initialize providers (Session, Theme, Locale), setup global CSS, render metadata

**Authentication Entry:**
- Location: `src/app/login/page.tsx`
- Triggers: Unauthenticated user accessing protected route
- Responsibilities: Display login form, validate credentials, redirect on success

**Protected Dashboard:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Authenticated user accessing `/dashboard/*`
- Responsibilities: Render navigation sidebar, check session, conditionally show role-based items

**Superuser Admin Panel:**
- Location: `src/app/admin/`
- Triggers: Superuser accessing `/admin/*`
- Responsibilities: Tenant management, user management, system-wide settings

**API Gateway:**
- Location: `src/app/api/` (multiple route groups)
- Triggers: Client AJAX requests or external webhooks
- Responsibilities: Validate requests, apply tenant isolation, execute business logic, return JSON

**Stripe Webhooks:**
- Location: `src/app/api/webhooks/stripe/route.ts`
- Triggers: Stripe payment events (invoice.paid, customer.subscription.created, etc.)
- Responsibilities: Update subscription status in database, sync billing information

**Cron Jobs:**
- Location: `src/app/api/cron/`
- Triggers: External scheduler (e.g., Vercel Cron) on schedule
- Responsibilities: Send reminders, process expires leave, generate reports, sync external data

## Error Handling

**Strategy:** Layered error handling with specific HTTP status codes and user-friendly messages

**Patterns:**

**API Route Error Handling:**
```typescript
// Validation error (400)
return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

// Authentication error (401)
if (!context) {
  return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
}

// Authorization error (403)
if (!hasPermission(context, Permission.APPROVE_TIMESHEETS)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Not found (404)
if (!resource) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// Server error (500)
catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Database Errors:**
- Prisma UniqueConstraintError caught and returned as 409 Conflict
- Foreign key violations caught and returned as 400 Bad Request
- Transaction failures logged and retried with exponential backoff

**Authentication Errors:**
- Invalid credentials logged but no user enumeration leak
- Session expiry triggers automatic logout to `/login`
- Token validation failures result in 401 Unauthorized

## Cross-Cutting Concerns

**Logging:**
- Console logging with prefixes like `[getTenantContext]`, `[Authorize]` for debugging
- Structured audit logging via `createAuditLog()` for compliance tracking
- Error logging with full stack traces in catch blocks

**Validation:**
- Zod schemas defined inline in API routes (e.g., `timesheetSchema` in `/api/timesheets/route.ts`)
- Schema validation on request body before business logic execution
- Custom validators for date formats, time ranges, enums

**Authentication:**
- NextAuth.js v5 credentials provider for email/password authentication
- JWT token issued with 24-hour max age
- Cookies marked HttpOnly and Secure (production) to prevent XSS
- Session callbacks populate user roles and tenant context into token

**Authorization:**
- Tenant context required on all API routes before data access
- Superusers bypass tenant checks but audit log tracks access
- Role-based navigation in UI (hide/show menu items based on role)
- Resource-level checks via `requirePermission()` for sensitive operations

**Rate Limiting:**
- `src/lib/rate-limit.ts` implements Upstash Redis-based rate limiting
- Applied to authentication endpoints and API routes
- Returns 429 Too Many Requests after threshold exceeded

**Multi-Language Support:**
- `next-intl` configured with Dutch (nl) as primary locale
- User locale preference stored in database and synced via `LocaleSync` component
- Navigation structure supports future localization

---

*Architecture analysis: 2025-01-23*
