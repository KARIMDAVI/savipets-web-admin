/**
 * useReports Hook
 * 
 * Hook for fetching and managing report templates and data.
 */

import { useState } from 'react';
import type { ReportTemplate, ReportData, ReportSchedule } from '../types/reports.types';

export const useReports = () => {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ReportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize mock templates
  // TODO: Replace with actual API calls
  const initializeTemplates = () => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: 'revenue-monthly',
        name: 'Monthly Revenue Report',
        description: 'Comprehensive monthly revenue analysis with trends',
        category: 'revenue',
        fields: [
          { id: 'date', name: 'Date', type: 'date', source: 'booking.scheduledDate' },
          { id: 'revenue', name: 'Revenue', type: 'currency', source: 'booking.price', aggregation: 'sum' },
          { id: 'bookings', name: 'Bookings', type: 'number', source: 'booking.id', aggregation: 'count' },
          { id: 'avgValue', name: 'Avg Value', type: 'currency', source: 'booking.price', aggregation: 'avg' },
        ],
        filters: [
          { id: 'dateRange', field: 'scheduledDate', operator: 'between', value: null, label: 'Date Range' },
          { id: 'status', field: 'status', operator: 'equals', value: 'completed', label: 'Status' },
        ],
        isPublic: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'sitter-performance',
        name: 'Sitter Performance Report',
        description: 'Detailed analysis of sitter performance metrics',
        category: 'sitters',
        fields: [
          { id: 'sitterName', name: 'Sitter Name', type: 'text', source: 'sitter.firstName' },
          { id: 'totalBookings', name: 'Total Bookings', type: 'number', source: 'booking.id', aggregation: 'count' },
          { id: 'totalRevenue', name: 'Total Revenue', type: 'currency', source: 'booking.price', aggregation: 'sum' },
          { id: 'avgRating', name: 'Avg Rating', type: 'number', source: 'sitter.rating', aggregation: 'avg' },
          { id: 'completionRate', name: 'Completion Rate', type: 'percentage', source: 'booking.status' },
        ],
        filters: [],
        isPublic: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'client-analysis',
        name: 'Client Analysis Report',
        description: 'Client behavior and spending patterns',
        category: 'clients',
        fields: [
          { id: 'clientName', name: 'Client Name', type: 'text', source: 'client.firstName' },
          { id: 'totalBookings', name: 'Total Bookings', type: 'number', source: 'booking.id', aggregation: 'count' },
          { id: 'totalSpent', name: 'Total Spent', type: 'currency', source: 'booking.price', aggregation: 'sum' },
          { id: 'lastBooking', name: 'Last Booking', type: 'date', source: 'booking.scheduledDate' },
          { id: 'favoriteService', name: 'Favorite Service', type: 'text', source: 'booking.serviceType' },
        ],
        filters: [],
        isPublic: false,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-12'),
      },
    ];

    setReportTemplates(mockTemplates);
  };

  return {
    reportTemplates,
    reportData,
    scheduledReports,
    isLoading,
    setReportTemplates,
    setReportData,
    setScheduledReports,
    setIsLoading,
    initializeTemplates,
  };
};

