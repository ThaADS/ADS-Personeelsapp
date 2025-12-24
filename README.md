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

ADS Personeelsapp is een uitgebreid SaaS HR-managementsysteem speciaal ontwikkeld voor Nederlandse bedrijven. Het platform biedt volledige ondersteuning voor tijdregistratie, verlofbeheer, goedkeuringsworkflows en facturatie - allemaal met strikte naleving van Nederlandse arbeidswetgeving en AVG/GDPR.

### Waarom ADS Personeelsapp?

- **Multi-tenant architectuur** - Volledige data-isolatie per organisatie
- **Nederlandse compliance** - AVG/GDPR en Arbeidstijdenwet ready
- **Modern & snel** - Next.js 15 met Turbopack voor razendsnelle ontwikkeling
- **SaaS-ready** - Stripe integratie voor subscripties en facturatie
- **Responsive design** - Perfect op desktop, tablet én mobiel
- **Light/Dark mode** - Gebruiksvriendelijke thema-schakelaar

---

## Features

### Core HR Functionaliteiten

| Feature | Beschrijving |
|---------|--------------|
| **Tijdregistratie** | GPS-gebaseerde klok-in/uit met automatische urenberekening |
| **Verlofbeheer** | Vakantie, ziekteverlof, tijd-voor-tijd aanvragen en goedkeuring |
| **Goedkeuringsworkflows** | Multi-level approval met smart validatie |
| **Medewerkerbeheer** | Uitgebreide profielen, rollen en machtigingen |
| **Rapportages** | Export naar PDF en Excel, real-time dashboards |

### Technische Highlights

| Technologie | Gebruik |
|-------------|---------|
| **Next.js 15** | App Router, Server Components, Turbopack |
| **Supabase** | PostgreSQL database met connection pooling |
| **NextAuth.js v5** | Secure JWT-based authenticatie |
| **Prisma ORM** | Type-safe database queries |
| **Stripe** | Subscriptie management en betalingen |
| **Tailwind CSS** | Utility-first styling met dark mode |

### Beveiliging & Compliance

- **Role-Based Access Control (RBAC)** - Fijnmazige toegangscontrole
- **Multi-tenant isolatie** - Strikte data-scheiding per organisatie
- **Audit logging** - Complete traceerbaarheid van alle acties
- **AVG/GDPR compliant** - Privacy by design
- **WCAG 2.1 AA** - Toegankelijkheid gewaarborgd

---

## Snelle Start

### Vereisten

- Node.js 18+
- npm of yarn
- Supabase account (of PostgreSQL database)
- Stripe account (voor betalingen)

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
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Stripe (optioneel voor betalingen)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Demo Accounts

Na het seeden van de database zijn de volgende accounts beschikbaar:

### Hoofdorganisatie (CKW)

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Admin | `admin@ckw.nl` | `Admin123!` |
| Manager | `manager@ckw.nl` | `Manager123!` |
| Medewerker | `gebruiker@ckw.nl` | `Gebruiker123!` |

### Demo Organisatie

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Admin | `admin@demo-company.nl` | `Admin123!` |
| Manager | `manager@demo-company.nl` | `Manager123!` |
| Medewerker | `gebruiker@demo-company.nl` | `Gebruiker123!` |

### Superuser

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Superuser | `superuser@ads-personeelsapp.nl` | `SuperAdmin123!` |

---

## Project Architectuur

```
src/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Beschermde dashboard routes
│   │   ├── dashboard/        # Hoofd dashboard
│   │   ├── timesheet/        # Tijdregistratie
│   │   ├── vacation/         # Verlofaanvragen
│   │   ├── sick-leave/       # Ziekmeldingen
│   │   ├── employees/        # Medewerkerbeheer
│   │   ├── approvals/        # Goedkeuringen
│   │   ├── billing/          # Facturatie
│   │   └── profile/          # Gebruikersprofiel
│   ├── admin/                # Superuser admin interface
│   ├── login/                # Authenticatie pagina's
│   ├── marketing/            # Publieke landingspagina
│   └── api/                  # API routes
├── components/               # Herbruikbare componenten
│   ├── ui/                   # Basis UI componenten
│   ├── dashboard/            # Dashboard widgets
│   ├── filters/              # Filter componenten
│   └── mobile/               # Mobiele componenten
├── lib/                      # Utilities en configuraties
│   ├── auth/                 # Authenticatie logica
│   ├── db/                   # Database utilities
│   ├── services/             # Business logic services
│   ├── stripe/               # Stripe integratie
│   └── utils/                # Helper functies
└── types/                    # TypeScript type definities
```

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
npm run test:coverage    # Test coverage rapport

# Database
npx prisma generate      # Genereer Prisma client
npx prisma db push       # Push schema naar database
npm run prisma:seed      # Seed database met demo data
```

---

## Multi-Tenant Architectuur

De applicatie is gebouwd met een robuuste multi-tenant architectuur:

```
┌─────────────────────────────────────────────────────────┐
│                    Tenant Layer                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   CKW B.V.  │  │ Demo Corp   │  │  Tenant N   │     │
│  │  (active)   │  │  (trial)    │  │   (...)     │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                 Data Isolation Layer                     │
│   - Alle queries gefilterd op tenantId                  │
│   - Geen cross-tenant data leakage mogelijk             │
├─────────────────────────────────────────────────────────┤
│                   User-Tenant Junction                   │
│   - Gebruikers kunnen bij meerdere tenants horen        │
│   - Rol per tenant configureerbaar                      │
└─────────────────────────────────────────────────────────┘
```

### Rollen Hiërarchie

```
SUPERUSER          → Volledige systeemtoegang
    ↓
TENANT_ADMIN       → Beheer van eigen organisatie
    ↓
MANAGER            → Team management, goedkeuringen
    ↓
USER               → Basisgebruiker functionaliteit
```

---

## Deployment

### Vercel (Aanbevolen)

1. Fork of import de repository in Vercel
2. Configureer environment variabelen in Vercel dashboard
3. Deploy automatisch bij elke push naar `main`

### Database Setup (Supabase)

1. Maak een nieuw Supabase project aan
2. Kopieer de connection strings:
   - `DATABASE_URL` - Pooler connection (poort 6543)
   - `DIRECT_URL` - Direct connection (poort 5432)
3. Run `npx prisma db push` om het schema te creëren
4. Run `npm run prisma:seed` voor demo data

---

## Subscriptie Plannen

| Plan | Prijs | Features |
|------|-------|----------|
| **Freemium** | Gratis | Tot 5 gebruikers, basis features |
| **Standard** | €49,95/maand | Onbeperkte gebruikers, alle features |

Stripe Checkout en Customer Portal zijn volledig geïntegreerd voor naadloze betalingsafhandeling.

---

## Documentatie

- [**CLAUDE.md**](./CLAUDE.md) - Technische project instructies
- [**Project Requirements**](./Project-requirements.md) - Gedetailleerde requirements
- [**API Documentatie**](./API-DOCUMENTATIE.md) - API referentie

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

---

## Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15, React 19, TypeScript |
| **Database** | Supabase PostgreSQL, Prisma ORM |
| **Auth** | NextAuth.js v5 |
| **Payments** | Stripe |
| **Styling** | Tailwind CSS, next-themes |
| **Testing** | Vitest, Testing Library |
| **Deployment** | Vercel |

</div>

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

**Gebouwd met ❤️ in Nederland**

</div>
