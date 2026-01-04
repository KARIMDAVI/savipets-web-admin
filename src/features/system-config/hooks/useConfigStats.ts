/**
 * Hook to calculate system configuration statistics
 */

import { useMemo } from 'react';
import type {
  ServiceType,
  PricingTier,
  FeatureFlag,
  BusinessHours,
  SystemConfigStats,
} from '../types/system-config.types';

interface UseConfigStatsOptions {
  serviceTypes: ServiceType[];
  pricingTiers: PricingTier[];
  featureFlags: FeatureFlag[];
  businessHours: BusinessHours[];
}

/**
 * Calculate statistics from configuration data
 */
export const useConfigStats = ({
  serviceTypes,
  pricingTiers,
  featureFlags,
  businessHours,
}: UseConfigStatsOptions): SystemConfigStats => {
  return useMemo(() => {
    return {
      totalServices: serviceTypes.length,
      activeServices: serviceTypes.filter(s => s.isActive).length,
      totalPricingTiers: pricingTiers.length,
      activeFeatureFlags: featureFlags.filter(f => f.isEnabled).length,
      totalFeatureFlags: featureFlags.length,
      businessHoursConfigured: businessHours.filter(h => h.isOpen).length,
    };
  }, [serviceTypes, pricingTiers, featureFlags, businessHours]);
};

