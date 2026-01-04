import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import type { RecurringBatch } from '@/types';

export const useRecurringBatches = (status: string = 'scheduled') => {
  return useQuery<RecurringBatch[], Error>({
    queryKey: ['recurring-batches', status],
    queryFn: () => bookingService.getRecurringBatches(status),
    staleTime: 60 * 1000,
  });
};

