/**
 * useBookings Hook
 * 
 * Custom hook for fetching bookings data with React Query.
 * Extracted from Bookings.tsx for reusability and testability.
 */

import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import type { BookingFilters } from '../types/bookings.types';
import { message } from 'antd';
import { useAuth } from '@/contexts/AuthContext';

interface UseBookingsOptions {
  filters: BookingFilters;
  enabled?: boolean;
}

/**
 * Hook to fetch bookings with filters
 * 
 * @param options - Configuration options
 * @returns Booking data, loading state, error, and refetch function
 */
export const useBookings = ({ filters, enabled = true }: UseBookingsOptions) => {
  const { isAdmin, loading: authLoading } = useAuth();
  const isAuthorized = isAdmin;

  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      try {
        const result = await bookingService.getAllBookings(filters);
        return result;
      } catch (error) {
        console.error('❌ Bookings query error:', error);
        message.error('Failed to load bookings.');
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
    enabled: enabled && isAuthorized && !authLoading,
  });

  return {
    bookings,
    isLoading,
    error,
    refetch,
  };
};

