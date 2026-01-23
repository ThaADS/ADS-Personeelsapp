# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.x - Full-stack type safety for all source code
- React 19.2.3 - UI component framework

**Secondary:**
- JavaScript (Node.js) - Runtime environment for backend processes

## Runtime

**Environment:**
- Node.js - Backend runtime (specified in `.env`)
- Next.js 15.5.2 - Full-stack React framework with App Router

**Package Manager:**
- npm - Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 15.5.2 - Full-stack framework with Turbopack for fast dev builds
- React 19.2.3 - Component-based UI library
- React Hook Form 7.62.0 - Form state management and validation

**Authentication:**
- NextAuth.js 5.0.0-beta.19 - Authentication framework with Credentials provider
- @auth/prisma-adapter 2.10.0 - Prisma database adapter for NextAuth

**Database:**
- Prisma 6.15.0 - ORM for PostgreSQL with migrations
- @prisma/client 6.15.0 - Runtime client for database queries

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS integration for Tailwind
- next-themes 0.4.6 - Dark/light theme management

**UI Components:**
- @radix-ui/themes 3.2.1 - Accessible component library with theming
- @radix-ui/react-icons 1.3.2 - Icon component set
- @heroicons/react 2.2.0 - Alternative icon library

**Internationalization:**
- next-intl 4.3.6 - Multi-language support (Dutch primary language)

**Data Validation:**
- Zod 4.1.5 - Runtime type validation for TypeScript

**Utility Libraries:**
- date-fns 4.1.0 - Date manipulation and formatting
- uuid 12.0.0 - Unique identifier generation
- bcryptjs 3.0.2 - Password hashing (alternative to bcrypt)
- bcrypt 6.0.0 - Native password hashing
- nodemailer 6.10.1 - Email sending via SMTP
- ExcelJS 4.4.0 - Excel file generation for exports
- PDFKit 0.17.2 - PDF document generation

**Caching & Rate Limiting:**
- @upstash/redis 1.35.3 - Redis client for rate limiting and caching
- @upstash/ratelimit 2.0.6 - Rate limiting service (development fallback to mock)

**External Services:**
- stripe 18.5.0 - Stripe API client for payment processing
- @stripe/stripe-js 7.9.0 - Browser-side Stripe library
- @supabase/supabase-js 2.57.2 - Supabase client (optional, database backup)
- @supabase/ssr 0.7.0 - Server-side Supabase utilities
- @vercel/postgres 0.10.0 - Vercel Postgres client (optional)

## Testing

**Test Runner:**
- Vitest 3.2.4 - Fast unit test framework
- jsdom 26.1.0 - DOM environment for browser testing

**Testing Libraries:**
- @testing-library/react 16.3.0 - Component testing utilities
- @testing-library/dom 10.4.1 - DOM testing utilities
- @testing-library/jest-dom 6.8.0 - Jest matchers for DOM
- @testing-library/user-event 14.6.1 - User interaction simulation
- @vitest/coverage-v8 3.2.4 - Code coverage reporting

**E2E Testing:**
- Cypress 15.1.0 - End-to-end browser testing
- @cypress/code-coverage 3.14.6 - Coverage integration

## Build & Dev Tools

**Build:**
- next build - Next.js production build
- Turbopack (in `npm run dev`) - Fast bundler for development

**Linting:**
- ESLint 9.35.0 - JavaScript/TypeScript linting
- eslint-config-next 15.5.2 - Next.js ESLint configuration
- @eslint/eslintrc 3 - ESLint configuration utilities

**Code Quality:**
- @vitejs/plugin-react 5.0.2 - React plugin for Vitest

**Utility Tools:**
- ts-node 10.9.2 - TypeScript execution for scripts (database seeding)
- npm-check-updates 18.1.0 - Dependency update checker

## Key Dependencies

**Critical:**
- @prisma/client 6.15.0 - Direct database access and multi-tenant data isolation
- NextAuth.js 5.0.0-beta.19 - Authentication and session management (beta but stable)
- Stripe 18.5.0 - Payment processing and subscription billing
- @upstash/ratelimit 2.0.6 - API rate limiting and abuse prevention

**Infrastructure:**
- next 15.5.2 - Full-stack application runtime and routing
- react 19.2.3 - UI rendering engine
- react-hook-form 7.62.0 - Form handling for all input forms
- zod 4.1.5 - Runtime schema validation for API inputs

## Configuration

**Environment:**
- `.env` - Main environment configuration (not committed)
- `.env.example` - Template showing required variables
- `.env.local` - Local overrides (not committed)
- `.env.supabase-template` - Supabase-specific configuration template

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - NextAuth redirect URL
- `NEXTAUTH_SECRET` - Session encryption secret
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature secret
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Email configuration
- `CRON_SECRET` - Cron job authentication
- `ROUTEVISION_API_URL`, `ROUTEVISION_API_KEY` - Optional fleet provider integration
- `UPSTASH_REDIS_REST_URL` - Optional Redis for rate limiting
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Optional Supabase

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with strict mode
- `next.config.ts` - Next.js configuration with next-intl plugin
- `vitest.config.ts` - Test runner configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `eslint.config.mjs` - ESLint configuration

## Platform Requirements

**Development:**
- Node.js (version specified in package.json scripts)
- npm package manager
- PostgreSQL database
- SMTP server for email (or test credentials)
- Stripe test account
- Optional: Upstash Redis account for production rate limiting

**Production:**
- Node.js runtime
- PostgreSQL database
- Vercel (implied by Turbopack and @vercel/postgres support)
- Stripe live account for payments
- Upstash Redis for rate limiting
- Email service provider (SMTP)
- Optional: Supabase for document storage or database backup

---

*Stack analysis: 2026-01-23*
