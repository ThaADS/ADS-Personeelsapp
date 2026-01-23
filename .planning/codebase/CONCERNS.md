# Codebase Concerns

**Analysis Date:** 2026-01-23

## Tech Debt

**Backup and Deprecated Files:**
- Issue: Abandoned backup files present in codebase that should be removed
- Files: `src/app/api/approvals/route-backup.ts`, `src/middleware.ts.backup`
- Impact: Code confusion, maintenance burden, potential for accidental use of outdated code
- Fix approach: Delete backup files and use version control (git) to preserve history

**Type Safety Issues with Type Assertions:**
- Issue: Multiple `as unknown as` and `as any` casts throughout codebase bypass TypeScript safety
- Files: `src/lib/rate-limit.ts:14`, `src/lib/stripe/subscription-service.ts:135,158`, `src/components/providers/LocaleSync.tsx:12`, `src/app/api/approvals/route.ts:111,114,146,149`, `src/lib/db/prisma.ts:3`, `src/app/api/webhooks/stripe/route.ts:285`, `src/lib/services/approval-service.ts:42`, `src/lib/services/fleet-providers/base-provider.ts:169`, `src/app/api/support/route.ts:43`
- Impact: Runtime type errors not caught at compile time, hidden data transformation bugs, maintenance difficulty
- Fix approach: Define proper TypeScript interfaces for transformed data types, remove type assertions by using typed APIs

**Unimplemented Webhook Notification:**
- Issue: TODO comment indicating missing email notification feature
- Files: `src/app/api/webhooks/stripe/route.ts:267`
- Impact: Subscription status changes (payment failures, cancellations) not communicated to tenant admins
- Fix approach: Implement email notification service call in webhook handlers for payment and subscription state changes

**Personal Data Exposure in Responses:**
- Issue: API responses expose sensitive personal data (BSN, bank details, passport info) without proper masking
- Files: `src/lib/services/compliance-service.ts:346-350` contains masking patterns but not enforced in API responses; `src/app/api/employees/[id]/route.ts:51-53,70` includes bankAccountNumber, bankAccountName, bsnNumber in user select clause
- Impact: GDPR/AVG compliance violation, data breach risk, unnecessary personal data exposure
- Fix approach: Implement response masking middleware that strips sensitive fields by default, expose only via audit-logged explicit requests with permission checks

## Known Bugs

**Inconsistent Timezone Handling:**
- Symptoms: Date/time inconsistencies possible across database boundaries; Nominatim rate limiting based on `lastNominatimCall` timestamp may be inaccurate due to local clock skew
- Files: `src/lib/services/geocoding-service.ts:32-33` relies on `Date.now()` without timezone awareness; database queries use `Timestamptz(6)` but client-side date handling may be naive
- Trigger: Cross-timezone deployments, rate limiting failures during high-frequency geocoding
- Workaround: Database automatically handles UTC conversion, but client-side code should use explicit UTC dates

**Console Logging in Production:**
- Symptoms: Sensitive information potentially exposed in server logs
- Files: 25+ locations with `console.error()` and `console.warn()` calls: `src/lib/validation/approval-validation.ts`, `src/app/api/employees/[id]/route.ts:176,352`, `src/app/api/approvals/route.ts:180,210,231,249`, `src/app/api/webhooks/stripe/route.ts`, and many more
- Trigger: Application errors in production environment
- Workaround: Rotate logs frequently, do not expose error details to client

## Security Considerations

**Sensitive Data in Session/JWT:**
- Risk: User object in JWT includes tenant context which could be spoofed if token validation is weak
- Files: `src/lib/auth/auth.ts` session callbacks, `src/components/providers/LocaleSync.tsx:12` accesses session data
- Current mitigation: NextAuth.js v5 handles signing, JWT validation on every request
- Recommendations: Implement rate limiting on JWT token generation, validate tenantId against database on sensitive operations, use secure httpOnly cookies

**Type Casting Masking SQL Injection Risks:**
- Risk: Type assertions hide potential data validation gaps; `as unknown as` patterns suggest unvalidated data transformations
- Files: `src/app/api/approvals/route.ts:111,114,146,149` casts audit log entries to unvalidated shapes
- Current mitigation: Prisma client-side validation, parameterized queries
- Recommendations: Remove type assertions and add explicit validation schemas before data use; use Zod schemas for all API inputs

**Insufficient Input Validation on Complex Nested Data:**
- Risk: Employee records accept deeply nested JSON data without schema validation
- Files: `src/app/api/employees/route.ts` and `src/app/api/employees/[id]/route.ts` accept arbitrary nested employee/vehicle data
- Current mitigation: Database schema constraints
- Recommendations: Implement comprehensive Zod validation for all nested structures before database writes, reject invalid structures early

