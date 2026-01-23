# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Payment Processing:**
- Stripe - Payment processing and subscription management
  - SDK/Client: `stripe` (18.5.0) for server-side, `@stripe/stripe-js` (7.9.0) for browser
  - Auth: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
  - Config: `src/lib/stripe/config.ts` with product/price ID management
  - Service: `src/lib/stripe/subscription-service.ts` handles customer/subscription lifecycle
  - Webhooks: `src/app/api/webhooks/stripe/route.ts` processes Stripe events

**Email Delivery:**
- SMTP (Generic email service)
  - Client: `nodemailer` (6.10.1)
  - Auth: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
  - Config: `src/lib/services/email-service.ts`
  - From: `SMTP_FROM` environment variable
  - Templates: `src/lib/email/templates.ts` with HTML email templates

**Fleet Tracking / GPS Integration:**
- RouteVision - Vehicle GPS tracking and trip data (legacy integration)
  - Config: `ROUTEVISION_API_URL`, `ROUTEVISION_API_KEY`
  - Model: `RouteVisionConfig` in Prisma schema (tenant-scoped)
  - Service: `src/lib/services/routevision-service.ts`
  - Type: Legacy, kept for backwards compatibility

**Multi-Provider Fleet Integration:**
- Abstract fleet provider system supporting multiple vendors
  - Supported providers: RouteVision, FleetGo, Samsara, Webfleet, TrackJack, Verizon
  - Base: `src/lib/services/fleet-providers/base-provider.ts`
  - Config model: `FleetProviderConfig` in Prisma (per-tenant, per-provider)
  - Vehicle mapping: `src/lib/services/fleet-providers/types.ts`
  - Credentials: Encrypted JSON in database
  - Sync: Automatic trip sync with configurable intervals

## Data Storage

**Databases:**
- PostgreSQL (Primary)
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma ORM (`@prisma/client`)
  - Schema: `schema.prisma` with 30+ models
  - Migration: `npx prisma db push` for development
  - Multi-tenant: All models include `tenant_id` for data isolation

- Supabase (Optional, not active)
  - Client: `@supabase/supabase-js` (2.57.2)
  - Config: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Usage: Utilities in `src/utils/supabase/` (not currently integrated)
  - Status: Placeholder for potential document storage or auth

- Vercel Postgres (Optional)
  - Client: `@vercel/postgres` (0.10.0)
  - Status: Not actively used, available for Vercel deployments

**File Storage:**
- Local filesystem only
  - Documents stored with paths in `documents` table
  - `storage_path` field tracks file locations
  - File uploads handled via `src/lib/services/document-service.ts`

**Caching:**
- Upstash Redis (Optional, production)
  - Service: `@upstash/ratelimit` (2.0.6), `@upstash/redis` (1.35.3)
  - Config: `UPSTASH_REDIS_REST_URL`
  - Fallback: Mock Redis implementation in development
  - Purpose: Rate limiting, analytics
  - Usage: `src/lib/rate-limit.ts` with multiple limiting strategies

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v5 (Credentials Provider)
  - Implementation: `src/lib/auth/auth.ts`
  - Strategy: Credentials (email/password) - no OAuth providers
  - Password storage: bcryptjs hashing
  - Session: JWT tokens with tenant context
  - Config: `src/auth.config.ts` (signIn page at `/login`)

**Multi-Tenant Identity:**
- User-Tenant relationship via junction table
  - Model: `TenantUser` in Prisma (email → tenants mapping)
  - Role system: SUPERUSER, TENANT_ADMIN, MANAGER, USER
  - Tenant context: `src/lib/auth/tenant-access.ts`
  - Session enrichment: `getTenantContext()` for authorization

**Password Management:**
- Password reset: `src/lib/auth/password-reset.ts`
- Token storage: `PasswordResetToken` model in database
- Reset link expiration: Configurable timeout

## Monitoring & Observability

**Error Tracking:**
- None detected - no Sentry, LogRocket, or similar

