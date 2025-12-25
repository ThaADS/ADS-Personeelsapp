/**
 * Password Reset Service
 * Handles password reset token generation, validation, and storage
 */

import { randomBytes, createHash } from 'crypto';

// Token expiration time (1 hour)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// Rate limiting: max 3 requests per email per hour
const MAX_REQUESTS_PER_HOUR = 3;

interface ResetToken {
  hashedToken: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

interface RateLimitEntry {
  count: number;
  firstRequestAt: Date;
}

// In-memory storage (in production, use Redis or database)
const tokenStore = new Map<string, ResetToken>();
const rateLimitStore = new Map<string, RateLimitEntry>();

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
 * Checks if an email is rate limited
 */
function isRateLimited(email: string): boolean {
  const entry = rateLimitStore.get(email.toLowerCase());
  if (!entry) return false;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (entry.firstRequestAt < hourAgo) {
    // Reset rate limit after an hour
    rateLimitStore.delete(email.toLowerCase());
    return false;
  }

  return entry.count >= MAX_REQUESTS_PER_HOUR;
}

/**
 * Records a rate limit entry
 */
function recordRateLimitEntry(email: string): void {
  const normalizedEmail = email.toLowerCase();
  const entry = rateLimitStore.get(normalizedEmail);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  if (!entry || entry.firstRequestAt < hourAgo) {
    rateLimitStore.set(normalizedEmail, {
      count: 1,
      firstRequestAt: new Date(),
    });
  } else {
    entry.count++;
  }
}

/**
 * Cleans up expired tokens
 */
function cleanupExpiredTokens(): void {
  const now = new Date();
  for (const [hashedToken, data] of tokenStore.entries()) {
    if (data.expiresAt < now || data.used) {
      tokenStore.delete(hashedToken);
    }
  }
}

// Run cleanup every 15 minutes
setInterval(cleanupExpiredTokens, 15 * 60 * 1000);

/**
 * Creates a password reset token for a user
 * @param email User's email address
 * @returns The plain text token (to be sent via email) or null if rate limited
 */
export async function createResetToken(email: string): Promise<string | null> {
  // Check rate limiting
  if (isRateLimited(email)) {
    console.log(`[PasswordReset] Rate limited: ${email}`);
    return null;
  }

  // Record this request for rate limiting
  recordRateLimitEntry(email);

  // Invalidate any existing tokens for this email
  for (const [hashedToken, data] of tokenStore.entries()) {
    if (data.email.toLowerCase() === email.toLowerCase()) {
      tokenStore.delete(hashedToken);
    }
  }

  // Generate new token
  const plainToken = generateSecureToken();
  const hashedToken = hashToken(plainToken);

  // Store the token
  tokenStore.set(hashedToken, {
    hashedToken,
    email: email.toLowerCase(),
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
    createdAt: new Date(),
    used: false,
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
  const data = tokenStore.get(hashedToken);

  if (!data) {
    console.log('[PasswordReset] Token not found');
    return null;
  }

  if (data.used) {
    console.log('[PasswordReset] Token already used');
    return null;
  }

  if (data.expiresAt < new Date()) {
    console.log('[PasswordReset] Token expired');
    tokenStore.delete(hashedToken);
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
  const data = tokenStore.get(hashedToken);

  if (data) {
    data.used = true;
    // Delete the token after marking as used
    tokenStore.delete(hashedToken);
  }
}

/**
 * Gets the remaining time for rate limit reset
 * @param email User's email
 * @returns Remaining seconds until rate limit resets, or 0 if not limited
 */
export function getRateLimitResetTime(email: string): number {
  const entry = rateLimitStore.get(email.toLowerCase());
  if (!entry) return 0;

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (entry.firstRequestAt < hourAgo) return 0;

  const resetTime = new Date(entry.firstRequestAt.getTime() + 60 * 60 * 1000);
  const remaining = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
}
