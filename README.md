<p align="center">
  <img src="https://img.shields.io/badge/ADSPersoneelapp-Enterprise%20HR-7C3AED?style=for-the-badge&labelColor=1e1b4b" alt="ADSPersoneelapp">
</p>

<h1 align="center">
  <br>
  ADSPersoneelapp
  <br>
</h1>

<h4 align="center">Enterprise-grade Multi-tenant HR Management Platform voor Nederlandse Organisaties</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-6.15-2D3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe" alt="Stripe">
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/i18n-NL%20|%20EN%20|%20DE%20|%20PL-4A90D9?style=flat-square" alt="Multi-language">
</p>

<p align="center">
  <a href="#-kernfuncties">Kernfuncties</a> •
  <a href="#-declaratiebeheer">Declaraties</a> •
  <a href="#-fleet-tracking-integratie">Fleet Tracking</a> •
  <a href="#-nmbrs-payroll-integratie">Nmbrs</a> •
  <a href="#-multi-language-ondersteuning">i18n</a> •
  <a href="#-architectuur">Architectuur</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AVG%2FGDPR-Compliant-00C853?style=flat-square" alt="GDPR">
  <img src="https://img.shields.io/badge/UWV%20Poortwachter-Ready-00C853?style=flat-square" alt="UWV">
  <img src="https://img.shields.io/badge/Arbeidstijdenwet-Conform-00C853?style=flat-square" alt="ATW">
  <img src="https://img.shields.io/badge/AES--256-Encrypted-00C853?style=flat-square" alt="Encryption">
</p>

---

## Wat is ADSPersoneelapp?

ADSPersoneelapp is een volledig uitgerust **enterprise HR management platform** gebouwd voor Nederlandse organisaties. Het systeem combineert moderne technologie met strikte naleving van Nederlandse arbeidswetgeving en biedt een complete oplossing voor:

- **Tijdregistratie** met GPS-verificatie en automatische validatie
- **Verlofbeheer** met wettelijke en bovenwettelijke dagen tracking
- **Ziekmeldingen** met UWV Poortwachter compliance en 42-dagen monitoring
- **Declaratiebeheer** met kilometervergoeding en onkosten workflow
- **Fleet tracking integratie** met automatische rit-koppeling aan urenregistraties
- **Nmbrs payroll integratie** voor naadloze salarisverwerking
- **Multi-language ondersteuning** voor NL, EN, DE en PL
- **Multi-tenant architectuur** met volledige data-isolatie per organisatie
- **SaaS billing** via Stripe met freemium en betaalde plannen

---

## Kernfuncties

### Dashboard & Analytics

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                    [👤 Admin] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   152.5 uur  │  │   12.5 uur   │  │    8 dagen   │  │   3 actief   │ │
│  │  Deze maand  │  │   Overwerk   │  │  Verlof rest │  │    Zieken    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                         │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  📊 Manager KPI's              │  │  ⚠️ UWV Alerts                 │ │
│  │  ────────────────────          │  │  ────────────────────          │ │
│  │  • Team leden: 24              │  │  🔴 KRITIEK: Jan (1 dag)       │ │
│  │  • Pending approvals: 7        │  │  🟡 URGENT: Piet (5 dagen)     │ │
│  │  • Team verzuim: 2             │  │  🟢 WARNING: Kees (12 dagen)   │ │
│  └────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                         │
│  ┌────────────────────────────────┐  ┌────────────────────────────────┐ │
│  │  🚗 Laatste Ritten             │  │  🏖️ Verlopend Verlof           │ │
│  │  ────────────────────          │  │  ────────────────────          │ │
│  │  Amsterdam → Rotterdam  42km   │  │  • 5 wettelijke dagen          │ │
│  │  Rotterdam → Utrecht    58km   │  │    vervallen op 01-07-2026     │ │
│  └────────────────────────────────┘  └────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

| Feature | Beschrijving |
|---------|--------------|
| **Realtime KPI's** | Persoonlijke statistieken: uren, overwerk, goedkeuringen, verlof, ziek |
| **Manager View** | Team statistieken, pending approvals, team verzuim, UWV alerts |
| **Extended KPI's** | Aankomende vakanties, pending requests, actieve ziekmeldingen |
| **Quick Clock-In Widget** | Eén-klik in/uitklokken met GPS-locatie |
| **Vacation Balance Widget** | Realtime verlofsaldo met categorieën |
| **Trips Widget** | Fleet tracking integratie met laatste ritten |
| **UWV Alert Widget** | Kritieke deadline monitoring voor zieke medewerkers |
| **Leave Expiration Widget** | Waarschuwingen voor verlopend verlof |

---

### Tijdregistratie

