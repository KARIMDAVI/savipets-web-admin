/**
 * Security Helper Utilities
 * 
 * Utility functions for security calculations and formatting.
 */

import React from 'react';
import {
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import type { SecurityDevice } from '../types/security.types';

/**
 * Get device type color
 */
export const getDeviceTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    passkey: 'green',
    totp: 'blue',
    sms: 'orange',
  };
  return colors[type] || 'default';
};

/**
 * Get device icon
 */
export const getDeviceIcon = (platform: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    mobile: React.createElement(MobileOutlined),
    desktop: React.createElement(DesktopOutlined),
    tablet: React.createElement(TabletOutlined),
  };
  return icons[platform] || React.createElement(DesktopOutlined);
};

/**
 * Calculate security statistics
 */
export const calculateSecurityStats = (
  devices: SecurityDevice[],
  sessions: Array<{ isCurrent: boolean; createdAt: Date }>
) => {
  return {
    totalDevices: devices.length,
    activeDevices: devices.filter(d => d.isActive).length,
    activeSessions: sessions.filter(s => s.isCurrent).length,
    totalSessions: sessions.length,
  };
};

