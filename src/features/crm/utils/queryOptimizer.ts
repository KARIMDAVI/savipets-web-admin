/**
 * Query Optimizer Utilities
 * 
 * Utilities for optimizing Firestore queries and preventing common issues.
 */

import type { Query, QueryConstraint } from 'firebase/firestore';

/**
 * Query optimization configuration
 */
export interface QueryOptimizationConfig {
  maxLimit: number;
  defaultLimit: number;
  enableBatching: boolean;
  batchSize: number;
}

/**
 * Default query optimization config
 */
export const DEFAULT_QUERY_CONFIG: QueryOptimizationConfig = {
  maxLimit: 1000, // Maximum documents per query
  defaultLimit: 50, // Default limit if not specified
  enableBatching: true,
  batchSize: 100, // Documents per batch
};

/**
 * Optimize query limit to prevent excessive reads
 */
export function optimizeQueryLimit(
  requestedLimit?: number,
  config: QueryOptimizationConfig = DEFAULT_QUERY_CONFIG
): number {
  if (!requestedLimit) {
    return config.defaultLimit;
  }
  return Math.min(requestedLimit, config.maxLimit);
}

/**
 * Validate query constraints to ensure index compatibility
 */
export function validateQueryConstraints(constraints: QueryConstraint[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for multiple inequality filters (not allowed)
  const inequalityFilters = constraints.filter((c: any) => 
    c.type === 'where' && 
    ['<', '<=', '>', '>='].includes(c._methodName)
  );
  
  if (inequalityFilters.length > 1) {
    errors.push('Firestore does not support multiple inequality filters on different fields');
  }
  
  // Check for orderBy after limit (should be before)
  const hasOrderBy = constraints.some((c: any) => c.type === 'orderBy');
  const hasLimit = constraints.some((c: any) => c.type === 'limit');
  
  if (hasLimit && hasOrderBy) {
    const orderByIndex = constraints.findIndex((c: any) => c.type === 'orderBy');
    const limitIndex = constraints.findIndex((c: any) => c.type === 'limit');
    
    if (limitIndex < orderByIndex) {
      errors.push('orderBy should come before limit in query constraints');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Batch query execution for large datasets
 */
export async function executeBatchedQuery<T>(
  queryFn: (limit: number, startAfter?: any) => Promise<{ data: T[]; lastDoc?: any }>,
  config: QueryOptimizationConfig = DEFAULT_QUERY_CONFIG
): Promise<T[]> {
  const allResults: T[] = [];
  let lastDoc: any = undefined;
  let hasMore = true;
  
  while (hasMore) {
    const batchResult = await queryFn(config.batchSize, lastDoc);
    allResults.push(...batchResult.data);
    
    if (batchResult.data.length < config.batchSize || !batchResult.lastDoc) {
      hasMore = false;
    } else {
      lastDoc = batchResult.lastDoc;
    }
  }
  
  return allResults;
}

/**
 * Deduplicate query results by ID
 */
export function deduplicateResults<T extends { id: string | number }>(
  results: T[]
): T[] {
  const seen = new Set<string | number>();
  return results.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

/**
 * Cache query results to prevent duplicate requests
 */
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate cache by exact key
   */
  invalidateKey(key: string): void {
    this.cache.delete(key);
  }
}

export const queryCache = new QueryCache();

/**
 * Generate cache key from query parameters
 */
export function generateCacheKey(
  collection: string,
  filters: Record<string, any> = {},
  limit?: number
): string {
  const filterStr = JSON.stringify(filters);
  return `${collection}:${filterStr}:${limit || 'all'}`;
}

/**
 * Optimize query by adding necessary constraints
 */
export function optimizeQuery(
  baseQuery: Query,
  constraints: QueryConstraint[],
  config: QueryOptimizationConfig = DEFAULT_QUERY_CONFIG
): {
  optimizedConstraints: QueryConstraint[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const optimizedConstraints: QueryConstraint[] = [];
  
  // Validate constraints
  const validation = validateQueryConstraints(constraints);
  if (!validation.valid) {
    warnings.push(...validation.errors);
  }
  
  // Ensure limit is set
  const hasLimit = constraints.some((c: any) => c.type === 'limit');
  if (!hasLimit) {
    // Add default limit if not present
    // Note: This would need to be done at the query building level
    warnings.push('Consider adding a limit to prevent excessive reads');
  }
  
  // Ensure orderBy is present if needed
  const hasOrderBy = constraints.some((c: any) => c.type === 'orderBy');
  const hasWhere = constraints.some((c: any) => c.type === 'where');
  
  if (hasWhere && !hasOrderBy) {
    warnings.push('Consider adding orderBy for consistent results');
  }
  
  return {
    optimizedConstraints: constraints,
    warnings,
  };
}

