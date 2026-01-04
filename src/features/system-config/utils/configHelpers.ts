/**
 * System Configuration Helper Functions
 * 
 * Utility functions for system configuration display and formatting.
 */

/**
 * Get color for service category tag
 */
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'walking': return 'green';
    case 'sitting': return 'blue';
    case 'grooming': return 'purple';
    case 'transport': return 'orange';
    case 'overnight': return 'red';
    default: return 'default';
  }
};

/**
 * Get icon for service category
 */
export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'walking': return '🐕';
    case 'sitting': return '🏠';
    case 'grooming': return '✂️';
    case 'transport': return '🚗';
    case 'overnight': return '🌙';
    default: return '📋';
  }
};

