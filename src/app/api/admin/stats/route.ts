import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { SubscriptionStatus } from '@/types';

// GET /api/admin/stats - Get platform statistics (superuser only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isSuperuser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic counts
    const [
      totalTenants,
      activeTenants,
      trialTenants,
      freemiumTenants,
      totalUsers,
      activeUsers,
      totalTimesheets,
      recentTimesheets,
    ] = await Promise.all([
      // Total tenants
      prisma.tenant.count(),
      
      // Active tenants (not canceled)
      prisma.tenant.count({
        where: {
          subscriptionStatus: {
            notIn: [SubscriptionStatus.CANCELED],
          },
        },
      }),
      
      // Trial tenants
      prisma.tenant.count({
        where: {
          subscriptionStatus: SubscriptionStatus.TRIAL,
        },
      }),
      
      // Freemium tenants
      prisma.tenant.count({
        where: {
          subscriptionStatus: SubscriptionStatus.FREEMIUM,
        },
      }),
      
      // Total users across all tenants
      prisma.user.count({
        where: {
          isSuperuser: false,
        },
      }),
      
      // Active users (in active tenants)
      prisma.tenantUser.count({
        where: {
          isActive: true,
          tenant: {
            subscriptionStatus: {
              notIn: [SubscriptionStatus.CANCELED],
            },
          },
        },
      }),
      
      // Total timesheets
      prisma.timesheet.count(),
      
      // Recent timesheets (last period)
      prisma.timesheet.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Get tenant growth over time
    const tenantGrowth = await prisma.tenant.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get subscription distribution
    const subscriptionDistribution = await prisma.tenant.groupBy({
      by: ['subscriptionStatus', 'currentPlan'],
      _count: {
        id: true,
      },
    });

    // Get recent tenant activity
    const recentTenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionStatus: true,
        currentPlan: true,
        createdAt: true,
        _count: {
          select: {
            tenantUsers: { where: { isActive: true } },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Get top tenants by activity
    const topTenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        subscriptionStatus: true,
        _count: {
          select: {
            timesheets: {
              where: {
                createdAt: {
                  gte: startDate,
                },
              },
            },
            tenantUsers: { where: { isActive: true } },
          },
        },
      },
      orderBy: {
        timesheets: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Calculate revenue metrics (simplified)
    const paidTenants = await prisma.tenant.count({
      where: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });

    // Estimate monthly recurring revenue (MRR)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    const mrr = activeSubscriptions.reduce((total, subscription) => {
      const planPrice = Number(subscription.plan.price);
      const userCount = subscription.userCount ?? 0;
      const includedUsers = subscription.plan.includedUsers ?? 0;
      const pricePerExtraUser = subscription.plan.pricePerExtraUser ?? 0;
      const extraUsers = Math.max(0, userCount - includedUsers);
      const extraUserCost = extraUsers * Number(pricePerExtraUser);
      return total + planPrice + extraUserCost;
    }, 0);

    // Get system health metrics
    const systemHealth = {
      dbConnections: 'healthy', // In a real app, you'd check actual DB connection pool
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // Mock: 2 hours ago
      uptime: process.uptime(),
    };

    // Return with cache headers for admin dashboard performance
    return NextResponse.json(
      {
        overview: {
          totalTenants,
          activeTenants,
          trialTenants,
          freemiumTenants,
          totalUsers,
          activeUsers,
          totalTimesheets,
          recentTimesheets,
          paidTenants,
          mrr: Math.round(mrr * 100) / 100, // Round to 2 decimal places
        },
        growth: {
          tenantGrowth: tenantGrowth.map(item => ({
            date: item.createdAt,
            count: item._count.id,
          })),
          subscriptionDistribution: subscriptionDistribution.map(item => ({
            status: item.subscriptionStatus,
            plan: item.currentPlan,
            count: item._count.id,
          })),
        },
        activity: {
          recentTenants: recentTenants.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.subscriptionStatus,
            plan: tenant.currentPlan,
            activeUsers: tenant._count.tenantUsers,
            createdAt: tenant.createdAt,
          })),
          topTenants: topTenants.map(tenant => ({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.subscriptionStatus,
            activeUsers: tenant._count.tenantUsers,
            recentActivity: tenant._count.timesheets,
          })),
        },
        systemHealth,
      },
      {
        headers: {
          // Admin stats can be cached for 60 seconds
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}