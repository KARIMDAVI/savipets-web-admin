/**
 * Notifications Feature Types
 * 
 * Type definitions for notification management.
 * Extracted from Notifications.tsx for better organization.
 */

/**
 * Notification template configuration
 */
export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'push' | 'email' | 'sms';
  category: 'booking' | 'payment' | 'system' | 'marketing' | 'security';
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification campaign configuration
 */
export interface NotificationCampaign {
  id: string;
  name: string;
  templateId: string;
  targetAudience: 'all' | 'pet_owners' | 'pet_sitters' | 'custom';
  targetUsers?: string[];
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: Date;
}

/**
 * User notification preferences
 */
export interface NotificationPreference {
  userId: string;
  userName: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  categories: {
    booking: boolean;
    payment: boolean;
    system: boolean;
    marketing: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

/**
 * Notification delivery log entry
 */
export interface NotificationLog {
  id: string;
  userId: string;
  userName: string;
  type: 'push' | 'email' | 'sms';
  templateId: string;
  templateName: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  deviceInfo?: string;
}

