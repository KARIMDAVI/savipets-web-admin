/**
 * CRM Test Setup
 * 
 * Test configuration and utilities for CRM module tests.
 */

import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';

/**
 * Create a new QueryClient for each test
 * This ensures tests don't interfere with each other
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Changed from cacheTime to gcTime in React Query v5
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Setup before all tests
 */
beforeAll(() => {
  // Any global setup needed
});

/**
 * Cleanup after each test
 */
afterEach(() => {
  cleanup();
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  // Any global cleanup needed
});

