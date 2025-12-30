/**
 * Script to create Stripe products with UPDATED Market-Aligned pricing
 *
 * v3 Pricing model (marktconform, 20-30% onder TimeChimp):
 * - Starter: €15 base + €6/user (min 3 users) - ONGEWIJZIGD
 * - Professional: €35 base + €7/user (min 3 users) - VERHOOGD
 * - Business: €59 base + €6/user (min 3 users) - VERHOOGD
 *
 * Yearly: 20% discount
 *
 * Run with: npx ts-node scripts/create-stripe-products-v3.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

interface PlanConfig {
  name: string;
  id: string;
  description: string;
  baseFeeMonthly: number;      // Base fee in cents
  baseFeeYearly: number;       // Base fee yearly (20% discount)
  perUserMonthly: number;      // Per user price in cents
  perUserYearly: number;       // Per user yearly (20% discount)
  minUsers: number;
  features: string[];
  metadata: {
    tier: string;
    minUsers: string;
    version: string;
  };
}

const plans: PlanConfig[] = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect voor kleine teams - Basis HR functionaliteit',
    baseFeeMonthly: 1500,      // €15.00 (ongewijzigd)
    baseFeeYearly: 14400,      // €144.00 (€12/mnd - 20% korting)
    perUserMonthly: 600,       // €6.00 (ongewijzigd)
    perUserYearly: 5760,       // €57.60/user/jaar (€4.80/mnd - 20% korting)
    minUsers: 3,
    features: [
      'Urenregistratie met GPS',
      'Verlof & TVT beheer',
      'Ziekmeldingen',
      'Goedkeuringsworkflows',
      'Basis rapportages',
      'Email support',
    ],
    metadata: {
      tier: 'starter',
      minUsers: '3',
      version: 'v3',
    },
  },
  {
    name: 'Professional',
    id: 'professional',
    description: 'Voor groeiende teams - Uitgebreide HR & Fleet tracking',
    baseFeeMonthly: 3500,      // €35.00 (was €25.00 - +€10)
    baseFeeYearly: 33600,      // €336.00 (€28/mnd - 20% korting)
    perUserMonthly: 700,       // €7.00 (was €5.00 - +€2)
    perUserYearly: 6720,       // €67.20/user/jaar (€5.60/mnd - 20% korting)
    minUsers: 3,
    features: [
      'Alles uit Starter',
      'Fleet tracking integratie',
      'Geavanceerde rapportages',
      'Bulk goedkeuringen',
      'Teamkalenders',
      'UWV Poortwachter alerts',
      'API toegang',
      'Chat & email support',
    ],
    metadata: {
      tier: 'professional',
      minUsers: '3',
      version: 'v3',
    },
  },
  {
    name: 'Business',
    id: 'business',
    description: 'Enterprise oplossing - Volledige controle & ondersteuning',
    baseFeeMonthly: 5900,      // €59.00 (was €39.00 - +€20)
    baseFeeYearly: 56640,      // €566.40 (€47.20/mnd - 20% korting)
    perUserMonthly: 600,       // €6.00 (was €4.00 - +€2)
    perUserYearly: 5760,       // €57.60/user/jaar (€4.80/mnd - 20% korting)
    minUsers: 3,
    features: [
      'Alles uit Professional',
      'Onbeperkte fleet integraties',
      'Custom rapportages',
      'Multi-tenant ondersteuning',
      'SSO / SAML authenticatie',
      'SLA garantie (99.9%)',
      'Prioriteit support',
      'Dedicated account manager',
      'Onboarding sessies',
    ],
    metadata: {
      tier: 'business',
      minUsers: '3',
      version: 'v3',
    },
  },
];

interface CreatedPrices {
  plan: string;
  productId: string;
  baseFeeMonthlyId: string;
  baseFeeYearlyId: string;
  perUserMonthlyId: string;
  perUserYearlyId: string;
}

async function createProducts() {
  console.log('🚀 Creating Stripe products with MARKET-ALIGNED v3 pricing...\n');
  console.log('📊 Comparison with TimeChimp (5 users):');
  console.log('   Starter: €45/mnd vs €45-55 (TimeChimp Essential) ✅');
  console.log('   Professional: €70/mnd vs €74-88 (TimeChimp Advanced) - 20% cheaper');
  console.log('   Business: €89/mnd vs €104-124 (TimeChimp Pro) - 25% cheaper\n');

  const createdProducts: CreatedPrices[] = [];

  for (const plan of plans) {
    console.log(`📦 Creating product: ${plan.name} v3...`);

    try {
      // Create or find the product
      const existingProducts = await stripe.products.search({
        query: `name:'${plan.name} v3' AND active:'true'`,
      });

      let product: Stripe.Product;

      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`  ⚠️  Product exists (${product.id}), updating...`);
        product = await stripe.products.update(product.id, {
          description: plan.description,
          metadata: plan.metadata,
        });
      } else {
        product = await stripe.products.create({
          name: `${plan.name} v3`,
          description: plan.description,
          metadata: plan.metadata,
        });
        console.log(`  ✅ Product created: ${product.id}`);
      }

      // Create Base Fee prices
      console.log(`  Creating base fee prices...`);

      const baseFeeMonthly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.baseFeeMonthly,
        currency: 'eur',
        recurring: { interval: 'month' },
        nickname: `${plan.name} v3 Base Fee - Monthly`,
        metadata: {
          tier: plan.id,
          type: 'base_fee',
          billing: 'monthly',
          version: 'v3',
        },
      });
      console.log(`  ✅ Base fee monthly: ${baseFeeMonthly.id} (€${plan.baseFeeMonthly / 100}/mnd)`);

      const baseFeeYearly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.baseFeeYearly,
        currency: 'eur',
        recurring: { interval: 'year' },
        nickname: `${plan.name} v3 Base Fee - Yearly`,
        metadata: {
          tier: plan.id,
          type: 'base_fee',
          billing: 'yearly',
          version: 'v3',
        },
      });
      console.log(`  ✅ Base fee yearly: ${baseFeeYearly.id} (€${plan.baseFeeYearly / 100}/jaar)`);

      // Create Per User prices (metered)
      console.log(`  Creating per-user prices...`);

      const perUserMonthly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.perUserMonthly,
        currency: 'eur',
        recurring: {
          interval: 'month',
          usage_type: 'licensed',  // Fixed quantity per billing period
        },
        nickname: `${plan.name} v3 Per User - Monthly`,
        metadata: {
          tier: plan.id,
          type: 'per_user',
          billing: 'monthly',
          version: 'v3',
        },
      });
      console.log(`  ✅ Per user monthly: ${perUserMonthly.id} (€${plan.perUserMonthly / 100}/user/mnd)`);

      const perUserYearly = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.perUserYearly,
        currency: 'eur',
        recurring: {
          interval: 'year',
          usage_type: 'licensed',
        },
        nickname: `${plan.name} v3 Per User - Yearly`,
        metadata: {
          tier: plan.id,
          type: 'per_user',
          billing: 'yearly',
          version: 'v3',
        },
      });
      console.log(`  ✅ Per user yearly: ${perUserYearly.id} (€${plan.perUserYearly / 100}/user/jaar)`);

      createdProducts.push({
        plan: plan.name,
        productId: product.id,
        baseFeeMonthlyId: baseFeeMonthly.id,
        baseFeeYearlyId: baseFeeYearly.id,
        perUserMonthlyId: perUserMonthly.id,
        perUserYearlyId: perUserYearly.id,
      });

      console.log('');
    } catch (error) {
      console.error(`  ❌ Error creating ${plan.name}:`, error);
    }
  }

  // Output environment variables
  console.log('\n📋 Add these to your .env.local file:\n');
  console.log('# Stripe Price IDs v3 - Market-Aligned Pricing');
  console.log('# Pricing: Base fee + per user (min 3 users), 20% yearly discount\n');

  for (const item of createdProducts) {
    const planId = item.plan.toUpperCase();
    console.log(`# ${item.plan}`);
    console.log(`STRIPE_PRICE_${planId}_BASE_MONTHLY="${item.baseFeeMonthlyId}"`);
    console.log(`STRIPE_PRICE_${planId}_BASE_YEARLY="${item.baseFeeYearlyId}"`);
    console.log(`STRIPE_PRICE_${planId}_USER_MONTHLY="${item.perUserMonthlyId}"`);
    console.log(`STRIPE_PRICE_${planId}_USER_YEARLY="${item.perUserYearlyId}"`);
    console.log('');
  }

  console.log('\n✅ Done! Market-aligned v3 pricing products created in Stripe.');
  console.log('\n📊 NEW Pricing Summary (v3 - Market Aligned):');
  console.log('┌─────────────────┬───────────────┬────────────────┬─────────────┬──────────────┐');
  console.log('│ Plan            │ Base Fee/mnd  │ Per User/mnd   │ Min (3 usr) │ 5 users      │');
  console.log('├─────────────────┼───────────────┼────────────────┼─────────────┼──────────────┤');
  console.log('│ Starter         │ €15           │ €6             │ €33/mnd     │ €45/mnd      │');
  console.log('│ Professional    │ €35 (+€10)    │ €7 (+€2)       │ €56/mnd     │ €70/mnd      │');
  console.log('│ Business        │ €59 (+€20)    │ €6 (+€2)       │ €77/mnd     │ €89/mnd      │');
  console.log('└─────────────────┴───────────────┴────────────────┴─────────────┴──────────────┘');
  console.log('\n💰 Revenue increase per 5-user customer:');
  console.log('   Professional: €50 → €70/mnd (+40%)');
  console.log('   Business: €59 → €89/mnd (+51%)');
}

createProducts().catch(console.error);
