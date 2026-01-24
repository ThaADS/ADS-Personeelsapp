import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { StripeSubscriptionService } from '@/lib/stripe/subscription-service';
import { prisma } from '@/lib/db/prisma';
import { canManageBilling } from '@/lib/rbac';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-billing-portal");

// POST /api/billing/portal - Create Stripe customer portal session
export async function POST(request: NextRequest) {
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

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (!tenant.stripeCustomerId) {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const { returnUrl } = await request.json();
    
    // Get the current domain for return URL
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const defaultReturnUrl = `${protocol}://${host}/billing`;
    
    const stripeService = new StripeSubscriptionService();
    const portalSession = await stripeService.createPortalSession(
      tenant.stripeCustomerId,
      returnUrl || defaultReturnUrl
    );

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    logger.error("Error creating portal session", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}