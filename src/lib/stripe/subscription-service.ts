import { stripe, STRIPE_CONFIG, formatAmountForStripe } from './config';
import { PrismaClient } from '@prisma/client';
import { SubscriptionStatus, PlanType } from '@/types';
import Stripe from 'stripe';

const prisma = new PrismaClient();

export interface CreateSubscriptionParams {
  tenantId: string;
  userCount: number;
  interval: 'month' | 'year';
  priceId?: string;
  trialDays?: number;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  userCount?: number;
  priceId?: string;
}

export class StripeSubscriptionService {
  
  /**
   * Create a Stripe customer for a tenant
   */
  async createCustomer(tenantId: string): Promise<Stripe.Customer> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const customer = await stripe.customers.create({
      email: tenant.contactEmail,
      name: tenant.name,
      metadata: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
      },
      address: tenant.address ? {
        line1: tenant.address,
      } : undefined,
      phone: tenant.phone || undefined,
    });

    // Update tenant with Stripe customer ID
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer;
  }

  /**
   * Create a subscription for a tenant
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
    const { tenantId, userCount, interval, priceId, trialDays = 14 } = params;

    // Get or create Stripe customer
    let tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await this.createCustomer(tenantId);
      customerId = customer.id;
      tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    }

    // Get the appropriate price ID
    let subscriptionPriceId = priceId;
    if (!subscriptionPriceId) {
      subscriptionPriceId = interval === 'year' 
        ? STRIPE_CONFIG.prices.standardYearly 
        : STRIPE_CONFIG.prices.standardMonthly;
    }

    if (!subscriptionPriceId) {
      throw new Error('No price ID available for subscription');
    }

    // Calculate line items
    const lineItems: Stripe.SubscriptionCreateParams.Item[] = [
      {
        price: subscriptionPriceId,
        quantity: 1, // Base plan
      },
    ];

    // Add extra users if more than 3
    const includedUsers = 3;
    const extraUsers = Math.max(0, userCount - includedUsers);
    
    if (extraUsers > 0) {
      lineItems.push({
        price: STRIPE_CONFIG.prices.extraUserMonthly,
        quantity: extraUsers,
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: lineItems,
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        tenantId,
        userCount: userCount.toString(),
        plan: 'standard',
      },
    });

    // Save subscription to database
    const plan = await prisma.plan.findFirst({
      where: { type: PlanType.STANDARD },
    });

    if (plan) {
      // Access subscription data (handle Stripe API response type)
      const subData = subscription as unknown as {
        id: string;
        current_period_start: number;
        current_period_end: number;
        trial_end: number | null;
      };

      await prisma.subscription.create({
        data: {
          tenantId,
          planId: plan.id,
          stripeSubscriptionId: subData.id,
          stripePriceId: subscriptionPriceId,
          status: SubscriptionStatus.TRIAL,
          currentPeriodStart: new Date(subData.current_period_start * 1000),
          currentPeriodEnd: new Date(subData.current_period_end * 1000),
          trialEnd: subData.trial_end ? new Date(subData.trial_end * 1000) : null,
          userCount,
        },
      });
    }

    // Update tenant (reuse subData from above for type safety)
    const subDataForTenant = subscription as unknown as {
      id: string;
      trial_end: number | null;
    };

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        stripeSubscriptionId: subDataForTenant.id,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        currentPlan: PlanType.STANDARD,
        trialEndsAt: subDataForTenant.trial_end ? new Date(subDataForTenant.trial_end * 1000) : null,
      },
    });

    return subscription;
  }

  /**
   * Update subscription user count
   */
  async updateSubscriptionUserCount(subscriptionId: string, newUserCount: number): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items'],
    });

    if (!subscription.items.data) {
      throw new Error('Subscription items not found');
    }

    const baseItem = subscription.items.data.find(item => 
      item.price.metadata.plan === 'standard'
    );
    
    const extraUserItem = subscription.items.data.find(item => 
      item.price.metadata.type === 'extra_user'
    );

    if (!baseItem) {
      throw new Error('Base subscription item not found');
    }

    const includedUsers = 3;
    const extraUsers = Math.max(0, newUserCount - includedUsers);

    // Update items
    const items: Stripe.SubscriptionUpdateParams.Item[] = [
      {
        id: baseItem.id,
        quantity: 1,
      },
    ];

    if (extraUsers > 0) {
      if (extraUserItem) {
        // Update existing extra user item
        items.push({
          id: extraUserItem.id,
          quantity: extraUsers,
        });
      } else {
        // Add new extra user item
        items.push({
          price: STRIPE_CONFIG.prices.extraUserMonthly,
          quantity: extraUsers,
        });
      }
    } else if (extraUserItem) {
      // Remove extra user item
      items.push({
        id: extraUserItem.id,
        deleted: true,
      });
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items,
      proration_behavior: 'create_prorations',
      metadata: {
        ...subscription.metadata,
        userCount: newUserCount.toString(),
      },
    });

    // Update database
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { userCount: newUserCount },
    });

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
      ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
    });

    // Update database
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { 
        status: immediately ? SubscriptionStatus.CANCELED : SubscriptionStatus.ACTIVE,
      },
    });

    // Update tenant if canceling immediately
    if (immediately) {
      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (dbSubscription) {
        await prisma.tenant.update({
          where: { id: dbSubscription.tenantId },
          data: {
            subscriptionStatus: SubscriptionStatus.FREEMIUM,
            currentPlan: PlanType.FREEMIUM,
          },
        });
      }
    }

    return subscription;
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    tenantId: string,
    userCount: number,
    interval: 'month' | 'year',
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get or create customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await this.createCustomer(tenantId);
      customerId = customer.id;
    }

    // Get price ID
    const priceId = interval === 'year' 
      ? STRIPE_CONFIG.prices.standardYearly 
      : STRIPE_CONFIG.prices.standardMonthly;

    if (!priceId) {
      throw new Error('Price not configured for interval: ' + interval);
    }

    // Calculate line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Add extra users
    const includedUsers = 3;
    const extraUsers = Math.max(0, userCount - includedUsers);
    
    if (extraUsers > 0) {
      lineItems.push({
        price: STRIPE_CONFIG.prices.extraUserMonthly,
        quantity: extraUsers,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          tenantId,
          userCount: userCount.toString(),
          plan: 'standard',
        },
      },
      metadata: {
        tenantId,
        userCount: userCount.toString(),
      },
    });

    return session;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'items.data.price'],
    });
  }

  /**
   * Get customer portal URL
   */
  async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
}