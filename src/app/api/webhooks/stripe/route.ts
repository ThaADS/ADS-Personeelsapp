import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/prisma";
import { SubscriptionStatus, PlanType } from "@/types";
import Stripe from "stripe";
import { createLogger } from "@/lib/logger";
import { sendEmail } from "@/lib/services/email-service";
import { getPaymentFailedEmail, getSubscriptionCanceledEmail } from "@/lib/email/templates";

const logger = createLogger("stripe-webhook");

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
    logger.warn("No tenantId in subscription metadata", { subscriptionId: subscription.id });
    return;
  }

  // Get plan from database
  const plan = await prisma.plan.findFirst({
    where: { type: PlanType.STANDARD },
  });

  if (!plan) {
    logger.error("Standard plan not found in database");
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

  logger.info("Subscription created/updated", { tenantId, status, subscriptionId: subscription.id });
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

  logger.info("Subscription updated", { tenantId, status, subscriptionId: subscription.id });
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionWithPeriods) {
  // Find the subscription in our database
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSubscription) {
    logger.warn("Subscription not found in database", { subscriptionId: subscription.id });
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

  logger.info("Subscription deleted, tenant downgraded to FREEMIUM", {
    tenantId: dbSubscription.tenantId,
    subscriptionId: subscription.id
  });

  // Send subscription canceled notification email
  await sendSubscriptionCanceledNotification(dbSubscription.tenantId, subscription);
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

    logger.info("Payment succeeded, subscription now ACTIVE", {
      subscriptionId,
      tenantId: dbSubscription.tenantId
    });
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

  logger.warn("Payment failed, subscription now PAST_DUE", {
    subscriptionId,
    tenantId: dbSubscription.tenantId
  });

  // Send notification email to tenant admin
  await sendPaymentFailedNotification(dbSubscription.tenantId, invoice);
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const tenantId = session.metadata?.tenantId;
  const subscriptionId = session.subscription;

  if (!tenantId || !subscriptionId) {
    logger.warn("Missing tenantId or subscriptionId in checkout session", { sessionId: session.id });
    return;
  }

  const stripeSubscriptionId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;

  // Fetch the full subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Handle as subscription created
  await handleSubscriptionCreated(subscription as unknown as StripeSubscriptionWithPeriods);

  logger.info("Checkout completed", { tenantId, subscriptionId: stripeSubscriptionId });
}

/**
 * Send payment failed notification email to tenant admin
 */
async function sendPaymentFailedNotification(tenantId: string, invoice: StripeInvoiceWithSubscription) {
  try {
    // Get tenant with admin user
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantUsers: {
          where: { role: "TENANT_ADMIN" },
          include: { user: true },
          take: 1,
        },
      },
    });

    if (!tenant || !tenant.tenantUsers[0]?.user) {
      logger.warn("Could not find tenant admin for payment failed notification", { tenantId });
      return;
    }

    const admin = tenant.tenantUsers[0].user;
    const amount = invoice.amount_due
      ? new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(invoice.amount_due / 100)
      : "Onbekend";

    const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ads-personeelsapp.nl"}/billing`;

    const emailData = getPaymentFailedEmail({
      adminName: admin.name || admin.email,
      tenantName: tenant.name,
      amount,
      failureReason: invoice.last_finalization_error?.message,
      billingUrl,
    });

    const sent = await sendEmail(admin.email, emailData.subject, emailData.html, emailData.text);

    if (sent) {
      logger.info("Payment failed notification email sent", { tenantId, adminEmail: admin.email });
    } else {
      logger.warn("Failed to send payment failed notification email", { tenantId, adminEmail: admin.email });
    }
  } catch (error) {
    logger.error("Error sending payment failed notification", error, { tenantId });
  }
}

/**
 * Send subscription canceled notification email to tenant admin
 */
async function sendSubscriptionCanceledNotification(tenantId: string, subscription: StripeSubscriptionWithPeriods) {
  try {
    // Get tenant with admin user
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantUsers: {
          where: { role: "TENANT_ADMIN" },
          include: { user: true },
          take: 1,
        },
      },
    });

    if (!tenant || !tenant.tenantUsers[0]?.user) {
      logger.warn("Could not find tenant admin for subscription canceled notification", { tenantId });
      return;
    }

    const admin = tenant.tenantUsers[0].user;
    const endDate = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toLocaleDateString("nl-NL", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Onbekend";

    const reactivateUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ads-personeelsapp.nl"}/billing`;

    const emailData = getSubscriptionCanceledEmail({
      adminName: admin.name || admin.email,
      tenantName: tenant.name,
      endDate,
      reactivateUrl,
    });

    const sent = await sendEmail(admin.email, emailData.subject, emailData.html, emailData.text);

    if (sent) {
      logger.info("Subscription canceled notification email sent", { tenantId, adminEmail: admin.email });
    } else {
      logger.warn("Failed to send subscription canceled notification email", { tenantId, adminEmail: admin.email });
    }
  } catch (error) {
    logger.error("Error sending subscription canceled notification", error, { tenantId });
  }
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
    logger.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  logger.info("Processing webhook event", { eventType: event.type, eventId: event.id });

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
        logger.debug("Unhandled event type", { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook", error, { eventType: event.type, eventId: event.id });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