| Feature | Beschrijving |
|---------|--------------|
| **GPS-Verificatie** | Automatische locatie capture bij in/uitklokken voor nauwkeurige verificatie |
| **Flexibele Invoer** | Handmatige invoer met datum, start/eind tijd, pauze en beschrijving |
| **Smart Validatie** | Automatische berekening van werkuren (total_hours in decimaal formaat) |
| **Status Workflow** | Pending → Approved/Rejected met volledige audit trail |
| **Mobile-First** | Card view op mobiel, table view op desktop met responsive breakpoints |
| **Filtering** | Datum range filter, status filter, paginatie (10 items/pagina) |
| **Export** | PDF en Excel export met professionele opmaak |
| **Automatische Herinneringen** | Cron jobs: vrijdag 15:00 en maandag 09:00 CET |

**GPS Data Model:**
```typescript
interface Timesheet {
  start_time: DateTime
  end_time?: DateTime
  start_latitude?: Float
  start_longitude?: Float
  end_latitude?: Float
  end_longitude?: Float
  start_location?: String  // Geocoded address
  end_location?: String    // Geocoded address
  total_hours?: Float
  break_minutes: Int
  description?: String
  status: PENDING | APPROVED | REJECTED
}
```

---

### Verlofbeheer

| Verloftype | Beschrijving | Standaard | Expiratie |
|------------|--------------|-----------|-----------|
| **Wettelijk Verlof** | Statutory leave conform CAO | 20 dagen/jaar | 1 juli volgend jaar |
| **Bovenwettelijk Verlof** | Extra leave boven minimum | 5 dagen/jaar | 5 jaar na opbouw |
| **Compensatie-uren (TVT)** | Tijd-voor-tijd opbouw | Variabel | Eind kalenderjaar |
| **Bijzonder Verlof** | Special leave (huwelijk, rouw) | Per situatie | N.v.t. |
| **Onbetaald Verlof** | Unbezoldigd verlof | Onbeperkt | N.v.t. |

**Verlofbalans Tracking:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  VERLOFSALDO 2025                                         [Jan Jansen]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🏖️ Wettelijk Verlof                                                │
│  ████████████████████░░░░░░░░░░░░░  15/20 dagen (75%)              │
│  ⚠️ Vervalt op: 1 juli 2026                                        │
│                                                                     │
│  ➕ Bovenwettelijk Verlof                                           │
│  ██████████░░░░░░░░░░░░░░░░░░░░░░░  3/5 dagen (60%)                │
│  Vervalt op: 31 december 2030                                       │
│                                                                     │
│  ⏰ Compensatie-uren                                                 │
│  ████████████████░░░░░░░░░░░░░░░░░  12.5 uur (TVT)                 │
│  Vervalt op: 31 december 2025                                       │
│                                                                     │
│  📋 Bijzonder Verlof                                                │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0 dagen opgenomen              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Ziekmeldingen & UWV Compliance

ADSPersoneelapp biedt volledige ondersteuning voor de **Wet Verbetering Poortwachter** met automatische monitoring van de 42-dagen (6 weken) UWV notificatie deadline.

| Alert Level | Dagen tot Deadline | Actie |
|-------------|-------------------|-------|
| 🟢 **Warning** | 7 dagen | Eerste waarschuwing naar HR/manager |
| 🟡 **Urgent** | 3 dagen | Dringende herinnering |
| 🔴 **Critical** | 1 dag | Finale alert |
| ⚫ **Overdue** | Verstreken | Escalatie naar tenant admin |

**Poortwachter Timeline:**
```
Dag 0          Dag 42 (6 weken)     Dag 56 (8 weken)
  │                  │                    │
  ▼                  ▼                    ▼
  ┌──────────────────┬────────────────────┐
  │   Ziekmelding    │  UWV Melding       │  Plan van Aanpak
  │                  │  Verplicht         │  Verplicht
  └──────────────────┴────────────────────┘
        │
        └── ADSPersoneelapp monitort automatisch
            en stuurt alerts op dag 35, 39, 41
```

**Features:**
- Automatische berekening UWV deadline (42 dagen vanaf startdatum)
- Dagelijkse cron job check (08:00 UTC)
- Gelaagde email alerts met kleurcodering
- In-app notificaties voor managers
- Tracking van UWV melding status
- Herstelpercentage monitoring (gedeeltelijke werkhervatting)
- Medisch attest vlag

---

## Declaratiebeheer

ADSPersoneelapp biedt een complete **onkostendeclaratie workflow** met ondersteuning voor kilometervergoeding en diverse onkostentypes.

### Declaratietypes