**Rate Limiting Implementation Gaps:**
- Risk: Database-based rate limiting can fail if database connection is slow/unavailable
- Files: `src/lib/auth/password-reset.ts:43-75` uses database lookups for rate limit checks, `src/lib/security/rate-limit.ts` uses in-memory sliding window with no persistence
- Current mitigation: Rate limit entries are cleaned up, token expiration enforced
- Recommendations: Implement Redis-backed rate limiting for critical endpoints (auth, API), add circuit breaker for database failures

## Performance Bottlenecks

**In-Memory Geocoding Cache Without Eviction:**
- Problem: `geocodeCache` Map in geocoding-service.ts grows unbounded; entries cached for 24 hours but no max size limit
- Files: `src/lib/services/geocoding-service.ts:28-29`
- Cause: Using Map instead of LRU cache, no memory pressure cleanup
- Improvement path: Replace with LRU cache implementation (e.g., `lru-cache` package already in deps), add max 5000 entries with TTL cleanup

**Nominatim Rate Limiting Too Conservative:**
- Problem: 1 request/second is safe but may be overly cautious for actual usage; could cause UI delays
- Files: `src/lib/services/geocoding-service.ts:33`
- Cause: Conservative rate limit to respect OSM policy
- Improvement path: Implement exponential backoff and request batching, use PDOK (Dutch provider) as primary for faster responses, cache more aggressively

**Unnecessary N+1 Queries in Employee Listings:**
- Problem: Employee GET endpoint includes nested relations (departments[], documents[], employees[]) without pagination
- Files: `src/app/api/employees/route.ts:45-140` includes multiple related records per employee
- Cause: Eager loading of all relationships regardless of actual need
- Improvement path: Implement relationship field selection via query parameters, use database cursors for pagination, implement field-level access control

**Missing Database Indexes on Common Filters:**
- Problem: Queries filter by `tenantId` and `role` on many models but indexes may not exist on all combinations
- Files: Schema has indexes on individual fields but not on filter combinations
- Cause: Index strategy not optimized for actual query patterns
- Improvement path: Add composite indexes for common filter combinations (tenantId + status, tenantId + role, etc.)

**Stripe Webhook Processing Blocking:**
- Problem: Webhook handlers perform synchronous database updates that could block concurrent requests
- Files: `src/app/api/webhooks/stripe/route.ts:21-96` (handleSubscriptionCreated)
- Cause: Direct Prisma updates in webhook handler without queuing
- Improvement path: Implement async job queue (Bull, pg-boss) for webhook processing, return 200 immediately before processing completes

## Fragile Areas

**Approval Validation Service Complex Business Logic:**
- Files: `src/lib/validation/approval-validation.ts`, `src/lib/services/approval-service.ts`
- Why fragile: Hardcoded validation rules (weekend work warnings, work hour constraints) are context-dependent; no tenant-specific configuration
- Safe modification: Add abstraction layer for validation rules, externalize to database or config, add comprehensive unit tests for each rule variant
- Test coverage: Moderate - validateTimesheet() and validateVacation() have basic logic but no edge case tests

**Multi-Tenant Isolation in API Routes:**
- Files: `src/app/api/employees/route.ts`, `src/app/api/approvals/route.ts`, 20+ API endpoints
- Why fragile: Relies on `getTenantContext()` being called first; no middleware enforcement; easy to add new endpoint and forget tenant filtering
- Safe modification: Create reusable middleware wrappers (withTenantAccess) for all routes, add route pattern linting to enforce middleware usage
- Test coverage: Multi-tenant isolation tests exist but coverage is limited to 3-4 scenarios

**Bcrypt vs Bcryptjs Library Confusion:**
- Files: `package.json` includes both `bcrypt ^6.0.0` and `bcryptjs ^3.0.2`; usage is inconsistent
- Why fragile: Two different implementations can have performance/compatibility differences; confusion about which to use
- Safe modification: Remove one dependency (prefer bcryptjs for Node.js cross-platform), standardize usage across auth modules
- Test coverage: Auth module has unit tests but doesn't verify hash compatibility

**AuditLog Filtering Logic Hidden in Type Casts:**
- Files: `src/app/api/approvals/route.ts:111-149` filters audit logs by status using multiple type casts
- Why fragile: Filter logic is encoded in AuditLog.newValues JSON; no schema validation on structure; breaks if JSON structure changes
- Safe modification: Create dedicated AuditLogFilter class with typed filtering, validate newValues structure on write
- Test coverage: No unit tests for audit log filtering logic

**Compliance Service Data Masking Not Enforced:**
- Files: `src/lib/services/compliance-service.ts:344-350` defines masking rules but no middleware applies them
- Why fragile: Masking rules exist but are not automatically applied to API responses; developers must remember to apply them
- Safe modification: Create response interceptor middleware that applies masking rules to all endpoints returning sensitive fields
- Test coverage: Compliance service has no unit tests

## Scaling Limits

