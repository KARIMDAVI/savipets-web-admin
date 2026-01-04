import type { AnalyticsQuery, ClientAcquisitionMetrics } from '../../types/analytics.types';
import { withErrorHandling } from '../../utils/errorHandler';
import { AnalyticsHelpers } from './AnalyticsHelpers';
import dayjs from 'dayjs';

/**
 * Service for client acquisition analytics
 */
export class ClientAcquisitionService {
  /**
   * Calculate client acquisition metrics
   */
  async getClientAcquisitionMetrics(
    queryParams: AnalyticsQuery
  ): Promise<ClientAcquisitionMetrics> {
    return (await withErrorHandling(async () => {
      const clients = await AnalyticsHelpers.getClientsInRange(queryParams);
      const newClients = clients.filter(
        (client) =>
          client.createdAt >= queryParams.dateRange.start &&
          client.createdAt <= queryParams.dateRange.end
      );

      const grouped = AnalyticsHelpers.groupByPeriod(
        newClients,
        queryParams.dateRange,
        queryParams.timePeriod || 'month'
      );

      const totalNewClients = newClients.length;
      const previousPeriodClients = await AnalyticsHelpers.getClientsInRange({
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

      const growthRate =
        previousPeriodClients.length > 0
          ? ((totalNewClients - previousPeriodClients.length) / previousPeriodClients.length) * 100
          : 0;

      const bookings = await AnalyticsHelpers.getBookingsInRange(queryParams);
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      const averageClientValue = totalNewClients > 0 ? totalRevenue / totalNewClients : 0;

      return {
        totalNewClients,
        newClientsByPeriod: grouped.map((g) => ({
          period: g.period,
          count: g.items.length,
        })),
        growthRate,
        averageClientValue,
      };
    })) || {
      totalNewClients: 0,
      newClientsByPeriod: [],
      growthRate: 0,
      averageClientValue: 0,
    };
  }

}

export const clientAcquisitionService = new ClientAcquisitionService();