| Type | Beschrijving | Vergoeding |
|------|--------------|------------|
| **Kilometervergoeding** | Zakelijke ritten met auto | €0,23/km (belastingvrij) |
| **Reiskosten** | OV, taxi, parkeren | Werkelijke kosten |
| **Maaltijden** | Zakelijke lunch/diner | Max €50/dag |
| **Verblijf** | Hotel, accommodatie | Max €150/nacht |
| **Overig** | Overige zakelijke kosten | Op goedkeuring |

### Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DECLARATIE WORKFLOW                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   MEDEWERKER              MANAGER                 SALARISADMIN          │
│   ──────────              ───────                 ────────────          │
│        │                     │                         │                │
│   ┌────┴────┐                │                         │                │
│   │ Indienen │               │                         │                │
│   │ + Bon    │               │                         │                │
│   └────┬────┘                │                         │                │
│        │                     │                         │                │
│        ▼                     ▼                         │                │
│   ┌─────────┐          ┌─────────┐                     │                │
│   │ PENDING │ ────────▶│ REVIEW  │                     │                │
│   └─────────┘          └────┬────┘                     │                │
│                             │                          │                │
│              ┌──────────────┼──────────────┐           │                │
│              ▼              │              ▼           │                │
│        ┌─────────┐          │        ┌─────────┐      │                │
│        │REJECTED │          │        │APPROVED │──────▶│                │
│        └─────────┘          │        └─────────┘      │                │
│                             │                    ┌────┴────┐            │
│                             │                    │ Export  │            │
│                             │                    │ → Nmbrs │            │
│                             │                    └─────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Beschrijving |
|---------|--------------|
| **Bon Upload** | Foto/PDF upload van bonnetjes (max 5MB) |
| **Automatische Berekening** | Kilometervergoeding automatisch berekend |
| **GPS Integratie** | Route verificatie via Fleet Tracking |
| **Approval Workflow** | Manager goedkeuring met opmerkingen |
| **Export naar Nmbrs** | Directe integratie met salarisverwerking |
| **Rapportages** | Maandelijkse declaratieoverzichten |

### Data Model

```typescript
interface Expense {
  id: string
  tenant_id: string
  employee_id: string
  expense_type: 'MILEAGE' | 'TRAVEL' | 'MEALS' | 'ACCOMMODATION' | 'OTHER'
  date: DateTime
  amount: Decimal
  description?: string
  receipt_url?: string

  // Mileage specific
  distance_km?: Decimal
  start_location?: string
  end_location?: string
  rate_per_km?: Decimal

  // Workflow
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approved_by?: string
  approved_at?: DateTime
  rejection_reason?: string
}
```

---

## Fleet Tracking Integratie

ADSPersoneelapp integreert met populaire fleet tracking systemen voor **automatische ritregistratie** die gekoppeld wordt aan urenregistraties.

### Ondersteunde Providers

| Provider | Regio | Status |
|----------|-------|--------|
| **RouteVision** | 🇳🇱 Nederland | ✅ Volledig ondersteund (legacy + nieuwe API) |
| **FleetGO** | 🇳🇱 Nederland | ✅ Ondersteund |
| **Samsara** | 🌍 Globaal | ✅ Ondersteund |
| **Webfleet** | 🇪🇺 Europa | ✅ Ondersteund |
| **TrackJack** | 🇳🇱 Nederland | ✅ Ondersteund |
| **Verizon Connect** | 🌍 Globaal | ✅ Ondersteund |

### Voordelen

| Voordeel | Impact |
|----------|--------|
| **2+ uur/week bespaard** | Geen handmatige invoer meer |
| **GPS Verificatie** | 100% betrouwbare data |
| **Automatisch Matchen** | Ritten gekoppeld aan timesheets |
| **Fiscaal Compliant** | Voldoet aan Belastingdienst eisen |

### Architectuur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLEET TRACKING SYNC                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐      │
│   │ RouteVision │         │   FleetGO   │         │   Samsara   │      │
│   │    API      │         │     API     │         │     API     │      │
│   └──────┬──────┘         └──────┬──────┘         └──────┬──────┘      │
│          │                       │                       │              │
│          └───────────────────────┼───────────────────────┘              │
│                                  │                                      │
│                                  ▼                                      │
│                    ┌─────────────────────────┐                         │
│                    │   Fleet Provider API     │                         │
│                    │   (Unified Interface)    │                         │
│                    └────────────┬────────────┘                         │
│                                 │                                       │
│         ┌───────────────────────┼───────────────────────┐              │
│         │                       │                       │              │
│         ▼                       ▼                       ▼              │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────┐        │
│  │   Vehicle   │      │   Trip Record   │      │   Timesheet │        │
│  │   Mapping   │      │    Database     │      │   Matcher   │        │
│  │  (Employee) │      │                 │      │             │        │
│  └─────────────┘      └─────────────────┘      └─────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Configuratie

```typescript
interface FleetProviderConfig {
  tenant_id: string
  provider_type: 'routevision' | 'fleetgo' | 'samsara' | 'webfleet' | 'trackjack' | 'verizon'
  api_url: string
  api_email: string        // AES-256 encrypted
  api_password: string     // AES-256 encrypted
  api_key?: string         // AES-256 encrypted
  sync_enabled: boolean
  sync_interval_minutes: number  // Default: 60
  last_sync?: DateTime
  last_sync_error?: string
}
```

---

## Nmbrs Payroll Integratie

ADSPersoneelapp integreert met **Nmbrs** (Visma), het toonaangevende salarispakket in Nederland, voor naadloze gegevensuitwisseling.

### Integratie Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NMBRS INTEGRATIE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ADSPersoneelapp                         Nmbrs (Visma)                 │
│   ───────────────                         ─────────────                 │
│                                                                         │
│   ┌─────────────────┐                   ┌─────────────────┐            │
│   │   Timesheets    │ ──── Export ────▶ │   Uren Import   │            │
│   │   (Approved)    │      (CSV/API)    │                 │            │
│   └─────────────────┘                   └─────────────────┘            │
│                                                                         │
│   ┌─────────────────┐                   ┌─────────────────┐            │
│   │   Expenses      │ ──── Export ────▶ │   Declaraties   │            │
│   │   (Approved)    │      (CSV/API)    │                 │            │
│   └─────────────────┘                   └─────────────────┘            │
│                                                                         │
│   ┌─────────────────┐                   ┌─────────────────┐            │
│   │   Sick Leaves   │ ──── Export ────▶ │   Verzuim       │            │
│   │                 │      (CSV/API)    │                 │            │
│   └─────────────────┘                   └─────────────────┘            │
│                                                                         │
│   ┌─────────────────┐                   ┌─────────────────┐            │
│   │   Vacations     │ ──── Export ────▶ │   Verlof        │            │
│   │                 │      (CSV/API)    │                 │            │
│   └─────────────────┘                   └─────────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Beschrijving |
|---------|--------------|
| **Automatische Export** | Maandelijkse export naar Nmbrs formaat |
| **Employee Sync** | Medewerkergegevens synchronisatie |
| **Hours Export** | Uren export met projectcodes |
| **Expense Export** | Declaraties met looncomponenten |
| **Absence Export** | Verzuim en verlof registratie |
| **API Integratie** | Optionele directe API koppeling |

### Export Formaten

```typescript
interface NmbrsExport {
  // Employee Identification
  personeelsnummer: string
  bsn?: string           // Burgerservicenummer (encrypted)

  // Hours Data
  periode: string        // Format: YYYY-MM
  uren_regulier: number
  uren_overwerk: number
  uren_ziekte: number
  uren_verlof: number

  // Expenses
  kilometervergoeding: number
  reiskosten: number
  overige_declaraties: number

  // Metadata
  kostenplaats?: string
  projectcode?: string
}
```

### Configuratie

| Setting | Beschrijving | Standaard |
|---------|--------------|-----------|
| **Export Frequentie** | Auto-export schema | Maandelijks |
| **Export Formaat** | CSV of API | CSV |
| **Loonperiode Mapping** | Periode configuratie | Kalendermaand |
| **Kostenplaats** | Standaard kostenplaats | Per tenant |

---

## Multi-Language Ondersteuning

ADSPersoneelapp ondersteunt **meerdere talen** om teams met diverse achtergronden te bedienen.

### Ondersteunde Talen

| Taal | Code | Status | Dekking |
|------|------|--------|---------|
| 🇳🇱 **Nederlands** | `nl` | ✅ Primair | 100% |
| 🇬🇧 **English** | `en` | ✅ Volledig | 100% |
| 🇩🇪 **Deutsch** | `de` | ✅ Volledig | 100% |
| 🇵🇱 **Polski** | `pl` | ✅ Volledig | 100% |

### Implementatie

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      i18n ARCHITECTUUR                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  │
│   │   User Login    │────▶│  Session Locale │────▶│   UI Rendering  │  │
│   │   (Preference)  │     │   (JWT Token)   │     │   (next-intl)   │  │
│   └─────────────────┘     └─────────────────┘     └─────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                     LocaleProvider (Context)                     │  │
│   │  • Synchronisatie met session                                   │  │
│   │  • LocalStorage persistence                                     │  │
│   │  • Real-time taalwissel                                         │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│   │  nl.json   │  │  en.json   │  │  de.json   │  │  pl.json   │      │
│   │  messages  │  │  messages  │  │  messages  │  │  messages  │      │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Beschrijving |
|---------|--------------|
| **Gebruiker Voorkeur** | Taalvoorkeur per medewerker instelbaar |
| **Manager Instelling** | Managers kunnen taal instellen bij medewerker aanmaken |
| **Session Sync** | Taal wordt opgeslagen in JWT token en sessie |
| **Instant Switch** | Real-time taalwissel zonder pagina refresh |
| **Fallback** | Nederlands als standaard fallback taal |

