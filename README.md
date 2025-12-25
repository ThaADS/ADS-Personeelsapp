# ADS Personeelsapp

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.15-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)

**Een modern, multi-tenant HR management platform voor Nederlandse bedrijven**

[Demo](https://adspersoneelsapp.vercel.app) · [Documentatie](#-documentatie) · [Bijdragen](#-contributing)

</div>

---

## Overzicht

ADS Personeelsapp is een uitgebreid SaaS HR-managementsysteem speciaal ontwikkeld voor Nederlandse bedrijven. Het platform biedt volledige ondersteuning voor tijdregistratie, verlofbeheer, ziekmelding, goedkeuringsworkflows en facturatie - allemaal met strikte naleving van Nederlandse arbeidswetgeving (Arbeidstijdenwet, Wet Verbetering Poortwachter) en AVG/GDPR.

### Waarom ADS Personeelsapp?

- **Multi-tenant architectuur** - Volledige data-isolatie per organisatie
- **Nederlandse compliance** - AVG/GDPR, Arbeidstijdenwet en UWV-regelgeving ready
- **Modern & snel** - Next.js 15 met Turbopack voor razendsnelle ontwikkeling
- **SaaS-ready** - Stripe integratie voor subscripties en facturatie
- **Responsive design** - Perfect op desktop, tablet en mobiel met dedicated mobile UI
- **Light/Dark mode** - Gebruiksvriendelijke thema-schakelaar
- **Automatische herinneringen** - Vercel Cron jobs voor weekstaat, verlof en UWV deadlines

---

## Features

### Tijdregistratie

| Feature | Beschrijving |
|---------|--------------|
| **GPS-verificatie** | Automatische locatieregistratie bij in- en uitklokken |
| **Snelle klok-in/uit** | One-click registratie vanaf het dashboard |
| **Handmatige invoer** | Flexibele urenregistratie voor thuiswerken of correcties |
| **Pauze tracking** | Automatische en handmatige pauzeregistratie |
| **Weekstaat overzicht** | Wekelijks overzicht met totalen en status |
| **Export functionaliteit** | PDF en Excel export van urenregistraties |
| **Automatische herinneringen** | Cron jobs voor weekstaat indienen (vrijdag 15:00 + maandag 08:00) |

### Verlofbeheer

| Feature | Beschrijving |
|---------|--------------|
| **Verlofaanvragen** | Eenvoudig vakantie aanvragen met datumpicker |
| **Verlofsaldo realtime** | Direct inzicht in beschikbare dagen |
| **Wettelijke en bovenwettelijke dagen** | Aparte tracking conform Nederlandse wetgeving |
| **Tijd-voor-tijd (TVT)** | Compensatieuren registratie en opname |
| **Expiratie waarschuwingen** | Automatische alerts voor verlopend verlof (3 maanden vooruit) |
| **Goedkeuringsworkflow** | Manager approval met notificaties |

### Ziekmeldingen

| Feature | Beschrijving |
|---------|--------------|
| **Ziekmelding registratie** | Snelle ziekmelding vanaf dashboard of mobiel |
| **Herstelmelding** | Eenvoudig hersteld melden met einddatum |
| **UWV Poortwachter compliance** | 42-dagen deadline monitoring |
| **UWV alerts** | Automatische dagelijkse checks voor naderende UWV deadlines |
| **Manager notificaties** | Real-time alerts bij nieuwe ziekmeldingen |
| **Verzuimoverzicht** | Historisch overzicht per medewerker |

### Goedkeuringsworkflows

| Feature | Beschrijving |
|---------|--------------|
| **Multi-level approval** | Hiërarchische goedkeuringsketen |
| **Bulk goedkeuring** | Meerdere items tegelijk goedkeuren |
| **Afwijzen met reden** | Verplichte toelichting bij afwijzing |
| **Audit trail** | Complete logging van alle goedkeuringsacties |
| **Manager herinneringen** | Automatische dagelijkse reminders (ma-vr 08:00) |
| **Smart validatie** | Automatische controle op conflicten en overlapping |

### Dashboard & Rapportages

| Feature | Beschrijving |
|---------|--------------|
| **Realtime KPI's** | Uren, overuren, goedkeuringen, verlof, ziek |
| **Manager dashboard** | Team statistieken en pending approvals |
| **UWV alert widget** | Direct zicht op naderende deadlines |
| **Verlof expiratie widget** | Waarschuwingen voor verlopend verlof |
| **Quick actions** | Snelkoppelingen voor veelgebruikte taken |
| **Recente activiteit** | Overzicht van laatste wijzigingen |

### Medewerkerbeheer

| Feature | Beschrijving |
|---------|--------------|
| **Uitgebreide profielen** | Persoons- en contactgegevens |
| **Rol en machtigingen** | Flexibele RBAC per gebruiker |
| **Contract informatie** | Arbeidsvoorwaarden en uren per week |
| **Notificatie voorkeuren** | Per-gebruiker opt-in/out voor meldingen |
| **Multi-tenant** | Gebruikers kunnen bij meerdere organisaties horen |

### Mobiele Ervaring

| Feature | Beschrijving |
|---------|--------------|
| **Responsive design** | Geoptimaliseerd voor alle schermformaten |
| **Bottom navigation** | Snelle toegang tot hoofdfuncties |
| **Hamburger menu** | Volledige navigatie in dropdown |
| **Touch-friendly** | Grote knoppen en touch targets (44px minimum) |
| **Dark mode** | Volledig ondersteund op mobiel |
| **Glassmorphism UI** | Modern semi-transparant design |

### Automatische Notificaties (Cron Jobs)

| Schedule | Endpoint | Functie |
|----------|----------|---------|
| Vrijdag 15:00 UTC | `/api/cron/timesheet-reminder` | Weekstaat herinnering |
| Maandag 08:00 UTC | `/api/cron/timesheet-reminder` | Weekstaat escalatie |
| Maandag 09:00 UTC | `/api/cron/leave-expiration` | Verlof expiratie check |
| Dagelijks 08:00 UTC | `/api/cron/uwv-alerts` | UWV deadline monitoring |
| Ma-Vr 08:00 UTC | `/api/cron/approval-reminders` | Manager goedkeur-reminders |

### Beveiliging & Compliance

| Feature | Beschrijving |
|---------|--------------|
| **Role-Based Access Control** | Fijnmazige toegangscontrole (SUPERUSER, TENANT_ADMIN, MANAGER, USER) |
| **Multi-tenant isolatie** | Strikte data-scheiding per organisatie |
| **Audit logging** | Complete traceerbaarheid van alle acties |
| **AVG/GDPR compliant** | Privacy by design, recht op vergetelheid |
| **Wachtwoord reset** | Secure token-based reset met email |
| **Rate limiting** | Bescherming tegen brute-force aanvallen |
| **CRON_SECRET** | Beveiligde cron endpoints |
| **WCAG 2.1 AA** | Toegankelijkheid gewaarborgd |

---

## Technische Architectuur

### Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript 5 |
| **Database** | Supabase PostgreSQL, Prisma ORM 6.15 |
| **Auth** | NextAuth.js v5 met JWT tokens |
| **Payments** | Stripe Checkout & Customer Portal |
| **Styling** | Tailwind CSS 4, next-themes |
| **Email** | Nodemailer met SMTP |
| **Testing** | Vitest, Testing Library, jsdom |
| **Deployment** | Vercel met Cron Jobs |

### Database Schema

```
User              → Globale gebruikersaccounts
Tenant            → Organisatie/bedrijf data
TenantUser        → Many-to-many junction met rol en status
Timesheet         → GPS-enabled urenregistratie
Vacation          → Verlofaanvragen met goedkeuringsstatus
SickLeave         → Ziekmeldingen met UWV tracking
LeaveBalance      → Verlofsaldi per jaar met expiratie
Notification      → In-app notificaties per gebruiker
Subscription      → Stripe subscriptie management
AuditLog          → Compliance audit trail
```

### Project Structuur

```
src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Beschermde dashboard routes
│   │   ├── dashboard/        # Hoofd dashboard met KPI's
│   │   ├── timesheet/        # Tijdregistratie
│   │   ├── vacation/         # Verlofaanvragen
│   │   ├── sick-leave/       # Ziekmeldingen
│   │   ├── employees/        # Medewerkerbeheer
│   │   ├── approvals/        # Goedkeuringen
│   │   ├── billing/          # Facturatie & Stripe
│   │   ├── profile/          # Gebruikersprofiel
│   │   └── settings/         # Organisatie instellingen
│   ├── admin/                # Superuser admin interface
│   ├── api/                  # API routes
│   │   ├── cron/             # Vercel Cron endpoints
│   │   │   ├── timesheet-reminder/
│   │   │   ├── leave-expiration/
│   │   │   ├── uwv-alerts/
│   │   │   └── approval-reminders/
│   │   ├── dashboard/stats/  # Dashboard KPI API
│   │   ├── timesheets/       # Timesheet CRUD
│   │   ├── vacations/        # Vacation CRUD
│   │   ├── sick-leaves/      # Sick leave CRUD
│   │   └── exports/          # PDF/Excel export
│   ├── login/                # Authenticatie
│   ├── forgot-password/      # Wachtwoord vergeten
│   ├── reset-password/       # Wachtwoord reset
│   └── marketing/            # Publieke landingspagina
├── components/
│   ├── dashboard/            # QuickClockIn, VacationBalance
│   ├── mobile/               # Mobiele componenten
│   ├── ui/                   # ThemeToggle, etc.
│   ├── filters/              # Filter componenten
│   └── providers/            # Session, Theme, Locale
├── lib/
│   ├── auth/                 # NextAuth config, password-reset
│   ├── services/             # Business logic
│   │   ├── email-service.ts
│   │   ├── timesheet-reminder.ts
│   │   ├── leave-expiration-reminder.ts
│   │   ├── uwv-alert-service.ts
│   │   └── approval-reminder-service.ts
│   ├── stripe/               # Stripe integratie
│   └── prisma.ts             # Prisma client
└── types/                    # TypeScript definities
```

---

## Snelle Start

### Vereisten

- Node.js 18+
- npm of yarn
- Supabase account (of PostgreSQL database)
- Stripe account (voor betalingen)
- SMTP server (voor email notificaties)

### Installatie

```bash
# Clone de repository
git clone https://github.com/ThaADS/ADS-Personeelsapp.git
cd ADS-Personeelsapp

# Installeer dependencies
npm install

# Kopieer environment template
cp .env.example .env.local

# Genereer Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed de database met demo data
npm run prisma:seed

# Start development server
npm run dev
```

De applicatie is nu beschikbaar op `http://localhost:3000`

### Environment Variabelen

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Stripe (betalingen)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STANDARD_PRICE_ID="price_..."

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="ADS Personeelsapp <noreply@example.com>"

# Cron Security
CRON_SECRET="your-cron-secret-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Demo Accounts

Na het seeden van de database zijn de volgende accounts beschikbaar:

### Superuser (Volledige systeemtoegang)

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Superuser | `superuser@ads-personeelsapp.nl` | `SuperAdmin123!` |

### Demo Organisatie

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Admin | `admin@demo-company.nl` | `Admin123!` |
| Manager | `manager@demo-company.nl` | `Manager123!` |
| Medewerker | `gebruiker@demo-company.nl` | `Gebruiker123!` |

### CKW Organisatie

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Admin | `admin@ckw.nl` | `Admin123!` |
| Manager | `manager@ckw.nl` | `Manager123!` |
| Medewerker | `gebruiker@ckw.nl` | `Gebruiker123!` |

---

## Scripts

```bash
# Development
npm run dev              # Start dev server met Turbopack
npm run build            # Build voor productie
npm run start            # Start productie server
npm run lint             # ESLint code linting

# Testing
npm test                 # Tests in watch mode
npm run test:run         # Eenmalige test run
npm run test:ui          # Visual test interface
npm run test:coverage    # Test coverage rapport

# Database
npx prisma generate      # Genereer Prisma client
npx prisma db push       # Push schema naar database
npx prisma db pull       # Pull schema van database
npm run prisma:seed      # Seed database met demo data
npx prisma studio        # Open Prisma Studio GUI
```

---

## Multi-Tenant Architectuur

```
┌─────────────────────────────────────────────────────────┐
│                    Tenant Layer                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   CKW B.V.  │  │ Demo Corp   │  │  Tenant N   │     │
│  │  (standard) │  │  (freemium) │  │   (trial)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                 Data Isolation Layer                     │
│   - Alle queries gefilterd op tenantId                  │
│   - Geen cross-tenant data leakage mogelijk             │
│   - Audit logging per tenant                            │
├─────────────────────────────────────────────────────────┤
│                   User-Tenant Junction                   │
│   - Gebruikers kunnen bij meerdere tenants horen        │
│   - Rol per tenant configureerbaar                      │
│   - Notification preferences per tenant                  │
└─────────────────────────────────────────────────────────┘
```

### Rollen Hiërarchie

```
SUPERUSER          → Volledige systeemtoegang, alle tenants
    ↓
TENANT_ADMIN       → Beheer van eigen organisatie, billing, settings
    ↓
MANAGER            → Team management, goedkeuringen, rapportages
    ↓
USER               → Eigen registraties, aanvragen, profiel
```

---

## Deployment

### Vercel (Aanbevolen)

1. Fork of import de repository in Vercel
2. Configureer environment variabelen in Vercel dashboard
3. Deploy automatisch bij elke push naar `main`
4. Cron jobs worden automatisch geconfigureerd via `vercel.json`

### Database Setup (Supabase)

1. Maak een nieuw Supabase project aan
2. Kopieer de connection strings:
   - `DATABASE_URL` - Pooler connection (poort 6543, met `?pgbouncer=true`)
   - `DIRECT_URL` - Direct connection (poort 5432)
3. Run `npx prisma db push` om het schema te creëren
4. Run `npm run prisma:seed` voor demo data

### Cron Jobs Configuratie

De cron jobs zijn geconfigureerd in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/timesheet-reminder", "schedule": "0 15 * * 5" },
    { "path": "/api/cron/timesheet-reminder", "schedule": "0 8 * * 1" },
    { "path": "/api/cron/leave-expiration", "schedule": "0 9 * * 1" },
    { "path": "/api/cron/uwv-alerts", "schedule": "0 8 * * *" },
    { "path": "/api/cron/approval-reminders", "schedule": "0 8 * * 1-5" }
  ]
}
```

Zorg dat `CRON_SECRET` is ingesteld in je environment variabelen.

---

## Subscriptie Plannen

| Plan | Prijs | Features |
|------|-------|----------|
| **Freemium** | Gratis | Tot 5 gebruikers, basis features |
| **Standard** | €49,95/maand | Onbeperkte gebruikers, alle features, prioriteit support |

Stripe Checkout en Customer Portal zijn volledig geïntegreerd voor naadloze betalingsafhandeling.

---

## API Endpoints

### Dashboard

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/dashboard/stats` | Dashboard KPI's (role-aware) |

