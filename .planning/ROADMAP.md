# ADSPersoneelsapp - Verbeteringsroadmap

**Gegenereerd:** 2026-01-23
**Gebaseerd op:** Codebase mapping analyse

---

## Overzicht

| Fase | Focus | Prioriteit | Geschatte Taken |
|------|-------|------------|-----------------|
| 1 | Kritieke Security & Compliance | 🔴 KRITIEK | 8 taken |
| 2 | Tech Debt Opruiming | 🟡 HOOG | 6 taken |
| 3 | Test Coverage Verbetering | 🟡 HOOG | 7 taken |
| 4 | Performance Optimalisatie | 🟢 MEDIUM | 6 taken |
| 5 | Schaalbaarheid & Infrastructuur | 🟢 MEDIUM | 5 taken |
| 6 | Feature Completering | 🔵 LAAG | 4 taken |
| 7 | UI/UX Dashboard Verbeteringen | 🟡 HOOG | 10 taken |

---

## Fase 1: Kritieke Security & Compliance 🔴

**Doel:** GDPR/AVG compliance en security vulnerabilities oplossen

### 1.1 Personal Data Masking Middleware
- **Probleem:** BSN, bankgegevens, passport info wordt blootgesteld in API responses
- **Locaties:** `src/app/api/employees/[id]/route.ts:51-53,70`
- **Actie:** Response interceptor middleware implementeren die gevoelige velden maskeert
- **Acceptatiecriteria:** Alle API endpoints retourneren gemaskeerde data tenzij expliciet geautoriseerd

### 1.2 Audit Logging voor Gevoelige Data Access
- **Probleem:** Geen audit trail voor BSN/bankgegevens toegang
- **Actie:** Verplichte audit logging voor sensitive field access met IP logging
- **Acceptatiecriteria:** Elke toegang tot gevoelige data wordt gelogd met timestamp, user, IP

### 1.3 Input Validation Versterking
- **Probleem:** Onvoldoende validatie op geneste JSON data
- **Locaties:** `src/app/api/employees/route.ts`, `src/app/api/employees/[id]/route.ts`
- **Actie:** Zod schemas implementeren voor alle nested structures
- **Acceptatiecriteria:** Alle API inputs gevalideerd via Zod voor database writes

### 1.4 Type Safety Verbetering
- **Probleem:** `as unknown as` en `as any` casts verbergen type fouten
- **Locaties:** 10+ bestanden met unsafe casts
- **Actie:** Proper TypeScript interfaces definiëren, type assertions verwijderen
- **Acceptatiecriteria:** Geen `as any` of `as unknown as` in productie code

### 1.5 Rate Limiting naar Redis
- **Probleem:** In-memory rate limiting faalt bij server restart
- **Locaties:** `src/lib/security/rate-limit.ts`
- **Actie:** Redis-backed rate limiting (@upstash/redis al in deps)
- **Acceptatiecriteria:** Rate limits persistent over server restarts

### 1.6 Console Logging Opschonen
- **Probleem:** 25+ `console.error()` calls kunnen gevoelige data lekken
- **Locaties:** Meerdere API routes en services
- **Actie:** Structured logging library implementeren (pino/winston)
- **Acceptatiecriteria:** Geen console.* calls in productie code

### 1.7 JWT Tenant Validatie
- **Probleem:** tenantId in JWT kan gespoofed worden
- **Locaties:** `src/lib/auth/auth.ts`
- **Actie:** tenantId valideren tegen database bij gevoelige operaties
- **Acceptatiecriteria:** Tenant membership verified op elke protected route

### 1.8 Encryption at Rest voor Gevoelige Data
- **Probleem:** BSN, namen, adressen opgeslagen in plaintext
- **Actie:** Database encryption voor sensitive columns
- **Acceptatiecriteria:** Alle PII encrypted in database

---

## Fase 2: Tech Debt Opruiming 🟡

**Doel:** Codebase kwaliteit en onderhoudbaarheid verbeteren

### 2.1 Backup Files Verwijderen
- **Probleem:** Verlaten backup files veroorzaken verwarring
- **Locaties:** `src/app/api/approvals/route-backup.ts`, `src/middleware.ts.backup`
- **Actie:** Delete backup files, gebruik git history
- **Acceptatiecriteria:** Geen .backup of -backup files in repo

### 2.2 Bcrypt Library Consolidatie
- **Probleem:** Zowel `bcrypt` als `bcryptjs` in dependencies
- **Actie:** Standaardiseer op bcryptjs, update alle usages
- **Acceptatiecriteria:** Één bcrypt library, consistent gebruik

