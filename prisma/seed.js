const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.tenantUser.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.advertisement.deleteMany();

  // Create Plans
  const freemiumPlan = await prisma.plan.create({
    data: {
      name: 'Freemium',
      type: 'FREEMIUM',
      price: 0,
      yearlyPrice: 0,
      includedUsers: 3,
      pricePerExtraUser: 0,
      features: JSON.stringify({
        timeTracking: true,
        basicReporting: true,
        leaveManagement: false,
        compliance: false,
        api: false,
        priority_support: false,
        advertisements: true
      }),
      isActive: true
    }
  });

  const standardPlan = await prisma.plan.create({
    data: {
      name: 'Standard',
      type: 'STANDARD',
      price: 49.95,
      yearlyPrice: 479.52, // 20% discount
      includedUsers: 3,
      pricePerExtraUser: 4.95,
      features: JSON.stringify({
        timeTracking: true,
        basicReporting: true,
        advancedReporting: true,
        leaveManagement: true,
        compliance: true,
        api: true,
        priority_support: true,
        advertisements: false,
        customIntegrations: true
      }),
      isActive: true
    }
  });

  // Create Superuser
  const superuserPassword = await bcrypt.hash('SuperAdmin123!', 12);
  const superuser = await prisma.user.create({
    data: {
      name: 'Platform Administrator',
      email: 'superuser@ads-personeelsapp.nl',
      password: superuserPassword,
      role: 'SUPERUSER',
      isSuperuser: true,
      emailVerified: new Date()
    }
  });

  // Create Demo Tenant
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company BV',
      slug: 'demo-company',
      contactEmail: 'admin@demo-company.nl',
      contactName: 'Demo Administrator',
      address: 'Demostraat 123, 1234 AB Amsterdam',
      phone: '+31 20 123 4567',
      subscriptionStatus: 'TRIAL',
      currentPlan: 'STANDARD',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      settings: JSON.stringify({
        workingHours: { start: '09:00', end: '17:00' },
        timezone: 'Europe/Amsterdam',
        currency: 'EUR',
        language: 'nl'
      })
    }
  });

  // Create Demo Users
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const demoAdmin = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'admin@demo-company.nl',
      password: adminPassword,
      role: 'TENANT_ADMIN',
      emailVerified: new Date()
    }
  });

  const managerPassword = await bcrypt.hash('Manager123!', 12);
  const demoManager = await prisma.user.create({
    data: {
      name: 'Team Manager',
      email: 'manager@demo-company.nl',
      password: managerPassword,
      role: 'MANAGER',
      emailVerified: new Date()
    }
  });

  const userPassword = await bcrypt.hash('Gebruiker123!', 12);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo Gebruiker',
      email: 'gebruiker@demo-company.nl',
      password: userPassword,
      role: 'USER',
      emailVerified: new Date()
    }
  });

  // Create Tenant-User relationships
  await prisma.tenantUser.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoAdmin.id,
      role: 'TENANT_ADMIN',
      isActive: true
    }
  });

  await prisma.tenantUser.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoManager.id,
      role: 'MANAGER',
      isActive: true
    }
  });

  await prisma.tenantUser.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      role: 'USER',
      isActive: true
    }
  });

  // Create Demo Subscription
  await prisma.subscription.create({
    data: {
      tenantId: demoTenant.id,
      planId: standardPlan.id,
      stripeSubscriptionId: 'demo_sub_trial',
      stripePriceId: 'demo_price_standard',
      status: 'TRIAL',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      userCount: 3
    }
  });

  // Create Sample Timesheets
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(9, 0, 0, 0);

  const endTime = new Date(yesterday);
  endTime.setHours(17, 0, 0, 0);

  await prisma.timesheet.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      date: yesterday,
      startTime: yesterday,
      endTime: endTime,
      description: 'Werken aan project A',
      status: 'APPROVED'
    }
  });

  await prisma.timesheet.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoManager.id,
      date: yesterday,
      startTime: yesterday,
      endTime: endTime,
      description: 'Team management en planning',
      status: 'APPROVED'
    }
  });

  // Create Sample Advertisement for Freemium users
  await prisma.advertisement.create({
    data: {
      title: 'Upgrade naar Standard Plan',
      content: 'Krijg toegang tot alle premium functies en onbeperkt aantal gebruikers.',
      type: 'BANNER',
      isActive: true,
      priority: 1,
      linkUrl: '/upgrade',
      tenantIds: '' // Empty means show to all freemium tenants
    }
  });

  // Create Audit Logs
  await prisma.auditLog.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoAdmin.id,
      action: 'TENANT_SETUP',
      resource: 'TENANT',
      resourceId: demoTenant.id,
      newValues: JSON.stringify({ status: 'trial_started' }),
      ipAddress: '127.0.0.1'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('🔑 Demo Login Credentials:');
  console.log('');
  console.log('👑 Superuser (Platform Admin):');
  console.log('   Email: superuser@ads-personeelsapp.nl');
  console.log('   Password: SuperAdmin123!');
  console.log('   URL: http://localhost:3003/admin');
  console.log('');
  console.log('🏢 Demo Tenant Admin:');
  console.log('   Email: admin@demo-company.nl');
  console.log('   Password: Admin123!');
  console.log('   URL: http://localhost:3003/login');
  console.log('');
  console.log('👨‍💼 Demo Manager:');
  console.log('   Email: manager@demo-company.nl');
  console.log('   Password: Manager123!');
  console.log('');
  console.log('👤 Demo User:');
  console.log('   Email: gebruiker@demo-company.nl');
  console.log('   Password: Gebruiker123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });