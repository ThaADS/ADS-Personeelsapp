# ADS Personeelsapp - SaaS Setup Guide 🚀

## Quick Start

### 1. Database Setup (Supabase) 

1. Ga naar [supabase.com](https://supabase.com)
2. Maak gratis account aan
3. Create New Project
4. Kies een **Project name**: `ads-personeelsapp`
5. Kies een **Database Password** (onthoud deze!)
6. Select **Region**: West EU (Ireland)
7. Wacht tot project is aangemaakt (~2 minuten)

### 2. Database Connection

1. Ga naar **Settings** > **Database**
2. Kopieer de **Connection string** 
3. Vervang `[YOUR-PASSWORD]` met je database wachtwoord
4. Update `.env` bestand:

```bash
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres"
```

### 3. Database Schema Setup

```bash
# Genereer Prisma client
npm run prisma:generate

# Push schema naar Supabase
npx prisma db push

# Seed de database met demo data
npm run prisma:seed
```

### 4. Stripe Setup (Optioneel voor test)

1. Ga naar [stripe.com](https://stripe.com) 
2. Maak account aan
3. Ga naar **Developers** > **API Keys**
4. Kopieer **Publishable key** en **Secret key**
5. Update `.env`:

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 5. Start de app

```bash
npm run dev
```

## Login Credentials (na seeding)

### Superuser (Platform Admin)
- **Email**: `superuser@ads-personeelsapp.nl`
- **Password**: `SuperAdmin123!`
- **URL**: `http://localhost:3002/admin`

### Demo Tenant Admin
- **Email**: `admin@demo-company.nl` 
- **Password**: `Admin123!`
- **URL**: `http://localhost:3002/login`

### Demo Users
- **Manager**: `manager@demo-company.nl` / `Manager123!`
- **User**: `gebruiker@demo-company.nl` / `Gebruiker123!`

## Features

### ✅ Implemented
- 🏢 **Multi-tenant architecture**
- 👑 **Superuser dashboard** 
- 💳 **Stripe subscriptions** (€49.95 + €4.95/user)
- 🔒 **Tenant isolation & security**
- 📊 **Admin analytics**
- ⏰ **14-day free trial**
- 🎯 **Role-based permissions**

### 🔧 SaaS Pricing
- **Free Trial**: 14 days, all features
- **Standard Plan**: €49.95/month (3 users included)
- **Extra Users**: €4.95/user/month
- **Yearly Discount**: 20% off

## Architecture

```
┌─────────────────────────────────────────┐
│              ADS Personeelsapp           │
│                 (SaaS)                  │
├─────────────────────────────────────────┤
│  Superuser Admin     │  Tenant 1        │
│  Platform Mgmt       │  Company A       │
│                      │                  │
│  • All tenants       │  • 3 users       │
│  • Billing overview  │  • Timesheets    │
│  • Statistics        │  • HR features   │
│  • Support           │  • Billing       │
├─────────────────────┬─────────────────────┤
│  Tenant 2           │  Tenant 3...       │
│  Company B          │                    │
│                     │                    │
│  • 8 users          │  • Trial tenant    │
│  • Standard plan    │  • 14 days left    │
│  • €89.70/month     │  • All features    │
└─────────────────────┴─────────────────────┘
```

## Database Schema

- **Tenants**: Companies using the platform
- **Users**: Platform users (can belong to multiple tenants)
- **TenantUsers**: Junction table for tenant-user relationships
- **Plans**: Subscription plans (Freemium, Standard)
- **Subscriptions**: Active subscriptions per tenant
- **Timesheets**: Tenant-isolated timesheet data
- **AuditLogs**: Compliance and activity tracking

## Next Steps

1. **Setup Supabase database** ⬆️
2. **Get Stripe test keys** 💳
3. **Run the seeder** 🌱
4. **Test the platform** 🧪
5. **Deploy to production** 🚀

---

**Need help?** Check the full documentation in the project files or contact support.