### 2.3 Supabase SDK Consolidatie
- **Probleem:** Beide `@supabase/supabase-js` en `@supabase/ssr` geïmporteerd
- **Locaties:** `src/utils/supabase/server.ts`
- **Actie:** Consolideer naar één SDK approach
- **Acceptatiecriteria:** Eén Supabase client pattern

### 2.4 Webhook Email Notificatie Implementeren
- **Probleem:** TODO voor missing email notificatie
- **Locaties:** `src/app/api/webhooks/stripe/route.ts:267`
- **Actie:** Email service call implementeren voor payment state changes
- **Acceptatiecriteria:** Admins krijgen email bij subscription changes

### 2.5 NextAuth v5 Upgrade Monitoring
- **Probleem:** Beta versie kan breaking changes hebben
- **Actie:** Monitor voor stable release, auth test suite uitbreiden
- **Acceptatiecriteria:** Test suite vangt breaking changes

### 2.6 Audit Log Filter Refactoring
- **Probleem:** Filter logica verborgen in type casts
- **Locaties:** `src/app/api/approvals/route.ts:111-149`
- **Actie:** AuditLogFilter class met typed filtering
- **Acceptatiecriteria:** Geen type casts in audit log filtering

---

## Fase 3: Test Coverage Verbetering 🟡

**Doel:** 80% coverage threshold halen met zinvolle tests

### 3.1 API Security Tests
- **Probleem:** Geen tests voor multi-tenant isolation bypass, SQL injection
- **Prioriteit:** HOOG
- **Actie:** Security test suite voor authorization en injection vectors
- **Acceptatiecriteria:** Security tests voor alle API endpoints

### 3.2 Validation Logic Tests
- **Probleem:** Edge cases niet getest (leap years, timezones, lange shifts)
- **Locaties:** `src/lib/validation/approval-validation.ts`
- **Prioriteit:** HOOG
- **Actie:** Unit tests voor alle validatie scenarios
- **Acceptatiecriteria:** 100% branch coverage op validatie functions

### 3.3 Webhook Error Scenario Tests
- **Probleem:** Database failures, timeouts niet getest
- **Locaties:** `src/app/api/webhooks/stripe/route.ts`
- **Prioriteit:** HOOG
- **Actie:** Error path tests voor webhook handlers
- **Acceptatiecriteria:** Tests voor alle error scenarios

### 3.4 Email Service Failure Tests
- **Probleem:** Delivery failures niet getest
- **Locaties:** `src/lib/services/email-service.ts`
- **Prioriteit:** MEDIUM
- **Actie:** Failure scenario tests voor email service
- **Acceptatiecriteria:** Graceful degradation getest

### 3.5 Rate Limiting Edge Case Tests
- **Probleem:** Clock skew, concurrent requests niet getest
- **Locaties:** `src/lib/auth/password-reset.ts`
- **Prioriteit:** MEDIUM
- **Actie:** Edge case tests voor rate limiting
- **Acceptatiecriteria:** Rate limit bypasses onmogelijk

### 3.6 Multi-Tenant Isolation Tests
- **Probleem:** Slechts 3-4 scenarios getest
- **Actie:** Uitgebreide isolation test suite
- **Acceptatiecriteria:** Tests voor alle cross-tenant access patterns

### 3.7 Load Testing Suite
- **Probleem:** Geen performance tests
- **Actie:** k6 of Artillery load testing setup
- **Acceptatiecriteria:** Baseline performance metrics vastgelegd

---

## Fase 4: Performance Optimalisatie 🟢

**Doel:** Response times en resource usage verbeteren

### 4.1 Geocoding Cache naar LRU
- **Probleem:** Unbounded Map growth
- **Locaties:** `src/lib/services/geocoding-service.ts:28-29`
- **Actie:** `lru-cache` package implementeren (al in deps)
- **Acceptatiecriteria:** Max 5000 entries met TTL cleanup

### 4.2 N+1 Query Oplossen
- **Probleem:** Employee listings laden alle relaties zonder pagination
- **Locaties:** `src/app/api/employees/route.ts:45-140`
- **Actie:** Field selection via query params, cursor pagination
- **Acceptatiecriteria:** Lazy loading voor relaties

### 4.3 Database Index Optimalisatie
- **Probleem:** Missing composite indexes
- **Actie:** Indexes toevoegen voor (tenantId + status), (tenantId + role)
- **Acceptatiecriteria:** Query performance gemeten en verbeterd

### 4.4 Webhook Async Processing
- **Probleem:** Synchrone DB updates blokkeren requests
- **Locaties:** `src/app/api/webhooks/stripe/route.ts`
- **Actie:** Job queue (Bull/pg-boss) voor webhook processing
- **Acceptatiecriteria:** 200 response binnen 100ms

### 4.5 PDOK Geocoding Primary
- **Probleem:** Nominatim rate limit te conservatief
- **Actie:** PDOK als primary provider voor Nederlandse adressen
- **Acceptatiecriteria:** Snellere geocoding responses

