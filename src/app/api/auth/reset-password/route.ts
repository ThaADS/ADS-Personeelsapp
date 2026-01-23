/**
 * Reset Password API Endpoint
 *
 * POST /api/auth/reset-password
 *
 * Handles password reset with token verification.
 * Updates user password after successful validation.
 *
 * Security:
 * - Token expiration (1 hour)
 * - Password strength validation
 * - Confirmation email sent after change
 * - Audit logging for all attempts
 */

import { NextRequest } from 'next/server';
import { resetPassword } from '@/lib/auth/password-reset';
import { z } from 'zod';
import { checkRateLimit, rateLimitedResponse } from '@/lib/security/rate-limiter';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  internalErrorResponse,
  ErrorCodes,
} from '@/lib/api/response';

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is vereist'),
  email: z.string().email('Ongeldig emailadres'),
  password: z.string()
    .min(8, 'Wachtwoord moet minimaal 8 tekens lang zijn')
    .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
    .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet minimaal één cijfer bevatten')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Wachtwoord moet minimaal één speciaal teken bevatten'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
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
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        errors[issue.path.join('.')] = issue.message;
      });
      return validationErrorResponse(errors, validation.error.issues[0].message);
    }

    const { token, email, password } = validation.data;

    // Get IP address for security logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Process password reset
    const result = await resetPassword(token, email, password, ipAddress);

    if (!result.success) {
      return errorResponse(
        ErrorCodes.INVALID_TOKEN,
        result.message,
        result.error ? { error: result.error } : undefined
      );
    }

    return successResponse({ reset: true }, { message: result.message });
  } catch (error) {
    console.error('Reset password error:', error);
    return internalErrorResponse('Er is een fout opgetreden. Probeer het opnieuw.');
  }
}
