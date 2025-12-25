# ADS Personeelsapp - Development Roadmap

> **Laatst bijgewerkt**: 2025-12-25
> **Status**: Actief in ontwikkeling
> **Versie**: 2.1.0

---

## Overzicht Voortgang

| Fase | Status | Voortgang |
|------|--------|-----------|
| Fase 1: Kritieke fixes | ✅ Voltooid | 100% |
| Fase 2: Should-Have Features | 🔄 In uitvoering | 0% |
| Fase 3: Marketing Pagina's | ⏳ Wachtend | 0% |
| Fase 4: Nice-to-Have Features | ⏳ Gepland | 0% |

---

## Fase 1: Kritieke Fixes ✅ VOLTOOID

### 1.1 Uitklok Bug Fix
- **Status**: ✅ Voltooid
- **Bestand**: `src/app/api/timesheets/[id]/route.ts`
- **Beschrijving**: PATCH endpoint toegevoegd voor timesheet updates
- **Multi-tenant**: ✅ Tenant isolatie geïmplementeerd
- **Beveiliging**: ✅ Gebruiker kan alleen eigen timesheets updaten

### 1.2 Automatische Herinneringen
- **Status**: ✅ Voltooid
- **Bestanden**:
  - `src/lib/services/timesheet-reminder.ts`
  - `src/app/api/cron/timesheet-reminder/route.ts`
  - `vercel.json`
- **Schema**: Vrijdag 15:00 + Maandag 09:00 (CET)
- **Multi-tenant**: ✅ Per tenant verwerkt
- **Beveiliging**: ✅ CRON_SECRET verificatie

### 1.3 Maandelijkse Rapportages
- **Status**: ✅ Voltooid
- **Bestanden**:
  - `src/lib/services/report-builder.ts`
  - `src/app/api/cron/monthly-reports/route.ts`
  - `src/app/api/reports/settings/route.ts`
- **Features**: PDF generatie, CC/BCC, configureerbaar per tenant
- **Multi-tenant**: ✅ Tenant-specifieke rapporten
- **Beveiliging**: ✅ Alleen admins kunnen settings wijzigen

### 1.4 Mobiele Navigatie
- **Status**: ✅ Voltooid
- **Bestand**: `src/components/marketing/Header.tsx`
- **Features**: Hamburger menu, responsive design

---

## Fase 2: Should-Have Features 🔄 IN UITVOERING

### 2.1 Dashboard KPI's Uitbreiden
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog
- **Geschatte tijd**: 4 uur
- **Multi-tenant vereisten**:
  - [ ] KPI's gefilterd per tenant
  - [ ] Manager ziet team KPI's
  - [ ] Admin ziet tenant-brede KPI's
- **Beveiliging**:
  - [ ] Role-based data access
  - [ ] Geen cross-tenant data lekkage
- **Nieuwe metrics**:
  - [ ] Gemiddelde werktijd per week
  - [ ] Verzuimpercentage
  - [ ] Goedkeuringssnelheid
  - [ ] Overtijd tracking
  - [ ] Verlofopname percentage
  - [ ] Team productiviteit

### 2.2 Verlof-expiratie Waarschuwingen
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog
- **Geschatte tijd**: 3 uur
- **Bestanden te maken/wijzigen**:
  - [ ] `src/lib/services/leave-expiration-service.ts`
  - [ ] `src/app/api/cron/leave-expiration/route.ts`
  - [ ] `vercel.json` - cron schedule toevoegen
- **Multi-tenant vereisten**:
  - [ ] Per tenant verlofjaar configuratie
  - [ ] Tenant-specifieke expiratie regels
- **Beveiliging**:
  - [ ] CRON_SECRET verificatie
  - [ ] Audit logging van verstuurde waarschuwingen
- **Functionaliteit**:
  - [ ] 30 dagen voor expiratie: eerste waarschuwing
  - [ ] 14 dagen voor expiratie: urgente waarschuwing
  - [ ] 7 dagen voor expiratie: laatste herinnering
  - [ ] Email + in-app notificatie

### 2.3 UWV-drempel Alerts (6 weken ziekte)
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog
- **Geschatte tijd**: 4 uur
- **Bestanden te maken/wijzigen**:
  - [ ] `src/lib/services/sick-leave-alerts.ts`
  - [ ] `src/app/api/cron/sick-leave-alerts/route.ts`
  - [ ] Database: UWV compliance tracking velden
- **Multi-tenant vereisten**:
  - [ ] Tenant-specifieke UWV instellingen
  - [ ] Bedrijfsarts contact per tenant
- **Beveiliging**:
  - [ ] Gevoelige medische data encryptie
  - [ ] Strikte toegangscontrole (HR/Admin only)
  - [ ] Audit trail voor alle UWV-gerelateerde acties
- **Functionaliteit**:
  - [ ] Automatische alert bij 4 weken (voorwaarschuwing)
  - [ ] Automatische alert bij 6 weken (UWV deadline)
  - [ ] Manager + HR notificatie
  - [ ] Compliance dashboard voor HR