### 4.6 Timezone Handling Standaardisatie
- **Probleem:** Inconsistente timezone handling
- **Locaties:** `src/lib/services/geocoding-service.ts:32-33`
- **Actie:** Expliciete UTC dates in client-side code
- **Acceptatiecriteria:** Geen timezone-gerelateerde bugs

---

## Fase 5: Schaalbaarheid & Infrastructuur 🟢

**Doel:** Productie-ready schaalbaarheid

### 5.1 Redis Session Store
- **Probleem:** In-memory session cache onbegrensd
- **Actie:** Redis-backed session store (@upstash/redis)
- **Acceptatiecriteria:** Sessions persistent en schaalbaar

### 5.2 Database Connection Pool Monitoring
- **Probleem:** Geen pool monitoring
- **Actie:** PgBouncer setup, metrics dashboard
- **Acceptatiecriteria:** Pool usage zichtbaar in monitoring

### 5.3 Webhook Queue met Backpressure
- **Probleem:** Geen limiet op concurrent webhook processing
- **Actie:** Max 10 concurrent webhooks, circuit breaker
- **Acceptatiecriteria:** Database niet overbelast bij webhook flood

### 5.4 Error Monitoring Setup
- **Probleem:** Console logs niet gecentraliseerd
- **Actie:** Sentry of equivalent error tracking
- **Acceptatiecriteria:** Alle errors gelogd met context

### 5.5 Health Check Endpoints
- **Actie:** /health en /ready endpoints voor load balancers
- **Acceptatiecriteria:** K8s/Docker health checks werken

---

## Fase 6: Feature Completering 🔵

**Doel:** Ontbrekende business features implementeren

### 6.1 Tenant Suspension Workflow
- **Probleem:** Geen mechanisme voor tenant access revocation
- **Actie:** Soft delete + archive patterns implementeren
- **Acceptatiecriteria:** Veilige tenant offboarding mogelijk

### 6.2 Data Retention Policy
- **Probleem:** Geen data deletion workflow
- **Actie:** GDPR-compliant data retention en deletion
- **Acceptatiecriteria:** Automatische data cleanup na retention period

### 6.3 Compliance Service Tests
- **Probleem:** Compliance service heeft geen unit tests
- **Locaties:** `src/lib/services/compliance-service.ts`
- **Actie:** Test suite voor compliance logic
- **Acceptatiecriteria:** Volledige test coverage

### 6.4 Approval Rules Configuratie
- **Probleem:** Hardcoded validation rules
- **Locaties:** `src/lib/validation/approval-validation.ts`
- **Actie:** Externaliseer naar database/config per tenant
- **Acceptatiecriteria:** Tenant-specifieke goedkeuringsregels

---

## Fase 7: UI/UX Dashboard Verbeteringen 🟡

**Doel:** Dashboard visueel verbeteren met behoud van dark/light/system thema's

