import type { AnalyticsQuery, EngagementMetrics } from '../../types/analytics.types';
import { withErrorHandling } from '../../utils/errorHandler';
import { AnalyticsHelpers } from './AnalyticsHelpers';
import dayjs from 'dayjs';
import type { Booking } from '@/types';

/**
 * Service for engagement analytics
 */
export class EngagementService {
  /**
   * Calculate engagement metrics
   */
  async getEngagementMetrics(queryParams: AnalyticsQuery): Promise<EngagementMetrics> {
    return (await withErrorHandling(async () => {
      const clients = await AnalyticsHelpers.getClientsInRange(queryParams);
      const bookings = await AnalyticsHelpers.getBookingsInRange(queryParams);
      const notes = await AnalyticsHelpers.getNotesInRange(queryParams);

      const averageBookingsPerClient =
        clients.length > 0 ? bookings.length / clients.length : 0;

      const timeBetweenBookings: number[] = [];
      const clientBookingsMap = bookings.reduce((acc, booking) => {
        if (!acc[booking.clientId]) acc[booking.clientId] = [];
        acc[booking.clientId].push(booking);
        return acc;
      }, {} as Record<string, Booking[]>);

      Object.values(clientBookingsMap).forEach((clientBookings) => {
        if (clientBookings.length > 1) {
          const sorted = clientBookings.sort(
            (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
          );
          for (let i = 1; i < sorted.length; i++) {
            const days = dayjs(sorted[i].scheduledDate).diff(sorted[i - 1].scheduledDate, 'day');
            timeBetweenBookings.push(days);
          }
        }
      });

      const averageTimeBetweenBookings =
        timeBetweenBookings.length > 0
          ? timeBetweenBookings.reduce((sum, days) => sum + days, 0) / timeBetweenBookings.length
          : 0;

      const noteFrequency = clients.length > 0 ? notes.length / clients.length : 0;

      return {
        averageBookingsPerClient,
        averageTimeBetweenBookings,
        noteFrequency,
        activeClientRate: clients.length > 0 ? (bookings.length > 0 ? 100 : 0) : 0,
      };
    })) || {
      averageBookingsPerClient: 0,
      averageTimeBetweenBookings: 0,
      noteFrequency: 0,
      activeClientRate: 0,
    };
  }
}

export const engagementService = new EngagementService();


