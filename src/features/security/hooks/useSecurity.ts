/**
 * useSecurity Hook
 * 
 * Hook for fetching and managing security data (devices, sessions, settings).
 */

import { useState, useEffect } from 'react';
import type { SecurityDevice, SessionInfo, SecuritySettings } from '../types/security.types';

export const useSecurity = () => {
  const [devices, setDevices] = useState<SecurityDevice[]>([]);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    requireReauthForSensitive: true,
    maxConcurrentSessions: 3,
    allowRememberDevice: true,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize mock data
    // TODO: Replace with actual API calls
    const mockDevices: SecurityDevice[] = [
      {
        id: 'device1',
        name: 'iPhone 14 Pro',
        type: 'passkey',
        platform: 'mobile',
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date('2024-01-20'),
        isActive: true,
        isDefault: true,
      },
      {
        id: 'device2',
        name: 'MacBook Pro',
        type: 'totp',
        platform: 'desktop',
        createdAt: new Date('2024-01-10'),
        lastUsed: new Date('2024-01-19'),
        isActive: true,
        isDefault: false,
      },
    ];

    const mockSessions: SessionInfo[] = [
      {
        id: 'session1',
        device: 'Chrome on MacBook Pro',
        platform: 'macOS',
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date('2024-01-20T10:00:00'),
        lastActivity: new Date('2024-01-20T15:30:00'),
        isCurrent: true,
      },
      {
        id: 'session2',
        device: 'Safari on iPhone',
        platform: 'iOS',
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        createdAt: new Date('2024-01-19T14:00:00'),
        lastActivity: new Date('2024-01-19T18:45:00'),
        isCurrent: false,
      },
    ];

    setDevices(mockDevices);
    setSessions(mockSessions);
  }, []);

  return {
    devices,
    sessions,
    settings,
    isLoading,
    setDevices,
    setSessions,
    setSettings,
    setIsLoading,
  };
};

