import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-stripe-checkout");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Price ID mapping for Base Fee + Per User pricing model
// Each plan has: base fee (fixed) + per user price (multiplied by user count)
const PRICE_IDS: Record<string, {
  base: { monthly: string; yearly: string };
  perUser: { monthly: string; yearly: string };
  minUsers: number;
}> = {
  starter: {
    base: {
      monthly: process.env.STRIPE_PRICE_STARTER_BASE_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_STARTER_BASE_YEARLY!,
    },
    perUser: {
      monthly: process.env.STRIPE_PRICE_STARTER_USER_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_STARTER_USER_YEARLY!,
    },
    minUsers: 3,
  },
  professional: {
    base: {
      monthly: process.env.STRIPE_PRICE_PROFESSIONAL_BASE_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_PROFESSIONAL_BASE_YEARLY!,
    },
    perUser: {
      monthly: process.env.STRIPE_PRICE_PROFESSIONAL_USER_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_PROFESSIONAL_USER_YEARLY!,
    },
    minUsers: 3,
  },
  business: {
    base: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_BASE_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_BUSINESS_BASE_YEARLY!,
    },
    perUser: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_USER_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_BUSINESS_USER_YEARLY!,
    },
    minUsers: 3,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billing = 'monthly', email, users = 3 } = body;

    // Validate plan
    const planKey = plan?.toLowerCase();
    if (!planKey || !PRICE_IDS[planKey]) {
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

    const planConfig = PRICE_IDS[planKey];

    // Ensure minimum users
    const userCount = Math.max(planConfig.minUsers, Number(users) || planConfig.minUsers);

    // Get price IDs for the selected billing period
    const basePriceId = planConfig.base[billing as 'monthly' | 'yearly'];
    const perUserPriceId = planConfig.perUser[billing as 'monthly' | 'yearly'];

    if (!basePriceId || !perUserPriceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 500 }
      );
    }

    // Get the base URL
    const origin = request.headers.get('origin') || 'http://localhost:3001';

    // Create Stripe checkout session with two line items:
    // 1. Base fee (quantity: 1)
    // 2. Per user price (quantity: number of users)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'ideal'], // Card + iDEAL for Dutch customers
      line_items: [
        {
          price: basePriceId,
          quantity: 1,
        },
        {
          price: perUserPriceId,
          quantity: userCount,
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
        plan: planKey,
        billing,
        users: userCount.toString(),
      },
      subscription_data: {
        metadata: {
          plan: planKey,
          billing,
          users: userCount.toString(),
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
    logger.error("Stripe checkout error", error);

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
