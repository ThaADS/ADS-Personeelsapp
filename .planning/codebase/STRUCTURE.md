# Codebase Structure

**Analysis Date:** 2025-01-23

## Directory Layout

```
C:\Ai Projecten\ADSpersoneelsapp/
├── src/
│   ├── app/                              # Next.js App Router pages and API routes
│   │   ├── (auth)/                       # Authentication pages (login, forgot-password, reset-password)
│   │   ├── (dashboard)/                  # Protected dashboard routes (requires authentication)
│   │   │   ├── approvals/                # Timesheet approval workflow
│   │   │   ├── billing/                  # Stripe billing and subscription management
│   │   │   ├── dashboard/                # Main dashboard page with stats and overview
│   │   │   ├── employees/                # Employee management interface
│   │   │   ├── profile/                  # User profile settings
│   │   │   ├── settings/                 # Tenant settings (fleet providers, RouteVision, etc.)
│   │   │   ├── sick-leave/               # Sick leave request management
│   │   │   ├── timesheet/                # Time tracking and timesheet submission
│   │   │   ├── trips/                    # RouteVision trip integration
│   │   │   ├── vacation/                 # Vacation request and balance management
│   │   │   └── layout.tsx                # Dashboard layout with navigation sidebar
│   │   ├── admin/                        # Superuser administration pages
│   │   │   ├── tenants/                  # Tenant creation and management
│   │   │   ├── email-templates/          # Email template editor
│   │   │   └── layout.tsx                # Admin layout
│   │   ├── api/                          # RESTful API endpoints
│   │   │   ├── admin/                    # Superuser-only endpoints (stats, tenant CRUD)
│   │   │   ├── approvals/                # Approval workflow endpoints
│   │   │   ├── audit/                    # Audit log endpoints
│   │   │   ├── auth/                     # Authentication endpoints (sign in, reset password, verify tokens)
│   │   │   ├── billing/                  # Stripe billing endpoints (checkout, portal, invoices)
│   │   │   ├── compliance/               # Compliance reporting endpoints
│   │   │   ├── cron/                     # Scheduled job endpoints (approval reminders, leave expiry, etc.)
│   │   │   ├── dashboard/                # Dashboard stats endpoints
│   │   │   ├── employees/                # Employee CRUD endpoints
│   │   │   ├── exports/                  # PDF/Excel export endpoints
│   │   │   ├── fleet-provider/           # Fleet tracking provider integration
│   │   │   ├── reports/                  # Report generation endpoints
│   │   │   ├── routevision/              # RouteVision trip matching and sync
│   │   │   ├── stripe/                   # Stripe integration endpoints
│   │   │   ├── timesheets/               # Timesheet CRUD and approval endpoints
│   │   │   ├── vacations/                # Vacation request endpoints
│   │   │   ├── webhooks/                 # Stripe webhook handler
│   │   │   └── __tests__/                # API route tests
│   │   ├── marketing/                    # Public marketing pages (pricing, features, FAQ)
│   │   ├── checkout/                     # Stripe checkout success/cancel pages
│   │   ├── login/                        # Login page
│   │   ├── layout.tsx                    # Root layout with providers
│   │   └── globals.css                   # Global Tailwind CSS styles
│   ├── components/                       # Reusable React components
│   │   ├── admin/                        # Admin-only components
│   │   ├── approvals/                    # Approval workflow components
│   │   ├── chat/                         # FAQ chatbot component
│   │   ├── dashboard/                    # Dashboard widget components
│   │   ├── employees/                    # Employee list and form components
│   │   ├── filters/                      # Reusable filter components
│   │   ├── forms/                        # Form components (Login, Timesheet, Vacation, etc.)
│   │   ├── marketing/                    # Marketing page components
│   │   ├── mobile/                       # Mobile-specific UI components
│   │   ├── providers/                    # Context providers (Session, Theme, Locale)
│   │   └── ui/                           # Base UI components (Button, Card, Input, etc.)
│   ├── hooks/                            # Custom React hooks
│   │   └── useTranslations.ts            # Hook for accessing translations
│   ├── lib/                              # Shared utility and business logic libraries
│   │   ├── auth/                         # Authentication and authorization
│   │   │   ├── auth.ts                   # NextAuth.js configuration with credentials provider
│   │   │   ├── tenant-access.ts          # Tenant context resolution and permission checking
│   │   │   ├── password-reset.ts         # Password reset token generation and verification
│   │   │   └── __tests__/                # Auth layer tests
│   │   ├── db/                           # Database utilities
│   │   │   ├── prisma.ts                 # Prisma client singleton
│   │   │   └── tenant-db.ts              # Tenant-specific database utilities
│   │   ├── email/                        # Email sending service
│   │   ├── routevision/                  # RouteVision API client
│   │   ├── security/                     # Security utilities (password hashing, validation)
│   │   ├── services/                     # Business logic services (40+ service files)
│   │   │   ├── approval-service.ts       # Timesheet approval workflow logic
│   │   │   ├── audit-service.ts          # Audit logging operations
│   │   │   ├── compliance-service.ts     # Compliance report generation
│   │   │   ├── email-service.ts          # Email template rendering and sending
│   │   │   ├── fleet-providers/          # Fleet tracking provider integrations
│   │   │   └── [other-services]          # Domain-specific business logic
│   │   ├── stripe/                       # Stripe integration utilities
│   │   ├── utils/                        # Reusable utility functions
│   │   ├── validation/                   # Form and data validation schemas
│   │   ├── rate-limit.ts                 # Rate limiting configuration
│   │   ├── rbac.ts                       # Role-based access control (permissions)
│   │   └── tenant.ts                     # Tenant lookup and slug management
│   ├── i18n/                             # Internationalization setup
│   ├── middleware.ts                     # Next.js request middleware (security headers)
│   ├── auth.config.ts                    # NextAuth configuration (redirects)
│   ├── types/                            # TypeScript type definitions
│   │   ├── index.ts                      # Enums (UserRole, PlanType, SubscriptionStatus) and types
│   │   ├── next-auth.d.ts                # NextAuth session type extensions
│   │   └── [other-types]                 # Domain-specific type definitions
│   ├── test/                             # Test utilities and setup
│   │   ├── setup.ts                      # Vitest global setup
│   │   ├── integration/                  # Integration tests
│   │   └── e2e/                          # End-to-end test scenarios
│   └── utils/                            # Top-level utility functions
│       └── supabase/                     # Supabase client utilities
├── prisma/                               # Prisma ORM setup
│   ├── schema.prisma                     # Database schema definition
│   └── seed.ts                           # Database seed script
├── public/                               # Static assets
│   ├── fonts/                            # Custom fonts
│   ├── images/                           # Product and marketing images
│   └── icons/                            # SVG icons
├── .planning/                            # GSD framework documentation
│   └── codebase/                         # Architecture and structure analysis docs
├── .env.example                          # Environment variable template
├── .env.local                            # Local environment variables (not committed)
├── .eslintrc.json                        # ESLint configuration
├── .gitignore                            # Git ignore patterns
├── next.config.ts                        # Next.js build configuration
├── schema.prisma                         # Primary database schema (PostgreSQL)
├── schema-sqlite.prisma                  # Alternative SQLite schema (development)
├── tailwind.config.ts                    # Tailwind CSS configuration
├── tsconfig.json                         # TypeScript compiler options
├── package.json                          # NPM dependencies and scripts
├── CLAUDE.md                             # Project-specific Claude instructions
└── README.md                             # Project documentation
```