### Huidige Staat
- **Thema Systeem:** next-themes met light/dark/system support ✅
- **Design:** Glassmorphism met backdrop-blur effecten
- **Kleuren:** Purple (#8b5cf6) + Pink (#ec4899) accent palette
- **Responsive:** Mobile-first met bottom nav bar
- **Animaties:** Blob animations, hover effects, smooth transitions

### 7.1 Visuele Hiërarchie Verbeteren
- **Probleem:** Meerdere stat cards concurreren om aandacht, onduidelijke prioriteit
- **Locaties:** `src/app/(dashboard)/dashboard/page.tsx`
- **Actie:**
  - Primary/secondary/tertiary card levels introduceren
  - Belangrijkste metrics groter en prominenter maken
  - Minder belangrijke stats collapsible of smaller
- **Acceptatiecriteria:** Duidelijke visuele focus op kritieke informatie

### 7.2 Loading States Verbeteren
- **Probleem:** Generieke skeletons matchen niet met final layout
- **Locaties:** Dashboard widgets en data components
- **Actie:**
  - Content-aware skeleton loaders die finale layout spiegelen
  - Shimmer animatie voor betere perceived performance
  - Progressive loading met prioriteit voor above-the-fold content
- **Acceptatiecriteria:** Skeletons matchen exact met geladen content shape

### 7.3 Form Input Styling
- **Probleem:** Input velden missen duidelijke focus states en error styling
- **Locaties:** `src/app/globals.css`, form components
- **Actie:**
  - Enhanced focus ring met thema-aware kleuren
  - Animated error messages met shake effect
  - Inline validation feedback met icons
  - Consistent input styling across all forms
- **Acceptatiecriteria:** Alle forms hebben duidelijke focus/error/success states

### 7.4 Toast Notification Systeem
- **Probleem:** Success/error feedback via alerts, geen subtiele feedback
- **Actie:**
  - Toast notification component implementeren (sonner of react-hot-toast)
  - Success, error, warning, info variants
  - Thema-aware styling matching glassmorphism design
  - Auto-dismiss met progress indicator
- **Acceptatiecriteria:** Alle acties geven feedback via toast notifications

### 7.5 Empty States met Illustraties
- **Probleem:** Generieke "geen data" berichten zonder context
- **Locaties:** Timesheets, approvals, employees lists
- **Actie:**
  - Contextuele empty states per pagina
  - Minimalistische illustraties of icons
  - Actionable guidance (bijv. "Registreer je eerste uren")
  - Consistent empty state component
- **Acceptatiecriteria:** Elke lege lijst heeft helpende empty state

### 7.6 Dashboard Personalisatie
- **Probleem:** Dashboard toont alle widgets, kan overweldigend zijn
- **Actie:**
  - Smart card prioritering op basis van user role
  - Collapsible secties voor minder gebruikte widgets
  - "Customize dashboard" optie voor widget aan/uit
  - Onthoud preferences in localStorage
- **Acceptatiecriteria:** Users kunnen dashboard layout aanpassen

### 7.7 Microinteracties Toevoegen
- **Probleem:** Beperkte feedback op button states en interacties
- **Actie:**
  - Loading spinner op buttons tijdens requests
  - Success checkmark animatie na completion
  - Haptic-style visual feedback op touch
  - Subtle scale/color transitions op hover
- **Acceptatiecriteria:** Elke interactie heeft visuele feedback

### 7.8 Navigation Improvements
- **Probleem:** Multiple nav levels (top, bottom, hamburger) kunnen verwarren
- **Actie:**
  - Active state indicator verbeteren (underline/highlight)
  - Breadcrumb trail voor deep pages
  - Consistent icon usage across nav items
  - Mobile: duidelijker hamburger menu content
- **Acceptatiecriteria:** Gebruiker weet altijd waar ze zijn

### 7.9 Accessibility Verbeteringen
- **Probleem:** Glassmorphic elements kunnen contrast issues hebben
- **Actie:**
  - WCAG AAA contrast ratio voor alle tekst
  - High-contrast mode optie toevoegen
  - Focus visible states voor keyboard navigation
  - Screen reader friendly labels
  - Reduced motion preference respecteren
- **Acceptatiecriteria:** WCAG 2.1 AA compliance minimum

### 7.10 Card & Modal Consistentie
- **Probleem:** Modals lijken te veel op cards, onduidelijke hiërarchie
- **Actie:**
  - Prominentere modal backdrops met blur
  - Duidelijke modal header/footer styling
  - Consistent card border-radius en shadows
  - Z-index hiërarchie documenteren
- **Acceptatiecriteria:** Duidelijk onderscheid tussen cards en modals

---

## Implementatie Volgorde

```
Week 1-2:  Fase 1.1-1.4 (Security basics)
Week 3:    Fase 1.5-1.8 (Security completion)
Week 4:    Fase 2.1-2.3 (Quick wins tech debt)
Week 5:    Fase 2.4-2.6 + Fase 3.1-3.2 (Tech debt + priority tests)
Week 6:    Fase 3.3-3.7 (Test coverage)
Week 7:    Fase 4.1-4.3 (Performance)
Week 8:    Fase 4.4-4.6 + Fase 5.1-5.2 (Performance + infra)
Week 9:    Fase 5.3-5.5 (Infra completion)
Week 10:   Fase 6.1-6.4 (Features)
Week 11-12: Fase 7.1-7.5 (UI/UX basis - met frontend dev review)
Week 13:   Fase 7.6-7.10 (UI/UX polish)
```

---

## Success Metrics

| Metric | Huidige Staat | Doel |
|--------|---------------|------|
| Test Coverage | ~60%* | 80%+ |
| Security Issues | 8 kritiek | 0 kritiek |
| Type Safety | 10+ unsafe casts | 0 |
| API Response Time | Onbekend | <200ms p95 |
| Console Logs | 25+ | 0 in productie |
| WCAG Compliance | Onbekend | AA minimum |
| Empty States | Generiek | Contextueel |
| Toast Notifications | Geen | Alle acties |
| Theme Support | light/dark/system | Behouden + verbeterd |

*Geschat op basis van coverage gaps analyse

---

## Risico's en Mitigaties

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| NextAuth v5 breaking changes | Hoog | Auth test suite uitbreiden |
| Performance regression | Medium | Baseline metrics vastleggen |
| Migration failures | Hoog | Database backups voor elke fase |
| Feature creep | Medium | Strikte scope per fase |

---

*Roadmap gegenereerd door GSD codebase mapping analyse*