### 2.4 Wachtwoord Reset Flow
- **Status**: ⏳ Te doen
- **Prioriteit**: Kritiek
- **Geschatte tijd**: 3 uur
- **Bestanden te maken/wijzigen**:
  - [ ] `src/app/api/auth/forgot-password/route.ts`
  - [ ] `src/app/api/auth/reset-password/route.ts`
  - [ ] `src/app/(auth)/forgot-password/page.tsx`
  - [ ] `src/app/(auth)/reset-password/page.tsx`
  - [ ] Email template voor reset link
- **Multi-tenant vereisten**:
  - [ ] Reset tokens gekoppeld aan tenant
  - [ ] Tenant-branded reset emails
- **Beveiliging**:
  - [ ] Cryptografisch veilige reset tokens
  - [ ] Token expiratie (1 uur)
  - [ ] Rate limiting (max 3 requests per uur)
  - [ ] IP logging
  - [ ] Audit logging

### 2.5 Twee-Factor Authenticatie (2FA)
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog
- **Geschatte tijd**: 6 uur
- **Bestanden te maken/wijzigen**:
  - [ ] `src/lib/auth/two-factor.ts`
  - [ ] `src/app/api/auth/2fa/setup/route.ts`
  - [ ] `src/app/api/auth/2fa/verify/route.ts`
  - [ ] `src/app/api/auth/2fa/disable/route.ts`
  - [ ] `src/components/auth/TwoFactorSetup.tsx`
  - [ ] Database: 2FA secret en backup codes velden
- **Multi-tenant vereisten**:
  - [ ] 2FA verplicht/optioneel per tenant configureerbaar
  - [ ] Tenant policy enforcement
- **Beveiliging**:
  - [ ] TOTP (Time-based One-Time Password) met speakeasy
  - [ ] Backup codes (10 stuks, eenmalig gebruik)
  - [ ] Secure secret storage (encrypted)
  - [ ] Brute force protection
- **Functionaliteit**:
  - [ ] QR code setup flow
  - [ ] Backup codes generatie
  - [ ] 2FA verificatie bij login
  - [ ] 2FA disable met wachtwoord bevestiging

### 2.6 SSO Integratie
- **Status**: ⏳ Roadmap
- **Prioriteit**: Medium
- **Geschatte tijd**: 8 uur
- **Bestanden te maken/wijzigen**:
  - [ ] `src/lib/auth/sso-providers.ts`
  - [ ] NextAuth provider configuratie uitbreiden
  - [ ] Database: SSO provider velden per tenant
- **Multi-tenant vereisten**:
  - [ ] SSO provider per tenant configureerbaar
  - [ ] Azure AD / Google Workspace support
  - [ ] SAML 2.0 ondersteuning
- **Beveiliging**:
  - [ ] OAuth 2.0 / OIDC compliant
  - [ ] Token validation
  - [ ] Account linking beveiliging
- **Providers te ondersteunen**:
  - [ ] Microsoft Azure AD
  - [ ] Google Workspace
  - [ ] SAML 2.0 (generic)

### 2.7 Mobiele PWA + Offline
- **Status**: ⏳ Roadmap
- **Prioriteit**: Medium
- **Geschatte tijd**: 12 uur
- **Bestanden te maken/wijzigen**:
  - [ ] `public/manifest.json`
  - [ ] `public/sw.js` (Service Worker)
  - [ ] `src/lib/offline/sync-manager.ts`
  - [ ] IndexedDB wrapper voor offline data
- **Multi-tenant vereisten**:
  - [ ] Tenant-specifieke PWA branding
  - [ ] Offline data alleen eigen tenant
- **Beveiliging**:
  - [ ] Encrypted offline storage
  - [ ] Secure sync protocol
  - [ ] Auto-logout na X dagen offline
- **Functionaliteit**:
  - [ ] Offline timesheet invoer
  - [ ] Background sync bij connectie
  - [ ] Push notifications
  - [ ] App install prompt

---

## Fase 3: Marketing Pagina's ⏳ WACHTEND

### 3.1 Features Pagina Verbeteren
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog voor lancering
- **Geschatte tijd**: 2 uur
- **Bestand**: `src/app/marketing/features/page.tsx`
- **Content toe te voegen**:
  - [ ] Gedetailleerde feature beschrijvingen
  - [ ] Screenshots/mockups
  - [ ] Vergelijkingstabel met concurrenten
  - [ ] Demo video embed

### 3.2 FAQ Pagina
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog voor lancering
- **Geschatte tijd**: 2 uur
- **Bestand**: `src/app/marketing/faq/page.tsx`
- **Secties toe te voegen**:
  - [ ] Algemene vragen
  - [ ] Prijzen & abonnementen
  - [ ] Beveiliging & privacy
  - [ ] Technische vragen
  - [ ] Support & contact

