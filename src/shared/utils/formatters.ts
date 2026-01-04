/**
 * Formatter Utilities
 * 
 * Shared formatting functions for currency, dates, names, etc.
 * Extracted from various page components to avoid duplication.
 */

/**
 * Format a value as currency (USD)
 * 
 * @param value - Number, string, null, or undefined to format
 * @returns Formatted currency string (e.g., "$100.00")
 * 
 * @example
 * formatCurrency(100) // "$100.00"
 * formatCurrency("50.5") // "$50.50"
 * formatCurrency(null) // "$0.00"
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  return `$${safeValue.toFixed(2)}`;
};

/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 * 
 * @param date - Date object to format
 * @returns Relative time string
 * 
 * @example
 * formatTimeAgo(new Date(Date.now() - 3600000)) // "1 hour ago"
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

/**
 * Extract pet names from various data structures
 * Handles arrays, objects, strings, and nested structures
 * 
 * @param petsData - Pet data in various formats
 * @returns Array of unique pet names
 * 
 * @example
 * extractPetNames([{name: "Fluffy"}, {name: "Spot"}]) // ["Fluffy", "Spot"]
 * extractPetNames("Fluffy, Spot") // ["Fluffy", "Spot"]
 */
export const extractPetNames = (petsData: unknown): string[] => {
  if (!petsData) {
    return [];
  }

  const names = new Set<string>();

  const pushName = (candidate: unknown) => {
    if (!candidate) {
      return;
    }
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) {
        names.add(trimmed);
      }
      return;
    }
    if (typeof candidate === 'object') {
      const record = candidate as Record<string, unknown>;
      const possibleKeys = ['name', 'petName', 'displayName', 'label'];
      for (const key of possibleKeys) {
        const value = record[key];
        if (typeof value === 'string' && value.trim().length > 0) {
          names.add(value.trim());
        }
      }
      return;
    }
  };

  if (Array.isArray(petsData)) {
    petsData.forEach(pushName);
  } else if (typeof petsData === 'string') {
    // Handle comma-separated strings
    petsData.split(',').forEach(part => pushName(part));
  } else if (typeof petsData === 'object' && petsData !== null) {
    // Handle object maps: {pet1: Pet, pet2: Pet}
    // Also handles single pet objects
    Object.values(petsData as Record<string, unknown>).forEach(pushName);
  } else {
    pushName(petsData);
  }

  return Array.from(names);
};

/**
 * Format a user name, extracting from email if needed
 * 
 * @param name - User name or email
 * @returns Formatted display name
 * 
 * @example
 * formatUserName("john.doe@example.com") // "John.doe"
 * formatUserName("John Doe") // "John Doe"
 */
export const formatUserName = (name: string | null | undefined): string => {
  if (!name) {
    return 'Unknown User';
  }
  
  if (name.includes('@')) {
    const emailName = name.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  return name;
};

