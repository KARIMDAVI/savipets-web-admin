/**
 * Analytics Service
 * 
 * Service for calculating CRM analytics and generating reports.
 * Delegates to specialized services for each metric domain.
 */

import type {
  AnalyticsQuery,
  ClientAcquisitionMetrics,
  RevenueMetrics,
  RetentionMetrics,
  EngagementMetrics,
  SegmentPerformance,
  ServicePerformance,
  ActivityMetrics,
  PerformanceComparison,
} from '../types/analytics.types';
import { clientAcquisitionService } from './analytics/ClientAcquisitionService';
import { revenueService } from './analytics/RevenueService';
import { retentionService } from './analytics/RetentionService';
import { engagementService } from './analytics/EngagementService';
import { performanceService } from './analytics/PerformanceService';

class AnalyticsService {
  /**
   * Calculate client acquisition metrics
   */
  async getClientAcquisitionMetrics(
    queryParams: AnalyticsQuery
  ): Promise<ClientAcquisitionMetrics> {
    return clientAcquisitionService.getClientAcquisitionMetrics(queryParams);
  }

  /**
   * Calculate revenue metrics
   */
  async getRevenueMetrics(queryParams: AnalyticsQuery): Promise<RevenueMetrics> {
    return revenueService.getRevenueMetrics(queryParams);
  }

  /**
   * Calculate retention metrics
   */
  async getRetentionMetrics(queryParams: AnalyticsQuery): Promise<RetentionMetrics> {
    return retentionService.getRetentionMetrics(queryParams);
  }

  /**
   * Calculate engagement metrics
   */
  async getEngagementMetrics(queryParams: AnalyticsQuery): Promise<EngagementMetrics> {
    return engagementService.getEngagementMetrics(queryParams);
  }

  /**
   * Calculate segment performance
   */
  async getSegmentPerformance(
    queryParams: AnalyticsQuery
  ): Promise<SegmentPerformance[]> {
    return performanceService.getSegmentPerformance(queryParams);
  }

  /**
   * Calculate service performance
   */
  async getServicePerformance(
    queryParams: AnalyticsQuery
  ): Promise<ServicePerformance[]> {
    return performanceService.getServicePerformance(queryParams);
  }

  /**
   * Calculate activity metrics
   */
  async getActivityMetrics(queryParams: AnalyticsQuery): Promise<ActivityMetrics> {
    return performanceService.getActivityMetrics(queryParams);
  }

  /**
   * Calculate performance comparison
   */
  async getPerformanceComparison(
    queryParams: AnalyticsQuery
  ): Promise<PerformanceComparison> {
    return performanceService.getPerformanceComparison(queryParams);
  }
}

export const analyticsService = new AnalyticsService();

