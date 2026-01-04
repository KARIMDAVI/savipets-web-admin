/**
 * Analytics Feature Types
 * 
 * Type definitions for analytics and reporting.
 * Extracted from Analytics.tsx for better organization.
 */

export interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth: number;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    growth: number;
  };
  users: {
    total: number;
    sitters: number;
    owners: number;
    growth: number;
  };
  performance: {
    avgRating: number;
    completionRate: number;
    responseTime: number;
  };
}

export interface RevenueChartDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface ServiceTypeDataPoint {
  name: string;
  value: number;
  percentage: number;
}

export interface TopSitter {
  id: string;
  name: string;
  rating: number;
  bookings: number;
  completed: number;
  revenue: number;
  completionRate: number;
}

export type Timeframe = 'daily' | 'weekly' | 'monthly';

