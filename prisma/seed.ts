import { PrismaClient, timesheet_status, vacation_status, vacation_type } from '@prisma/client';
import { hash } from 'bcryptjs';

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

  // Create employees records for CKW users (links User to employees table)
  console.log('👷 Creating CKW employee records...');

  const ckwEmployeeRecords = [
    {
      user: ckwAdmin,
      employee_number: 'CKW001',
      position: 'Directeur',
      hours_per_week: 40,
      start_date: new Date('2015-01-01'),
      emergency_contact: 'Marieke van Admin',
      emergency_phone: '+31 6 98765432',
      emergency_relationship: 'Partner',
      skills: ['Management', 'Strategie', 'Financiën'],
      certifications: ['MBA'],
      education_level: 'WO',
      languages: ['Nederlands', 'Engels', 'Duits'],
      remote_work_allowed: true,
      work_location: 'Utrecht',
    },
    {
      user: ckwManager,
      employee_number: 'CKW002',
      position: 'Operations Manager',
      hours_per_week: 40,
      start_date: new Date('2018-03-15'),
      emergency_contact: 'Jan Manager',
      emergency_phone: '+31 6 87654321',
      emergency_relationship: 'Partner',
      skills: ['Operations', 'Teamleiding', 'Planning'],
      certifications: ['Prince2', 'ITIL'],
      education_level: 'HBO',
      languages: ['Nederlands', 'Engels'],
      remote_work_allowed: true,
      work_location: 'Utrecht',
    },
    {
      user: ckwUser,
      employee_number: 'CKW003',
      position: 'Developer',
      hours_per_week: 40,
      start_date: new Date('2021-06-01'),
      emergency_contact: 'Anna Gebruiker',
      emergency_phone: '+31 6 76543210',
      emergency_relationship: 'Ouder',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      certifications: ['AWS Developer'],
      education_level: 'HBO',
      languages: ['Nederlands', 'Engels'],
      remote_work_allowed: true,
      work_location: 'Utrecht / Remote',
    },
  ];

  // Add remaining CKW employees
  const ckwEmployeeDetails = [
    { email: 'jan.devries@ckw.nl', number: 'CKW004', position: 'Senior Developer', skills: ['Java', 'Python', 'AWS'], certifications: ['AWS Solutions Architect'], education_level: 'WO', start_date: new Date('2019-09-01') },
    { email: 'maria.janssen@ckw.nl', number: 'CKW005', position: 'HR Manager', skills: ['HR', 'Recruitment', 'Arbeidsrecht'], certifications: ['SHRM-CP'], education_level: 'HBO', start_date: new Date('2017-04-15') },
    { email: 'piet.bakker@ckw.nl', number: 'CKW006', position: 'Accountant', skills: ['Boekhouden', 'Excel', 'SAP'], certifications: ['RA'], education_level: 'WO', start_date: new Date('2020-01-10') },
    { email: 'lisa.dejong@ckw.nl', number: 'CKW007', position: 'System Administrator', skills: ['Linux', 'Docker', 'Kubernetes'], certifications: ['RHCE', 'CKA'], education_level: 'HBO', start_date: new Date('2022-02-01') },
    { email: 'tom.vandijk@ckw.nl', number: 'CKW008', position: 'Logistics Coordinator', skills: ['Logistiek', 'WMS', 'Supply Chain'], certifications: ['APICS'], education_level: 'MBO', start_date: new Date('2021-08-15') },
  ];

  for (const emp of ckwEmployeeRecords) {
    await prisma.employees.upsert({
      where: { user_id: emp.user.id },
      update: {
        position: emp.position,
        hours_per_week: emp.hours_per_week,
        emergency_contact: emp.emergency_contact,
        emergency_phone: emp.emergency_phone,
        emergency_relationship: emp.emergency_relationship,
        skills: emp.skills,
        certifications: emp.certifications,
        education_level: emp.education_level,
        languages: emp.languages,
        remote_work_allowed: emp.remote_work_allowed,
        work_location: emp.work_location,
      },
      create: {
        user_id: emp.user.id,
        tenant_id: ckwTenant.id,
        employee_number: emp.employee_number,
        position: emp.position,
        contract_type: 'FULLTIME',
        hours_per_week: emp.hours_per_week,
        start_date: emp.start_date,
        emergency_contact: emp.emergency_contact,
        emergency_phone: emp.emergency_phone,
        emergency_relationship: emp.emergency_relationship,
        skills: emp.skills,
        certifications: emp.certifications,
        education_level: emp.education_level,
        languages: emp.languages,
        remote_work_allowed: emp.remote_work_allowed,
        work_location: emp.work_location,
      },
    });
  }

  for (let i = 0; i < createdEmployees.length; i++) {
    const user = createdEmployees[i];
    const details = ckwEmployeeDetails[i];
    await prisma.employees.upsert({
      where: { user_id: user.id },
      update: {
        position: details.position,
        skills: details.skills,
        certifications: details.certifications,
        education_level: details.education_level,
      },
      create: {
        user_id: user.id,
        tenant_id: ckwTenant.id,
        employee_number: details.number,
        position: details.position,
        contract_type: 'FULLTIME',
        hours_per_week: 40,
        start_date: details.start_date,
        emergency_contact: 'Noodcontact ' + user.name?.split(' ')[0],
        emergency_phone: '+31 6 ' + String(Math.floor(10000000 + Math.random() * 90000000)),
        emergency_relationship: 'Partner',
        skills: details.skills,
        certifications: details.certifications,
        education_level: details.education_level,
        languages: ['Nederlands', 'Engels'],
        remote_work_allowed: Math.random() > 0.3,
        work_location: 'Utrecht',
      },
    });
  }

  // Create sample timesheets for CKW users
  console.log('⏰ Creating sample timesheets...');
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  await prisma.timesheet.create({
    data: {
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      date: lastWeek,
      startTime: new Date(lastWeek.setHours(8, 0, 0, 0)),
      endTime: new Date(lastWeek.setHours(17, 0, 0, 0)),
      break_minutes: 30,
      description: 'Projectwerk en meetings',
      status: 'APPROVED',
    },
  });

  await prisma.timesheet.create({
    data: {
      tenantId: ckwTenant.id,
      userId: ckwUser.id,
      date: today,
      startTime: new Date(today.setHours(8, 30, 0, 0)),
      endTime: new Date(today.setHours(16, 30, 0, 0)),
      break_minutes: 30,
      description: 'Development taken',
      status: 'PENDING',
    },
  });

  // Create sample leave requests for CKW users
  console.log('🏖️ Creating sample vacation requests...');
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const nextMonthEnd = new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.leaveRequest.create({
    data: {
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

  await prisma.leaveRequest.create({
    data: {
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

  // Create demo tenant users with full profile data
  console.log('👥 Creating demo tenant users...');
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo-company.nl' },
    update: {
      phone: '+31 20 111 2222',
      department: 'Management',
      position: 'CEO',
      employeeId: 'DEMO001',
      startDate: new Date('2010-01-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
    create: {
      email: 'admin@demo-company.nl',
      name: 'Demo Admin',
      password: adminPassword,
      role: UserRole.TENANT_ADMIN,
      phone: '+31 20 111 2222',
      address: 'Keizersgracht 100',
      city: 'Amsterdam',
      postalCode: '1015 AB',
      department: 'Management',
      position: 'CEO',
      employeeId: 'DEMO001',
      startDate: new Date('2010-01-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
  });

  const demoManager = await prisma.user.upsert({
    where: { email: 'manager@demo-company.nl' },
    update: {
      phone: '+31 20 222 3333',
      department: 'Sales',
      position: 'Sales Manager',
      employeeId: 'DEMO002',
      startDate: new Date('2015-06-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
    create: {
      email: 'manager@demo-company.nl',
      name: 'Demo Manager',
      password: managerPassword,
      role: UserRole.MANAGER,
      phone: '+31 20 222 3333',
      address: 'Herengracht 250',
      city: 'Amsterdam',
      postalCode: '1016 CD',
      department: 'Sales',
      position: 'Sales Manager',
      employeeId: 'DEMO002',
      startDate: new Date('2015-06-01'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 40,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'gebruiker@demo-company.nl' },
    update: {
      phone: '+31 20 333 4444',
      department: 'Marketing',
      position: 'Marketing Specialist',
      employeeId: 'DEMO003',
      startDate: new Date('2020-03-15'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 32,
    },
    create: {
      email: 'gebruiker@demo-company.nl',
      name: 'Demo Gebruiker',
      password: userPassword,
      role: UserRole.USER,
      phone: '+31 20 333 4444',
      address: 'Prinsengracht 500',
      city: 'Amsterdam',
      postalCode: '1017 EF',
      department: 'Marketing',
      position: 'Marketing Specialist',
      employeeId: 'DEMO003',
      startDate: new Date('2020-03-15'),
      contractType: 'Vast dienstverband',
      workHoursPerWeek: 32,
    },
  });

  // Additional employees for demo company
  const demoAdditionalEmployees = [
    {
      email: 'sophie.bakker@demo-company.nl',
      name: 'Sophie Bakker',
      phone: '+31 20 444 5555',
      department: 'Sales',
      position: 'Account Manager',
      employeeId: 'DEMO004',
      startDate: new Date('2018-09-01'),
    },
    {
      email: 'lucas.jansen@demo-company.nl',
      name: 'Lucas Jansen',
      phone: '+31 20 555 6666',
      department: 'IT',
      position: 'Developer',
      employeeId: 'DEMO005',
      startDate: new Date('2019-02-15'),
    },
    {
      email: 'emma.dekker@demo-company.nl',
      name: 'Emma Dekker',
      phone: '+31 20 666 7777',
      department: 'HR',
      position: 'HR Specialist',
      employeeId: 'DEMO006',
      startDate: new Date('2021-01-10'),
    },
  ];

  const createdDemoEmployees = [];
  for (const emp of demoAdditionalEmployees) {
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
    createdDemoEmployees.push(employee);
  }

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

  // Link additional employees to demo tenant
  for (const employee of createdDemoEmployees) {
    await prisma.tenantUser.upsert({
      where: { tenantId_userId: { tenantId: demoTenant.id, userId: employee.id } },
      update: {},
      create: {
        tenantId: demoTenant.id,
        userId: employee.id,
        role: UserRole.USER,
        isActive: true,
      },
    });
  }

  // Create employees records for Demo Company users
  console.log('👷 Creating Demo Company employee records...');

  const demoEmployeeRecords = [
    {
      user: demoAdmin,
      employee_number: 'DEMO001',
      position: 'CEO',
      hours_per_week: 40,
      start_date: new Date('2010-01-01'),
      emergency_contact: 'Petra Admin',
      emergency_phone: '+31 20 111 9999',
      emergency_relationship: 'Partner',
      skills: ['Strategie', 'Leiderschap', 'Finance'],
      certifications: ['MBA', 'CPA'],
      education_level: 'WO',
      languages: ['Nederlands', 'Engels', 'Frans'],
      remote_work_allowed: true,
      work_location: 'Amsterdam',
    },
    {
      user: demoManager,
      employee_number: 'DEMO002',
      position: 'Sales Manager',
      hours_per_week: 40,
      start_date: new Date('2015-06-01'),
      emergency_contact: 'Rick Manager',
      emergency_phone: '+31 20 222 8888',
      emergency_relationship: 'Partner',
      skills: ['Sales', 'Klantrelaties', 'Negotiation'],
      certifications: ['Salesforce Certified'],
      education_level: 'HBO',
      languages: ['Nederlands', 'Engels'],
      remote_work_allowed: true,
      work_location: 'Amsterdam',
    },
    {
      user: demoUser,
      employee_number: 'DEMO003',
      position: 'Marketing Specialist',
      hours_per_week: 32,
      start_date: new Date('2020-03-15'),
      emergency_contact: 'Sanne User',
      emergency_phone: '+31 20 333 7777',
      emergency_relationship: 'Zus',
      skills: ['Marketing', 'Social Media', 'Content'],
      certifications: ['Google Analytics'],
      education_level: 'HBO',
      languages: ['Nederlands', 'Engels'],
      remote_work_allowed: true,
      work_location: 'Amsterdam / Remote',
    },
  ];

  const demoEmployeeDetails = [
    { email: 'sophie.bakker@demo-company.nl', number: 'DEMO004', position: 'Account Manager', skills: ['Sales', 'CRM', 'Presenteren'], certifications: ['Salesforce Certified'], education_level: 'HBO', start_date: new Date('2018-09-01') },
    { email: 'lucas.jansen@demo-company.nl', number: 'DEMO005', position: 'Developer', skills: ['JavaScript', 'Python', 'React'], certifications: ['AWS Developer'], education_level: 'HBO', start_date: new Date('2019-02-15') },
    { email: 'emma.dekker@demo-company.nl', number: 'DEMO006', position: 'HR Specialist', skills: ['HR', 'Recruitment', 'Onboarding'], certifications: ['SHRM-CP'], education_level: 'HBO', start_date: new Date('2021-01-10') },
  ];

  for (const emp of demoEmployeeRecords) {
    await prisma.employees.upsert({
      where: { user_id: emp.user.id },
      update: {
        position: emp.position,
        hours_per_week: emp.hours_per_week,
        emergency_contact: emp.emergency_contact,
        emergency_phone: emp.emergency_phone,
        emergency_relationship: emp.emergency_relationship,
        skills: emp.skills,
        certifications: emp.certifications,
        education_level: emp.education_level,
        languages: emp.languages,
        remote_work_allowed: emp.remote_work_allowed,
        work_location: emp.work_location,
      },
      create: {
        user_id: emp.user.id,
        tenant_id: demoTenant.id,
        employee_number: emp.employee_number,
        position: emp.position,
        contract_type: emp.hours_per_week === 32 ? 'PARTTIME' : 'FULLTIME',
        hours_per_week: emp.hours_per_week,
        start_date: emp.start_date,
        emergency_contact: emp.emergency_contact,
        emergency_phone: emp.emergency_phone,
        emergency_relationship: emp.emergency_relationship,
        skills: emp.skills,
        certifications: emp.certifications,
        education_level: emp.education_level,
        languages: emp.languages,
        remote_work_allowed: emp.remote_work_allowed,
        work_location: emp.work_location,
      },
    });
  }

  for (let i = 0; i < createdDemoEmployees.length; i++) {
    const user = createdDemoEmployees[i];
    const details = demoEmployeeDetails[i];
    await prisma.employees.upsert({
      where: { user_id: user.id },
      update: {
        position: details.position,
        skills: details.skills,
        certifications: details.certifications,
        education_level: details.education_level,
      },
      create: {
        user_id: user.id,
        tenant_id: demoTenant.id,
        employee_number: details.number,
        position: details.position,
        contract_type: 'FULLTIME',
        hours_per_week: 40,
        start_date: details.start_date,
        emergency_contact: 'Noodcontact ' + user.name?.split(' ')[0],
        emergency_phone: '+31 20 ' + String(Math.floor(1000000 + Math.random() * 9000000)),
        emergency_relationship: 'Partner',
        skills: details.skills,
        certifications: details.certifications,
        education_level: details.education_level,
        languages: ['Nederlands', 'Engels'],
        remote_work_allowed: Math.random() > 0.3,
        work_location: 'Amsterdam',
      },
    });
  }

  // Create sample data for demo tenant
  console.log('⏰ Creating sample timesheets for demo tenant...');
  const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Demo user timesheets
  await prisma.timesheet.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      date: twoDaysAgo,
      startTime: new Date(twoDaysAgo.setHours(9, 0, 0, 0)),
      endTime: new Date(twoDaysAgo.setHours(17, 30, 0, 0)),
      break_minutes: 30,
      description: 'Klantgesprekken en administratie',
      status: 'APPROVED',
    },
  });

  await prisma.timesheet.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      date: yesterday,
      startTime: new Date(yesterday.setHours(8, 45, 0, 0)),
      endTime: new Date(yesterday.setHours(17, 15, 0, 0)),
      break_minutes: 30,
      description: 'Projectwerk',
      status: 'PENDING',
    },
  });

  // Demo manager timesheets
  await prisma.timesheet.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoManager.id,
      date: yesterday,
      startTime: new Date(yesterday.setHours(9, 0, 0, 0)),
      endTime: new Date(yesterday.setHours(18, 0, 0, 0)),
      break_minutes: 60,
      description: 'Team meetings en planning',
      status: 'APPROVED',
    },
  });

  // Demo admin timesheets
  await prisma.timesheet.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoAdmin.id,
      date: yesterday,
      startTime: new Date(yesterday.setHours(8, 30, 0, 0)),
      endTime: new Date(yesterday.setHours(17, 30, 0, 0)),
      break_minutes: 30,
      description: 'Strategische planning',
      status: 'APPROVED',
    },
  });

  console.log('🏖️ Creating vacation requests for demo tenant...');
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekEnd = new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000);

  // Demo user vacation
  await prisma.leaveRequest.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      type: 'VACATION',
      startDate: nextWeek,
      endDate: nextWeekEnd,
      totalDays: 5,
      description: 'Familievakantie naar Spanje',
      status: 'PENDING',
    },
  });

  // Demo manager vacation (approved)
  const inTwoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const inTwoWeeksEnd = new Date(inTwoWeeks.getTime() + 10 * 24 * 60 * 60 * 1000);

  await prisma.leaveRequest.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoManager.id,
      type: 'VACATION',
      startDate: inTwoWeeks,
      endDate: inTwoWeeksEnd,
      totalDays: 10,
      description: 'Vakantie Frankrijk',
      status: 'APPROVED',
    },
  });

  console.log('🏥 Creating sick leave for demo tenant...');
  const threeWeeksAgo = new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000);

  // Demo user sick leave
  await prisma.leaveRequest.create({
    data: {
      tenantId: demoTenant.id,
      userId: demoUser.id,
      type: 'SICK_LEAVE',
      startDate: threeWeeksAgo,
      endDate: new Date(threeWeeksAgo.getTime() + 3 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      description: 'Verkoudheid',
      status: 'APPROVED',
    },
  });

  // Create sample advertisements for freemium users
  console.log('📢 Creating sample advertisements...');

  await prisma.advertisement.create({
    data: {
      title: 'Upgrade to Standard Plan',
      content: 'Get access to all features, remove ads, and unlock advanced reporting. Start your journey to better HR management today!',
      imageUrl: null,
      linkUrl: '/billing/upgrade',
      type: 'BANNER',
      isActive: true,
      priority: 1,
      target_tenant_ids: [],
    },
  });

  await prisma.advertisement.create({
    data: {
      title: 'RouteVision Integration Available',
      content: 'Automatically track work hours with GPS verification. Upgrade to Standard plan to enable RouteVision integration.',
      imageUrl: null,
      linkUrl: '/features/routevision',
      type: 'MODAL',
      isActive: true,
      priority: 2,
      target_tenant_ids: [],
    },
  });

  // ==========================================
  // 📊 8 MONTHS OF HISTORICAL DATA FOR DEMO
  // ==========================================
  console.log('📊 Creating 8 months of historical demo data...');

  // Helper function to get working days (Monday-Friday)
  const isWorkingDay = (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
  };

  // Helper function to create a date at specific time
  const createDateTime = (date: Date, hours: number, minutes: number): Date => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  // Helper to add random variation to hours (-30 to +30 minutes)
  const randomVariation = (): number => Math.floor(Math.random() * 61) - 30;

  // Get all users for both tenants
  const allCKWUsers = [ckwAdmin, ckwManager, ckwUser, ...createdEmployees];
  const allDemoUsers = [demoAdmin, demoManager, demoUser, ...createdDemoEmployees];

  // Work patterns for variety
  const workDescriptions = [
    'Reguliere werkzaamheden',
    'Projectwerk en meetings',
    'Klantgesprekken',
    'Administratie en rapportage',
    'Team overleg',
    'Sprint planning',
    'Code review en development',
    'Documentatie',
    'Onderzoek en analyse',
    'Training en ontwikkeling',
    'Externe vergadering',
    'Deadline werkzaamheden',
  ];

  const vacationReasons = [
    'Vakantie',
    'Zomervakantie',
    'Kerstvakantie',
    'Herfstvakantie',
    'Voorjaarsvakantie',
    'Familiebezoek',
    'Uitstapje',
    'Rust en ontspanning',
  ];

  const sickLeaveReasons = [
    'Griep',
    'Verkoudheid',
    'Niet lekker',
    'Ziek thuis',
    'Herstel na ziekte',
  ];

  // Generate 8 months of historical data
  const eightMonthsAgo = new Date();
  eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);
  eightMonthsAgo.setHours(0, 0, 0, 0);

  const historicalTimesheets: Array<{
    tenantId: string;
    userId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    break_minutes: number;
    description: string;
    status: timesheet_status;
  }> = [];

  const historicalLeaveRequests: Array<{
    tenantId: string;
    userId: string;
    type: vacation_type;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    description: string;
    status: vacation_status;
  }> = [];

  // Generate timesheets for each user over 8 months
  const generateTimesheetsForUser = (
    tenantId: string,
    userId: string,
    workHoursPerWeek: number = 40
  ) => {
    const currentDate = new Date(eightMonthsAgo);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // Stop 3 days ago to avoid conflicts

    // Track days off for this user
    const daysOff = new Set<string>();

    // Add some random vacation periods (2-3 per user over 8 months)
    const numVacations = Math.floor(Math.random() * 2) + 1;
    for (let v = 0; v < numVacations; v++) {
      const vacationStart = new Date(eightMonthsAgo);
      vacationStart.setDate(vacationStart.getDate() + Math.floor(Math.random() * 200));

      // Skip if vacation would be in the future
      if (vacationStart > endDate) continue;

      const vacationDays = Math.floor(Math.random() * 8) + 3; // 3-10 days
      const vacationEnd = new Date(vacationStart);
      vacationEnd.setDate(vacationEnd.getDate() + vacationDays);

      // Only add if within our range
      if (vacationEnd <= endDate) {
        // Count working days
        let workingDays = 0;
        const tempDate = new Date(vacationStart);
        while (tempDate <= vacationEnd) {
          if (isWorkingDay(tempDate)) {
            daysOff.add(tempDate.toISOString().split('T')[0]);
            workingDays++;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }

        if (workingDays > 0) {
          historicalLeaveRequests.push({
            tenantId,
            userId,
            type: vacation_type.VACATION,
            startDate: vacationStart,
            endDate: vacationEnd,
            totalDays: workingDays,
            description: vacationReasons[Math.floor(Math.random() * vacationReasons.length)],
            status: vacation_status.APPROVED,
          });
        }
      }
    }

    // Add some random sick days (0-5 per user over 8 months)
    const numSickPeriods = Math.floor(Math.random() * 4);
    for (let s = 0; s < numSickPeriods; s++) {
      const sickStart = new Date(eightMonthsAgo);
      sickStart.setDate(sickStart.getDate() + Math.floor(Math.random() * 220));

      // Skip if sick day would be in the future
      if (sickStart > endDate) continue;

      const sickDays = Math.floor(Math.random() * 4) + 1; // 1-4 days
      const sickEnd = new Date(sickStart);
      sickEnd.setDate(sickEnd.getDate() + sickDays - 1);

      // Only add if within our range
      if (sickEnd <= endDate) {
        // Count working days
        let workingDays = 0;
        const tempDate = new Date(sickStart);
        while (tempDate <= sickEnd) {
          if (isWorkingDay(tempDate)) {
            daysOff.add(tempDate.toISOString().split('T')[0]);
            workingDays++;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }

        if (workingDays > 0) {
          historicalLeaveRequests.push({
            tenantId,
            userId,
            type: vacation_type.LEAVE, // Using LEAVE for sick leave as the schema uses vacation_type
            startDate: sickStart,
            endDate: sickEnd,
            totalDays: workingDays,
            description: sickLeaveReasons[Math.floor(Math.random() * sickLeaveReasons.length)],
            status: vacation_status.APPROVED,
          });
        }
      }
    }

    // Generate daily timesheets
    const hoursPerDay = workHoursPerWeek / 5;
    const tempDate = new Date(eightMonthsAgo);

    while (tempDate <= endDate) {
      const dateKey = tempDate.toISOString().split('T')[0];

      // Skip weekends and days off
      if (isWorkingDay(tempDate) && !daysOff.has(dateKey)) {
        // Randomly skip some days (about 5% - sick not reported, etc)
        if (Math.random() > 0.05) {
          // Calculate start/end times with variation
          const baseStart = workHoursPerWeek === 32 ? 9 : 8; // Part-time starts later
          const startMinutes = 0 + randomVariation();
          const startHour = baseStart + Math.floor(startMinutes / 60);
          const actualStartMinutes = ((startMinutes % 60) + 60) % 60;

          const workMinutes = hoursPerDay * 60 + randomVariation();
          const breakMinutes = hoursPerDay >= 6 ? 30 : 0;
          const endMinutes = startMinutes + workMinutes + breakMinutes;
          const endHour = baseStart + Math.floor(endMinutes / 60);
          const actualEndMinutes = ((endMinutes % 60) + 60) % 60;

          // Determine status based on date (older = approved, recent = mix)
          const daysAgo = Math.floor((today.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
          let status: timesheet_status = timesheet_status.APPROVED;
          if (daysAgo < 14) {
            // Recent entries have mixed status
            const rand = Math.random();
            if (rand < 0.3) status = timesheet_status.PENDING;
            // Note: Schema only has PENDING, APPROVED, REJECTED - no SUBMITTED
          }

          historicalTimesheets.push({
            tenantId,
            userId,
            date: new Date(tempDate),
            startTime: createDateTime(tempDate, startHour, actualStartMinutes),
            endTime: createDateTime(tempDate, endHour, actualEndMinutes),
            break_minutes: breakMinutes,
            description: workDescriptions[Math.floor(Math.random() * workDescriptions.length)],
            status,
          });
        }
      }

      tempDate.setDate(tempDate.getDate() + 1);
    }
  };

  // Generate data for CKW users
  console.log('  📅 Generating CKW historical data...');
  for (const user of allCKWUsers) {
    const workHours = user.email === 'gebruiker@demo-company.nl' ? 32 : 40;
    generateTimesheetsForUser(ckwTenant.id, user.id, workHours);
  }

  // Generate data for Demo Company users
  console.log('  📅 Generating Demo Company historical data...');
  for (const user of allDemoUsers) {
    const workHours = user.email === 'gebruiker@demo-company.nl' ? 32 : 40;
    generateTimesheetsForUser(demoTenant.id, user.id, workHours);
  }

  // Batch insert timesheets (to avoid hitting database limits)
  console.log(`  ⏰ Inserting ${historicalTimesheets.length} timesheets...`);
  const BATCH_SIZE = 100;
  for (let i = 0; i < historicalTimesheets.length; i += BATCH_SIZE) {
    const batch = historicalTimesheets.slice(i, i + BATCH_SIZE);
    await prisma.timesheet.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  // Batch insert leave requests
  console.log(`  🏖️ Inserting ${historicalLeaveRequests.length} leave requests...`);
  for (let i = 0; i < historicalLeaveRequests.length; i += BATCH_SIZE) {
    const batch = historicalLeaveRequests.slice(i, i + BATCH_SIZE);
    await prisma.leaveRequest.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  console.log('  ✅ Historical data created successfully!');
  console.log(`     - ${historicalTimesheets.length} timesheet entries`);
  console.log(`     - ${historicalLeaveRequests.length} leave requests`);

  // ==========================================
  // 🏖️ VACATIONS AND SICK LEAVES (proper tables)
  // ==========================================
  console.log('🏖️ Creating vacations and sick_leaves records...');

  // Get all employee records for creating vacations/sick_leaves
  const allEmployeeRecords = await prisma.employees.findMany({
    select: { id: true, user_id: true, tenant_id: true },
  });

  const ckwEmployeeIds = allEmployeeRecords.filter(e => e.tenant_id === ckwTenant.id);
  const demoEmployeeIds = allEmployeeRecords.filter(e => e.tenant_id === demoTenant.id);

  // Create vacations for CKW employees
  for (const emp of ckwEmployeeIds) {
    // Upcoming approved vacation
    await prisma.vacations.create({
      data: {
        tenant_id: ckwTenant.id,
        employee_id: emp.id,
        type: 'VACATION',
        start_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        end_date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        total_days: 5,
        description: 'Geplande vakantie',
        status: Math.random() > 0.3 ? 'APPROVED' : 'PENDING',
      },
    });

    // Past approved vacation
    await prisma.vacations.create({
      data: {
        tenant_id: ckwTenant.id,
        employee_id: emp.id,
        type: 'VACATION',
        start_date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
        end_date: new Date(today.getTime() - 53 * 24 * 60 * 60 * 1000), // 2 months ago + 1 week
        total_days: 5,
        description: 'Vorige vakantie',
        status: 'APPROVED',
      },
    });
  }

  // Create vacations for Demo employees
  for (const emp of demoEmployeeIds) {
    await prisma.vacations.create({
      data: {
        tenant_id: demoTenant.id,
        employee_id: emp.id,
        type: 'VACATION',
        start_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        end_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        total_days: 5,
        description: 'Geplande vakantie',
        status: Math.random() > 0.5 ? 'APPROVED' : 'PENDING',
      },
    });
  }

  // Create sick_leaves for some CKW employees
  // Active sick leave (one employee currently sick)
  if (ckwEmployeeIds.length > 2) {
    await prisma.sick_leaves.create({
      data: {
        tenant_id: ckwTenant.id,
        employee_id: ckwEmployeeIds[2].id, // Third employee
        start_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // Started 3 days ago
        end_date: null, // Still ongoing
        reason: 'Griep',
        status: 'ACTIVE',
        medical_certificate: false,
        uwv_reported: false,
      },
    });
  }

  // Past recovered sick leave
  if (ckwEmployeeIds.length > 0) {
    await prisma.sick_leaves.create({
      data: {
        tenant_id: ckwTenant.id,
        employee_id: ckwEmployeeIds[0].id,
        start_date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
        end_date: new Date(today.getTime() - 42 * 24 * 60 * 60 * 1000),
        reason: 'Verkoudheid',
        status: 'RECOVERED',
        actual_return_date: new Date(today.getTime() - 41 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Long-term sick leave approaching UWV deadline
  if (ckwEmployeeIds.length > 4) {
    await prisma.sick_leaves.create({
      data: {
        tenant_id: ckwTenant.id,
        employee_id: ckwEmployeeIds[4].id,
        start_date: new Date(today.getTime() - 38 * 24 * 60 * 60 * 1000), // 38 days ago - approaching 42-day UWV deadline
        end_date: null,
        reason: 'Rugklachten',
        status: 'ACTIVE',
        medical_certificate: true,
        uwv_reported: false,
        uwv_report_deadline: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days remaining
        expected_return_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create sick_leaves for Demo employees
  if (demoEmployeeIds.length > 1) {
    await prisma.sick_leaves.create({
      data: {
        tenant_id: demoTenant.id,
        employee_id: demoEmployeeIds[1].id,
        start_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        end_date: null,
        reason: 'Niet lekker',
        status: 'ACTIVE',
      },
    });
  }

  // ==========================================
  // 💰 LEAVE BALANCES
  // ==========================================
  console.log('💰 Creating leave balances...');

  const currentYear = today.getFullYear();
  const endOfYear = new Date(currentYear, 11, 31);
  const midYear = new Date(currentYear, 6, 1);

  for (const emp of ckwEmployeeIds) {
    const usedStatutory = Math.floor(Math.random() * 10) + 5; // 5-15 days used
    const usedExtra = Math.floor(Math.random() * 3); // 0-3 days used

    await prisma.leaveBalance.upsert({
      where: {
        tenant_id_employee_id_year: {
          tenant_id: ckwTenant.id,
          employee_id: emp.id,
          year: currentYear,
        },
      },
      update: {
        statutory_used: usedStatutory,
        extra_used: usedExtra,
      },
      create: {
        tenant_id: ckwTenant.id,
        employee_id: emp.id,
        year: currentYear,
        statutory_days: 20, // Dutch standard
        statutory_used: usedStatutory,
        statutory_expiry: midYear, // Statutory days expire mid-year next year typically
        extra_days: 5,
        extra_used: usedExtra,
        extra_expiry: endOfYear,
        compensation_hours: Math.floor(Math.random() * 20), // 0-20 compensation hours
        compensation_used: 0,
        special_leave: 2, // Special leave days
        special_leave_used: Math.random() > 0.7 ? 1 : 0,
      },
    });
  }

  for (const emp of demoEmployeeIds) {
    const usedStatutory = Math.floor(Math.random() * 8) + 3;
    const usedExtra = Math.floor(Math.random() * 2);

    await prisma.leaveBalance.upsert({
      where: {
        tenant_id_employee_id_year: {
          tenant_id: demoTenant.id,
          employee_id: emp.id,
          year: currentYear,
        },
      },
      update: {
        statutory_used: usedStatutory,
        extra_used: usedExtra,
      },
      create: {
        tenant_id: demoTenant.id,
        employee_id: emp.id,
        year: currentYear,
        statutory_days: 20,
        statutory_used: usedStatutory,
        statutory_expiry: midYear,
        extra_days: 5,
        extra_used: usedExtra,
        extra_expiry: endOfYear,
        compensation_hours: Math.floor(Math.random() * 16),
        compensation_used: 0,
        special_leave: 2,
        special_leave_used: 0,
      },
    });
  }

  console.log('  ✅ Vacations, sick_leaves, and leave balances created!');

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
  console.log('📊 8 months of historical timesheet and leave data generated');
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
