/**
 * Workflow and Reminder Types
 * 
 * Type definitions for automated workflows and reminders in the CRM system.
 */

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

export type WorkflowTrigger =
  | { type: 'days_since_last_booking'; days: number }
  | { type: 'segment_assignment'; segmentName: string }
  | { type: 'churn_risk_high' }
  | { type: 'no_bookings_days'; days: number }
  | { type: 'first_booking_created' }
  | { type: 'note_added'; noteType?: string };

export type WorkflowAction =
  | { type: 'create_note'; noteType: string; content: string; priority: 'low' | 'medium' | 'high' }
  | { type: 'assign_tag'; tagId: string }
  | { type: 'assign_segment'; segmentId: string }
  | { type: 'send_email'; templateId: string; subject: string }
  | { type: 'create_reminder'; reminderType: string; days: number; message: string };

export interface Reminder {
  id: string;
  clientId: string;
  workflowId?: string;
  type: ReminderType;
  message: string;
  dueDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  createdAt: Date;
  createdBy: string;
}

export type ReminderType =
  | 'follow_up'
  | 'booking_follow_up'
  | 'payment_reminder'
  | 'feedback_request'
  | 're_engagement'
  | 'custom';












