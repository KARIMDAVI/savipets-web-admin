/**
 * useLiveTrackingData Hook
 * 
 * Manages data fetching for live tracking (visits, bookings, sitters).
 */

import { useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { visitService, type Visit } from '@/services/visit.service';
import { userService } from '@/services/user.service';
import type { Booking, User } from '@/types';
import { convertVisitToBooking } from './liveTrackingHelpers';

export interface UseLiveTrackingDataReturn {
  activeVisits: Visit[];
  activeBookings: Booking[];
  effectiveActiveBookings: Booking[];
  sitters: User[];
  sitterLookup: Map<string, User>;
  bookingLookup: Map<string, Booking>;
  visitsLoading: boolean;
  bookingsLoading: boolean;
  isLoading: boolean;
  refetch: () => void;
  convertVisitToBookingFn: (visit: Visit) => Booking;
}

export const useLiveTrackingData = (
  autoRefresh: boolean,
  refreshInterval: number
): UseLiveTrackingDataReturn => {
  // ✅ IMMEDIATE LOG - Runs when hook initializes
  console.log('🔍 [useLiveTrackingData] Hook initializing...');
  
  // Fetch active visits (on_adventure status)
  const {
    data: activeVisits = [],
    isLoading: visitsLoading,
    refetch: refetchVisits,
    error: visitsError,
  } = useQuery({
    queryKey: ['activeVisits'],
    queryFn: async () => {
      console.log('📡 [useLiveTrackingData] Fetching active visits...');
      const visits = await visitService.getActiveVisits();
      console.log(`✅ [useLiveTrackingData] Received ${visits.length} active visit(s)`);
      return visits;
    },
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });
  
  // ✅ LOG when data changes or errors occur
  useEffect(() => {
    if (visitsError) {
      console.error('❌ [useLiveTrackingData] Query error:', visitsError);
    } else {
      console.log(`📊 [useLiveTrackingData] activeVisits changed: ${activeVisits.length} visit(s)`, activeVisits);
    }
  }, [activeVisits, visitsError]);

  // Fetch active bookings for fallback/display
  const {
    data: activeBookings = [],
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['activeBookings'],
    queryFn: () => bookingService.getActiveBookings(),
    refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
  });

  // Create booking lookup map for visit-to-booking mapping
  const bookingLookup = useMemo(() => {
    return activeBookings.reduce<Map<string, Booking>>((acc, booking) => {
      acc.set(booking.id, booking);
      return acc;
    }, new Map());
  }, [activeBookings]);

  const convertVisitToBookingFn = useCallback((visit: Visit): Booking => {
    return convertVisitToBooking(visit);
  }, []);

  // Convert visits to bookings for compatibility
  const activeBookingsFromVisits = useMemo(() => {
    return activeVisits.map(visit => {
      // Try to find matching booking
      const booking = bookingLookup.get(visit.bookingId) || bookingLookup.get(visit.id);
      if (booking) return booking;
      
      // Create a minimal booking object from visit data
      return convertVisitToBookingFn(visit);
    });
  }, [activeVisits, bookingLookup, convertVisitToBookingFn]);

  // Use visits if available, otherwise fall back to bookings
  const effectiveActiveBookings = activeVisits.length > 0 ? activeBookingsFromVisits : activeBookings;

  // Fetch sitters for active visits/bookings
  const { data: sitters = [] } = useQuery({
    queryKey: ['sitters'],
    queryFn: () => userService.getUsersByRole('petSitter'),
    enabled: effectiveActiveBookings.length > 0,
  });

  const sitterLookup = useMemo(() => {
    return sitters.reduce<Map<string, User>>((acc, sitter) => {
      acc.set(sitter.id, sitter);
      return acc;
    }, new Map());
  }, [sitters]);

  const isLoading = visitsLoading || bookingsLoading;
  const refetch = useCallback(() => {
    refetchVisits();
    refetchBookings();
  }, [refetchVisits, refetchBookings]);

  return {
    activeVisits,
    activeBookings,
    effectiveActiveBookings,
    sitters,
    sitterLookup,
    bookingLookup,
    visitsLoading,
    bookingsLoading,
    isLoading,
    refetch,
    convertVisitToBookingFn,
  };
};


