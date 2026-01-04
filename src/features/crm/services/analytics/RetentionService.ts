import type { AnalyticsQuery, RetentionMetrics } from '../../types/analytics.types';
import { withErrorHandling } from '../../utils/errorHandler';
import { AnalyticsHelpers } from './AnalyticsHelpers';
import dayjs from 'dayjs';
import type { Booking } from '@/types';

/**
 * Service for retention analytics
 */
export class RetentionService {
  /**
   * Calculate retention metrics
   */
  async getRetentionMetrics(queryParams: AnalyticsQuery): Promise<RetentionMetrics> {
    return (await withErrorHandling(async () => {
      const clients = await AnalyticsHelpers.getClientsInRange(queryParams);
      const bookings = await AnalyticsHelpers.getBookingsInRange(queryParams);

      const activeClients = new Set(bookings.map((b) => b.clientId)).size;
      const totalClients = clients.length;
      const inactiveClients = totalClients - activeClients;

      const ninetyDaysAgo = dayjs().subtract(90, 'day').toDate();
      const recentBookings = bookings.filter((b) => new Date(b.scheduledDate) >= ninetyDaysAgo);
      const activeRecentClients = new Set(recentBookings.map((b) => b.clientId)).size;
      const atRiskClients = activeClients - activeRecentClients;

      const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
      const churnRate = 100 - retentionRate;

      const clientRevenue = bookings.reduce((acc, booking) => {
        if (!acc[booking.clientId]) acc[booking.clientId] = 0;
        acc[booking.clientId] += Number(booking.price) || 0;
        return acc;
      }, {} as Record<string, number>);

      const lifetimeValue =
        Object.keys(clientRevenue).length > 0
          ? Object.values(clientRevenue).reduce((sum, rev) => sum + rev, 0) /
            Object.keys(clientRevenue).length
          : 0;

      const clientLifespans = clients
        .map((client) => {
          const clientBookings = bookings.filter((b) => b.clientId === client.id);
          if (clientBookings.length === 0) return 0;
          const sorted = clientBookings.sort(
            (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
          );
          const firstBooking = sorted[0];
          const lastBooking = sorted[sorted.length - 1];
          return dayjs(lastBooking.scheduledDate).diff(firstBooking.scheduledDate, 'day');
        })
        .filter((days) => days > 0);

      const averageClientLifespan =
        clientLifespans.length > 0
          ? clientLifespans.reduce((sum, days) => sum + days, 0) / clientLifespans.length
          : 0;

      const clientsWithMultipleBookings = Object.values(
        bookings.reduce((acc, booking) => {
          if (!acc[booking.clientId]) acc[booking.clientId] = 0;
          acc[booking.clientId]++;
          return acc;
        }, {} as Record<string, number>)
      ).filter((count) => count > 1).length;

      const repeatBookingRate =
        totalClients > 0 ? (clientsWithMultipleBookings / totalClients) * 100 : 0;

      return {
        retentionRate,
        churnRate,
        activeClients,
        inactiveClients,
        atRiskClients,
        lifetimeValue,
        averageClientLifespan,
        repeatBookingRate,
      };
    })) || {
      retentionRate: 0,
      churnRate: 0,
      activeClients: 0,
      inactiveClients: 0,
      atRiskClients: 0,
      lifetimeValue: 0,
      averageClientLifespan: 0,
      repeatBookingRate: 0,
    };
  }
}

export const retentionService = new RetentionService();


