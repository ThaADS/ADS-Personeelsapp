/**
 * Forgot Password API Endpoint
 *
 * POST /api/auth/forgot-password
 *
 * Handles password reset requests. Sends reset email if user exists.
 * Returns generic success message to prevent email enumeration.
 *
 * Security:
 * - Rate limiting (3 attempts per hour per email)
 * - No email enumeration possible
 * - Audit logging for all attempts
 */

import { NextRequest } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/password-reset';
import { z } from 'zod';
import { checkRateLimit, rateLimitedResponse } from '@/lib/security/rate-limiter';
import { successResponse, validationErrorResponse } from '@/lib/api/response';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-auth-forgot-password");

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check - auth type: 10 req/min
    const rateLimitResult = await checkRateLimit(request, 'auth');
    if (!rateLimitResult.success) {
      return rateLimitedResponse(rateLimitResult);
    }

    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse({ email: 'Vul een geldig emailadres in.' });
    }

    const { email } = validation.data;

    // Get IP address and user agent for security logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Process password reset request
    const result = await requestPasswordReset(email, ipAddress, userAgent);

    // Always return 200 to prevent email enumeration
    return successResponse({ sent: result.success }, { message: result.message });
  } catch (error) {
    logger.error("Forgot password error", error);

    // Generic success to prevent information leakage
    return successResponse(
      { sent: true },
      { message: 'Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies.' }
    );
  }
}
