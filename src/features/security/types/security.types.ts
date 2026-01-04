/**
 * Security Feature Types
 * 
 * Type definitions for security settings and authentication.
 * Extracted from Security.tsx for better organization.
 */

/**
 * Security device
 */
export interface SecurityDevice {
  id: string;
  name: string;
  type: 'passkey' | 'totp' | 'sms';
  platform: 'desktop' | 'mobile' | 'tablet';
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
  isDefault: boolean;
}

/**
 * Session information
 */
export interface SessionInfo {
  id: string;
  device: string;
  platform: string;
  location: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  requireReauthForSensitive: boolean;
  maxConcurrentSessions: number;
  allowRememberDevice: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}

