/**
 * Feature Flag Infrastructure
 * 
 * Enables controlled rollout and easy rollback without code deployment.
 * Feature flags can be toggled via environment variables.
 */

export interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage?: number;
  retentionDays?: number;
}

export const FEATURE_FLAGS = {
  LIVE_TRACKING_V2: {
    enabled: import.meta.env.VITE_LIVE_TRACKING_V2_ENABLED === 'true',
    rolloutPercentage: parseInt(import.meta.env.VITE_LIVE_TRACKING_ROLLOUT || '0', 10),
  },
  AUTO_ROUTE_CLEANUP: {
    enabled: import.meta.env.VITE_AUTO_ROUTE_CLEANUP === 'true',
    retentionDays: parseInt(import.meta.env.VITE_ROUTE_RETENTION_DAYS || '30', 10),
  },
  HEARTBEAT_MONITORING: {
    enabled: import.meta.env.VITE_HEARTBEAT_MONITORING === 'true',
  },
  CRM_SERVICE_LAYER: {
    enabled: import.meta.env.VITE_CRM_SERVICE_LAYER_ENABLED === 'true',
  },
  crmModuleEnabled: {
    enabled: true, // CRM module is always enabled
  },
  useNewBookingStore: {
    enabled: import.meta.env.VITE_USE_NEW_BOOKING_STORE === 'true',
  },
} as const;

/**
 * Check if a feature is enabled for a given user
 * @param flag - Feature flag key
 * @param userId - Optional user ID for percentage-based rollout
 * @returns true if feature is enabled for this user
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS, userId?: string): boolean {
  const feature = FEATURE_FLAGS[flag];
  if (!feature.enabled) return false;

  // If rollout percentage is defined, use hash-based rollout
  if ('rolloutPercentage' in feature && feature.rolloutPercentage !== undefined) {
    if (!userId) return false;
    // Simple hash-based rollout (consistent for same user)
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 100) < feature.rolloutPercentage;
  }

  return true;
}

/**
 * Get feature flag value
 * Supports both typed keys and string keys for flexibility
 */
export function getFeatureFlag(flag: string): boolean {
  const feature = FEATURE_FLAGS[flag as keyof typeof FEATURE_FLAGS];
  if (!feature) {
    console.warn(`[FeatureFlag] Unknown feature flag: ${flag}`);
    return false;
  }
  return feature.enabled;
}

/**
 * Check if a feature flag is production-ready
 * For now, all flags in FEATURE_FLAGS are considered production-ready
 * This can be extended with a productionReady property if needed
 */
export function isFeatureFlagProductionReady(flag: string): boolean {
  const feature = FEATURE_FLAGS[flag as keyof typeof FEATURE_FLAGS];
  if (!feature) {
    return false;
  }
  // All flags in FEATURE_FLAGS are production-ready
  // Can be extended with a productionReady property if needed
  return true;
}
