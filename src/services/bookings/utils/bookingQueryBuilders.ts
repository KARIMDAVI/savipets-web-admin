/**
 * Booking Query Builders
 * 
 * Utility functions for building Firestore queries.
 */

import { query, where, orderBy, Query, Timestamp } from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import type { Booking, BookingFilters } from '@/types';

/**
 * Build query with filters
 */
export const buildBookingQuery = (
  baseQuery: Query,
  filters?: BookingFilters
): Query => {
  let q = baseQuery;
  const constraints: QueryConstraint[] = [];

  // Build query with filters
  if (filters?.status && filters.status.length > 0) {
    constraints.push(where('status', 'in', filters.status));
    console.log('📝 Applied status filter:', filters.status);
  }

  if (filters?.serviceType && filters.serviceType.length > 0) {
    constraints.push(where('serviceType', 'in', filters.serviceType));
    console.log('📝 Applied serviceType filter:', filters.serviceType);
  }

  if (filters?.sitterId) {
    constraints.push(where('sitterId', '==', filters.sitterId));
    console.log('📝 Applied sitterId filter:', filters.sitterId);
  }

  if (filters?.clientId) {
    constraints.push(where('clientId', '==', filters.clientId));
    console.log('📝 Applied clientId filter:', filters.clientId);
  }

  // Apply date range filter at Firestore level (requires index on scheduledDate)
  if (filters?.dateRange) {
    const startDate = filters.dateRange.start instanceof Date
      ? Timestamp.fromDate(filters.dateRange.start)
      : filters.dateRange.start;
    const endDate = filters.dateRange.end instanceof Date
      ? Timestamp.fromDate(filters.dateRange.end)
      : filters.dateRange.end;
    
    constraints.push(where('scheduledDate', '>=', startDate));
    constraints.push(where('scheduledDate', '<=', endDate));
    console.log('📝 Applied date range filter at Firestore level:', {
      start: filters.dateRange.start,
      end: filters.dateRange.end,
    });
  }

  // Try to order by createdAt, but handle case where it might not exist
  // Note: If dateRange is used, we should order by scheduledDate instead
  try {
    if (filters?.dateRange) {
      constraints.push(orderBy('scheduledDate', 'asc'));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }
  } catch (error) {
    console.warn('⚠️ Could not apply ordering:', error);
    // Continue without ordering
  }

  // Apply all constraints
  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }

  return q;
};

/**
 * Apply post-query filters (search only)
 * Note: Date range filtering is now done at Firestore level for better performance
 */
export const applyPostQueryFilters = (
  bookings: Booking[],
  filters?: BookingFilters
): Booking[] => {
  let filtered = bookings;

  // Date range filtering is now handled at Firestore level in buildBookingQuery
  // Only apply client-side filtering for search (which can't be done efficiently in Firestore)

  // Apply search filter if provided
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(booking => 
      booking.id.toLowerCase().includes(searchTerm) ||
      booking.specialInstructions?.toLowerCase().includes(searchTerm) ||
      booking.serviceType?.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

