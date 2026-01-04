/**
 * useAnalytics Hook
 * 
 * Hook for fetching analytics data.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { bookingService } from '@/services/booking.service';
import { userService } from '@/services/user.service';
import type { Booking, User } from '@/types';
import type { Timeframe } from '../types/analytics.types';

export const useAnalytics = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');

  // Fetch analytics data
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useQuery<Booking[]>({
    queryKey: ['analytics-bookings', dateRange],
    queryFn: () => bookingService.getAllBookings({
      dateRange: {
        start: dateRange[0].toDate(),
        end: dateRange[1].toDate(),
      },
    }),
    retry: 2,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
    isError: isUsersError,
  } = useQuery<User[]>({
    queryKey: ['analytics-users'],
    queryFn: () => userService.getAllUsers({}),
    retry: 2,
  });

  const isLoading = bookingsLoading || usersLoading;
  const error = bookingsError || usersError;
  const isError = isBookingsError || isUsersError;

  // Refetch all data
  const refetchAll = () => {
    refetchBookings();
    // Note: Users query doesn't change, so no need to refetch it frequently
  };

  return {
    bookings,
    users,
    dateRange,
    timeframe,
    isLoading,
    bookingsLoading,
    usersLoading,
    error,
    isError,
    setDateRange,
    setTimeframe,
    refetchBookings,
    refetchAll,
  };
};

