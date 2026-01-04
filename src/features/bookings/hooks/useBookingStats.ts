/**
 * Hook to calculate booking statistics
 */

import { useMemo } from 'react';
import type { Booking } from '../types/bookings.types';

interface BookingStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  revenue: number;
}

/**
 * Calculate statistics from bookings array
 */
export const useBookingStats = (bookings: Booking[]): BookingStats => {
  return useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      revenue: bookings.reduce((sum, b) => sum + b.price, 0),
    };
  }, [bookings]);
};

