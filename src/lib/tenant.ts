import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  currentPlan: string;
  trialEndsAt?: Date;
}

export async function getTenantFromSlug(slug: string): Promise<TenantContext | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionStatus: true,
        currentPlan: true,
        trialEndsAt: true,
      },
    });

    return tenant;
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
}

export async function getTenantFromDomain(domain: string): Promise<TenantContext | null> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { domain },
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionStatus: true,
        currentPlan: true,
        trialEndsAt: true,
      },
    });

    return tenant;
  } catch (error) {
    console.error('Error fetching tenant by domain:', error);
    return null;
  }
}

export async function getCurrentTenant(): Promise<TenantContext | null> {
  const headersList = await headers();
  const host = headersList.get('host');
  
  if (!host) return null;

  // Check if it's a custom domain
  if (!host.includes('ads-personeelsapp.nl')) {
    return await getTenantFromDomain(host);
  }

  // Extract tenant slug from subdomain
  const subdomain = host.split('.')[0];
  
  // Skip main domain and superuser subdomain
  if (subdomain === 'www' || subdomain === 'admin' || subdomain === 'ads-personeelsapp') {
    return null;
  }

  return await getTenantFromSlug(subdomain);
}

export async function getUserTenants(userId: string) {
  try {
    const tenantUsers = await prisma.tenantUser.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true,
            currentPlan: true,
            trialEndsAt: true,
          },
        },
      },
    });

    return tenantUsers.map(tu => ({
      ...tu.tenant,
      userRole: tu.role,
    }));
  } catch (error) {
    console.error('Error fetching user tenants:', error);
    return [];
  }
}

export async function canUserAccessTenant(userId: string, tenantId: string): Promise<boolean> {
  try {
    const tenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    return tenantUser?.isActive ?? false;
  } catch (error) {
    console.error('Error checking tenant access:', error);
    return false;
  }
}

export async function isSuperuser(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperuser: true },
    });

    return user?.isSuperuser ?? false;
  } catch (error) {
    console.error('Error checking superuser status:', error);
    return false;
  }
}

export function createTenantSlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    return !existingTenant;
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
}