## Directory Purposes

**src/app/**
- Purpose: Next.js App Router entry points (pages and API routes)
- Contains: Page components, layout components, route handlers
- Key files: `layout.tsx`, `page.tsx`, `route.ts`

**src/app/(auth)/**
- Purpose: Public authentication pages without dashboard layout
- Contains: Login form, password reset, forgot password flows
- Key files: `login/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`

**src/app/(dashboard)/**
- Purpose: Protected routes requiring authentication and tenant context
- Contains: Dashboard widgets, employee management, timesheet tracking, leave management
- Key files: `layout.tsx` (main dashboard navigation), `dashboard/page.tsx` (stats dashboard)

**src/app/admin/**
- Purpose: Superuser-only administration interface
- Contains: Tenant creation, user management, system settings
- Key files: `tenants/new/page.tsx`, `email-templates/page.tsx`

**src/app/api/**
- Purpose: RESTful endpoints with multi-tenant isolation
- Contains: GET/POST/PUT/DELETE handlers with validation and business logic
- Key files: Multiple `route.ts` files organized by domain (timesheets, approvals, billing, etc.)

**src/components/**
- Purpose: Reusable React components organized by feature
- Contains: UI components, forms, layouts, feature-specific components
- Key files: `providers/` (context providers), `ui/` (base components), `forms/` (domain forms)

**src/lib/auth/**
- Purpose: Authentication, authorization, and tenant access control
- Contains: NextAuth configuration, JWT handling, permission system, tenant context
- Key files: `auth.ts` (NextAuth config), `tenant-access.ts` (context resolution), `password-reset.ts`

**src/lib/db/**
- Purpose: Database access patterns and Prisma utilities
- Contains: Prisma client singleton, tenant-specific query utilities
- Key files: `prisma.ts` (client export), `tenant-db.ts` (tenant utilities)

**src/lib/services/**
- Purpose: Domain-specific business logic separated from API routes
- Contains: Approval workflows, compliance reports, email templates, integrations
- Key files: 40+ service files for different business domains

**src/lib/stripe/**
- Purpose: Stripe payment integration utilities
- Contains: Checkout session creation, subscription management, webhook handlers
- Key files: Stripe API client wrapper functions

**src/lib/utils/**
- Purpose: Generic utility functions (date formatting, string manipulation, etc.)
- Contains: Helper functions without business context
- Key files: Utility functions for common operations

**src/types/**
- Purpose: Shared TypeScript type definitions and enums
- Contains: UserRole, PlanType, SubscriptionStatus enums, common interfaces
- Key files: `index.ts` (main types), `next-auth.d.ts` (session augmentation)

**prisma/**
- Purpose: Prisma ORM schema and seed data
- Contains: Database schema with all models and relationships
- Key files: `schema.prisma` (PostgreSQL schema), `seed.ts` (initial data)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapping all pages with providers
- `src/app/(auth)/login/page.tsx`: Login entry point for unauthenticated users
- `src/app/(dashboard)/layout.tsx`: Dashboard shell with navigation and session check
- `src/app/admin/layout.tsx`: Admin panel entry point for superusers
- `src/middleware.ts`: Global request middleware for security headers

**Configuration:**
- `src/auth.config.ts`: NextAuth redirect configuration
- `src/lib/auth/auth.ts`: NextAuth.js credentials provider setup
- `next.config.ts`: Next.js build and feature configuration
- `tsconfig.json`: TypeScript compiler configuration with path aliases
- `tailwind.config.ts`: Tailwind CSS theme and plugin configuration

**Core Logic:**
- `src/lib/auth/tenant-access.ts`: Tenant context resolution and permission checking
- `src/lib/rbac.ts`: Role-based access control permission system
- `src/lib/tenant.ts`: Tenant slug and domain lookup
- `src/lib/services/`: 40+ business logic services for different domains
- `schema.prisma`: Complete database schema with all relationships

**Testing:**
- `src/test/setup.ts`: Vitest global configuration and mocks
- `src/lib/auth/__tests__/`: Authentication layer tests
- `src/app/api/__tests__/`: API route tests
- `src/app/login/__tests__/`: Login page tests

## Naming Conventions

**Files:**
- Pages: `page.tsx` for route pages, `layout.tsx` for layout components
- API handlers: `route.ts` for Next.js API routes (GET, POST, PUT, DELETE)
- Components: PascalCase (`UserCard.tsx`, `TimesheetForm.tsx`)
- Utilities: camelCase (`dateUtils.ts`, `formatCurrency.ts`)
- Services: descriptive names with `-service.ts` suffix (`approval-service.ts`)
- Types: PascalCase for interfaces (`UserRole.ts`, `TimesheetData.ts`)
- Tests: `.test.ts` or `.spec.ts` suffix for test files

**Directories:**
- Feature directories: kebab-case (`sick-leave`, `fleet-provider`)
- Component collections: kebab-case (`ui`, `forms`, `mobile`)
- Service groups: kebab-case (`fleet-providers`, `api/fleet-provider`)
- Utility directories: specific purpose names (`auth`, `db`, `email`)

**Variables and Functions:**
- Constants: UPPER_SNAKE_CASE for module constants
- Functions: camelCase (`getTenantContext()`, `createAuditLog()`)
- React components: PascalCase (`<DashboardLayout />`, `<TimesheetForm />`)
- Hooks: camelCase with `use` prefix (`useTranslations()`, `useSession()`)

**Database Models:**
- Model names: PascalCase (`User`, `Tenant`, `Timesheet`)
- Fields: camelCase with snake_case mapping for database (`subscriptionStatus` → `subscription_status`)
- Relations: singular when one-to-one, plural when one-to-many (`tenant` vs `employees`)

## Where to Add New Code

**New Feature (Complete Domain):**
- Primary code: `src/app/api/[feature]/route.ts` for API endpoints
- UI pages: `src/app/(dashboard)/[feature]/page.tsx` for main interface
- Components: `src/components/[feature]/` for feature-specific components
- Business logic: `src/lib/services/[feature]-service.ts` for domain logic
- Types: `src/types/[feature].ts` for feature-specific types
- Tests: `src/lib/services/__tests__/[feature]-service.test.ts`

**New Component/Module:**
- UI component: `src/components/[category]/NewComponent.tsx`
- Form component: `src/components/forms/NewForm.tsx`
- Base UI: `src/components/ui/NewControl.tsx` for reusable controls

**Utilities and Helpers:**
- Auth-related: `src/lib/auth/new-utility.ts`
- Service utilities: `src/lib/services/[domain]-service.ts`
- General utils: `src/lib/utils/[purpose].ts`
- Validation schemas: `src/lib/validation/[domain].ts`

**API Endpoints:**
- Tenant-isolated endpoints: `src/app/api/[resource]/route.ts`
- Dynamic routes: `src/app/api/[resource]/[id]/route.ts`
- Sub-routes: `src/app/api/[resource]/[action]/route.ts`

**Database Changes:**
- Update `schema.prisma` with new model or field
- Run `npx prisma db push` to apply schema changes
- Run `npx prisma generate` to regenerate Prisma client

**Environment Configuration:**
- Add variables to `.env.local` (local development)
- Add template to `.env.example` (for team reference)
- Use `process.env.VARIABLE_NAME` in code

## Special Directories

**src/app/(dashboard)/**
- Purpose: Route group for dashboard-specific layout and navigation
- Generated: No, manually organized
- Committed: Yes, part of source code

**src/test/**
- Purpose: Test utilities, fixtures, and test setup
- Generated: No, manually created
- Committed: Yes, part of source code

**.next/**
- Purpose: Next.js build output and cache
- Generated: Yes, created by `npm run build` and `npm run dev`
- Committed: No, in .gitignore

**node_modules/**
- Purpose: NPM package dependencies
- Generated: Yes, created by `npm install`
- Committed: No, in .gitignore

**prisma/migrations/**
- Purpose: Prisma database migration history (if using migrations)
- Generated: No, created by `npx prisma migrate`
- Committed: Yes, if using migrations (currently using `db push`)

## Import Path Conventions

**Path Alias:**
- `@/*` maps to `src/*` via `tsconfig.json:24-26`
- Always use `@/` for imports: `import { auth } from '@/lib/auth/auth'`
- Never use relative paths like `../../../lib/auth`

**Import Organization:**
```typescript
// 1. Next.js and React imports
import { useState } from 'react';
import { useSession } from 'next-auth/react';

// 2. Third-party imports
import { prisma } from '@prisma/client';
import { z } from 'zod';

// 3. Internal imports (from @/)
import { getTenantContext } from '@/lib/auth/tenant-access';
import { UserCard } from '@/components/users/UserCard';

// 4. Type imports
import type { UserRole } from '@/types';
```

---

*Structure analysis: 2025-01-23*