**Logs:**
- Console logging (development mode)
  - Prisma: Logs errors and warnings in dev, errors only in prod
  - Location: `src/lib/db/prisma.ts`

**Audit Logging:**
- Database-backed audit trail
  - Model: `AuditLog` table with user, tenant, action, resource tracking
  - Service: `src/lib/services/audit-service.ts`
  - Captures: IP address, user agent, old/new values for compliance

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js optimizations and @vercel/postgres)
- Turbopack enabled for fast development and deployments

**CI Pipeline:**
- None detected in codebase

**Webhooks:**
- Stripe webhook endpoint: `src/app/api/webhooks/stripe/route.ts`
  - Events handled: subscription_created, subscription_updated, subscription_deleted, customer.subscription.payment_failed

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Authentication redirect URL
- `NEXTAUTH_SECRET` - Session encryption key
- `STRIPE_SECRET_KEY` - Stripe API secret
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Email service
- `CRON_SECRET` - Cron job authentication token

**Optional env vars:**
- `UPSTASH_REDIS_REST_URL` - Redis for rate limiting
- `ROUTEVISION_API_URL`, `ROUTEVISION_API_KEY` - Fleet tracking
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Document storage
- `STRIPE_STANDARD_PRODUCT_ID`, `STRIPE_STANDARD_MONTHLY_PRICE_ID`, `STRIPE_STANDARD_YEARLY_PRICE_ID`, `STRIPE_EXTRA_USER_MONTHLY_PRICE_ID` - Stripe product IDs (auto-created if missing)

**Secrets location:**
- Environment variables file (`.env`, `.env.local`)
- Template: `.env.example` shows all available configuration

## Webhooks & Callbacks

**Incoming:**
- Stripe webhooks: `src/app/api/webhooks/stripe/route.ts`
  - Signature verification: `stripe.webhooks.constructEvent()`
  - Events: subscription lifecycle, payment failures, customer updates

**Outgoing:**
- None detected - system only receives webhooks, doesn't send to external systems

## Cron Jobs & Background Tasks

**Background Services:**
- Approval reminders: `src/lib/services/approval-reminder-service.ts`
- Timesheet reminders: `src/lib/services/timesheet-reminder.ts`
- Leave expiration reminders: `src/lib/services/leave-expiration-reminder.ts`
- UWV alert service: `src/lib/services/uwv-alert-service.ts`
- Trip-timesheet matching: `src/lib/services/trip-timesheet-matcher.ts`

**Cron Protection:**
- Auth: `CRON_SECRET` environment variable for cron endpoint security

## Rate Limiting

**Strategy:**
- Upstash-based rate limiting with multiple contexts
- Location: `src/lib/rate-limit.ts`

**Limits:**
- API: 100 requests/hour
- Authentication: 5 login attempts/15 minutes (brute force prevention)
- Admin actions: 20 actions/hour
- Data exports: 10 exports/hour
- Email: 50 emails/day

## Fleet Provider Integration

**Architecture:**
- Abstract base class: `src/lib/services/fleet-providers/base-provider.ts`
- Provider implementations: 6 different fleet tracking services
  - `routevision-provider.ts` - Primary integration
  - `fleetgo-provider.ts` - FleetGo API
  - `samsara-provider.ts` - Samsara platform
  - `webfleet-provider.ts` - TomTom Webfleet
  - `trackjack-provider.ts` - TrackJack system
  - `verizon-provider.ts` - Verizon Connect

**Data Models:**
- `FleetProviderConfig` - Per-tenant configuration with encrypted credentials
- `VehicleMapping` - Links provider vehicles to employees
- `TripRecord` - Synchronized trip data from provider
- Backwards compatibility: `routevision_id` fields for legacy data

**Credentials Encryption:**
- Credentials stored as encrypted JSON in `FleetProviderConfig.credentials`
- Encryption: `src/lib/security/encryption.ts`
- Token caching: 14-minute TTL in-memory cache

---

*Integration audit: 2026-01-23*
