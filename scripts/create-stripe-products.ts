/**
 * Script to create Stripe products and prices for ADSPersoneelapp
 *
 * Run with: npx ts-node scripts/create-stripe-products.ts
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
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  metadata: {
    tier: string;
    maxUsers: string;
  };
}

const plans: PlanConfig[] = [
  {
    name: 'Starter',
    description: 'Perfect voor kleine teams tot 5 gebruikers',
    monthlyPrice: 1900, // €19.00 in cents
    yearlyPrice: 19000, // €190.00 in cents (2 maanden gratis)
    features: [
      'Tot 5 gebruikers',
      'Urenregistratie',
      'Verlofbeheer',
      'Basis rapportages',
      'E-mail support',
    ],
    metadata: {
      tier: 'starter',
      maxUsers: '5',
    },
  },
  {
    name: 'Team',
    description: 'Ideaal voor groeiende teams tot 15 gebruikers',
    monthlyPrice: 3900, // €39.00 in cents
    yearlyPrice: 39000, // €390.00 in cents (2 maanden gratis)
    features: [
      'Tot 15 gebruikers',
      'Alles van Starter',
      'GPS-verificatie',
      'Ziekmeldingen & Poortwachter',
      'Geavanceerde rapportages',
      'Prioriteit support',
    ],
    metadata: {
      tier: 'team',
      maxUsers: '15',
    },
  },
  {
    name: 'Business',
    description: 'Complete oplossing voor bedrijven tot 50 gebruikers',
    monthlyPrice: 7900, // €79.00 in cents
    yearlyPrice: 79000, // €790.00 in cents (2 maanden gratis)
    features: [
      'Tot 50 gebruikers',
      'Alles van Team',
      'Fleet Tracking integratie',
      'API toegang',
      'Custom branding',
      'Dedicated accountmanager',
      'SLA garantie',
    ],
    metadata: {
      tier: 'business',
      maxUsers: '50',
    },
  },
];

async function createProducts() {
  console.log('🚀 Starting Stripe product creation...\n');

  const createdProducts: { plan: string; productId: string; monthlyPriceId: string; yearlyPriceId: string }[] = [];

  for (const plan of plans) {
    console.log(`📦 Creating product: ${plan.name}...`);

    try {
      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `name:'${plan.name}' AND active:'true'`,
      });

      let product: Stripe.Product;

      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`  ⚠️  Product "${plan.name}" already exists (${product.id}), updating...`);

        product = await stripe.products.update(product.id, {
          description: plan.description,
          metadata: plan.metadata,
        });
      } else {
        // Create the product
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: plan.metadata,
        });
        console.log(`  ✅ Product created: ${product.id}`);
      }

      // Check for existing prices
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
      });

      let monthlyPrice: Stripe.Price | undefined;
      let yearlyPrice: Stripe.Price | undefined;

      // Look for existing monthly and yearly prices
      for (const price of existingPrices.data) {
        if (price.recurring?.interval === 'month') {
          monthlyPrice = price;
        } else if (price.recurring?.interval === 'year') {
          yearlyPrice = price;
        }
      }

      // Create monthly price if not exists
      if (!monthlyPrice) {
        monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.monthlyPrice,
          currency: 'eur',
          recurring: {
            interval: 'month',
          },
          metadata: {
            ...plan.metadata,
            billing: 'monthly',
          },
        });
        console.log(`  ✅ Monthly price created: ${monthlyPrice.id} (€${plan.monthlyPrice / 100}/month)`);
      } else {
        console.log(`  ⚠️  Monthly price already exists: ${monthlyPrice.id}`);
      }

      // Create yearly price if not exists
      if (!yearlyPrice) {
        yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.yearlyPrice,
          currency: 'eur',
          recurring: {
            interval: 'year',
          },
          metadata: {
            ...plan.metadata,
            billing: 'yearly',
          },
        });
        console.log(`  ✅ Yearly price created: ${yearlyPrice.id} (€${plan.yearlyPrice / 100}/year)`);
      } else {
        console.log(`  ⚠️  Yearly price already exists: ${yearlyPrice.id}`);
      }

      createdProducts.push({
        plan: plan.name,
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        yearlyPriceId: yearlyPrice.id,
      });

      console.log('');
    } catch (error) {
      console.error(`  ❌ Error creating ${plan.name}:`, error);
    }
  }

  console.log('\n📋 Summary of created products and prices:\n');
  console.log('Add these to your .env.local file:\n');

  for (const item of createdProducts) {
    console.log(`# ${item.plan}`);
    console.log(`STRIPE_PRICE_${item.plan.toUpperCase()}_MONTHLY="${item.monthlyPriceId}"`);
    console.log(`STRIPE_PRICE_${item.plan.toUpperCase()}_YEARLY="${item.yearlyPriceId}"`);
    console.log('');
  }

  console.log('\n✅ Done! Products and prices have been created in Stripe.');
}

createProducts().catch(console.error);