**Database Connection Pool with No Monitoring:**
- Current capacity: Prisma default pool of 2 connections per CPU core
- Limit: When active connections exceed pool size, queries queue; long queue = timeout errors
- Scaling path: Configure Prisma pool size based on load testing, implement PgBouncer for connection pooling, add connection pool monitoring metrics

**In-Memory Session Cache Unbounded:**
- Current capacity: Global session objects stored per request with no size limits
- Limit: Memory usage grows with concurrent users; server may crash under sustained high load
- Scaling path: Implement Redis-backed session store (already have @upstash/redis in deps), configure session TTL, add memory pressure monitoring

**Stripe Webhook Rate Limiting No Backpressure:**
- Current capacity: No limit on concurrent webhook processing
- Limit: Webhook flood (e.g., failed payment retries) can overwhelm database
- Scaling path: Implement queue-based webhook processing with concurrency limits (max 10 concurrent), add circuit breaker for database failures

## Dependencies at Risk

**NextAuth.js v5 Beta:**
- Risk: Beta version not production-ready; API breaking changes possible; limited community support
- Files: `package.json` dependency `next-auth ^5.0.0-beta.19`
- Impact: Auth system may break on minor updates; migration path unclear
- Migration plan: Upgrade to stable v5 release when available (v5.0.0+), maintain auth test suite to catch breaking changes

**Supabase Integration Duplicated:**
- Risk: Both `@supabase/supabase-js` and `@supabase/ssr` imported; unclear which is authoritative
- Files: `src/utils/supabase/server.ts` uses both SDKs
- Impact: Confusing implementation, potential for SDK version conflicts
- Migration plan: Consolidate on single Supabase approach (remove unused SDK), clarify authentication strategy

**Multiple Bcrypt Implementations:**
- Risk: Both `bcrypt` and `bcryptjs` in dependencies; inconsistent usage
- Files: `package.json` has both, usage scattered across auth modules
- Impact: Potential hash incompatibility, bloated dependencies
- Migration plan: Standardize on single library (prefer bcryptjs), update all usages, remove other dependency

## Missing Critical Features

**No Audit Logging for Sensitive Data Access:**
- Problem: Personal data (BSN, bank details) accessed in API but no audit trail
- Blocks: GDPR/AVG compliance requirements, data breach investigation
- Fix: Implement mandatory audit logging for sensitive field access with IP logging

**No Encryption for Sensitive Data at Rest:**
- Problem: Passwords are hashed but personal data (names, addresses, BSN) stored in plaintext
- Blocks: Full GDPR compliance, data protection best practices
- Fix: Implement database encryption for sensitive columns, key rotation strategy

**Missing Tenant Suspension/Offboarding Workflows:**
- Problem: No mechanism to safely revoke tenant access or delete tenant data
- Blocks: Customer offboarding, data retention policy compliance
- Fix: Implement soft delete + archive patterns, audit trail for deletion

**No End-to-End Encryption for Sensitive Communications:**
- Problem: Email notifications contain sensitive data (employee names, leave requests) in plaintext
- Blocks: Enhanced security posture
- Fix: Implement optional S/MIME or PGP for email encryption

## Test Coverage Gaps

**API Security Tests Missing:**
- What's not tested: Multi-tenant isolation bypass attempts, SQL injection vectors, CSRF protection
- Files: `src/app/api/__tests__/` has 8 test files but minimal security testing
- Risk: Authorization vulnerabilities, SQL injection could go undetected in production
- Priority: High

**Validation Logic Not Tested:**
- What's not tested: Edge cases in approval validation (leap years, timezone boundaries, very long shifts)
- Files: `src/lib/validation/approval-validation.ts` has no unit tests
- Risk: Validation bypasses could allow invalid data through
- Priority: High

**Webhook Handler Error Scenarios:**
- What's not tested: Database failure during webhook, Stripe API timeouts, malformed webhook payloads
- Files: `src/app/api/webhooks/stripe/route.ts` has minimal error path testing
- Risk: Silent failures, unsynced subscription state between Stripe and database
- Priority: High

**Email Service Delivery Failures:**
- What's not tested: Email service unavailable, template rendering errors, invalid recipient addresses
- Files: `src/lib/services/email-service.ts` not tested for failure scenarios
- Risk: Users not notified of approvals, password resets fail silently
- Priority: Medium

**Rate Limiting Edge Cases:**
- What's not tested: Clock skew during rate limit window transitions, rapid concurrent requests
- Files: `src/lib/auth/password-reset.ts` rate limiting logic has no edge case tests
- Risk: Rate limiting bypasses under specific timing conditions
- Priority: Medium

**Performance Under Load:**
- What's not tested: Behavior with 1000+ concurrent users, large timesheet datasets
- Files: No load testing suite
- Risk: Unexpected performance degradation in production
- Priority: Medium

---

*Concerns audit: 2026-01-23*
