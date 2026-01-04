/**
 * Encryption Utilities
 * 
 * Client-side encryption utilities for sensitive CRM data.
 * Note: For production, consider using server-side encryption or
 * a dedicated encryption service. This provides basic client-side encryption.
 */

/**
 * Encrypt sensitive data using Web Crypto API
 * Note: This is a basic implementation. For production, use proper key management.
 */
export async function encryptSensitiveData(
  data: string,
  key?: string
): Promise<string> {
  try {
    // Generate or use provided key
    const encryptionKey = key || await generateKey();
    
    // Convert data to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Import key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey).slice(0, 32), // Use first 32 bytes
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data
 */
export async function decryptSensitiveData(
  encryptedData: string,
  key?: string
): Promise<string> {
  try {
    // Generate or use provided key (must match encryption key)
    const encryptionKey = key || await generateKey();
    
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Import key
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey).slice(0, 32),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      cryptoKey,
      encrypted
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Generate encryption key (for demo purposes)
 * In production, use proper key management (e.g., AWS KMS, HashiCorp Vault)
 */
async function generateKey(): Promise<string> {
  // In production, retrieve from secure key management service
  // For now, use a constant key stored in environment variable
  const key = import.meta.env.VITE_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  return key;
}

/**
 * Hash sensitive data (one-way, for comparison)
 */
export async function hashSensitiveData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash sensitive data');
  }
}

/**
 * Mask sensitive data for display (e.g., email, phone)
 */
export function maskSensitiveData(data: string, type: 'email' | 'phone' | 'ssn' | 'creditCard'): string {
  if (!data) return '';
  
  switch (type) {
    case 'email':
      const [localPart, domain] = data.split('@');
      if (!domain) return data;
      const maskedLocal = localPart.length > 2 
        ? `${localPart[0]}${'*'.repeat(Math.max(0, localPart.length - 2))}${localPart[localPart.length - 1]}`
        : localPart;
      return `${maskedLocal}@${domain}`;
      
    case 'phone':
      const cleaned = data.replace(/\D/g, '');
      if (cleaned.length < 4) return data;
      const last4 = cleaned.slice(-4);
      return `***-***-${last4}`;
      
    case 'ssn':
      if (data.length < 4) return data;
      return `***-**-${data.slice(-4)}`;
      
    case 'creditCard':
      const cardCleaned = data.replace(/\D/g, '');
      if (cardCleaned.length < 4) return data;
      return `****-****-****-${cardCleaned.slice(-4)}`;
      
    default:
      return data;
  }
}

/**
 * Check if data is encrypted (basic check)
 */
export function isEncrypted(data: string): boolean {
  // Encrypted data is base64 encoded and has specific structure
  try {
    if (!data || data.length < 20) return false;
    // Check if it's valid base64
    const decoded = atob(data);
    // Check if it has minimum length for IV + encrypted data
    return decoded.length >= 12;
  } catch {
    return false;
  }
}

/**
 * Encrypt object fields selectively
 */
export async function encryptObjectFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): Promise<T> {
  const encrypted = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    const value = obj[field];
    if (value && typeof value === 'string') {
      encrypted[field] = await encryptSensitiveData(value) as T[keyof T];
    }
  }
  
  return encrypted;
}

/**
 * Decrypt object fields selectively
 */
export async function decryptObjectFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): Promise<T> {
  const decrypted = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    const value = obj[field];
    if (value && typeof value === 'string' && isEncrypted(value)) {
      try {
        decrypted[field] = await decryptSensitiveData(value) as T[keyof T];
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error);
        // Keep encrypted value if decryption fails
      }
    }
  }
  
  return decrypted;
}

