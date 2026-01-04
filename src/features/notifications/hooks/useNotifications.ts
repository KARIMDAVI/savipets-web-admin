/**
 * useNotifications Hook
 * 
 * Hook for fetching notification data (templates, campaigns, preferences, logs).
 */

import { useState, useEffect } from 'react';
import type {
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  NotificationLog,
} from '../types/notifications.types';

export const useNotifications = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize mock notification data
    // TODO: Replace with actual API calls
    const mockTemplates: NotificationTemplate[] = [
      {
        id: 'template1',
        name: 'Booking Confirmation',
        type: 'email',
        category: 'booking',
        subject: 'Your booking has been confirmed',
        content: 'Hi {{userName}}, your {{serviceType}} booking for {{petName}} on {{date}} has been confirmed. Your sitter {{sitterName}} will arrive at {{time}}.',
        variables: ['userName', 'serviceType', 'petName', 'date', 'sitterName', 'time'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'template2',
        name: 'Payment Reminder',
        type: 'push',
        category: 'payment',
        content: 'Payment reminder: Your booking payment of ${{amount}} is due tomorrow.',
        variables: ['amount'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'template3',
        name: 'Sitter Arrived',
        type: 'sms',
        category: 'booking',
        content: 'Your sitter {{sitterName}} has arrived for your {{serviceType}} appointment.',
        variables: ['sitterName', 'serviceType'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-12'),
      },
    ];

    const mockCampaigns: NotificationCampaign[] = [
      {
        id: 'campaign1',
        name: 'Welcome New Users',
        templateId: 'template1',
        targetAudience: 'pet_owners',
        status: 'sent',
        sentCount: 150,
        deliveredCount: 145,
        openedCount: 120,
        clickedCount: 45,
        createdAt: new Date('2024-01-18'),
      },
      {
        id: 'campaign2',
        name: 'Payment Reminder Campaign',
        templateId: 'template2',
        targetAudience: 'custom',
        targetUsers: ['user1', 'user2', 'user3'],
        status: 'scheduled',
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        scheduledAt: new Date('2024-01-25'),
        createdAt: new Date('2024-01-20'),
      },
    ];

    const mockPreferences: NotificationPreference[] = [
      {
        userId: 'user1',
        userName: 'John Doe',
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        categories: {
          booking: true,
          payment: true,
          system: false,
          marketing: false,
          security: true,
        },
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        },
        frequency: 'immediate',
      },
    ];

    const mockLogs: NotificationLog[] = [
      {
        id: 'log1',
        userId: 'user1',
        userName: 'John Doe',
        type: 'email',
        templateId: 'template1',
        templateName: 'Booking Confirmation',
        status: 'opened',
        sentAt: new Date('2024-01-20T10:00:00'),
        deliveredAt: new Date('2024-01-20T10:01:00'),
        openedAt: new Date('2024-01-20T10:15:00'),
        deviceInfo: 'iPhone 14 Pro',
      },
    ];

    setTemplates(mockTemplates);
    setCampaigns(mockCampaigns);
    setPreferences(mockPreferences);
    setNotificationLogs(mockLogs);
  }, []);

  const refetch = () => {
    setIsLoading(true);
    // TODO: Implement actual refetch logic
    setTimeout(() => setIsLoading(false), 500);
  };

  return {
    templates,
    campaigns,
    preferences,
    notificationLogs,
    isLoading,
    refetch,
    setTemplates,
    setCampaigns,
    setPreferences,
    setNotificationLogs,
  };
};

