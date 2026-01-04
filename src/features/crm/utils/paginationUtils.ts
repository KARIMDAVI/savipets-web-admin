/**
 * Pagination Utilities
 * 
 * Utility functions for pagination calculations and validations.
 */

import type { PaginationParams, PaginatedResponse } from '../types/pagination.types';

/**
 * Calculate total pages from total items and page size
 */
export const calculateTotalPages = (total: number, pageSize: number): number => {
  if (total === 0 || pageSize === 0) return 0;
  return Math.ceil(total / pageSize);
};

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (params: PaginationParams): PaginationParams => {
  const page = Math.max(1, Math.floor(params.page) || 1);
  const pageSize = Math.min(
    Math.max(1, Math.floor(params.pageSize) || 10),
    100 // Max page size
  );

  return {
    page,
    pageSize,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder || 'desc',
  };
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  const validatedParams = validatePaginationParams(params);
  const totalPages = calculateTotalPages(total, validatedParams.pageSize);

  return {
    data,
    total,
    page: validatedParams.page,
    pageSize: validatedParams.pageSize,
    totalPages,
    hasMore: validatedParams.page < totalPages,
  };
};

/**
 * Calculate offset from page and page size
 */
export const calculateOffset = (page: number, pageSize: number): number => {
  return (Math.max(1, page) - 1) * pageSize;
};

/**
 * Get pagination info for display
 */
export const getPaginationInfo = (response: PaginatedResponse<unknown>): string => {
  const { page, pageSize, total } = response;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  if (total === 0) return 'No results';
  return `Showing ${start}-${end} of ${total}`;
};