### 3.3 Security Pagina
- **Status**: ⏳ Te doen
- **Prioriteit**: Kritiek voor lancering
- **Geschatte tijd**: 3 uur
- **Bestand**: `src/app/marketing/security/page.tsx`
- **Content toe te voegen**:
  - [ ] Data encryptie uitleg
  - [ ] Multi-tenant isolatie uitleg
  - [ ] GDPR/AVG compliance
  - [ ] Backup & recovery
  - [ ] Penetration testing resultaten
  - [ ] ISO certificeringen (indien van toepassing)
  - [ ] SOC 2 compliance status

### 3.4 Contact Formulier
- **Status**: ⏳ Te doen
- **Prioriteit**: Hoog voor lancering
- **Geschatte tijd**: 2 uur
- **Bestanden te maken**:
  - [ ] `src/app/marketing/contact/page.tsx`
  - [ ] `src/app/api/contact/route.ts`
- **Beveiliging**:
  - [ ] CAPTCHA/reCAPTCHA integratie
  - [ ] Rate limiting
  - [ ] Input sanitization

---

## Fase 4: Nice-to-Have Features ⏳ GEPLAND

### 4.1 Tijd-voor-Tijd (TVT) Saldo Uitbreiding
- **Status**: ⏳ Gepland
- **Prioriteit**: Medium
- **Geschatte tijd**: 6 uur
- **Multi-tenant**: Per tenant TVT beleid configureerbaar
- **Functionaliteit**:
  - [ ] TVT saldo tracking
  - [ ] TVT opname aanvragen
  - [ ] Automatische TVT berekening bij overwerk
  - [ ] TVT expiratie regels

### 4.2 Projecturen Toewijzing
- **Status**: ⏳ Gepland
- **Prioriteit**: Medium
- **Geschatte tijd**: 10 uur
- **Database wijzigingen**:
  - [ ] Project model toevoegen
  - [ ] ProjectAssignment model
  - [ ] Timesheet-Project relatie
- **Multi-tenant**: Projecten per tenant geïsoleerd
- **Functionaliteit**:
  - [ ] Project aanmaken/beheren
  - [ ] Uren aan projecten toewijzen
  - [ ] Project rapportages
  - [ ] Budget tracking per project

### 4.3 Slack/Teams Integratie
- **Status**: ⏳ Gepland
- **Prioriteit**: Laag
- **Geschatte tijd**: 8 uur
- **Multi-tenant**: Webhook URLs per tenant
- **Functionaliteit**:
  - [ ] Notificaties naar Slack/Teams
  - [ ] Slash commands voor quick actions
  - [ ] Status updates

### 4.4 Biometrische Authenticatie
- **Status**: ⏳ Gepland
- **Prioriteit**: Laag
- **Geschatte tijd**: 6 uur
- **Technologie**: WebAuthn API
- **Multi-tenant**: Per tenant in/uitschakelen
- **Functionaliteit**:
  - [ ] Fingerprint login
  - [ ] Face ID login
  - [ ] Hardware security keys

### 4.5 Real-time Dashboard Updates
- **Status**: ⏳ Gepland
- **Prioriteit**: Laag
- **Geschatte tijd**: 8 uur
- **Technologie**: Server-Sent Events of WebSocket
- **Multi-tenant**: Events gefilterd per tenant
- **Functionaliteit**:
  - [ ] Live timesheet updates
  - [ ] Real-time goedkeuring notificaties
  - [ ] Dashboard auto-refresh

### 4.6 CAO Integratie
- **Status**: ⏳ Fase 2+
- **Prioriteit**: Laag
- **Geschatte tijd**: 20+ uur
- **Complexiteit**: Zeer hoog
- **Overwegingen**:
  - Verschillende CAO's per branche
  - Complexe regels en berekeningen
  - Jaarlijkse updates nodig

---

## Beveiligingsrichtlijnen (Alle Features)

### Multi-Tenant Isolatie
Elke nieuwe feature MOET:
1. `tenantId` filter in alle database queries
2. Tenant context validatie in API routes
3. Geen cross-tenant data toegang mogelijk
4. Audit logging voor gevoelige operaties

### API Beveiliging
Elke nieuwe API route MOET:
1. `getTenantContext()` aanroepen
2. Role-based access control implementeren
3. Input validatie met Zod
4. Error handling zonder gevoelige data lekkage

### Data Beveiliging
Gevoelige data MOET:
1. Encrypted at rest (database level)
2. Encrypted in transit (HTTPS)
3. Toegang gelogd in audit trail
4. Minimale data retentie

---

## Changelog

### 2025-12-25
- [x] Roadmap document aangemaakt
- [x] Fase 1 items als voltooid gemarkeerd
- [x] Fase 2-4 gepland met details

---

## Volgende Stappen

1. **Nu**: Start met Fase 2.4 (Wachtwoord Reset) - kritiek voor gebruikers
2. **Daarna**: Fase 2.1 (Dashboard KPI's) - verbetert gebruikerservaring
3. **Parallel**: Fase 3 Marketing pagina's - nodig voor lancering

---

> **Opmerking**: Dit document wordt actief bijgehouden. Check regelmatig voor updates.
