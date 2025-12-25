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

import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/password-reset';
import { z } from 'zod';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vul een geldig emailadres in.',
        },
        { status: 400 }
      );
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
    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    // Generic error to prevent information leakage
    return NextResponse.json(
      {
        success: true,
        message: 'Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies.',
      },
      { status: 200 }
    );
  }
}
