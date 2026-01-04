/**
 * Performance Utils Unit Tests
 * 
 * Tests for performance optimization utilities.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  debounce,
  throttle,
  batchOperations,
  shouldUseVirtualScrolling,
  calculateOptimalPageSize,
  memoize,
} from '../../utils/performanceUtils';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should debounce function calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on subsequent calls', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should throttle function calls', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});

describe('batchOperations', () => {
  it('should batch operations', async () => {
    const items = [1, 2, 3, 4, 5];
    const operation = async (item: number) => item * 2;
    const batchSize = 2;

    const results = await batchOperations(items, operation, batchSize);

    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle empty array', async () => {
    const results = await batchOperations([], async (x) => x, 10);

    expect(results).toEqual([]);
  });
});

describe('shouldUseVirtualScrolling', () => {
  it('should return true for large lists', () => {
    expect(shouldUseVirtualScrolling(150, 100)).toBe(true);
  });

  it('should return false for small lists', () => {
    expect(shouldUseVirtualScrolling(50, 100)).toBe(false);
  });

  it('should use default threshold', () => {
    expect(shouldUseVirtualScrolling(150)).toBe(true);
    expect(shouldUseVirtualScrolling(50)).toBe(false);
  });
});

describe('calculateOptimalPageSize', () => {
  it('should calculate page size based on viewport', () => {
    const pageSize = calculateOptimalPageSize(50, 1000);

    expect(pageSize).toBeGreaterThan(0);
    expect(pageSize).toBeLessThanOrEqual(1000 / 50);
  });

  it('should use default values', () => {
    const pageSize = calculateOptimalPageSize();

    expect(pageSize).toBeGreaterThan(0);
  });

  it('should return minimum of 10', () => {
    const pageSize = calculateOptimalPageSize(1000, 100);

    expect(pageSize).toBeGreaterThanOrEqual(10);
  });
});

describe('memoize', () => {
  it('should cache function results', () => {
    const expensiveFn = vi.fn((x: number) => x * 2);
    const memoizedFn = memoize(expensiveFn);

    const result1 = memoizedFn(5);
    const result2 = memoizedFn(5);

    expect(result1).toBe(10);
    expect(result2).toBe(10);
    expect(expensiveFn).toHaveBeenCalledTimes(1);
  });

  it('should use custom key generator', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const keyGen = (a: number, b: number) => `${a}-${b}`;
    const memoizedFn = memoize(fn, keyGen);

    memoizedFn(1, 2);
    memoizedFn(1, 2);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});











