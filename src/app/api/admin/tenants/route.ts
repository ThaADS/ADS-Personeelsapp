import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { PrismaClient } from '@prisma/client';
import { UserRole, PlanType, SubscriptionStatus } from '@/types';
import { createTenantSlug, isSlugAvailable } from '@/lib/tenant';
import { hasPermission } from '@/lib/rbac';
import { z } from 'zod';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const createTenantSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  domain: z.string().optional(),
  plan: z.enum(['FREEMIUM', 'STANDARD']).default('FREEMIUM'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminEmail: z.string().email('Valid admin email is required'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// GET /api/admin/tenants - List all tenants (superuser only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.subscriptionStatus = status;
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          _count: {
            select: {
              tenantUsers: { where: { isActive: true } },
              timesheets: true,
            },
          },
          subscriptions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              status: true,
              userCount: true,
              currentPeriodEnd: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      tenants: tenants.map(tenant => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        contactEmail: tenant.contactEmail,
        contactName: tenant.contactName,
        subscriptionStatus: tenant.subscriptionStatus,
        currentPlan: tenant.currentPlan,
        trialEndsAt: tenant.trialEndsAt,
        activeUsers: tenant._count.tenantUsers,
        totalTimesheets: tenant._count.timesheets,
        subscription: tenant.subscriptions[0] || null,
        createdAt: tenant.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/tenants - Create new tenant (superuser only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createTenantSchema.parse(body);
    
    // Generate slug from company name
    let slug = createTenantSlug(validatedData.name);
    let slugCounter = 1;
    
    // Ensure slug is unique
    while (!(await isSlugAvailable(slug))) {
      slug = `${createTenantSlug(validatedData.name)}-${slugCounter}`;
      slugCounter++;
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Admin email already exists' },
        { status: 400 }
      );
    }

    // Hash admin password
    const hashedPassword = await hash(validatedData.adminPassword, 10);

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.name,
          slug,
          domain: validatedData.domain,
          contactEmail: validatedData.contactEmail,
          contactName: validatedData.contactName,
          address: validatedData.address,
          phone: validatedData.phone,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          currentPlan: validatedData.plan,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
      });

      // Create admin user
      const adminUser = await tx.user.create({
        data: {
          email: validatedData.adminEmail,
          name: validatedData.adminName,
          password: hashedPassword,
          role: UserRole.TENANT_ADMIN,
          emailVerified: new Date(),
        },
      });

      // Link admin user to tenant
      await tx.tenantUser.create({
        data: {
          tenantId: tenant.id,
          userId: adminUser.id,
          role: UserRole.TENANT_ADMIN,
          isActive: true,
        },
      });

      return { tenant, adminUser };
    });

    return NextResponse.json({
      message: 'Tenant created successfully',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        contactEmail: result.tenant.contactEmail,
        subscriptionStatus: result.tenant.subscriptionStatus,
        currentPlan: result.tenant.currentPlan,
        trialEndsAt: result.tenant.trialEndsAt,
      },
      adminUser: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        name: result.adminUser.name,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}