import { createHash, randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import bs58 from 'bs58';

/**
 * Generate a random base58 slug
 */
export function generateBase58Slug(length: number = 8): string {
  const bytes = randomBytes(length);
  return bs58.encode(bytes).slice(0, length);
}

/**
 * Hash a string using SHA256
 */
export function sha256Hash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Hash an IP address for privacy-preserving analytics
 */
export function hashIP(ip: string, salt?: string): string {
  const saltValue = salt || process.env.IP_SALT || 'default-salt-change-me';
  return sha256Hash(`${ip}:${saltValue}`);
}

/**
 * Hash a URL for blocklist checking
 */
export function hashURL(url: string): string {
  return sha256Hash(url);
}

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify a password against an Argon2id hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Generate a secure editor token
 */
export function generateEditorToken(): string {
  const bytes = randomBytes(24);
  return bs58.encode(bytes);
}

/**
 * Parse user agent for device category
 */
export function parseDeviceCategory(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Normalize URL for safety checks
 */
export function normalizeURL(url: string): string {
  try {
    const parsed = new URL(url);
    // Force HTTPS
    if (parsed.protocol !== 'https:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Extract domain from referrer
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

