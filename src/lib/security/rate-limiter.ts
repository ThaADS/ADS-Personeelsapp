/**
 * Rate Limiting Middleware
 * Beschermt API endpoints tegen brute force en DDoS aanvallen
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { headers } from 'next/headers';

// Rate limiters voor verschillende endpoint types
const limiters = {
  // Standard API endpoints: 100 requests per minute
  standard: new RateLimiterMemory({
    points: 100,
    duration: 60, // Per minute
    blockDuration: 60, // Block for 1 minute when exceeded
  }),

  // Auth endpoints (login, register): 10 requests per minute
  auth: new RateLimiterMemory({
    points: 10,
    duration: 60,
    blockDuration: 300, // Block for 5 minutes when exceeded
  }),

  // Sensitive data endpoints: 30 requests per minute
  sensitive: new RateLimiterMemory({
    points: 30,
    duration: 60,
    blockDuration: 120, // Block for 2 minutes when exceeded
  }),

  // Webhook endpoints: 500 requests per minute (higher for webhooks)
  webhook: new RateLimiterMemory({
    points: 500,
    duration: 60,
    blockDuration: 60,
  }),
};

export type RateLimitType = keyof typeof limiters;

/**
 * Get client IP from request headers
 */
async function getClientIP(request: NextRequest): Promise<string> {
  try {
    const headersList = await headers();

    // Check various headers for IP (in order of reliability)
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = headersList.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = headersList.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Create rate limit key from IP and optional user ID
 */
function createRateLimitKey(ip: string, userId?: string): string {
  if (userId) {
    return `${ip}_${userId}`;
  }
  return ip;
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  blocked: boolean;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'standard',
  userId?: string
): Promise<RateLimitResult> {
  const limiter = limiters[type];
  const ip = await getClientIP(request);
  const key = createRateLimitKey(ip, userId);

  try {
    const result = await limiter.consume(key);
    return {
      success: true,
      remaining: result.remainingPoints,
      reset: Math.ceil(result.msBeforeNext / 1000),
      blocked: false,
    };
  } catch (error) {
    // Rate limit exceeded
    const rateLimitError = error as { msBeforeNext?: number; remainingPoints?: number };
    return {
      success: false,
      remaining: rateLimitError.remainingPoints ?? 0,
      reset: Math.ceil((rateLimitError.msBeforeNext ?? 60000) / 1000),
      blocked: true,
    };
  }
}

/**
 * Rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Rate limited API response
 */
export function rateLimitedResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'Te veel verzoeken. Probeer het later opnieuw.',
      retryAfter: result.reset,
    },
    {
      status: 429,
      headers: {
        ...getRateLimitHeaders(result),
        'Retry-After': result.reset.toString(),
      },
    }
  );
}

/**
 * Middleware wrapper voor rate limiting
 * Usage:
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await checkRateLimit(request, 'auth');
 *   if (!rateLimitResult.success) {
 *     return rateLimitedResponse(rateLimitResult);
 *   }
 *   // ... handle request
 * }
 */
export async function withRateLimit<T>(
  request: NextRequest,
  type: RateLimitType,
  handler: () => Promise<T>,
  userId?: string
): Promise<T | NextResponse> {
  const result = await checkRateLimit(request, type, userId);

  if (!result.success) {
    return rateLimitedResponse(result);
  }

  return handler();
}

/**
 * Higher-order function voor API route handlers
 * Automatisch rate limiting toepassen
 */
export function createRateLimitedHandler<T>(
  type: RateLimitType,
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { error: string; retryAfter: number }>> => {
    const result = await checkRateLimit(request, type);

    if (!result.success) {
      return rateLimitedResponse(result) as NextResponse<{ error: string; retryAfter: number }>;
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    const headers = new Headers(response.headers);
    const rateLimitHeaders = getRateLimitHeaders(result);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }) as NextResponse<T>;
  };
}

/**
 * Reset rate limit voor een specifieke key (bijv. na succesvolle login)
 */
export async function resetRateLimit(
  request: NextRequest,
  type: RateLimitType,
  userId?: string
): Promise<void> {
  const limiter = limiters[type];
  const ip = await getClientIP(request);
  const key = createRateLimitKey(ip, userId);

  try {
    await limiter.delete(key);
  } catch {
    // Silently fail - not critical if reset fails
  }
}