### Vertaalde Onderdelen

| Sectie | Beschrijving |
|--------|--------------|
| **Dashboard** | KPI's, widgets, navigatie |
| **Tijdregistratie** | Formulieren, validatie, status |
| **Verlofbeheer** | Aanvragen, saldi, types |
| **Ziekmeldingen** | UWV alerts, status, workflow |
| **Declaraties** | Types, bedragen, goedkeuring |
| **Instellingen** | Profielbeheer, voorkeuren |
| **Emails** | Notificaties, reminders, alerts |
| **Errors** | Validatiefouten, systeemfouten |

### Taalvoorkeur Instellen

**Via Medewerker Profiel:**
```typescript
// Schema validatie
const localeSchema = z.enum(['nl', 'en', 'de', 'pl']).default('nl')

// Update via employee form
const updateEmployee = {
  // ...other fields
  locale: 'en'  // Preferred language
}
```

**Via Manager bij Aanmaken:**
Managers kunnen bij het aanmaken van een nieuwe medewerker direct de taalvoorkeur instellen, ideaal voor internationale teams.

---

## Nederlandse Compliance

### AVG/GDPR

| Recht | Implementatie |
|-------|---------------|
| **Recht op inzage** | Data export functionaliteit per medewerker |
| **Recht op rectificatie** | Wijzigingen via profiel met audit trail |
| **Recht op vergetelheid** | Anonimisatie functie met retentie policies |
| **Dataportabiliteit** | Export in JSON/CSV formaat |
| **Consent tracking** | Timestamp registratie van alle toestemmingen |

**Data Retention Policies:**
| Data Type | Bewaartermijn |
|-----------|---------------|
| Personeelsdossiers | 2 jaar na uitdiensttreding |
| Salarisgegevens | 7 jaar |
| Verzuimdata | 2 jaar |
| Sollicitatiegegevens | 4 weken (of 1 jaar met consent) |

### Arbeidstijdenwet

- Maximum werkuren tracking
- Pauze registratie conform wetgeving
- Overwerk monitoring
- Nachtdienst tracking (indien van toepassing)

### Audit Logging

Elk record bevat volledige traceerbaarheid:

```typescript
interface AuditLog {
  id: string
  tenant_id: string
  user_id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'EXPORT'
  resource_type: string
  resource_id: string
  old_values?: JSON
  new_values?: JSON
  ip_address?: string
  user_agent?: string
  created_at: DateTime
}
```

---

## Architectuur

### Tech Stack

| Layer | Technology | Versie |
|-------|------------|--------|
| **Frontend** | Next.js (App Router) | 15.5 |
| **UI Framework** | React | 19.2 |
| **Language** | TypeScript | 5.0 |
| **Styling** | Tailwind CSS | 4.0 |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **ORM** | Prisma | 6.15 |
| **Auth** | NextAuth.js | 5.0 |
| **Payments** | Stripe | 18.5 |
| **Email** | Nodemailer | 6.10 |
| **PDF Generation** | PDFKit | 0.17 |
| **Excel Generation** | ExcelJS | 4.4 |
| **Testing** | Vitest + Testing Library | 3.2 |
| **Deployment** | Vercel | - |

### Multi-Tenant Architectuur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Authentication (NextAuth.js)                  │   │
│  │  • JWT Tokens met tenant context                                │   │
│  │  • Session callbacks met role injection                         │   │
│  │  • Secure password reset flow                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
│                                   ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Tenant Context Middleware                     │   │
│  │  • withTenantAccess() - Route handler wrapper                   │   │
│  │  • withPermission() - Permission validation                     │   │
│  │  • addTenantFilter() - Query scoping                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
├───────────────────────────────────┼─────────────────────────────────────┤
│                           DATA LAYER                                    │
│                                   │                                     │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐    │
│  │  Tenant A  │   │  Tenant B  │   │  Tenant C  │   │  Tenant N  │    │
│  │ (Standard) │   │ (Freemium) │   │  (Trial)   │   │    ...     │    │
│  ├────────────┤   ├────────────┤   ├────────────┤   ├────────────┤    │
│  │ Users      │   │ Users      │   │ Users      │   │ Users      │    │
│  │ Timesheets │   │ Timesheets │   │ Timesheets │   │ Timesheets │    │
│  │ Vacations  │   │ Vacations  │   │ Vacations  │   │ Vacations  │    │
│  │ SickLeaves │   │ SickLeaves │   │ SickLeaves │   │ SickLeaves │    │
│  │ Trips      │   │ Trips      │   │ Trips      │   │ Trips      │    │
│  │ AuditLogs  │   │ AuditLogs  │   │ AuditLogs  │   │ AuditLogs  │    │
│  └────────────┘   └────────────┘   └────────────┘   └────────────┘    │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                    COMPLETE DATA ISOLATION                              │
│                    (tenantId on all models)                             │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

