/**
 * Rate Limiting Middleware
 * Implements a sliding window rate limiter using in-memory storage
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store for rate limiting
// In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > 3600000) { // 1 hour
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  message?: string;      // Custom error message
  keyPrefix?: string;    // Prefix for rate limit key
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const fullKey = config.keyPrefix ? `${config.keyPrefix}:${key}` : key;

  const entry = rateLimitStore.get(fullKey);

  if (!entry || now - entry.windowStart >= config.windowMs) {
    // New window
    rateLimitStore.set(fullKey, {
      count: 1,
      windowStart: now,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Existing window
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.windowStart + config.windowMs - now) / 1000);

    return {
      success: false,
      remaining: 0,
      resetTime: entry.windowStart + config.windowMs,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(fullKey, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.windowStart + config.windowMs,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints - strict limits
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,           // 5 attempts per 15 minutes
    message: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.',
    keyPrefix: 'login',
  },

  // Password reset - very strict
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,           // 3 attempts per hour
    message: 'Te veel wachtwoord reset verzoeken. Probeer het later opnieuw.',
    keyPrefix: 'pwd-reset',
  },

  // Registration - moderate limits
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,          // 10 attempts per hour
    message: 'Te veel registratiepogingen. Probeer het later opnieuw.',
    keyPrefix: 'register',
  },

  // API endpoints - general limits
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,         // 100 requests per minute
    message: 'Te veel verzoeken. Probeer het later opnieuw.',
    keyPrefix: 'api',
  },

  // Sensitive operations
  sensitiveOps: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,          // 20 per hour
    message: 'Te veel gevoelige bewerkingen. Probeer het later opnieuw.',
    keyPrefix: 'sensitive',
  },
} as const;

/**
 * Get client identifier from request
 */
export function getClientIdentifier(
  request: Request,
  fallback: string = 'unknown'
): string {
  // Try to get real IP from various headers (in order of preference)
  const headers = new Headers(request.headers);

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Get the first IP in the chain (client IP)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return fallback;
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    ...(result.retryAfter ? { 'Retry-After': result.retryAfter.toString() } : {}),
  };
}
