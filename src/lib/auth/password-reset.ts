/**
 * Password Reset Module
 *
 * Handles password reset token generation, validation, and password updates.
 * Integrates with email service for notifications and audit logging for compliance.
 *
 * Security features:
 * - Cryptographically secure token generation
 * - Token hashing (tokens stored hashed, not plain)
 * - Rate limiting (3 requests per hour per email) - stored in database
 * - Token expiration (1 hour) - stored in database
 * - Audit logging for all attempts
 */

import { prisma } from '@/lib/db/prisma';
import { hash } from 'bcryptjs';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '@/lib/services/email-service';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PasswordReset');

// Constants
const TOKEN_EXPIRY_HOURS = 1;
const RATE_LIMIT_WINDOW_HOURS = 1;
const MAX_REQUESTS_PER_WINDOW = 3;
const BCRYPT_ROUNDS = 12;

/**
 * Generate a cryptographically secure token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for secure storage
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Check rate limiting for an email using database storage
 */
async function checkRateLimit(email: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();

  // Find existing rate limit entry
  const rateEntry = await prisma.rateLimitEntry.findUnique({
    where: {
      identifier_type: {
        identifier: normalizedEmail,
        type: 'password_reset'
      }
    }
  });

  if (!rateEntry) {
    return { allowed: true, remainingAttempts: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  // Check if window has expired
  if (rateEntry.windowExpires < now) {
    // Delete expired entry
    await prisma.rateLimitEntry.delete({
      where: { id: rateEntry.id }
    });
    return { allowed: true, remainingAttempts: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  const remaining = MAX_REQUESTS_PER_WINDOW - rateEntry.count;
  return {
    allowed: remaining > 0,
    remainingAttempts: Math.max(0, remaining - 1)
  };
}

/**
 * Record a rate limit attempt in database
 */
async function recordRateLimitAttempt(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();
  const windowExpires = new Date(now.getTime() + RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000);

  await prisma.rateLimitEntry.upsert({
    where: {
      identifier_type: {
        identifier: normalizedEmail,
        type: 'password_reset'
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      identifier: normalizedEmail,
      type: 'password_reset',
      count: 1,
      firstRequest: now,
      windowExpires
    }
  });
}

/**
 * Clean up expired tokens from database (run periodically)
 */
async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();

  // Delete expired tokens
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { usedAt: { not: null } }
      ]
    }
  });

  // Delete expired rate limit entries
  await prisma.rateLimitEntry.deleteMany({
    where: {
      windowExpires: { lt: now }
    }
  });
}

/**
 * Create audit log entry
 */
async function createAuditLog(
  action: string,
  userId: string | null,
  details: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        newValues: details as object,
        ipAddress: ipAddress || null
      }
    });
  } catch (error) {
    logger.error('Failed to create audit log', error);
  }
}

/**
 * Request a password reset
 *
 * @param email - User's email address
 * @param ipAddress - IP address of the request
 * @param userAgent - User agent of the request
 * @returns Result object with success status and message
 */
export async function requestPasswordReset(
  email: string,
  ipAddress: string,
  userAgent?: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Clean up expired tokens periodically (async, don't await)
  cleanupExpiredTokens().catch(err => logger.error('Token cleanup error', err));

  // Check rate limiting
  const { allowed } = await checkRateLimit(normalizedEmail);

  if (!allowed) {
    await createAuditLog('PASSWORD_RESET_RATE_LIMITED', null, {
      email: normalizedEmail,
      ipAddress,
      userAgent
    }, ipAddress);

    // Return generic message to prevent enumeration
    return {
      success: true,
      message: 'Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies.'
    };
  }

  // Record the attempt
  await recordRateLimitAttempt(normalizedEmail);

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // Log the attempt (regardless of whether user exists)
    await createAuditLog('PASSWORD_RESET_REQUESTED', user?.id || null, {
      email: normalizedEmail,
      userExists: !!user,
      ipAddress,
      userAgent
    }, ipAddress);

    // If user doesn't exist, return generic message (security: don't reveal if email exists)
    if (!user) {
      return {
        success: true,
        message: 'Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies.'
      };
    }

    // Generate token
    const token = generateToken();
    const hashedToken = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Invalidate any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail }
    });

    // Store the new token in database
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token: hashedToken,
        expiresAt
      }
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(normalizedEmail, {
      recipientName: user.name || 'Gebruiker',
      resetUrl,
      expiryHours: TOKEN_EXPIRY_HOURS.toString()
    });

    if (!emailSent) {
      logger.error('Failed to send password reset email', undefined, { email: normalizedEmail });
      // Don't reveal email sending failure to prevent enumeration
    }

    await createAuditLog('PASSWORD_RESET_EMAIL_SENT', user.id, {
      email: normalizedEmail,
      emailSent,
      expiresAt: expiresAt.toISOString()
    }, ipAddress);

    return {
      success: true,
      message: 'Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies.'
    };

  } catch (error) {
    logger.error('Password reset request error', error);

    await createAuditLog('PASSWORD_RESET_ERROR', null, {
      email: normalizedEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress
    }, ipAddress);

    // Return generic success to prevent enumeration
    return {
      success: true,
      message: 'Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met instructies.'
    };
  }
}