```
SUPERUSER
    │
    │   • Toegang tot alle tenants
    │   • Platform-wide configuratie
    │   • Tenant management
    │
    ▼
TENANT_ADMIN
    │
    │   • Volledige tenant beheer
    │   • Billing & subscription
    │   • Instellingen & configuratie
    │   • Alle medewerker data
    │
    ▼
MANAGER
    │
    │   • Team management
    │   • Goedkeuringen (timesheet, vacation, sick leave)
    │   • Team rapportages
    │   • Medewerker overzichten
    │
    ▼
USER
    │
    │   • Eigen tijdregistratie
    │   • Eigen verlofaanvragen
    │   • Eigen ziekmeldingen
    │   • Profiel beheer
```

### Database Schema (Core Models)

```prisma
// Core Entities
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  name          String?
  is_superuser  Boolean  @default(false)
  tenants       TenantUser[]
}

model Tenant {
  id                  String   @id @default(cuid())
  name                String
  domain              String?  @unique
  subscription_status SubscriptionStatus
  subscription_plan   PlanType
  users               TenantUser[]
  timesheets          Timesheet[]
  vacations           Vacation[]
  sick_leaves         SickLeave[]
  fleet_configs       FleetProviderConfig[]
  trip_records        TripRecord[]
}

model TenantUser {
  tenant_id   String
  user_id     String
  role        UserRole
  is_active   Boolean  @default(true)

  @@id([tenant_id, user_id])
}

// Time & Leave
model Timesheet { ... }
model Vacation { ... }
model SickLeave { ... }
model LeaveBalance { ... }

// Fleet Tracking
model FleetProviderConfig { ... }
model VehicleMapping { ... }
model TripRecord { ... }

// Business
model Subscription { ... }
model AuditLog { ... }
```

### Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (dashboard)/               # Protected routes (requires auth)
│   │   ├── dashboard/             # Main dashboard with KPIs
│   │   ├── timesheet/             # Time registration
│   │   ├── vacation/              # Leave management
│   │   ├── sick-leave/            # Sick leave tracking
│   │   ├── employees/             # Employee management
│   │   │   └── [id]/              # Employee detail view
│   │   ├── approvals/             # Approval workflows
│   │   ├── expenses/              # Expense management
│   │   ├── trips/                 # Fleet tracking trips
│   │   ├── billing/               # Subscription & invoices
│   │   ├── profile/               # User profile
│   │   └── settings/              # Tenant settings
│   │       ├── fleet-provider/    # Fleet provider config
│   │       └── routevision/       # RouteVision specific
│   │
│   ├── admin/                     # Superuser admin panel
│   │   └── tenants/               # Tenant management
│   │
│   ├── api/                       # API Routes
│   │   ├── auth/                  # NextAuth endpoints
│   │   ├── dashboard/stats/       # Dashboard KPIs
│   │   ├── timesheets/            # Timesheet CRUD
│   │   ├── vacations/             # Vacation CRUD
│   │   ├── sick-leaves/           # Sick leave CRUD
│   │   ├── employees/             # Employee CRUD
│   │   │   ├── [id]/              # Single employee
│   │   │   └── vehicles/          # Vehicle mappings
│   │   ├── expenses/              # Expense CRUD
│   │   ├── fleet-provider/        # Fleet provider API
│   │   ├── routevision/           # RouteVision API
│   │   ├── approvals/             # Batch approvals
│   │   ├── exports/               # PDF/Excel export
│   │   ├── billing/               # Stripe integration
│   │   ├── webhooks/stripe/       # Stripe webhooks
│   │   ├── support/               # FAQ chatbot support
│   │   └── cron/                  # Automated jobs
│   │       ├── timesheet-reminder/
│   │       ├── leave-expiration/
│   │       ├── uwv-alerts/
│   │       ├── approval-reminders/
│   │       ├── monthly-reports/
│   │       └── routevision-sync/
│   │
│   ├── login/                     # Authentication
│   ├── forgot-password/           # Password reset request
│   ├── reset-password/            # Password reset form
│   └── marketing/                 # Public marketing pages
│
├── components/
│   ├── approvals/                 # Approval components
│   ├── chat/                      # FAQ Chatbot
│   ├── dashboard/                 # Dashboard widgets
│   ├── employees/                 # Employee components
│   ├── filters/                   # Filter components
│   ├── mobile/                    # Mobile-specific UI
│   ├── marketing/                 # Marketing page components
│   ├── providers/                 # React context providers
│   └── ui/                        # Shared UI components
│
├── lib/
│   ├── auth/                      # Auth configuration
│   │   ├── auth.ts                # NextAuth config
│   │   ├── password-reset.ts      # Password reset logic
│   │   └── tenant-access.ts       # Tenant middleware
│   ├── db/                        # Database utilities
│   │   ├── prisma.ts              # Prisma client
│   │   └── tenant-db.ts           # Tenant-scoped queries
│   ├── email/                     # Email templates
│   ├── security/                  # Security utilities
│   │   └── cron-auth.ts           # CRON_SECRET validation
│   ├── services/                  # Business logic
│   │   ├── email-service.ts
│   │   ├── timesheet-reminder.ts
│   │   ├── leave-expiration-reminder.ts
│   │   ├── uwv-alert-service.ts
│   │   ├── approval-reminder-service.ts
│   │   ├── report-builder.ts
│   │   ├── routevision-service.ts
│   │   ├── trip-timesheet-matcher.ts
│   │   └── fleet-providers/
│   │       ├── base-provider.ts
│   │       ├── routevision-provider.ts
│   │       ├── fleetgo-provider.ts
│   │       └── webfleet-provider.ts
│   ├── stripe/                    # Stripe integration
│   └── validation/                # Input validation
│
├── test/                          # Test setup
├── types/                         # TypeScript definitions
│
messages/                           # i18n Translation Files
├── nl.json                         # Nederlands (primary)
├── en.json                         # English
├── de.json                         # Deutsch
└── pl.json                         # Polski
```

---

## Quick Start

### Vereisten

- Node.js 18+
- npm of yarn
- PostgreSQL database (Supabase aanbevolen)
- Stripe account (voor betalingen)
- SMTP server (voor email)

### Installatie

```bash
# Clone repository
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

