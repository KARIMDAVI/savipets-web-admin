/**
 * Smoke Tests for Feature Flags
 * 
 * Tests that feature flag infrastructure works correctly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeatureFlag, useFeatureFlags } from '@/hooks/useFeatureFlag';
import { getFeatureFlag } from '@/config/featureFlags';

describe('Feature Flags Smoke Tests', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    // Reset environment
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env
    Object.assign(import.meta.env, originalEnv);
  });

  it('should return default value when flag is not set', () => {
    const result = getFeatureFlag('useNewBookingStore');
    // Default should be false
    expect(result).toBe(false);
  });

  it('should use hook correctly', () => {
    const { result } = renderHook(() => useFeatureFlag('useNewBookingStore'));
    expect(result.current).toBe(false);
  });

  it('should handle multiple flags', () => {
    const { result } = renderHook(() =>
      useFeatureFlags(['useNewBookingStore', 'useNewSystemConfig'])
    );

    expect(result.current.useNewBookingStore).toBe(false);
    expect(result.current.useNewSystemConfig).toBe(false);
  });

  it('should handle unknown flag gracefully', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const result = getFeatureFlag('unknownFlag');
    
    expect(result).toBe(false);
    expect(consoleWarn).toHaveBeenCalled();
    
    consoleWarn.mockRestore();
  });
});

