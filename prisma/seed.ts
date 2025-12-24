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

  // Create CKW tenant (main tenant for testing)
  console.log('🏢 Creating CKW tenant...');
  const ckwTenant = await prisma.tenant.upsert({
    where: { slug: 'ckw' },
    update: {},
    create: {
      name: 'CKW BV',
      slug: 'ckw',
      contactEmail: 'admin@ckw.nl',
      contactName: 'CKW Administrator',
      address: 'Industrieweg 50, 3500 AA Utrecht',
      phone: '+31 30 123 4567',
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      currentPlan: PlanType.STANDARD,
      trialEndsAt: null,
      settings: JSON.stringify({
        companyLogo: null,
        timeZone: 'Europe/Amsterdam',
        currency: 'EUR',
        workingHours: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: null,
          sunday: null
        }
      })
    },
  });

  // Create CKW users with full profile data
  console.log('👥 Creating CKW users...');
  const adminPassword = await hash('Admin123!', 10);
  const managerPassword = await hash('Manager123!', 10);
  const userPassword = await hash('Gebruiker123!', 10);

  const ckwAdmin = await prisma.user.upsert({
    where: { email: 'admin@ckw.nl' },
    update: {
      phone: '+31 6 12345678',
      department: 'Management',
      position: 'Directeur',
      employeeId: 'CKW001',
      startDate: new Date('2015-01-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
    create: {
      email: 'admin@ckw.nl',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.TENANT_ADMIN,
      phone: '+31 6 12345678',
      address: 'Hoofdstraat 1',
      city: 'Utrecht',
      postalCode: '3500 AA',
      department: 'Management',
      position: 'Directeur',
      employeeId: 'CKW001',
      startDate: new Date('2015-01-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
  });

  const ckwManager = await prisma.user.upsert({
    where: { email: 'manager@ckw.nl' },
    update: {
      phone: '+31 6 23456789',
      department: 'Operations',
      position: 'Operations Manager',
      employeeId: 'CKW002',
      startDate: new Date('2018-03-15'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
    create: {
      email: 'manager@ckw.nl',
      name: 'Manager User',
      password: managerPassword,
      role: UserRole.MANAGER,
      phone: '+31 6 23456789',
      address: 'Kerkstraat 25',
      city: 'Utrecht',
      postalCode: '3511 AB',
      department: 'Operations',
      position: 'Operations Manager',
      employeeId: 'CKW002',
      startDate: new Date('2018-03-15'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
  });

  const ckwUser = await prisma.user.upsert({
    where: { email: 'gebruiker@ckw.nl' },
    update: {
      phone: '+31 6 34567890',
      department: 'IT',
      position: 'Developer',
      employeeId: 'CKW003',
      startDate: new Date('2021-06-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
    create: {
      email: 'gebruiker@ckw.nl',
      name: 'Test Gebruiker',
      password: userPassword,
      role: UserRole.USER,
      phone: '+31 6 34567890',
      address: 'Marktplein 10',
      city: 'Utrecht',
      postalCode: '3512 CD',
      department: 'IT',
      position: 'Developer',
      employeeId: 'CKW003',
      startDate: new Date('2021-06-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
  });

  // Additional employees for CKW
  const additionalEmployees = [
    {
      email: 'jan.devries@ckw.nl',
      name: 'Jan de Vries',
      phone: '+31 6 11111111',
      department: 'IT',
      position: 'Senior Developer',
      employeeId: 'CKW004',
      startDate: new Date('2019-09-01'),
    },
    {
      email: 'maria.janssen@ckw.nl',
      name: 'Maria Janssen',
      phone: '+31 6 22222222',
      department: 'HR',
      position: 'HR Manager',
      employeeId: 'CKW005',
      startDate: new Date('2017-04-15'),
    },
    {
      email: 'piet.bakker@ckw.nl',
      name: 'Piet Bakker',
      phone: '+31 6 33333333',
      department: 'Finance',
      position: 'Accountant',
      employeeId: 'CKW006',
      startDate: new Date('2020-01-10'),
    },
    {
      email: 'lisa.dejong@ckw.nl',
      name: 'Lisa de Jong',
      phone: '+31 6 44444444',
      department: 'IT',
      position: 'System Administrator',
      employeeId: 'CKW007',
      startDate: new Date('2022-02-01'),
    },
    {
      email: 'tom.vandijk@ckw.nl',
      name: 'Tom van Dijk',
      phone: '+31 6 55555555',
      department: 'Operations',
      position: 'Logistics Coordinator',
      employeeId: 'CKW008',
      startDate: new Date('2021-08-15'),
    },
  ];

  const createdEmployees = [];
  for (const emp of additionalEmployees) {
    const employee = await prisma.user.upsert({
      where: { email: emp.email },
      update: {
        phone: emp.phone,
        department: emp.department,
        position: emp.position,
        employeeId: emp.employeeId,
        startDate: emp.startDate,
        contractType: 'Vast dienstverband',
        workHoursPerWeek: 40,
      },
      create: {
        email: emp.email,
        name: emp.name,
        password: userPassword,
        role: UserRole.USER,
        phone: emp.phone,
        department: emp.department,
        position: emp.position,
        employeeId: emp.employeeId,
        startDate: emp.startDate,
        contractType: 'Vast dienstverband',
        workHoursPerWeek: 40,
      },
    });
    createdEmployees.push(employee);
  }

  // Link users to CKW tenant
  console.log('🔗 Linking users to CKW tenant...');

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: ckwTenant.id, userId: ckwAdmin.id } },
    update: {},
    create: {
      tenantId: ckwTenant.id,
      userId: ckwAdmin.id,
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: ckwTenant.id, userId: ckwManager.id } },
    update: {},
    create: {
      tenantId: ckwTenant.id,
      userId: ckwManager.id,
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: ckwTenant.id, userId: ckwUser.id } },
    update: {},
    create: {
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      role: UserRole.USER,
      isActive: true,
    },
  });

  // Link additional employees to CKW tenant
  for (const employee of createdEmployees) {
    await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: ckwTenant.id, userId: employee.id } },
      update: {},
      create: {
        tenantId: ckwTenant.id,
        userId: employee.id,
        role: UserRole.USER,
        isActive: true,
      },
    });
  }

  // Create sample timesheets for CKW users
  console.log('⏰ Creating sample timesheets...');
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  await prisma.timesheet.upsert({
    where: { id: 'ts-ckw-001' },
    update: {},
    create: {
      id: 'ts-ckw-001',
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      date: lastWeek,
      startTime: new Date(lastWeek.setHours(8, 0, 0, 0)),
      endTime: new Date(lastWeek.setHours(17, 0, 0, 0)),
      breakDuration: 30,
      description: 'Projectwerk en meetings',
      status: 'APPROVED',
    },
  });

  await prisma.timesheet.upsert({
    where: { id: 'ts-ckw-002' },
    update: {},
    create: {
      id: 'ts-ckw-002',
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      date: today,
      startTime: new Date(today.setHours(8, 30, 0, 0)),
      endTime: new Date(today.setHours(16, 30, 0, 0)),
      breakDuration: 30,
      description: 'Development taken',
      status: 'PENDING',
    },
  });

  // Create sample leave requests for CKW users
  console.log('🏖️ Creating sample vacation requests...');
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonthEnd = new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.leaveRequest.upsert({
    where: { id: 'leave-ckw-001' },
    update: {},
    create: {
      id: 'leave-ckw-001',
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      type: 'VACATION',
      startDate: nextMonth,
      endDate: nextMonthEnd,
      totalDays: 5,
      description: 'Zomervakantie',
      status: 'PENDING',
    },
  });

  // Create sample sick leave requests for CKW users
  console.log('🏥 Creating sample sick leave requests...');
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  await prisma.leaveRequest.upsert({
    where: { id: 'leave-ckw-002' },
    update: {},
    create: {
      id: 'leave-ckw-002',
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      type: 'SICK_LEAVE',
      startDate: lastMonth,
      endDate: new Date(lastMonth.getTime() + 2 * 24 * 60 * 60 * 1000),
      totalDays: 2,
      description: 'Griep',
      status: 'APPROVED',
    },
  });

  // Create demo tenant (secondary tenant)
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
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo-company.nl' },
    update: {},
    create: {
      email: 'admin@demo-company.nl',
      name: 'Demo Admin',
      password: adminPassword,
      role: UserRole.TENANT_ADMIN,
    },
  });

  const demoManager = await prisma.user.upsert({
    where: { email: 'manager@demo-company.nl' },
    update: {},
    create: {
      email: 'manager@demo-company.nl',
      name: 'Demo Manager',
      password: managerPassword,
      role: UserRole.MANAGER,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'gebruiker@demo-company.nl' },
    update: {},
    create: {
      email: 'gebruiker@demo-company.nl',
      name: 'Demo Gebruiker',
      password: userPassword,
      role: UserRole.USER,
    },
  });

  // Link users to demo tenant
  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: demoTenant.id, userId: demoAdmin.id } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: demoAdmin.id,
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: demoTenant.id, userId: demoManager.id } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: demoManager.id,
      role: UserRole.MANAGER,
      isActive: true,
    },
  });

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: demoTenant.id, userId: demoUser.id } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
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
      tenantIds: "",
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
  console.log('');
  console.log('--- CKW Tenant (main) ---');
  console.log('Admin: admin@ckw.nl / Admin123!');
  console.log('Manager: manager@ckw.nl / Manager123!');
  console.log('User: gebruiker@ckw.nl / Gebruiker123!');
  console.log('');
  console.log('--- Demo Company (secondary) ---');
  console.log('Admin: admin@demo-company.nl / Admin123!');
  console.log('Manager: manager@demo-company.nl / Manager123!');
  console.log('User: gebruiker@demo-company.nl / Gebruiker123!');
  console.log('');
  console.log('--- Superuser ---');
  console.log('superuser@ads-personeelsapp.nl / SuperAdmin123!');
  console.log('');
  console.log('🏢 Tenants created: CKW (active) and Demo Company (14-day trial)');
  console.log('📦 Plans created: Freemium (€0) and Standard (€49.95/month)');
  console.log('👥 CKW has 8 employees with full profile data');
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
