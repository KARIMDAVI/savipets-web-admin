/**
 * Reports Helper Utilities
 * 
 * Utility functions for report calculations and formatting.
 */

import {
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import React from 'react';
import type { ReportTemplate } from '../types/reports.types';

/**
 * Get category color
 */
export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    revenue: '#52c41a',
    bookings: '#1890ff',
    sitters: '#722ed1',
    clients: '#faad14',
    custom: '#f5222d',
  };
  return colors[category] || '#d9d9d9';
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    revenue: React.createElement(DollarOutlined),
    bookings: React.createElement(CalendarOutlined),
    sitters: React.createElement(UserOutlined),
    clients: React.createElement(UserOutlined),
    custom: React.createElement(BarChartOutlined),
  };
  return icons[category] || React.createElement(FileTextOutlined);
};

/**
 * Calculate report statistics
 */
export const calculateReportStats = (templates: ReportTemplate[], lastGenerated: Date) => {
  return {
    totalTemplates: templates.length,
    publicTemplates: templates.filter(t => t.isPublic).length,
    scheduledReports: templates.filter(t => t.schedule?.isActive).length,
    totalExports: 0, // Would be tracked in real implementation
    lastGenerated,
  };
};

