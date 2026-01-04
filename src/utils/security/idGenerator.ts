/**
 * Secure ID Generation Utility
 * Uses cryptographically secure random number generation
 */

/**
 * Generates a cryptographically secure random ID
 * @param prefix - Prefix for the ID
 * @returns Secure random ID string
 */
export const generateSecureId = (prefix: string): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment - use Web Crypto API
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${prefix}-${hex}`;
  } else if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // Node.js 14.17+ - use crypto.randomUUID
    return `${prefix}-${crypto.randomUUID()}`;
  } else {
    // Fallback (should not be used in production)
    console.warn('Using fallback ID generation - not cryptographically secure');
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 11);
    return `${prefix}-${timestamp}-${random}`;
  }
};

/**
 * Generates a secure token for CSRF protection
 * @returns Secure random token
 */
export const generateCSRFToken = (): string => {
  return generateSecureId('csrf');
};