/**
 * Reset password with token
 *
 * @param token - Reset token from email
 * @param email - User's email address
 * @param newPassword - New password
 * @param ipAddress - IP address of the request
 * @returns Result object with success status and message
 */
export async function resetPassword(
  token: string,
  email: string,
  newPassword: string,
  ipAddress: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Clean up expired tokens
  await cleanupExpiredTokens();

  try {
    // Hash the provided token to look up
    const hashedToken = hashToken(token);

    // Find token in database
    const tokenData = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken }
    });

    // Verify token exists
    if (!tokenData) {
      await createAuditLog('PASSWORD_RESET_INVALID_TOKEN', null, {
        email: normalizedEmail,
        reason: 'Token not found',
        ipAddress
      }, ipAddress);

      return {
        success: false,
        message: 'De reset link is ongeldig of verlopen. Vraag een nieuwe aan.',
        error: 'INVALID_TOKEN'
      };
    }

    // Verify token hasn't expired
    if (tokenData.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: tokenData.id }
      });

      await createAuditLog('PASSWORD_RESET_EXPIRED_TOKEN', null, {
        email: normalizedEmail,
        reason: 'Token expired',
        expiredAt: tokenData.expiresAt.toISOString(),
        ipAddress
      }, ipAddress);

      return {
        success: false,
        message: 'De reset link is verlopen. Vraag een nieuwe aan.',
        error: 'TOKEN_EXPIRED'
      };
    }

    // Verify token hasn't been used
    if (tokenData.usedAt) {
      return {
        success: false,
        message: 'De reset link is al gebruikt. Vraag een nieuwe aan.',
        error: 'TOKEN_USED'
      };
    }

    // Verify email matches
    if (tokenData.email !== normalizedEmail) {
      await createAuditLog('PASSWORD_RESET_EMAIL_MISMATCH', null, {
        providedEmail: normalizedEmail,
        tokenEmail: tokenData.email,
        ipAddress
      }, ipAddress);

      return {
        success: false,
        message: 'De reset link is ongeldig. Controleer of je het juiste emailadres hebt ingevuld.',
        error: 'EMAIL_MISMATCH'
      };
    }

    // Find and verify user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      await prisma.passwordResetToken.delete({
        where: { id: tokenData.id }
      });

      await createAuditLog('PASSWORD_RESET_USER_NOT_FOUND', null, {
        email: normalizedEmail,
        ipAddress
      }, ipAddress);

      return {
        success: false,
        message: 'Er is een fout opgetreden. Probeer het opnieuw of neem contact op met support.',
        error: 'USER_NOT_FOUND'
      };
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, BCRYPT_ROUNDS);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    // Mark token as used and delete all tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail }
    });

    // Send confirmation email
    const emailSent = await sendPasswordChangedEmail(normalizedEmail, {
      recipientName: user.name || 'Gebruiker',
      changedAt: new Date().toLocaleString('nl-NL', {
        timeZone: 'Europe/Amsterdam',
        dateStyle: 'full',
        timeStyle: 'short'
      }),
      ipAddress
    });

    await createAuditLog('PASSWORD_RESET_SUCCESS', user.id, {
      email: normalizedEmail,
      confirmationEmailSent: emailSent,
      ipAddress
    }, ipAddress);

    return {
      success: true,
      message: 'Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.'
    };

  } catch (error) {
    logger.error('Password reset error', error);

    await createAuditLog('PASSWORD_RESET_ERROR', null, {
      email: normalizedEmail,
      error: error instanceof Error ? error.message : 'Unknown error',
      ipAddress
    }, ipAddress);

    return {
      success: false,
      message: 'Er is een fout opgetreden. Probeer het opnieuw.',
      error: 'INTERNAL_ERROR'
    };
  }
}

/**
 * Verify a token is valid (for UI validation before showing reset form)
 *
 * @param token - Reset token from email
 * @param email - User's email address
 * @returns Whether the token is valid
 */
export async function verifyResetToken(
  token: string,
  email: string
): Promise<{ valid: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Clean up expired tokens
  await cleanupExpiredTokens();

  const hashedToken = hashToken(token);
  const tokenData = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken }
  });

  if (!tokenData) {
    return { valid: false, error: 'INVALID_TOKEN' };
  }

  if (tokenData.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: tokenData.id }
    });
    return { valid: false, error: 'TOKEN_EXPIRED' };
  }

  if (tokenData.usedAt) {
    return { valid: false, error: 'TOKEN_USED' };
  }

  if (tokenData.email !== normalizedEmail) {
    return { valid: false, error: 'EMAIL_MISMATCH' };
  }

  return { valid: true };
}
