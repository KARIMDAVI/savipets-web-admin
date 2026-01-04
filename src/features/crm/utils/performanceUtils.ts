/**
 * Performance Utilities
 * 
 * Utilities for optimizing CRM performance.
 */

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch operations for performance
 */
export async function batchOperations<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Lazy load data with pagination
 */
export function createLazyLoader<T>(
  loadFunction: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  pageSize: number = 20
) {
  let currentPage = 1;
  let allData: T[] = [];
  let total = 0;
  let loading = false;

  const loadPage = async (page: number): Promise<T[]> => {
    if (loading) return [];
    loading = true;

    try {
      const result = await loadFunction(page, pageSize);
      total = result.total;
      return result.data;
    } finally {
      loading = false;
    }
  };

  return {
    loadNext: async () => {
      const data = await loadPage(currentPage);
      allData = [...allData, ...data];
      currentPage++;
      return data;
    },
    reset: () => {
      currentPage = 1;
      allData = [];
      total = 0;
    },
    getData: () => allData,
    getTotal: () => total,
    isLoading: () => loading,
  };
}

/**
 * Memoize expensive calculations
 */
export function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return,
  keyGenerator?: (...args: Args) => string
): (...args: Args) => Return {
  const cache = new Map<string, Return>();

  return (...args: Args): Return => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  fn: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Check if we should use virtual scrolling based on data size
 */
export function shouldUseVirtualScrolling(itemCount: number, threshold: number = 100): boolean {
  return itemCount > threshold;
}

/**
 * Calculate optimal page size based on viewport
 */
export function calculateOptimalPageSize(
  itemHeight: number = 50,
  viewportHeight: number = window.innerHeight
): number {
  const headerHeight = 100; // Approximate header/footer height
  const availableHeight = viewportHeight - headerHeight;
  return Math.max(10, Math.floor(availableHeight / itemHeight));
}

