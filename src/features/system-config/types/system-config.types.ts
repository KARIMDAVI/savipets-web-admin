/**
 * System Configuration Feature Types
 * 
 * Type definitions for system configuration management.
 * Extracted from SystemConfig.tsx for better organization.
 */

/**
 * Service type configuration
 */
export interface ServiceType {
  id: string;
  name: string;
  description: string;
  category: 'walking' | 'sitting' | 'grooming' | 'transport' | 'overnight';
  duration: number; // minutes
  basePrice: number;
  pricePerHour?: number;
  isActive: boolean;
  requiresSpecialSkills: boolean;
  maxPets: number;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pricing tier configuration
 */
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  serviceTypeId: string;
  duration: number; // minutes
  price: number;
  isActive: boolean;
  conditions: {
    minPets?: number;
    maxPets?: number;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek?: string[];
    isWeekend?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Feature flag configuration
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  key: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  conditions: {
    userRoles?: string[];
    platforms?: string[];
    regions?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Business hours configuration
 */
export interface BusinessHours {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
}

/**
 * System settings configuration
 */
export interface SystemSettings {
  id: string;
  category: 'general' | 'booking' | 'payment' | 'notification' | 'security';
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  isRequired: boolean;
  updatedAt: Date;
}

/**
 * System configuration statistics
 */
export interface SystemConfigStats {
  totalServices: number;
  activeServices: number;
  totalPricingTiers: number;
  activeFeatureFlags: number;
  totalFeatureFlags: number;
  businessHoursConfigured: number;
}

/**
 * Configuration tab keys
 */
export type ConfigTabKey = 'services' | 'pricing' | 'features' | 'business-hours' | 'settings';

