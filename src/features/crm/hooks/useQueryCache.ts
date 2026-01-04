/**
 * useQueryCache Hook
 * 
 * Hook for managing advanced React Query cache strategies.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook for advanced cache management
 */
export const useQueryCache = () => {
  const queryClient = useQueryClient();

  /**
   * Prefetch data for better UX
   */
  const prefetchData = useCallback(
    async (queryKey: string[], queryFn: () => Promise<any>) => {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
    [queryClient]
  );

  /**
   * Invalidate and refetch queries
   */
  const invalidateAndRefetch = useCallback(
    async (queryKey: string[]) => {
      await queryClient.invalidateQueries({ queryKey });
    },
    [queryClient]
  );

  /**
   * Set query data optimistically
   */
  const setQueryData = useCallback(
    <T,>(queryKey: string[], updater: (old: T | undefined) => T) => {
      queryClient.setQueryData(queryKey, updater);
    },
    [queryClient]
  );

  /**
   * Get cached data without refetching
   */
  const getCachedData = useCallback(
    <T,>(queryKey: string[]): T | undefined => {
      return queryClient.getQueryData<T>(queryKey);
    },
    [queryClient]
  );

  /**
   * Clear all CRM-related cache
   */
  const clearCRMCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['crm'] });
  }, [queryClient]);

  /**
   * Reset cache for specific queries
   */
  const resetQueries = useCallback(
    async (queryKey: string[]) => {
      await queryClient.resetQueries({ queryKey });
    },
    [queryClient]
  );

  return {
    prefetchData,
    invalidateAndRefetch,
    setQueryData,
    getCachedData,
    clearCRMCache,
    resetQueries,
  };
};

