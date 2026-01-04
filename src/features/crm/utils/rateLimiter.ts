/**
 * Rate Limiter Utilities
 * 
 * Client-side rate limiting for API calls and user actions.
 * Note: Server-side rate limiting should also be implemented for security.
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  key: string; // Unique key for this rate limit (e.g., userId, IP, action)
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds until retry is allowed
}

/**
 * In-memory rate limit store
 * In production, use Redis or similar distributed cache
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetTime: Date }> = new Map();

  /**
   * Check and increment rate limit
   */
  checkLimit(config: RateLimitConfig): RateLimitResult {
    const key = config.key;
    const now = new Date();
    const entry = this.store.get(key);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      this.store.delete(key);
    }

    const currentEntry = this.store.get(key);

    if (!currentEntry) {
      // First request in window
      const resetTime = new Date(now.getTime() + config.windowMs);
      this.store.set(key, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    if (currentEntry.count >= config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((currentEntry.resetTime.getTime() - now.getTime()) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    currentEntry.count++;
    this.store.set(key, currentEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.store.clear();
  }
}

const rateLimitStore = new RateLimitStore();

/**
 * Rate limiter class
 */
class RateLimiter {
  /**
   * Check rate limit for an action
   */
  checkRateLimit(
    action: string,
    userId: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): RateLimitResult {
    const key = `${action}:${userId}`;
    return rateLimitStore.checkLimit({
      maxRequests,
      windowMs,
      key,
    });
  }

  /**
   * Check rate limit for API calls
   */
  checkAPIRateLimit(userId: string): RateLimitResult {
    return this.checkRateLimit('api', userId, 100, 60000); // 100 requests per minute
  }

  /**
   * Check rate limit for CRM actions
   */
  checkCRMActionRateLimit(userId: string, action: string): RateLimitResult {
    // Different limits for different actions
    const limits: Record<string, { max: number; window: number }> = {
      create_note: { max: 20, window: 60000 }, // 20 notes per minute
      create_task: { max: 30, window: 60000 }, // 30 tasks per minute
      send_email: { max: 10, window: 60000 }, // 10 emails per minute
      send_sms: { max: 5, window: 60000 }, // 5 SMS per minute
      export_data: { max: 5, window: 300000 }, // 5 exports per 5 minutes
      import_data: { max: 3, window: 300000 }, // 3 imports per 5 minutes
      bulk_action: { max: 10, window: 60000 }, // 10 bulk actions per minute
    };

    const limit = limits[action] || { max: 20, window: 60000 };
    return this.checkRateLimit(`crm:${action}`, userId, limit.max, limit.window);
  }

  /**
   * Reset rate limit for an action
   */
  resetRateLimit(action: string, userId: string): void {
    const key = `${action}:${userId}`;
    rateLimitStore.reset(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  action: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): T {
  return (async (...args: Parameters<T>) => {
    // Extract userId from first argument if it's an object with userId
    // Otherwise, use a default key
    let userId = 'anonymous';
    if (args[0] && typeof args[0] === 'object' && 'userId' in args[0]) {
      userId = args[0].userId as string;
    }

    const result = rateLimiter.checkRateLimit(action, userId, maxRequests, windowMs);
    
    if (!result.allowed) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`
      );
    }

    return fn(...args);
  }) as T;
}

