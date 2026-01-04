import type {
  AnalyticsQuery,
  SegmentPerformance,
  ServicePerformance,
  ActivityMetrics,
  PerformanceComparison,
} from '../../types/analytics.types';
import { withErrorHandling } from '../../utils/errorHandler';
import { AnalyticsHelpers } from './AnalyticsHelpers';
import dayjs from 'dayjs';
import type { Booking } from '@/types';

/**
 * Service for performance analytics
 */
export class PerformanceService {
  /**
   * Calculate segment performance
   */
  async getSegmentPerformance(
    queryParams: AnalyticsQuery
  ): Promise<SegmentPerformance[]> {
    return (await withErrorHandling(async () => {
      // TODO: Implement segment performance calculation
      return [];
    })) || [];
  }

  /**
   * Calculate service performance
   */
  async getServicePerformance(
    queryParams: AnalyticsQuery
  ): Promise<ServicePerformance[]> {
    return (await withErrorHandling(async () => {
      const bookings = await AnalyticsHelpers.getBookingsInRange(queryParams);
      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

      const serviceMap = bookings.reduce((acc, booking) => {
        const serviceType = booking.serviceType || 'Unknown';
        if (!acc[serviceType]) {
          acc[serviceType] = {
            bookingCount: 0,
            totalRevenue: 0,
            prices: [] as number[],
          };
        }
        acc[serviceType].bookingCount++;
        const price = Number(booking.price) || 0;
        acc[serviceType].totalRevenue += price;
        acc[serviceType].prices.push(price);
        return acc;
      }, {} as Record<string, { bookingCount: number; totalRevenue: number; prices: number[] }>);

      return Object.entries(serviceMap).map(([serviceType, data]) => ({
        serviceType,
        bookingCount: data.bookingCount,
        totalRevenue: data.totalRevenue,
        averagePrice: data.totalRevenue / data.bookingCount,
        popularity: totalBookings > 0 ? (data.bookingCount / totalBookings) * 100 : 0,
        growthRate: 0,
      }));
    })) || [];
  }

  /**
   * Calculate activity metrics
   */
  async getActivityMetrics(queryParams: AnalyticsQuery): Promise<ActivityMetrics> {
    return (await withErrorHandling(async () => {
      // TODO: Implement activity metrics calculation
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        averageTaskCompletionTime: 0,
        totalEmails: 0,
        totalSMS: 0,
        totalCalls: 0,
        totalNotes: 0,
        activityByType: [],
      };
    })) || {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      averageTaskCompletionTime: 0,
      totalEmails: 0,
      totalSMS: 0,
      totalCalls: 0,
      totalNotes: 0,
      activityByType: [],
    };
  }

  /**
   * Calculate performance comparison
   */
  async getPerformanceComparison(
    queryParams: AnalyticsQuery
  ): Promise<PerformanceComparison> {
    return (await withErrorHandling(async () => {
      const currentBookings = await AnalyticsHelpers.getBookingsInRange(queryParams);
      const currentClients = await AnalyticsHelpers.getClientsInRange(queryParams);

      const periodDuration = dayjs(queryParams.dateRange.end).diff(
        queryParams.dateRange.start,
        'day'
      );

      const previousDateRange = {
        start: dayjs(queryParams.dateRange.start).subtract(periodDuration, 'day').toDate(),
        end: queryParams.dateRange.start,
      };

      const previousBookings = await AnalyticsHelpers.getBookingsInRange({
        ...queryParams,
        dateRange: previousDateRange,
      });
      const previousClients = await AnalyticsHelpers.getClientsInRange({
        ...queryParams,
        dateRange: previousDateRange,
      });

      const currentRevenue = currentBookings.reduce(
        (sum, b) => sum + (Number(b.price) || 0),
        0
      );
      const previousRevenue = previousBookings.reduce(
        (sum, b) => sum + (Number(b.price) || 0),
        0
      );

      return {
        currentPeriod: {
          revenue: currentRevenue,
          clients: currentClients.length,
          bookings: currentBookings.length,
        },
        previousPeriod: {
          revenue: previousRevenue,
          clients: previousClients.length,
          bookings: previousBookings.length,
        },
        changes: {
          revenue: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
          clients: previousClients.length > 0
            ? ((currentClients.length - previousClients.length) / previousClients.length) * 100
            : 0,
          bookings: previousBookings.length > 0
            ? ((currentBookings.length - previousBookings.length) / previousBookings.length) * 100
            : 0,
        },
      };
    })) || {
      currentPeriod: { revenue: 0, clients: 0, bookings: 0 },
      previousPeriod: { revenue: 0, clients: 0, bookings: 0 },
      changes: { revenue: 0, clients: 0, bookings: 0 },
    };
  }
}

export const performanceService = new PerformanceService();


