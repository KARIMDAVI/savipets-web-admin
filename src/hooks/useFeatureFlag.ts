import { useMemo } from 'react';
import { getFeatureFlag, isFeatureFlagProductionReady } from '@/config/featureFlags';

/**
 * Hook to access feature flags in components
 * 
 * @param flagName - Name of the feature flag (e.g., 'useNewBookingStore')
 * @returns boolean indicating if the feature is enabled
 * 
 * @example
 * ```tsx
 * const BookingsPage: React.FC = () => {
 *   const useNewVersion = useFeatureFlag('useNewBookingStore');
 *   
 *   if (useNewVersion) {
 *     return <BookingsPageRefactored />;
 *   }
 *   return <BookingsPageLegacy />;
 * };
 * ```
 */
export const useFeatureFlag = (flagName: string): boolean => {
  return useMemo(() => {
    const isEnabled = getFeatureFlag(flagName);
    
    // Warn in development if using non-production-ready flags
    if (import.meta.env.DEV && isEnabled) {
      const isReady = isFeatureFlagProductionReady(flagName);
      if (!isReady) {
        console.warn(
          `[FeatureFlag] Flag "${flagName}" is enabled but not marked as production-ready. ` +
          `Use with caution in production.`
        );
      }
    }
    
    return isEnabled;
  }, [flagName]);
};

/**
 * Hook to access multiple feature flags at once
 * 
 * @param flagNames - Array of feature flag names
 * @returns Object mapping flag names to their enabled state
 * 
 * @example
 * ```tsx
 * const { useNewBookingStore, useNewSystemConfig } = useFeatureFlags([
 *   'useNewBookingStore',
 *   'useNewSystemConfig'
 * ]);
 * ```
 */
export const useFeatureFlags = (
  flagNames: string[]
): Record<string, boolean> => {
  return useMemo(() => {
    return flagNames.reduce((acc, flagName) => {
      acc[flagName] = getFeatureFlag(flagName);
      return acc;
    }, {} as Record<string, boolean>);
  }, [flagNames.join(',')]);
};

