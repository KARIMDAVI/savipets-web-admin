/**
 * Reports Feature Types
 * 
 * Type definitions for report generation and templates.
 * Extracted from Reports.tsx for better organization.
 */

/**
 * Report template
 */
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'bookings' | 'sitters' | 'clients' | 'custom';
  fields: ReportField[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Report field
 */
export interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  source: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: string;
}

/**
 * Report filter
 */
export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'between' | 'greater_than' | 'less_than';
  value: any;
  label: string;
}

/**
 * Report schedule
 */
export interface ReportSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  recipients: string[];
  format: 'pdf' | 'csv' | 'excel';
  isActive: boolean;
}

/**
 * Report data
 */
export interface ReportData {
  headers: string[];
  rows: any[][];
  summary: {
    totalRows: number;
    totalRevenue: number;
    averageBookingValue: number;
    topSitter: string;
    topService: string;
  };
}

