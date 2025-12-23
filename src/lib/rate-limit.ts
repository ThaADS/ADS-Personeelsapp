import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis instance for production or mock for development
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : {
      // Mock Redis for development
      get: async () => null,
      set: async () => "OK",
      incr: async () => 1,
      expire: async () => 1,
      flushdb: async () => "OK",
    } as unknown as Redis;

// API Rate Limits - Banking Grade Security
const apiLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 requests per hour
  analytics: true,
  prefix: "ratelimit:api",
});

// Auth Rate Limits - Prevent brute force attacks
const authLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 login attempts per 15 minutes
  analytics: true,
  prefix: "ratelimit:auth",
});

// Admin Action Rate Limits - Higher security for admin actions
const adminLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 admin actions per hour
  analytics: true,
  prefix: "ratelimit:admin",
});

// Export Rate Limits - Control data export frequency
const exportLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 exports per hour
  analytics: true,
  prefix: "ratelimit:export",
});

// Email Rate Limits - Prevent spam
const emailLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, "1 d"), // 50 emails per day
  analytics: true,
  prefix: "ratelimit:email",
});

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  if (realIP) {
    return realIP;
  }
  
  return "unknown";
}

/**
 * Create rate limit identifier (IP + optional user ID)
 */
export function createIdentifier(ip: string, userId?: string): string {
  return userId ? `${ip}:${userId}` : ip;
}

/**
 * Check API rate limit
 */
export async function checkApiRateLimit(request: Request, userId?: string) {
  const ip = getClientIP(request);
  const identifier = createIdentifier(ip, userId);
  
  const { success, limit, reset, remaining } = await apiLimiter.limit(identifier);
  
  return {
    success,
    limit,
    reset,
    remaining,
    identifier
  };
}

/**
 * Check authentication rate limit
 */
export async function checkAuthRateLimit(request: Request, email?: string) {
  const ip = getClientIP(request);
  const identifier = email ? `${ip}:${email}` : ip;
  
  const { success, limit, reset, remaining } = await authLimiter.limit(identifier);
  
  return {
    success,
    limit,
    reset,
    remaining,
    identifier
  };
}

/**
 * Check admin action rate limit
 */
export async function checkAdminRateLimit(request: Request, userId: string) {
  const ip = getClientIP(request);
  const identifier = createIdentifier(ip, userId);
  
  const { success, limit, reset, remaining } = await adminLimiter.limit(identifier);
  
  return {
    success,
    limit,
    reset,
    remaining,
    identifier
  };
}

/**
 * Check export rate limit
 */
export async function checkExportRateLimit(request: Request, userId: string) {
  const ip = getClientIP(request);
  const identifier = createIdentifier(ip, userId);
  
  const { success, limit, reset, remaining } = await exportLimiter.limit(identifier);
  
  return {
    success,
    limit,
    reset,
    remaining,
    identifier
  };
}

/**
 * Check email rate limit
 */
export async function checkEmailRateLimit(request: Request, userId?: string) {
  const ip = getClientIP(request);
  const identifier = createIdentifier(ip, userId);
  
  const { success, limit, reset, remaining } = await emailLimiter.limit(identifier);
  
  return {
    success,
    limit,
    reset,
    remaining,
    identifier
  };
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

/**
 * Middleware helper for API routes with rate limiting
 */
export async function withRateLimit<T>(
  request: Request,
  handler: () => Promise<T>,
  limitType: 'api' | 'auth' | 'admin' | 'export' | 'email' = 'api',
  userId?: string
): Promise<Response | T> {
  let result;
  
  switch (limitType) {
    case 'auth':
      result = await checkAuthRateLimit(request);
      break;
    case 'admin':
      if (!userId) throw new Error('User ID required for admin rate limiting');
      result = await checkAdminRateLimit(request, userId);
      break;
    case 'export':
      if (!userId) throw new Error('User ID required for export rate limiting');
      result = await checkExportRateLimit(request, userId);
      break;
    case 'email':
      result = await checkEmailRateLimit(request, userId);
      break;
    default:
      result = await checkApiRateLimit(request, userId);
  }
  
  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: `Too many requests. Try again after ${new Date(result.reset).toLocaleTimeString()}`,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...createRateLimitHeaders(result),
          'Retry-After': Math.round((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  // Execute handler and add rate limit headers to response
  const response = await handler();
  
  // If response is a Response object, add headers
  if (response instanceof Response) {
    const headers = createRateLimitHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}