### Timesheets

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/timesheets` | Lijst met timesheets |
| POST | `/api/timesheets` | Nieuwe timesheet aanmaken |
| PATCH | `/api/timesheets/[id]` | Timesheet bijwerken (uitklokken) |

### Vacations

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/vacations` | Lijst met verlofaanvragen |
| POST | `/api/vacations` | Nieuwe verlofaanvraag |
| PATCH | `/api/vacations/[id]` | Status bijwerken (goedkeuren/afwijzen) |

### Sick Leaves

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/sick-leaves` | Lijst met ziekmeldingen |
| POST | `/api/sick-leaves` | Nieuwe ziekmelding |
| PATCH | `/api/sick-leaves/[id]` | Herstelmelding of UWV status |

### Exports

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/exports/timesheets` | CSV export |
| GET | `/api/exports/timesheets.pdf` | PDF export |
| GET | `/api/exports/timesheets.xlsx` | Excel export |

### Cron (Beveiligd met CRON_SECRET)

| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/cron/timesheet-reminder` | Weekstaat herinneringen |
| GET | `/api/cron/leave-expiration` | Verlof expiratie checks |
| GET | `/api/cron/uwv-alerts` | UWV deadline monitoring |
| GET | `/api/cron/approval-reminders` | Manager goedkeur-reminders |

---

## Documentatie

- [**CLAUDE.md**](./CLAUDE.md) - Technische project instructies voor Claude Code
- [**Project Requirements**](./Project-requirements.md) - Gedetailleerde requirements
- [**API Documentatie**](./API-DOCUMENTATIE.md) - Volledige API referentie

---

## Contributing

Bijdragen zijn welkom! Volg deze stappen:

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je wijzigingen (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

### Code Standaarden

- TypeScript strict mode
- ESLint configuratie volgen
- Tailwind CSS voor styling
- Commit messages in Engels
- Test coverage minimaal 80%

---

## License

Dit project is eigendom van ADS en is niet publiek beschikbaar voor commercieel gebruik.

---

## Support

Voor vragen of ondersteuning:

- **GitHub Issues**: [Open een issue](https://github.com/ThaADS/ADS-Personeelsapp/issues)
- **Email**: support@ads-personeelsapp.nl

---

<div align="center">

**Gebouwd met liefde in Nederland**

*Versie 2.0 - December 2025*

</div>
