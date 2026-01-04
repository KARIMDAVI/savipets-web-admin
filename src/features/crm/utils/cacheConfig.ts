/**
 * Advanced Cache Configuration
 * 
 * Configuration for React Query caching strategies optimized for CRM.
 */

import type { QueryClientConfig } from '@tanstack/react-query';

/**
 * Cache time configurations (in milliseconds)
 */
export const CACHE_TIMES = {
  // Short-lived cache (real-time data)
  SHORT: 30 * 1000, // 30 seconds
  
  // Medium cache (frequently changing data)
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  
  // Long cache (rarely changing data)
  LONG: 30 * 60 * 1000, // 30 minutes
  
  // Very long cache (static data)
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Stale time configurations (in milliseconds)
 */
export const STALE_TIMES = {
  // Never stale (always use cache)
  NEVER: Infinity,
  
  // Immediately stale (always refetch)
  IMMEDIATE: 0,
  
  // Short stale time
  SHORT: 1 * 60 * 1000, // 1 minute
  
  // Medium stale time
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  
  // Long stale time
  LONG: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * Query key prefixes for organized cache management
 */
export const QUERY_KEY_PREFIXES = {
  CRM: 'crm',
  CRM_CLIENTS: 'crm-clients',
  CRM_NOTES: 'crm-notes',
  CRM_TAGS: 'crm-tags',
  CRM_SEGMENTS: 'crm-segments',
  CRM_ACTIVITIES: 'crm-activities',
  CRM_ANALYTICS: 'crm-analytics',
  CRM_TASKS: 'crm-tasks',
  CRM_WORKFLOWS: 'crm-workflows',
} as const;

/**
 * Cache configuration for different query types
 */
export const QUERY_CACHE_CONFIG = {
  // Client data - medium cache, short stale time
  clients: {
    staleTime: STALE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  },
  
  // Notes - short cache, immediate stale (real-time)
  notes: {
    staleTime: STALE_TIMES.IMMEDIATE,
    gcTime: CACHE_TIMES.SHORT,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30 * 1000, // 30 seconds
  },
  
  // Tags - long cache, medium stale (rarely changes)
  tags: {
    staleTime: STALE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: false,
  },
  
  // Segments - long cache, medium stale
  segments: {
    staleTime: STALE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: false,
  },
  
  // Activities - short cache, immediate stale (real-time)
  activities: {
    staleTime: STALE_TIMES.IMMEDIATE,
    gcTime: CACHE_TIMES.SHORT,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 15 * 1000, // 15 seconds
  },
  
  // Analytics - medium cache, medium stale
  analytics: {
    staleTime: STALE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  },
  
  // Tasks - short cache, short stale
  tasks: {
    staleTime: STALE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // 1 minute
  },
  
  // Workflows - long cache, long stale (rarely changes)
  workflows: {
    staleTime: STALE_TIMES.LONG,
    gcTime: CACHE_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  },
} as const;

/**
 * Enhanced QueryClient configuration
 */
export const createEnhancedQueryClientConfig = (): QueryClientConfig => ({
  defaultOptions: {
    queries: {
      // Default stale time (data is fresh for 1 minute)
      staleTime: STALE_TIMES.SHORT,
      
      // Default garbage collection time (5 minutes)
      gcTime: CACHE_TIMES.MEDIUM,
      
      // Refetch on window focus (for real-time updates)
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect (for offline support)
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
      
      // Retry failed queries
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Retry delay
      retryDelay: 1000,
      
      // Network mode
      networkMode: 'online',
    },
  },
});

/**
 * Get cache config for a specific query type
 */
export function getCacheConfig(queryType: keyof typeof QUERY_CACHE_CONFIG) {
  return QUERY_CACHE_CONFIG[queryType];
}

/**
 * Build query key with prefix
 */
export function buildQueryKey(
  prefix: string,
  ...parts: (string | number | undefined)[]
): string[] {
  return [prefix, ...parts.filter((p): p is string | number => p !== undefined).map(p => String(p))];
}

