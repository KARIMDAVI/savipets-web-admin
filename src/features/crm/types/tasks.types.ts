/**
 * Task Types
 * 
 * Type definitions for CRM task and activity management.
 */

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task status
 */
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

/**
 * Task type/category
 */
export type TaskType =
  | 'follow_up'
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'booking'
  | 'custom';

/**
 * Task recurrence pattern
 */
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Task recurrence configuration
 */
export interface TaskRecurrence {
  pattern: RecurrencePattern;
  interval?: number; // For custom patterns
  daysOfWeek?: number[]; // 0-6, Sunday-Saturday
  dayOfMonth?: number; // 1-31
  endDate?: Date;
  occurrences?: number; // Max number of occurrences
}

/**
 * Task reminder configuration
 */
export interface TaskReminder {
  id: string;
  taskId: string;
  reminderTime: Date;
  sent: boolean;
  sentAt?: Date;
  reminderType: 'email' | 'sms' | 'push' | 'in_app';
}

/**
 * Task assignment
 */
export interface TaskAssignment {
  userId: string;
  userName?: string;
  userEmail?: string;
  assignedAt: Date;
  assignedBy: string;
}

/**
 * Task comment/update
 */
export interface TaskComment {
  id: string;
  taskId: string;
  content: string;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Task attachment
 */
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

/**
 * Task model
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  clientId?: string; // Optional - tasks can be client-specific or general
  relatedEntityId?: string; // ID of related booking, note, etc.
  relatedEntityType?: 'booking' | 'note' | 'email' | 'call' | 'sms';
  
  // Assignment
  assignedTo?: TaskAssignment[];
  createdBy: string;
  createdByName?: string;
  
  // Dates
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  
  // Recurrence
  recurrence?: TaskRecurrence;
  parentTaskId?: string; // For recurring task series
  isRecurringInstance?: boolean;
  
  // Metadata
  tags?: string[];
  estimatedDuration?: number; // In minutes
  actualDuration?: number; // In minutes
  completionPercentage?: number; // 0-100
  
  // Related data
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  reminders?: TaskReminder[];
  
  // Custom fields
  customFields?: Record<string, unknown>;
}

/**
 * Task filter options
 */
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  assignedTo?: string[];
  clientId?: string;
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchTerm?: string;
}

/**
 * Task form values
 */
export interface TaskFormValues {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  clientId?: string;
  assignedTo?: string[];
  dueDate?: Date;
  startDate?: Date;
  tags?: string[];
  estimatedDuration?: number;
  recurrence?: TaskRecurrence;
}

/**
 * Task comment form values
 */
export interface TaskCommentFormValues {
  content: string;
}

/**
 * Task statistics
 */
export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  highPriority: number;
  byType: Record<TaskType, number>;
  byPriority: Record<TaskPriority, number>;
}

