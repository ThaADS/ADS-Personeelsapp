/**
 * Password Reset Service
 * Handles password reset token generation, validation, and storage using database
 *
 * This service provides a simplified interface for password reset token operations.
 * For full password reset flow with audit logging and email sending, use the
 * password-reset module in @/lib/auth/password-reset.ts
 */

import { prisma } from '@/lib/db/prisma';
import { randomBytes, createHash } from 'crypto';

// Token expiration time (1 hour)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// Rate limiting: max 3 requests per email per hour
const MAX_REQUESTS_PER_HOUR = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * Generates a cryptographically secure random token
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hashes a token for secure storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Checks if an email is rate limited using database storage
 */
async function isRateLimited(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();

  const entry = await prisma.rateLimitEntry.findUnique({
    where: {
      identifier_type: {
        identifier: normalizedEmail,
        type: 'password_reset_service'
      }
    }
  });

  if (!entry) return false;

  // Check if window has expired
  if (entry.windowExpires < now) {
    await prisma.rateLimitEntry.delete({
      where: { id: entry.id }
    });
    return false;
  }

  return entry.count >= MAX_REQUESTS_PER_HOUR;
}

/**
 * Records a rate limit entry in database
 */
async function recordRateLimitEntry(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();
  const windowExpires = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  await prisma.rateLimitEntry.upsert({
    where: {
      identifier_type: {
        identifier: normalizedEmail,
        type: 'password_reset_service'
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      identifier: normalizedEmail,
      type: 'password_reset_service',
      count: 1,
      firstRequest: now,
      windowExpires
    }
  });
}

/**
 * Cleans up expired tokens from database
 */
async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();

  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { usedAt: { not: null } }
      ]
    }
  });

  await prisma.rateLimitEntry.deleteMany({
    where: {
      windowExpires: { lt: now }
    }
  });
}

/**
 * Creates a password reset token for a user
 * @param email User's email address
 * @returns The plain text token (to be sent via email) or null if rate limited
 */
export async function createResetToken(email: string): Promise<string | null> {
  // Clean up expired tokens periodically
  cleanupExpiredTokens().catch(err => console.error('[PasswordReset] Cleanup error:', err));

  // Check rate limiting
  if (await isRateLimited(email)) {
    console.log(`[PasswordReset] Rate limited: ${email}`);
    return null;
  }

  // Record this request for rate limiting
  await recordRateLimitEntry(email);

  const normalizedEmail = email.toLowerCase();

  // Invalidate any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email: normalizedEmail }
  });

  // Generate new token
  const plainToken = generateSecureToken();
  const hashedToken = hashToken(plainToken);

  // Store the token in database
  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      token: hashedToken,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS)
    }
  });

  console.log(`[PasswordReset] Token created for: ${email}`);
  return plainToken;
}

/**
 * Validates a password reset token
 * @param token The plain text token from the URL
 * @returns The email address if valid, null otherwise
 */
export async function validateResetToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  const data = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken }
  });

  if (!data) {
    console.log('[PasswordReset] Token not found');
    return null;
  }

  if (data.usedAt) {
    console.log('[PasswordReset] Token already used');
    return null;
  }

  if (data.expiresAt < new Date()) {
    console.log('[PasswordReset] Token expired');
    await prisma.passwordResetToken.delete({
      where: { id: data.id }
    });
    return null;
  }

  return data.email;
}

/**
 * Marks a token as used (after successful password reset)
 * @param token The plain text token
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const hashedToken = hashToken(token);

  // Delete the token after marking as used
  await prisma.passwordResetToken.deleteMany({
    where: { token: hashedToken }
  });
}

/**
 * Gets the remaining time for rate limit reset
 * @param email User's email
 * @returns Remaining seconds until rate limit resets, or 0 if not limited
 */
export async function getRateLimitResetTime(email: string): Promise<number> {
  const normalizedEmail = email.toLowerCase();

  const entry = await prisma.rateLimitEntry.findUnique({
    where: {
      identifier_type: {
        identifier: normalizedEmail,
        type: 'password_reset_service'
      }
    }
  });

  if (!entry) return 0;

  if (entry.windowExpires < new Date()) return 0;

  const remaining = Math.ceil((entry.windowExpires.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}
