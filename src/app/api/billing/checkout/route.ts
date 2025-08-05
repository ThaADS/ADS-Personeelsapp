import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { StripeSubscriptionService } from '@/lib/stripe/subscription-service';
import { z } from 'zod';
import { canManageBilling } from '@/lib/rbac';

const checkoutSchema = z.object({
  userCount: z.number().min(1).max(100),
  interval: z.enum(['month', 'year']),
  returnUrl: z.string().url().optional(),
});

// POST /api/billing/checkout - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can manage billing
    if (!canManageBilling(session.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (!session.user.tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    const stripeService = new StripeSubscriptionService();
    
    // Get the current domain for success/cancel URLs
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const successUrl = validatedData.returnUrl || `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/dashboard/billing?canceled=true`;

    const checkoutSession = await stripeService.createCheckoutSession(
      session.user.tenantId,
      validatedData.userCount,
      validatedData.interval,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}