/**
 * Verify Reset Token API Endpoint
 *
 * POST /api/auth/verify-reset-token
 *
 * Validates a password reset token before showing the reset form.
 * This prevents users from filling out the form only to discover
 * their token is invalid.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/auth/password-reset';
import { z } from 'zod';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-auth-verify-reset-token");

// Validation schema
const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is vereist'),
  email: z.string().email('Ongeldig emailadres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = verifyTokenSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    const { token, email } = validation.data;

    // Verify token
    const result = await verifyResetToken(token, email);

    return NextResponse.json({
      valid: result.valid,
      error: result.error,
    });
  } catch (error) {
    logger.error("Verify reset token error", error);

    return NextResponse.json(
      {
        valid: false,
        error: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
