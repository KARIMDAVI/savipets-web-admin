import type { AnalyticsQuery, RevenueMetrics } from '../../types/analytics.types';
import { withErrorHandling } from '../../utils/errorHandler';
import { AnalyticsHelpers } from './AnalyticsHelpers';
import dayjs from 'dayjs';
import type { Booking } from '@/types';

/**
 * Service for revenue analytics
 */
export class RevenueService {
  /**
   * Calculate revenue metrics
   */
  async getRevenueMetrics(queryParams: AnalyticsQuery): Promise<RevenueMetrics> {
    return (await withErrorHandling(async () => {
      const bookings = await AnalyticsHelpers.getBookingsInRange(queryParams);
      const clients = await AnalyticsHelpers.getClientsInRange(queryParams);

      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

      const grouped = AnalyticsHelpers.groupByPeriod(
        bookings,
        queryParams.dateRange,
        queryParams.timePeriod || 'month'
      );

      const revenueByPeriod = grouped.map((g) => ({
        period: g.period,
        revenue: g.items.reduce((sum, b: Booking) => sum + (Number(b.price) || 0), 0),
      }));

      const revenueBySegment = await this.calculateRevenueBySegment(bookings, clients);
      const revenueByServiceType = AnalyticsHelpers.calculateRevenueByServiceType(bookings);

      const averageRevenuePerClient = clients.length > 0 ? totalRevenue / clients.length : 0;
      const averageRevenuePerBooking = bookings.length > 0 ? totalRevenue / bookings.length : 0;

      const previousPeriodBookings = await AnalyticsHelpers.getBookingsInRange({
        ...queryParams,
        dateRange: {
          start: dayjs(queryParams.dateRange.start)
            .subtract(
              dayjs(queryParams.dateRange.end).diff(queryParams.dateRange.start, 'day'),
              'day'
            )
            .toDate(),
          end: queryParams.dateRange.start,
        },
      });

      const previousRevenue = previousPeriodBookings.reduce(
        (sum, b) => sum + (Number(b.price) || 0),
        0
      );
      const revenueGrowth =
        previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      return {
        totalRevenue,
        revenueByPeriod,
        averageRevenuePerClient,
        averageRevenuePerBooking,
        revenueBySegment,
        revenueByServiceType,
        revenueGrowth,
      };
    })) || {
      totalRevenue: 0,
      revenueByPeriod: [],
      averageRevenuePerClient: 0,
      averageRevenuePerBooking: 0,
      revenueBySegment: [],
      revenueByServiceType: [],
      revenueGrowth: 0,
    };
  }

  private async calculateRevenueBySegment(
    bookings: Booking[],
    clients: any[]
  ): Promise<Array<{ segment: string; revenue: number }>> {
    // TODO: Implement segment-based revenue calculation
    return [];
  }
}

export const revenueService = new RevenueService();


