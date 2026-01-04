/**
 * CRM Filter Types
 * 
 * Type definitions for advanced filtering in CRM module.
 */

import type { ClientSegment } from './crm.types';

/**
 * Date range filter options
 */
export type DateField = 'createdAt' | 'lastBooking' | 'lastContact';

/**
 * Client filters interface
 */
export interface ClientFilters {
  searchTerm?: string;
  segmentIds?: string[];
  tagIds?: string[];
  dateRange?: {
    field: DateField;
    start: Date;
    end: Date;
  };
  revenueRange?: {
    min: number;
    max: number;
  };
  bookingCountRange?: {
    min: number;
    max: number;
  };
  ratingRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
  customFields?: Record<string, unknown>;
}

/**
 * Filter preset for saving and reusing filters
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: ClientFilters;
  isDefault?: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Filter preset storage key
 */
export const FILTER_PRESETS_STORAGE_KEY = 'crm_filter_presets';

/**
 * Default filter preset
 */
export const DEFAULT_FILTER_PRESET: FilterPreset = {
  id: 'default',
  name: 'All Clients',
  filters: {},
  isDefault: true,
  createdBy: 'system',
  createdAt: new Date(),
};

