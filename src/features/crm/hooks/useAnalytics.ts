/**
 * useAnalytics Hook
 * 
 * Hook for fetching and managing CRM analytics data.
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import type { AnalyticsQuery } from '../types/analytics.types';

/**
 * Hook for analytics data
 */
export const useAnalytics = (queryParams: AnalyticsQuery) => {
  // Client acquisition metrics
  const acquisitionMetrics = useQuery({
    queryKey: ['crm-analytics-acquisition', queryParams],
    queryFn: () => analyticsService.getClientAcquisitionMetrics(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Revenue metrics
  const revenueMetrics = useQuery({
    queryKey: ['crm-analytics-revenue', queryParams],
    queryFn: () => analyticsService.getRevenueMetrics(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Retention metrics
  const retentionMetrics = useQuery({
    queryKey: ['crm-analytics-retention', queryParams],
    queryFn: () => analyticsService.getRetentionMetrics(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Engagement metrics
  const engagementMetrics = useQuery({
    queryKey: ['crm-analytics-engagement', queryParams],
    queryFn: () => analyticsService.getEngagementMetrics(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Segment performance
  const segmentPerformance = useQuery({
    queryKey: ['crm-analytics-segments', queryParams],
    queryFn: () => analyticsService.getSegmentPerformance(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Service performance
  const servicePerformance = useQuery({
    queryKey: ['crm-analytics-services', queryParams],
    queryFn: () => analyticsService.getServicePerformance(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Activity metrics
  const activityMetrics = useQuery({
    queryKey: ['crm-analytics-activity', queryParams],
    queryFn: () => analyticsService.getActivityMetrics(queryParams),
    enabled: !!queryParams.dateRange,
  });

  // Performance comparison
  const performanceComparison = useQuery({
    queryKey: ['crm-analytics-comparison', queryParams],
    queryFn: () => analyticsService.getPerformanceComparison(queryParams),
    enabled: !!queryParams.dateRange,
  });

  return {
    acquisitionMetrics: acquisitionMetrics.data,
    revenueMetrics: revenueMetrics.data,
    retentionMetrics: retentionMetrics.data,
    engagementMetrics: engagementMetrics.data,
    segmentPerformance: segmentPerformance.data,
    servicePerformance: servicePerformance.data,
    activityMetrics: activityMetrics.data,
    performanceComparison: performanceComparison.data,
    isLoading:
      acquisitionMetrics.isLoading ||
      revenueMetrics.isLoading ||
      retentionMetrics.isLoading ||
      engagementMetrics.isLoading ||
      segmentPerformance.isLoading ||
      servicePerformance.isLoading ||
      activityMetrics.isLoading ||
      performanceComparison.isLoading,
  };
};