# Seed demo data
npm run prisma:seed

# Start development server
npm run dev
```

### Environment Variables

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

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="ADSPersoneelapp <noreply@adspersoneelapp.nl>"

# Security
CRON_SECRET="your-cron-secret-key"
ENCRYPTION_KEY="your-32-char-aes-256-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Demo Accounts

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| **Superuser** | `superuser@ads-personeelsapp.nl` | `SuperAdmin123!` |
| **Tenant Admin** | `admin@demo-company.nl` | `Admin123!` |
| **Manager** | `manager@demo-company.nl` | `Manager123!` |
| **Medewerker** | `gebruiker@demo-company.nl` | `Gebruiker123!` |

---

## API Referentie

### Authentication

Alle API endpoints zijn beveiligd met NextAuth.js. De session bevat tenant context:

```typescript
interface Session {
  user: {
    id: string
    email: string
    name: string
    tenantId: string
    role: 'SUPERUSER' | 'TENANT_ADMIN' | 'MANAGER' | 'USER'
  }
}
```

### Core Endpoints

#### Dashboard
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/dashboard/stats` | Dashboard KPI's (role-aware) |

#### Timesheets
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/timesheets` | Lijst timesheets (filtered by tenant) |
| POST | `/api/timesheets` | Nieuwe timesheet (clock-in) |
| PATCH | `/api/timesheets/[id]` | Update timesheet (clock-out) |

#### Vacations
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/vacations` | Lijst verlofaanvragen |
| POST | `/api/vacations` | Nieuwe verlofaanvraag |
| GET | `/api/vacation-balance` | Verlofsaldi per categorie |

#### Sick Leaves
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/sick-leaves` | Lijst ziekmeldingen |
| POST | `/api/sick-leaves` | Nieuwe ziekmelding |
| PATCH | `/api/sick-leaves/[id]` | Herstelmelding / UWV status |

#### Expenses
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/expenses` | Lijst declaraties (filtered by tenant) |
| POST | `/api/expenses` | Nieuwe declaratie indienen |
| PATCH | `/api/expenses/[id]` | Update declaratie |
| DELETE | `/api/expenses/[id]` | Verwijder declaratie |
| GET | `/api/expenses/export` | Export naar Nmbrs formaat |

#### Approvals
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/approvals` | Pending approvals (manager+) |
| PATCH | `/api/approvals` | Batch approve/reject |

#### Exports
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/exports/timesheets` | CSV export |
| GET | `/api/exports/timesheets.pdf` | PDF export |
| GET | `/api/exports/timesheets.xlsx` | Excel export |

