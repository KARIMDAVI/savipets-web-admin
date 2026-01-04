/**
 * Encryption Types
 * 
 * Type definitions for encryption and sensitive data handling.
 */

/**
 * Fields that should be encrypted
 */
export type EncryptableField = 
  | 'email'
  | 'phoneNumber'
  | 'ssn'
  | 'creditCard'
  | 'bankAccount'
  | 'notes'
  | 'customField';

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  enabled: boolean;
  fields: EncryptableField[];
  keySource: 'env' | 'kms' | 'vault';
  keyId?: string;
}

/**
 * Encrypted data wrapper
 */
export interface EncryptedData {
  encrypted: boolean;
  data: string;
  algorithm?: string;
  keyId?: string;
  iv?: string;
}

/**
 * Masking configuration
 */
export interface MaskingConfig {
  email: boolean;
  phone: boolean;
  ssn: boolean;
  creditCard: boolean;
}

