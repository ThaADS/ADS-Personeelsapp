/**
 * AES-256-GCM Encryption Module
 *
 * Provides secure encryption/decryption for sensitive data like API credentials.
 * Uses AES-256-GCM with random IV for each encryption operation.
 */

import crypto from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for GCM
const AUTH_TAG_LENGTH = 16; // 16 bytes authentication tag
const KEY_LENGTH = 32; // 32 bytes = 256 bits

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env.FLEET_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'Encryption key not configured. Set FLEET_ENCRYPTION_KEY or ENCRYPTION_KEY environment variable with a 32-byte (256-bit) key in base64 or hex format.'
    );
  }

  // Try to decode as base64 first, then hex, then use as-is
  let keyBuffer: Buffer;

  try {
    // Try base64
    keyBuffer = Buffer.from(key, 'base64');
    if (keyBuffer.length === KEY_LENGTH) {
      return keyBuffer;
    }
  } catch {
    // Not base64
  }

  try {
    // Try hex
    keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length === KEY_LENGTH) {
      return keyBuffer;
    }
  } catch {
    // Not hex
  }

  // Use as UTF-8 string and hash it to get consistent 32 bytes
  // This is a fallback for simpler keys, but base64/hex is recommended
  keyBuffer = crypto.createHash('sha256').update(key).digest();
  return keyBuffer;
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns: base64 encoded string containing IV + AuthTag + Ciphertext
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Ciphertext
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt a string encrypted with AES-256-GCM
 * Expects: base64 encoded string containing IV + AuthTag + Ciphertext
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';

  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Minimum size: IV (16) + AuthTag (16) + at least 1 byte ciphertext
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      throw new Error('Invalid encrypted data: too short');
    }

    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Log for debugging but don't expose details
    console.error('Decryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to decrypt data. The data may be corrupted or the encryption key may have changed.');
  }
}

/**
 * Generate a new encryption key
 * Returns a base64-encoded 32-byte key suitable for FLEET_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Validate if a string is properly encrypted (basic format check)
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false;

  try {
    const decoded = Buffer.from(data, 'base64');
    // Minimum size check
    return decoded.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Safely migrate from old XOR encryption to AES-256
 * Attempts to decrypt with old method, then re-encrypts with new method
 */
export function migrateFromXor(oldEncrypted: string, oldKey: string): string {
  if (!oldEncrypted) return '';

  try {
    // First check if it's already AES encrypted
    if (isEncrypted(oldEncrypted)) {
      try {
        // Try to decrypt with AES
        decrypt(oldEncrypted);
        return oldEncrypted; // Already migrated
      } catch {
        // Not AES encrypted, continue with XOR migration
      }
    }

    // Decrypt with XOR
    const decoded = Buffer.from(oldEncrypted, 'base64').toString();
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ oldKey.charCodeAt(i % oldKey.length);
      decrypted += String.fromCharCode(charCode);
    }

    // Re-encrypt with AES-256
    return encrypt(decrypted);
  } catch {
    // Migration failed, return original
    console.error('XOR to AES migration failed for credential');
    return oldEncrypted;
  }
}

/**
 * Hash a value for secure comparison (e.g., for tokens, secrets)
 */
export function secureHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
