import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Price ID mapping
const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY!,
  },
  team: {
    monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_TEAM_YEARLY!,
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY!,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billing = 'monthly', email } = body;

    // Validate plan
    if (!plan || !PRICE_IDS[plan.toLowerCase()]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Validate billing period
    if (!['monthly', 'yearly'].includes(billing)) {
      return NextResponse.json(
        { error: 'Invalid billing period' },
        { status: 400 }
      );
    }

    const priceId = PRICE_IDS[plan.toLowerCase()][billing];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 500 }
      );
    }

    // Get the base URL
    const origin = request.headers.get('origin') || 'http://localhost:3001';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'ideal'], // Card + iDEAL for Dutch customers
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
      metadata: {
        plan: plan.toLowerCase(),
        billing,
      },
      subscription_data: {
        metadata: {
          plan: plan.toLowerCase(),
          billing,
        },
        trial_period_days: 14, // 14 dagen gratis trial
      },
      locale: 'nl', // Dutch locale
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
