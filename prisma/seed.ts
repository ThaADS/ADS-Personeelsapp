import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

// Define types locally since @/types is not available in seed context
enum UserRole {
  SUPERUSER = 'SUPERUSER',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

enum PlanType {
  FREEMIUM = 'FREEMIUM',
  STANDARD = 'STANDARD'
}

enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  FREEMIUM = 'FREEMIUM',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID'
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create subscription plans
  console.log('📦 Creating subscription plans...');
  
  const freemiumPlan = await prisma.plan.upsert({
    where: { name: 'Freemium' },
    update: {},
    create: {
      name: 'Freemium',
      type: PlanType.FREEMIUM,
      price: 0.00,
      yearlyPrice: 0.00,
      includedUsers: 1,
      pricePerExtraUser: 0.00,
      features: JSON.stringify({
        timeTracking: true,
        basicReports: true,
        emailSupport: true,
        advertisements: true,
        advancedReports: false,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false
      }),
      isActive: true,
    },
  });

  const standardPlan = await prisma.plan.upsert({
    where: { name: 'Standard' },
    update: {},
    create: {
      name: 'Standard',
      type: PlanType.STANDARD,
      price: 49.95,
      yearlyPrice: 479.52, // 20% discount: 49.95 * 12 * 0.8
      includedUsers: 3,
      pricePerExtraUser: 4.95,
      features: JSON.stringify({
        timeTracking: true,
        basicReports: true,
        emailSupport: true,
        advertisements: false,
        advancedReports: true,
        apiAccess: true,
        prioritySupport: true,
        customBranding: true,
        routeVisionIntegration: true,
        complianceReports: true
      }),
      isActive: true,
    },
  });

  // Create superuser
  console.log('👑 Creating superuser...');
  const superuserPassword = await hash('SuperAdmin123!', 10);
  
  const superuser = await prisma.user.upsert({
    where: { email: 'superuser@ads-personeelsapp.nl' },
    update: {},
    create: {
      email: 'superuser@ads-personeelsapp.nl',
      name: 'Super Administrator',
      password: superuserPassword,
      role: UserRole.SUPERUSER,
      isSuperuser: true,
    },
  });

  // Create demo tenant
  console.log('🏢 Creating demo tenant...');
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company BV',
      slug: 'demo-company',
      contactEmail: 'admin@demo-company.nl',
      contactName: 'Demo Administrator',
      address: 'Demostraat 123, 1234 AB Amsterdam',
      phone: '+31 20 123 4567',
      subscriptionStatus: SubscriptionStatus.TRIAL,
      currentPlan: PlanType.STANDARD,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      settings: JSON.stringify({
        companyLogo: null,
        timeZone: 'Europe/Amsterdam',
        currency: 'EUR',
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: null,
          sunday: null
        }
      })
    },
  });

  // Create demo tenant users
  console.log('👥 Creating demo tenant users...');
  const adminPassword = await hash('Admin123!', 10);
  const managerPassword = await hash('Manager123!', 10);
  const userPassword = await hash('Gebruiker123!', 10);

  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo-company.nl' },
    update: {},
    create: {
      email: 'admin@demo-company.nl',
      name: 'Demo Admin',
      password: adminPassword,
      role: UserRole.TENANT_ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@demo-company.nl' },
    update: {},
    create: {
      email: 'manager@demo-company.nl',
      name: 'Demo Manager',
      password: managerPassword,
      role: UserRole.MANAGER,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'gebruiker@demo-company.nl' },
    update: {},
    create: {
      email: 'gebruiker@demo-company.nl',
      name: 'Demo Gebruiker',
      password: userPassword,
      role: UserRole.USER,
    },
  });

  // Link users to tenant
  console.log('🔗 Linking users to demo tenant...');
  
  await prisma.tenantUser.upsert({
    where: { 
      tenantId_userId: { 
        tenantId: demoTenant.id, 
        userId: tenantAdmin.id 
      } 
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: tenantAdmin.id,
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: { 
      tenantId_userId: { 
        tenantId: demoTenant.id, 
        userId: manager.id 
      } 
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: manager.id,
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: { 
      tenantId_userId: { 
        tenantId: demoTenant.id, 
        userId: regularUser.id 
      } 
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: regularUser.id,
      role: UserRole.USER,
      isActive: true,
    },
  });

  // Create sample advertisements for freemium users
  console.log('📢 Creating sample advertisements...');
  
  await prisma.advertisement.upsert({
    where: { id: 'ads-upgrade-banner' },
    update: {},
    create: {
      id: 'ads-upgrade-banner',
      title: 'Upgrade to Standard Plan',
      content: 'Get access to all features, remove ads, and unlock advanced reporting. Start your journey to better HR management today!',
      imageUrl: null,
      linkUrl: '/billing/upgrade',
      type: 'BANNER',
      isActive: true,
      priority: 1,
      tenantIds: "", // Show to all freemium tenants
    },
  });

  await prisma.advertisement.upsert({
    where: { id: 'ads-routevision-integration' },
    update: {},
    create: {
      id: 'ads-routevision-integration',
      title: 'RouteVision Integration Available',
      content: 'Automatically track work hours with GPS verification. Upgrade to Standard plan to enable RouteVision integration.',
      imageUrl: null,
      linkUrl: '/features/routevision',
      type: 'MODAL',
      isActive: true,
      priority: 2,
      tenantIds: "",
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('Superuser: superuser@ads-personeelsapp.nl / SuperAdmin123!');
  console.log('Demo Tenant Admin: admin@demo-company.nl / Admin123!');
  console.log('Demo Manager: manager@demo-company.nl / Manager123!');
  console.log('Demo User: gebruiker@demo-company.nl / Gebruiker123!');
  console.log('');
  console.log('🏢 Demo tenant: demo-company (14-day trial)');
  console.log('📦 Plans created: Freemium (€0) and Standard (€49.95/month)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });