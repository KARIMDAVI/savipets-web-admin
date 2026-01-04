/**
 * Workflow Types
 * 
 * Type definitions for CRM workflow automation.
 */

/**
 * Workflow trigger types
 */
export type WorkflowTrigger =
  | 'client_created'
  | 'client_updated'
  | 'booking_created'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'note_added'
  | 'task_completed'
  | 'email_sent'
  | 'call_logged'
  | 'segment_assigned'
  | 'tag_added'
  | 'custom_field_changed'
  | 'schedule_based'; // Time-based triggers

/**
 * Workflow condition operators
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in';

/**
 * Workflow condition
 */
export interface WorkflowCondition {
  field: string; // Field path (e.g., 'client.segment', 'booking.status')
  operator: ConditionOperator;
  value: unknown; // Can be string, number, boolean, array, etc.
}

/**
 * Workflow action types
 */
export type WorkflowAction =
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'assign_segment'
  | 'add_tag'
  | 'remove_tag'
  | 'create_note'
  | 'update_field'
  | 'assign_user'
  | 'webhook'
  | 'delay';

/**
 * Workflow action configuration
 */
export interface WorkflowActionConfig {
  type: WorkflowAction;
  params: Record<string, unknown>; // Action-specific parameters
  delay?: number; // Delay in seconds before executing action
}

/**
 * Workflow rule
 */
export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  triggerConfig?: Record<string, unknown>; // Trigger-specific config
  conditions?: WorkflowCondition[]; // All conditions must be met (AND logic)
  actions: WorkflowActionConfig[];
  enabled: boolean;
  priority: number; // Higher priority runs first
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Workflow execution log
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: WorkflowTrigger;
  triggerData: Record<string, unknown>; // Data that triggered the workflow
  conditionsMet: boolean;
  actionsExecuted: WorkflowActionExecution[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // Duration in milliseconds
}

/**
 * Workflow action execution
 */
export interface WorkflowActionExecution {
  actionType: WorkflowAction;
  actionConfig: WorkflowActionConfig;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: unknown;
  error?: string;
  executedAt?: Date;
  duration?: number;
}

/**
 * Workflow template
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'welcome' | 'follow_up' | 'retention' | 'upsell' | 'custom';
  trigger: WorkflowTrigger;
  conditions?: WorkflowCondition[];
  actions: WorkflowActionConfig[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

/**
 * Workflow form values
 */
export interface WorkflowFormValues {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  triggerConfig?: Record<string, unknown>;
  conditions?: WorkflowCondition[];
  actions: WorkflowActionConfig[];
  enabled: boolean;
  priority: number;
}

/**
 * Workflow condition form values
 */
export interface WorkflowConditionFormValues {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

/**
 * Workflow statistics
 */
export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  executionsByTrigger: Record<WorkflowTrigger, number>;
  executionsByAction: Record<WorkflowAction, number>;
}

