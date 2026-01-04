/**
 * Cache Config Unit Tests
 * 
 * Tests for cache configuration utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  CACHE_TIMES,
  STALE_TIMES,
  QUERY_KEY_PREFIXES,
  QUERY_CACHE_CONFIG,
  getCacheConfig,
  buildQueryKey,
  createEnhancedQueryClientConfig,
} from '../../utils/cacheConfig';

describe('Cache Constants', () => {
  it('should have correct cache time values', () => {
    expect(CACHE_TIMES.SHORT).toBe(30 * 1000);
    expect(CACHE_TIMES.MEDIUM).toBe(5 * 60 * 1000);
    expect(CACHE_TIMES.LONG).toBe(30 * 60 * 1000);
    expect(CACHE_TIMES.VERY_LONG).toBe(24 * 60 * 60 * 1000);
  });

  it('should have correct stale time values', () => {
    expect(STALE_TIMES.IMMEDIATE).toBe(0);
    expect(STALE_TIMES.SHORT).toBe(1 * 60 * 1000);
    expect(STALE_TIMES.MEDIUM).toBe(5 * 60 * 1000);
    expect(STALE_TIMES.LONG).toBe(15 * 60 * 1000);
    expect(STALE_TIMES.NEVER).toBe(Infinity);
  });

  it('should have query key prefixes', () => {
    expect(QUERY_KEY_PREFIXES.CRM).toBe('crm');
    expect(QUERY_KEY_PREFIXES.CRM_CLIENTS).toBe('crm-clients');
    expect(QUERY_KEY_PREFIXES.CRM_NOTES).toBe('crm-notes');
  });
});

describe('getCacheConfig', () => {
  it('should return config for valid query type', () => {
    const config = getCacheConfig('clients');

    expect(config).toBeDefined();
    expect(config.staleTime).toBeDefined();
    expect(config.gcTime).toBeDefined();
  });

  it('should return config for all query types', () => {
    const types: Array<keyof typeof QUERY_CACHE_CONFIG> = [
      'clients',
      'notes',
      'tags',
      'segments',
      'activities',
      'analytics',
      'tasks',
      'workflows',
    ];

    types.forEach((type) => {
      const config = getCacheConfig(type);
      expect(config).toBeDefined();
      expect(config.staleTime).toBeDefined();
      expect(config.gcTime).toBeDefined();
    });
  });
});

describe('buildQueryKey', () => {
  it('should build query key with prefix', () => {
    const key = buildQueryKey('crm', 'clients');

    expect(key).toEqual(['crm', 'clients']);
  });

  it('should filter undefined values', () => {
    const key = buildQueryKey('crm', 'clients', undefined, 'notes');

    expect(key).toEqual(['crm', 'clients', 'notes']);
  });

  it('should handle numbers', () => {
    const key = buildQueryKey('crm', 'client', 123);

    expect(key).toEqual(['crm', 'client', 123]);
  });
});

describe('createEnhancedQueryClientConfig', () => {
  it('should create valid QueryClient config', () => {
    const config = createEnhancedQueryClientConfig();

    expect(config.defaultOptions).toBeDefined();
    expect(config.defaultOptions?.queries).toBeDefined();
    expect(config.defaultOptions?.mutations).toBeDefined();
  });

  it('should have retry logic', () => {
    const config = createEnhancedQueryClientConfig();
    const retryFn = config.defaultOptions?.queries?.retry;

    expect(typeof retryFn).toBe('function');

    if (typeof retryFn === 'function') {
      // Test retry logic
      expect(retryFn(0, { status: 400 } as any)).toBe(false); // 4xx should not retry
      expect(retryFn(0, { status: 500 } as any)).toBe(true); // 5xx should retry
      expect(retryFn(2, { status: 500 } as any)).toBe(false); // Max retries reached
    }
  });
});











