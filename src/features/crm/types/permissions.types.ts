/**
 * Permissions Types
 * 
 * Type definitions for CRM permissions and RBAC.
 */

/**
 * CRM permission actions
 */
export type CRMPermission =
  | 'crm:view'
  | 'crm:clients:view'
  | 'crm:clients:create'
  | 'crm:clients:edit'
  | 'crm:clients:delete'
  | 'crm:clients:export'
  | 'crm:clients:import'
  | 'crm:notes:view'
  | 'crm:notes:create'
  | 'crm:notes:edit'
  | 'crm:notes:delete'
  | 'crm:segments:view'
  | 'crm:segments:create'
  | 'crm:segments:edit'
  | 'crm:segments:delete'
  | 'crm:tags:view'
  | 'crm:tags:create'
  | 'crm:tags:edit'
  | 'crm:tags:delete'
  | 'crm:tasks:view'
  | 'crm:tasks:create'
  | 'crm:tasks:edit'
  | 'crm:tasks:delete'
  | 'crm:tasks:assign'
  | 'crm:workflows:view'
  | 'crm:workflows:create'
  | 'crm:workflows:edit'
  | 'crm:workflows:delete'
  | 'crm:workflows:execute'
  | 'crm:analytics:view'
  | 'crm:analytics:export'
  | 'crm:communications:view'
  | 'crm:communications:send_email'
  | 'crm:communications:send_sms'
  | 'crm:communications:log_call'
  | 'crm:audit:view';

/**
 * User role
 */
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

/**
 * Permission set for a role
 */
export interface RolePermissions {
  role: UserRole;
  permissions: CRMPermission[];
}

/**
 * Permission check result
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Resource ownership context
 */
export interface ResourceContext {
  resourceId: string;
  createdBy?: string;
  assignedTo?: string[];
  clientId?: string;
}

