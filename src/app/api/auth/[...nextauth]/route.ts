import { handlers } from '@/lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/security/rate-limit';

// Wrap POST handler with rate limiting for login attempts
async function rateLimitedPOST(request: NextRequest): Promise<Response> {
  // Get client identifier for rate limiting
  const clientId = getClientIdentifier(request, 'unknown-client');

  // Check if this is a credentials sign-in attempt
  const url = new URL(request.url);
  const isSignIn = url.searchParams.get('action') === 'callback' ||
    url.pathname.includes('callback/credentials');

  if (isSignIn) {
    // Apply strict rate limiting for login attempts
    const result = checkRateLimit(clientId, RATE_LIMITS.login);

    if (!result.success) {
      return NextResponse.json(
        { error: RATE_LIMITS.login.message },
        {
          status: 429,
          headers: createRateLimitHeaders(result),
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handlers.POST(request);
    const headers = new Headers(response.headers);
    Object.entries(createRateLimitHeaders(result)).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // For non-login requests, apply general API rate limiting
  const result = checkRateLimit(clientId, RATE_LIMITS.api);

  if (!result.success) {
    return NextResponse.json(
      { error: RATE_LIMITS.api.message },
      {
        status: 429,
        headers: createRateLimitHeaders(result),
      }
    );
  }

  return handlers.POST(request);
}

export const GET = handlers.GET;
export const POST = rateLimitedPOST;
