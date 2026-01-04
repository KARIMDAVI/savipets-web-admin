/**
 * Audit & Compliance Helper Utilities
 * 
 * Utility functions for audit and compliance management.
 */

import React from 'react';
import {
  LockOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

/**
 * Get color for severity level
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'default';
  }
};

/**
 * Get icon component for category
 */
export const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'auth':
      return React.createElement(LockOutlined);
    case 'data_access':
      return React.createElement(EyeOutlined);
    case 'data_modification':
      return React.createElement(EditOutlined);
    case 'system':
      return React.createElement(SettingOutlined);
    case 'security':
      return React.createElement(SafetyCertificateOutlined);
    default:
      return React.createElement(FileTextOutlined);
  }
};

/**
 * Get color for compliance status
 */
export const getComplianceStatusColor = (status: string): string => {
  switch (status) {
    case 'compliant':
      return 'green';
    case 'non_compliant':
      return 'red';
    case 'pending':
      return 'orange';
    case 'exempt':
      return 'blue';
    default:
      return 'default';
  }
};

