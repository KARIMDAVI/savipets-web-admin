/**
 * Workforce Helper Utilities
 * 
 * Utility functions for workforce management.
 */

/**
 * Get color for performance rate
 */
export const getPerformanceColor = (rate: number): string => {
  if (rate >= 95) return 'green';
  if (rate >= 85) return 'orange';
  return 'red';
};

/**
 * Get color for rating
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'green';
  if (rating >= 4.0) return 'orange';
  return 'red';
};

