/**
 * Booking Filters Hook
 * 
 * Hook for managing booking filter state and handlers.
 */

import { useCallback } from 'react';
import dayjs from 'dayjs';
import type { BookingFilters, BookingStatus, ServiceType } from '@/types';

interface UseBookingFiltersProps {
  filters: BookingFilters;
  setFilters: React.Dispatch<React.SetStateAction<BookingFilters>>;
}

export const useBookingFilters = ({ filters, setFilters }: UseBookingFiltersProps) => {
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, [setFilters]);

  const handleStatusFilter = useCallback((value: BookingStatus[]) => {
    setFilters(prev => ({ ...prev, status: value }));
  }, [setFilters]);

  const handleServiceTypeFilter = useCallback((value: ServiceType[]) => {
    setFilters(prev => ({ ...prev, serviceType: value }));
  }, [setFilters]);

  const handleDateRangeFilter = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          start: dates[0]!.toDate(),
          end: dates[1]!.toDate(),
        },
      }));
    } else {
      setFilters(prev => ({ ...prev, dateRange: undefined }));
    }
  }, [setFilters]);

  return {
    handleSearch,
    handleStatusFilter,
    handleServiceTypeFilter,
    handleDateRangeFilter,
  };
};


