import { useCallback } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import type { ClientFilters, DateField } from '../../types/filters.types';

interface UseFilterHandlersProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
}

export const useFilterHandlers = ({
  filters,
  onFiltersChange,
}: UseFilterHandlersProps) => {
  const handleSearchChange = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, searchTerm: value || undefined });
    },
    [filters, onFiltersChange]
  );

  const handleSegmentChange = useCallback(
    (value: string[]) => {
      onFiltersChange({
        ...filters,
        segmentIds: value.length > 0 ? value : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleTagChange = useCallback(
    (value: string[]) => {
      onFiltersChange({
        ...filters,
        tagIds: value.length > 0 ? value : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleDateRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null, field: DateField) => {
      if (dates && dates[0] && dates[1]) {
        onFiltersChange({
          ...filters,
          dateRange: {
            field,
            start: dates[0].toDate(),
            end: dates[1].toDate(),
          },
        });
      } else {
        const { dateRange, ...rest } = filters;
        onFiltersChange(rest);
      }
    },
    [filters, onFiltersChange]
  );

  const handleRevenueRangeChange = useCallback(
    (min: number | null, max: number | null) => {
      if (min !== null || max !== null) {
        onFiltersChange({
          ...filters,
          revenueRange: {
            min: min ?? 0,
            max: max ?? Infinity,
          },
        });
      } else {
        const { revenueRange, ...rest } = filters;
        onFiltersChange(rest);
      }
    },
    [filters, onFiltersChange]
  );

  const handleBookingCountRangeChange = useCallback(
    (min: number | null, max: number | null) => {
      if (min !== null || max !== null) {
        onFiltersChange({
          ...filters,
          bookingCountRange: {
            min: min ?? 0,
            max: max ?? Infinity,
          },
        });
      } else {
        const { bookingCountRange, ...rest } = filters;
        onFiltersChange(rest);
      }
    },
    [filters, onFiltersChange]
  );

  const handleRatingRangeChange = useCallback(
    (min: number | null, max: number | null) => {
      if (min !== null || max !== null) {
        onFiltersChange({
          ...filters,
          ratingRange: {
            min: min ?? 0,
            max: max ?? 5,
          },
        });
      } else {
        const { ratingRange, ...rest } = filters;
        onFiltersChange(rest);
      }
    },
    [filters, onFiltersChange]
  );

  const handleActiveStatusChange = useCallback(
    (checked: boolean) => {
      onFiltersChange({
        ...filters,
        isActive: checked ? true : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  return {
    handleSearchChange,
    handleSegmentChange,
    handleTagChange,
    handleDateRangeChange,
    handleRevenueRangeChange,
    handleBookingCountRangeChange,
    handleRatingRangeChange,
    handleActiveStatusChange,
    handleClearFilters,
  };
};


