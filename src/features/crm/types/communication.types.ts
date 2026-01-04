/**
 * Communication Types
 * 
 * Type definitions for CRM communication features (email, SMS, calls).
 */

/**
 * Communication types
 */
export type CommunicationType = 'email' | 'sms' | 'call' | 'message';

/**
 * Communication status
 */
export type CommunicationStatus = 'draft' | 'sent' | 'delivered' | 'failed' | 'read';

/**
 * Email template
 */
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[]; // Available variables like {{firstName}}, {{lastName}}, etc.
  category?: 'welcome' | 'follow_up' | 'promotional' | 'transactional' | 'custom';
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Email communication
 */
export interface EmailCommunication {
  id: string;
  clientId: string;
  templateId?: string;
  subject: string;
  body: string;
  to: string;
  from: string;
  status: CommunicationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  openedCount?: number;
  clickedCount?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

/**
 * SMS communication
 */
export interface SMSCommunication {
  id: string;
  clientId: string;
  to: string;
  from: string;
  message: string;
  status: CommunicationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
}

/**
 * Call log entry
 */
export interface CallLog {
  id: string;
  clientId: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration?: number; // Duration in seconds
  status: 'completed' | 'missed' | 'voicemail' | 'busy' | 'failed';
  notes?: string;
  recordingUrl?: string;
  startedAt: Date;
  endedAt?: Date;
  createdBy: string;
  createdAt: Date;
}

/**
 * Communication log (unified)
 */
export interface CommunicationLog {
  id: string;
  clientId: string;
  type: CommunicationType;
  direction: 'inbound' | 'outbound';
  subject?: string; // For emails
  content: string;
  status: CommunicationStatus;
  timestamp: Date;
  metadata?: {
    emailId?: string;
    smsId?: string;
    callLogId?: string;
    conversationId?: string;
    [key: string]: unknown;
  };
  createdBy: string;
}

/**
 * Email compose form values
 */
export interface EmailComposeValues {
  to: string;
  subject: string;
  body: string;
  templateId?: string;
  useTemplate?: boolean;
}

/**
 * SMS compose form values
 */
export interface SMSComposeValues {
  to: string;
  message: string;
}

/**
 * Call log form values
 */
export interface CallLogValues {
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration?: number;
  status: CallLog['status'];
  notes?: string;
  startedAt: Date;
  endedAt?: Date;
}

