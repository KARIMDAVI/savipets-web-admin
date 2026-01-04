/**
 * Notification Helper Utilities
 * 
 * Utility functions for notification management.
 */

import React from 'react';
import {
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

/**
 * Get icon component for notification type
 */
export const getTypeIcon = (type: string): React.ReactNode => {
  switch (type) {
    case 'push':
      return React.createElement(BellOutlined);
    case 'email':
      return React.createElement(MailOutlined);
    case 'sms':
      return React.createElement(PhoneOutlined);
    default:
      return React.createElement(NotificationOutlined);
  }
};

/**
 * Get color for notification type
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'email':
      return 'blue';
    case 'push':
      return 'green';
    case 'sms':
      return 'orange';
    default:
      return 'default';
  }
};

/**
 * Get color for notification category
 */
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'booking':
      return 'blue';
    case 'payment':
      return 'green';
    case 'system':
      return 'purple';
    case 'marketing':
      return 'orange';
    case 'security':
      return 'red';
    default:
      return 'default';
  }
};

/**
 * Get color for notification status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'sent':
    case 'delivered':
      return 'green';
    case 'opened':
    case 'clicked':
      return 'blue';
    case 'scheduled':
      return 'orange';
    case 'sending':
      return 'processing';
    case 'failed':
    case 'bounced':
      return 'red';
    case 'draft':
      return 'default';
    default:
      return 'default';
  }
};

