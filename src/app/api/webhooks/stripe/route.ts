import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/prisma";
import { SubscriptionStatus, PlanType } from "@/types";
import Stripe from "stripe";

// Disable body parsing, we need raw body for webhook signature verification
export const dynamic = "force-dynamic";

type StripeSubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
  trial_end?: number | null;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
};

async function handleSubscriptionCreated(subscription: StripeSubscriptionWithPeriods) {
  const tenantId = subscription.metadata?.tenantId;

  if (!tenantId) {
    console.error("No tenantId in subscription metadata");
    return;
  }

  // Get plan from database
  const plan = await prisma.plan.findFirst({
    where: { type: PlanType.STANDARD },
  });

  if (!plan) {
    console.error("Standard plan not found in database");
    return;
  }

  // Determine status based on Stripe subscription status
  let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
  if (subscription.status === "trialing") {
    status = SubscriptionStatus.TRIAL;
  } else if (subscription.status === "past_due") {
    status = SubscriptionStatus.PAST_DUE;
  } else if (subscription.status === "unpaid") {
    status = SubscriptionStatus.UNPAID;
  } else if (subscription.status === "canceled") {
    status = SubscriptionStatus.CANCELED;
  }

  const userCount = parseInt(subscription.metadata?.userCount || "3", 10);

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    create: {
      tenantId,
      planId: plan.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || "",
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      userCount,
    },
    update: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      userCount,
    },
  });

  // Update tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: status,
      currentPlan: PlanType.STANDARD,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });

  console.log(`Subscription created/updated for tenant ${tenantId}: ${status}`);
}

async function handleSubscriptionUpdated(subscription: StripeSubscriptionWithPeriods) {
  const tenantId = subscription.metadata?.tenantId;

  if (!tenantId) {
    // Try to find tenant by subscription ID
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (existingSubscription) {
      await updateSubscriptionFromStripe(
        existingSubscription.tenantId,
        subscription
      );
    }
    return;
  }

  await updateSubscriptionFromStripe(tenantId, subscription);
}

async function updateSubscriptionFromStripe(
  tenantId: string,
  subscription: StripeSubscriptionWithPeriods
) {
  // Determine status
  let status: SubscriptionStatus = SubscriptionStatus.ACTIVE;
  if (subscription.status === "trialing") {
    status = SubscriptionStatus.TRIAL;
  } else if (subscription.status === "past_due") {
    status = SubscriptionStatus.PAST_DUE;
  } else if (subscription.status === "unpaid") {
    status = SubscriptionStatus.UNPAID;
  } else if (
    subscription.status === "canceled" ||
    subscription.cancel_at_period_end
  ) {
    status = SubscriptionStatus.CANCELED;
  }

  const userCount = parseInt(subscription.metadata?.userCount || "3", 10);

  // Update subscription
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      userCount,
    },
  });

  // Update tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: status,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  });

  console.log(`Subscription updated for tenant ${tenantId}: ${status}`);
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionWithPeriods) {
  // Find the subscription in our database
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    console.log("Subscription not found in database:", subscription.id);
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELED,
    },
  });

  // Downgrade tenant to freemium
  await prisma.tenant.update({
    where: { id: dbSubscription.tenantId },
    data: {
      subscriptionStatus: SubscriptionStatus.FREEMIUM,
      currentPlan: PlanType.FREEMIUM,
      stripeSubscriptionId: null,
    },
  });

  console.log(
    `Subscription deleted, tenant ${dbSubscription.tenantId} downgraded to FREEMIUM`
  );
}

async function handleInvoicePaymentSucceeded(invoice: StripeInvoiceWithSubscription) {
  if (!invoice.subscription) return;

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;

  // Find the subscription
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) return;

  // If it was in trial or past_due, update to active
  if (
    dbSubscription.status === SubscriptionStatus.TRIAL ||
    dbSubscription.status === SubscriptionStatus.PAST_DUE
  ) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE },
    });

    await prisma.tenant.update({
      where: { id: dbSubscription.tenantId },
      data: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    });

    console.log(
      `Payment succeeded, subscription ${subscriptionId} now ACTIVE`
    );
  }
}

async function handleInvoicePaymentFailed(invoice: StripeInvoiceWithSubscription) {
  if (!invoice.subscription) return;

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;

  // Find the subscription
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!dbSubscription) return;

  // Update to past_due
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: SubscriptionStatus.PAST_DUE },
  });

  await prisma.tenant.update({
    where: { id: dbSubscription.tenantId },
    data: { subscriptionStatus: SubscriptionStatus.PAST_DUE },
  });

  console.log(
    `Payment failed, subscription ${subscriptionId} now PAST_DUE`
  );

  // TODO: Send notification email to tenant admin
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const tenantId = session.metadata?.tenantId;
  const subscriptionId = session.subscription;

  if (!tenantId || !subscriptionId) {
    console.log("Missing tenantId or subscriptionId in checkout session");
    return;
  }

  const stripeSubscriptionId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;

  // Fetch the full subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Handle as subscription created
  await handleSubscriptionCreated(subscription as unknown as StripeSubscriptionWithPeriods);

  console.log(`Checkout completed for tenant ${tenantId}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as unknown as StripeSubscriptionWithPeriods
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as unknown as StripeSubscriptionWithPeriods
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as unknown as StripeSubscriptionWithPeriods
        );
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as unknown as StripeInvoiceWithSubscription);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as unknown as StripeInvoiceWithSubscription);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
