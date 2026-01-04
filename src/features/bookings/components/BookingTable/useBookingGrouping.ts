/**
 * Booking Grouping Hook
 * 
 * Hook for grouping bookings by recurring series ID.
 */

import { useMemo } from 'react';
import type { Booking } from '../../types/bookings.types';

export const useBookingGrouping = (bookings: Booking[]) => {
  const groupedBySeries = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach(booking => {
      if (booking.recurringSeriesId) {
        const seriesId = booking.recurringSeriesId;
        if (!grouped[seriesId]) {
          grouped[seriesId] = [];
        }
        grouped[seriesId].push(booking);
      }
    });
    Object.keys(grouped).forEach(seriesId => {
      grouped[seriesId].sort((a, b) => (a.visitNumber || 0) - (b.visitNumber || 0));
    });
    return grouped;
  }, [bookings]);

  return groupedBySeries;
};


