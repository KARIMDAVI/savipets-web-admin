/**
 * Pagination Types
 * 
 * Type definitions for pagination functionality in CRM module.
 */

/**
 * Pagination parameters for queries
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Cursor-based pagination parameters (for large datasets)
 */
export interface CursorPaginationParams {
  limit: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

