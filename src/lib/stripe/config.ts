import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const STRIPE_CONFIG = {
  // Product and Price IDs - these should be set up in Stripe Dashboard
  products: {
    standard: process.env.STRIPE_STANDARD_PRODUCT_ID || '',
  },
  prices: {
    standardMonthly: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID || '',
    standardYearly: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID || '',
    extraUserMonthly: process.env.STRIPE_EXTRA_USER_MONTHLY_PRICE_ID || '',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'eur',
  locale: 'nl',
  
  // Default pricing (in cents)
  defaultPricing: {
    standardMonthly: 4995, // €49.95
    standardYearly: 47952, // €479.52 (20% discount)
    extraUserMonthly: 495,  // €4.95
  },
};

// Utility function to format amounts for Stripe (convert euros to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Utility function to format amounts for display (convert cents to euros)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

// Create Stripe products and prices if they don't exist
export const ensureStripeProducts = async () => {
  try {
    // Create Standard Product if it doesn't exist
    let standardProduct: Stripe.Product;
    
    if (STRIPE_CONFIG.products.standard) {
      try {
        standardProduct = await stripe.products.retrieve(STRIPE_CONFIG.products.standard);
      } catch {
        // Product doesn't exist, create it
        standardProduct = await createStandardProduct();
      }
    } else {
      standardProduct = await createStandardProduct();
    }

    // Create prices if they don't exist
    const prices = await ensureStandardPrices(standardProduct.id);
    
    return {
      standardProduct,
      prices,
    };
  } catch (error) {
    console.error('Error ensuring Stripe products:', error);
    throw error;
  }
};

const createStandardProduct = async (): Promise<Stripe.Product> => {
  return await stripe.products.create({
    name: 'ADS Personeelsapp Standard',
    description: 'Complete HR management solution with advanced features',
    type: 'service',
    metadata: {
      plan: 'standard',
      includedUsers: '3',
    },
  });
};

const ensureStandardPrices = async (productId: string) => {
  const prices = {
    monthly: null as Stripe.Price | null,
    yearly: null as Stripe.Price | null,
    extraUser: null as Stripe.Price | null,
  };

  // Check if monthly price exists
  if (STRIPE_CONFIG.prices.standardMonthly) {
    try {
      prices.monthly = await stripe.prices.retrieve(STRIPE_CONFIG.prices.standardMonthly);
    } catch {
      console.log('Monthly price not found, creating...');
    }
  }

  // Create monthly price if it doesn't exist
  if (!prices.monthly) {
    prices.monthly = await stripe.prices.create({
      product: productId,
      unit_amount: STRIPE_CONFIG.defaultPricing.standardMonthly,
      currency: STRIPE_CONFIG.currency,
      recurring: {
        interval: 'month',
      },
      nickname: 'Standard Monthly',
      metadata: {
        plan: 'standard',
        interval: 'month',
        includedUsers: '3',
      },
    });
  }

  // Check if yearly price exists
  if (STRIPE_CONFIG.prices.standardYearly) {
    try {
      prices.yearly = await stripe.prices.retrieve(STRIPE_CONFIG.prices.standardYearly);
    } catch {
      console.log('Yearly price not found, creating...');
    }
  }

  // Create yearly price if it doesn't exist
  if (!prices.yearly) {
    prices.yearly = await stripe.prices.create({
      product: productId,
      unit_amount: STRIPE_CONFIG.defaultPricing.standardYearly,
      currency: STRIPE_CONFIG.currency,
      recurring: {
        interval: 'year',
      },
      nickname: 'Standard Yearly (20% discount)',
      metadata: {
        plan: 'standard',
        interval: 'year',
        includedUsers: '3',
        discount: '20',
      },
    });
  }

  // Check if extra user price exists
  if (STRIPE_CONFIG.prices.extraUserMonthly) {
    try {
      prices.extraUser = await stripe.prices.retrieve(STRIPE_CONFIG.prices.extraUserMonthly);
    } catch {
      console.log('Extra user price not found, creating...');
    }
  }

  // Create extra user price if it doesn't exist
  if (!prices.extraUser) {
    prices.extraUser = await stripe.prices.create({
      product: productId,
      unit_amount: STRIPE_CONFIG.defaultPricing.extraUserMonthly,
      currency: STRIPE_CONFIG.currency,
      recurring: {
        interval: 'month',
      },
      nickname: 'Extra User Monthly',
      metadata: {
        type: 'extra_user',
      },
    });
  }

  return prices;
};