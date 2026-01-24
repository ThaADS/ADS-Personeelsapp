import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { StripeSubscriptionService } from '@/lib/stripe/subscription-service';
import { prisma } from '@/lib/db/prisma';
import { canManageBilling } from '@/lib/rbac';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StripeSubscription = any;

const updateSubscriptionSchema = z.object({
  userCount: z.number().min(1).max(100).optional(),
  interval: z.enum(['month', 'year']).optional(),
});

// GET /api/billing/subscription - Get current subscription details
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const currentSubscription = tenant.subscriptions[0];
    let stripeSubscription: StripeSubscription | null = null;

    // Get Stripe subscription details if available
    if (tenant.stripeSubscriptionId) {
      try {
        const stripeService = new StripeSubscriptionService();
        stripeSubscription = await stripeService.getSubscription(tenant.stripeSubscriptionId);
      } catch (error) {
        console.error('Failed to fetch Stripe subscription:', error);
      }
    }

    // Get active user count
    const activeUserCount = await prisma.tenantUser.count({
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
      },
    });

    // Calculate pricing
    const basePlanPrice = currentSubscription?.plan?.price || 0;
    const includedUsers = currentSubscription?.plan?.includedUsers || 1;
    const extraUsers = Math.max(0, activeUserCount - includedUsers);
    const extraUserPrice = currentSubscription?.plan?.pricePerExtraUser || 0;
    const extraUserCost = extraUsers * Number(extraUserPrice);
    const totalMonthlyPrice = Number(basePlanPrice) + extraUserCost;

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        subscriptionStatus: tenant.subscriptionStatus,
        currentPlan: tenant.currentPlan,
        trialEndsAt: tenant.trialEndsAt,
        stripeCustomerId: tenant.stripeCustomerId,
      },
      subscription: currentSubscription ? {
        id: currentSubscription.id,
        status: currentSubscription.status,
        currentPeriodStart: currentSubscription.currentPeriodStart,
        currentPeriodEnd: currentSubscription.currentPeriodEnd,
        trialEnd: currentSubscription.trialEnd,
        userCount: currentSubscription.userCount,
        plan: {
          name: currentSubscription.plan.name,
          type: currentSubscription.plan.type,
          price: currentSubscription.plan.price,
          yearlyPrice: currentSubscription.plan.yearlyPrice,
          includedUsers: currentSubscription.plan.includedUsers,
          pricePerExtraUser: currentSubscription.plan.pricePerExtraUser,
          features: currentSubscription.plan.features,
        },
      } : null,
      stripeSubscription: stripeSubscription ? {
        status: stripeSubscription.status,
        currentPeriodEnd: stripeSubscription.current_period_end || 0,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end ?? false,
      } : null,
      usage: {
        activeUsers: activeUserCount,
        includedUsers,
        extraUsers,
        extraUserCost,
        totalMonthlyPrice,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/billing/subscription - Update subscription
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageBilling(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!session.user.tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (!tenant || !tenant.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const stripeService = new StripeSubscriptionService();

    // Update user count if provided
    if (validatedData.userCount) {
      await stripeService.updateSubscriptionUserCount(
        tenant.stripeSubscriptionId,
        validatedData.userCount
      );
    }

    // Get updated subscription
    const updatedSubscription: StripeSubscription = await stripeService.getSubscription(tenant.stripeSubscriptionId);

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        currentPeriodStart: updatedSubscription.current_period_start
          ? new Date(updatedSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: updatedSubscription.current_period_end
          ? new Date(updatedSubscription.current_period_end * 1000)
          : null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/billing/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canManageBilling(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!session.user.tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const url = new URL(request.url);
    const immediately = url.searchParams.get('immediately') === 'true';

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (!tenant || !tenant.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const stripeService = new StripeSubscriptionService();
    const canceledSubscription: StripeSubscription = await stripeService.cancelSubscription(
      tenant.stripeSubscriptionId,
      immediately
    );

    return NextResponse.json({
      message: immediately ? 'Subscription canceled immediately' : 'Subscription will be canceled at period end',
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
        currentPeriodEnd: canceledSubscription.current_period_end
          ? new Date(canceledSubscription.current_period_end * 1000)
          : null,
      },
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}