#### Fleet Tracking
| Method | Endpoint | Beschrijving |
|--------|----------|--------------|
| GET | `/api/fleet-provider/[provider]/config` | Provider configuratie |
| POST | `/api/fleet-provider/[provider]/config` | Update configuratie |
| POST | `/api/fleet-provider/[provider]/test` | Test verbinding |
| GET | `/api/routevision/vehicles` | RouteVision voertuigen |
| GET | `/api/routevision/trips` | RouteVision ritten |

### Cron Endpoints

Beveiligd met `CRON_SECRET` header.

| Schedule | Endpoint | Functie |
|----------|----------|---------|
| `0 13 * * 5` | `/api/cron/timesheet-reminder` | Vrijdag 15:00 CET herinnering |
| `0 7 * * 1` | `/api/cron/timesheet-reminder` | Maandag 09:00 CET escalatie |
| `0 8 * * 1` | `/api/cron/leave-expiration` | Verlof expiratie check |
| `0 7 * * *` | `/api/cron/uwv-alerts` | Dagelijkse UWV deadline check |
| `0 7 * * 1-5` | `/api/cron/approval-reminders` | Workday approval reminders |
| `0 6 1 * *` | `/api/cron/monthly-reports` | Maandelijkse rapportages |
| `0 4 * * *` | `/api/cron/routevision-sync` | Fleet tracking sync |

---

## Scripts

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint linting

# Testing
npm test                 # Tests in watch mode
npm run test:run         # Single test run
npm run test:ui          # Visual test interface
npm run test:coverage    # Coverage report (80% threshold)

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma db pull       # Pull schema from database
npm run prisma:seed      # Seed demo data
npx prisma studio        # Open Prisma Studio GUI
```

---

## Deployment

### Vercel (Aanbevolen)

1. Import repository in Vercel
2. Configureer environment variables
3. Deploy automatisch bij push naar `main`
4. Cron jobs worden geconfigureerd via `vercel.json`

### Cron Configuration (vercel.json)

```json
{
  "crons": [
    { "path": "/api/cron/timesheet-reminder", "schedule": "0 13 * * 5" },
    { "path": "/api/cron/timesheet-reminder", "schedule": "0 7 * * 1" },
    { "path": "/api/cron/leave-expiration", "schedule": "0 8 * * 1" },
    { "path": "/api/cron/uwv-alerts", "schedule": "0 7 * * *" },
    { "path": "/api/cron/approval-reminders", "schedule": "0 7 * * 1-5" }
  ]
}
```

---

## Subscription Plans

| Feature | Freemium | Standard |
|---------|----------|----------|
| **Prijs** | Gratis | €49,95/maand |
| **Gebruikers** | Tot 3 | Onbeperkt (€4,95/extra) |
| **Tijdregistratie** | ✅ | ✅ |
| **Verlofbeheer** | ✅ | ✅ |
| **Ziekmeldingen** | ✅ | ✅ |
| **Declaratiebeheer** | ✅ Basis | ✅ Volledig |
| **Multi-Language** | ✅ NL | ✅ NL/EN/DE/PL |
| **GPS Verificatie** | ❌ | ✅ |
| **Fleet Tracking** | ❌ | ✅ |
| **Nmbrs Export** | ❌ | ✅ |
| **PDF/Excel Export** | ❌ | ✅ |
| **API Access** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

---

## Security

| Maatregel | Implementatie |
|-----------|---------------|
| **Credentials Encryption** | AES-256 voor fleet provider credentials |
| **Password Hashing** | bcrypt met salt |
| **JWT Tokens** | Signed tokens met tenant context |
| **Rate Limiting** | Upstash Redis rate limiting |
| **CRON Protection** | CRON_SECRET header validation |
| **SQL Injection** | Prisma ORM parameterized queries |
| **XSS Prevention** | React automatic escaping |
| **CSRF Protection** | NextAuth CSRF tokens |
| **Audit Logging** | Complete action trail met IP/User Agent |

---

## Support

- **GitHub Issues**: [Open een issue](https://github.com/ThaADS/ADS-Personeelsapp/issues)
- **Email**: support@adspersoneelapp.nl
- **In-App**: FAQ Chatbot met email escalatie

---

<p align="center">
  <br>
  <img src="https://img.shields.io/badge/Made%20in-Netherlands-FF6C2D?style=for-the-badge" alt="Made in Netherlands">
  <br><br>
  <strong>ADSPersoneelapp v3.1</strong>
  <br>
  <em>Enterprise HR Management voor Nederlandse Organisaties</em>
  <br>
  <em>Met declaratiebeheer, Nmbrs integratie & meertalige ondersteuning</em>
  <br><br>
  Januari 2026
</p>
