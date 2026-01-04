/**
 * Analytics Types
 * 
 * Type definitions for CRM analytics and reporting.
 */

/**
 * Date range for analytics queries
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Time period for grouping data
 */
export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Client acquisition metrics
 */
export interface ClientAcquisitionMetrics {
  totalNewClients: number;
  newClientsByPeriod: Array<{ period: string; count: number }>;
  acquisitionChannels?: Array<{ channel: string; count: number }>;
  growthRate: number; // Percentage
  averageClientValue: number;
}

/**
 * Revenue metrics
 */
export interface RevenueMetrics {
  totalRevenue: number;
  revenueByPeriod: Array<{ period: string; revenue: number }>;
  averageRevenuePerClient: number;
  averageRevenuePerBooking: number;
  revenueBySegment: Array<{ segment: string; revenue: number }>;
  revenueByServiceType: Array<{ serviceType: string; revenue: number }>;
  revenueGrowth: number; // Percentage
  projectedRevenue?: number;
}

/**
 * Client retention metrics
 */
export interface RetentionMetrics {
  retentionRate: number; // Percentage
  churnRate: number; // Percentage
  activeClients: number;
  inactiveClients: number;
  atRiskClients: number;
  lifetimeValue: number; // Average LTV
  averageClientLifespan: number; // In days
  repeatBookingRate: number; // Percentage
}

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  averageBookingsPerClient: number;
  averageTimeBetweenBookings: number; // In days
  communicationFrequency: number; // Average communications per client
  responseRate: number; // Percentage
  taskCompletionRate: number; // Percentage
  noteFrequency: number; // Average notes per client
}

/**
 * Segment performance metrics
 */
export interface SegmentPerformance {
  segmentId: string;
  segmentName: string;
  clientCount: number;
  totalRevenue: number;
  averageRevenuePerClient: number;
  averageBookingsPerClient: number;
  retentionRate: number;
  growthRate: number;
}

/**
 * Service performance metrics
 */
export interface ServicePerformance {
  serviceType: string;
  bookingCount: number;
  totalRevenue: number;
  averagePrice: number;
  popularity: number; // Percentage of total bookings
  growthRate: number;
}

/**
 * Sales funnel metrics
 */
export interface SalesFunnelMetrics {
  leads: number;
  qualified: number;
  proposals: number;
  bookings: number;
  conversionRates: {
    leadToQualified: number;
    qualifiedToProposal: number;
    proposalToBooking: number;
    overall: number;
  };
}

/**
 * Activity metrics
 */
export interface ActivityMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageTaskCompletionTime: number; // In hours
  totalEmails: number;
  totalSMS: number;
  totalCalls: number;
  totalNotes: number;
  activityByType: Array<{ type: string; count: number }>;
}

/**
 * Performance comparison
 */
export interface PerformanceComparison {
  currentPeriod: {
    revenue: number;
    clients: number;
    bookings: number;
  };
  previousPeriod: {
    revenue: number;
    clients: number;
    bookings: number;
  };
  changes: {
    revenue: number; // Percentage
    clients: number; // Percentage
    bookings: number; // Percentage
  };
}

/**
 * Report configuration
 */
export interface ReportConfig {
  name: string;
  description?: string;
  dateRange: DateRange;
  timePeriod: TimePeriod;
  segments?: string[];
  metrics: string[]; // Which metrics to include
  format: 'table' | 'chart' | 'both';
  chartType?: 'line' | 'bar' | 'pie' | 'area';
}

/**
 * Report data
 */
export interface ReportData {
  id: string;
  name: string;
  config: ReportConfig;
  data: {
    acquisition?: ClientAcquisitionMetrics;
    revenue?: RevenueMetrics;
    retention?: RetentionMetrics;
    engagement?: EngagementMetrics;
    segments?: SegmentPerformance[];
    services?: ServicePerformance[];
    funnel?: SalesFunnelMetrics;
    activity?: ActivityMetrics;
    comparison?: PerformanceComparison;
  };
  generatedAt: Date;
  generatedBy: string;
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

/**
 * Analytics query parameters
 */
export interface AnalyticsQuery {
  dateRange: DateRange;
  timePeriod?: TimePeriod;
  segmentIds?: string[];
  clientIds?: string[];
  serviceTypes?: string[];
  groupBy?: string[];
}

