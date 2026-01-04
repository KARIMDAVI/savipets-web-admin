/**
 * CRM Permissions Utilities
 * 
 * Enhanced Role-based access control (RBAC) for CRM module.
 * Following best practices for granular permission management.
 */

import type { User } from '@/types';
import type {
  CRMPermission,
  UserRole,
  RolePermissions,
  PermissionCheck,
  ResourceContext,
} from '../types/permissions.types';

/**
 * Role-based permission definitions
 */
const ROLE_PERMISSIONS: Record<UserRole, CRMPermission[]> = {
  admin: [
    // Full access to all CRM features
    'crm:view',
    'crm:clients:view',
    'crm:clients:create',
    'crm:clients:edit',
    'crm:clients:delete',
    'crm:clients:export',
    'crm:clients:import',
    'crm:notes:view',
    'crm:notes:create',
    'crm:notes:edit',
    'crm:notes:delete',
    'crm:segments:view',
    'crm:segments:create',
    'crm:segments:edit',
    'crm:segments:delete',
    'crm:tags:view',
    'crm:tags:create',
    'crm:tags:edit',
    'crm:tags:delete',
    'crm:tasks:view',
    'crm:tasks:create',
    'crm:tasks:edit',
    'crm:tasks:delete',
    'crm:tasks:assign',
    'crm:workflows:view',
    'crm:workflows:create',
    'crm:workflows:edit',
    'crm:workflows:delete',
    'crm:workflows:execute',
    'crm:analytics:view',
    'crm:analytics:export',
    'crm:communications:view',
    'crm:communications:send_email',
    'crm:communications:send_sms',
    'crm:communications:log_call',
    'crm:audit:view',
  ],
  manager: [
    // Management-level access
    'crm:view',
    'crm:clients:view',
    'crm:clients:edit',
    'crm:clients:export',
    'crm:notes:view',
    'crm:notes:create',
    'crm:notes:edit',
    'crm:notes:delete',
    'crm:segments:view',
    'crm:tags:view',
    'crm:tags:create',
    'crm:tags:edit',
    'crm:tasks:view',
    'crm:tasks:create',
    'crm:tasks:edit',
    'crm:tasks:assign',
    'crm:workflows:view',
    'crm:workflows:execute',
    'crm:analytics:view',
    'crm:communications:view',
    'crm:communications:send_email',
    'crm:communications:send_sms',
    'crm:communications:log_call',
  ],
  agent: [
    // Agent-level access (limited)
    'crm:view',
    'crm:clients:view',
    'crm:notes:view',
    'crm:notes:create',
    'crm:notes:edit',
    'crm:tasks:view',
    'crm:tasks:create',
    'crm:tasks:edit',
    'crm:communications:view',
    'crm:communications:send_email',
    'crm:communications:log_call',
  ],
  viewer: [
    // Read-only access
    'crm:view',
    'crm:clients:view',
    'crm:notes:view',
    'crm:analytics:view',
  ],
};

/**
 * Get user role (normalized)
 */
const getUserRole = (user: User | null): UserRole => {
  if (!user) return 'viewer';
  const role = user.role?.toLowerCase();
  
  // Map common role variations
  if (role === 'admin' || role === 'administrator') return 'admin';
  if (role === 'manager' || role === 'management') return 'manager';
  if (role === 'agent' || role === 'sitter') return 'agent';
  
  // Default to viewer for unknown roles
  return 'viewer';
};

/**
 * Get permissions for a role
 */
export const getRolePermissions = (role: UserRole): CRMPermission[] => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: CRMPermission
): boolean => {
  if (!user) return false;
  const role = getUserRole(user);
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
};

/**
 * Check permission with context (for resource ownership)
 */
export const checkPermission = (
  user: User | null,
  permission: CRMPermission,
  context?: ResourceContext
): PermissionCheck => {
  if (!user) {
    return { allowed: false, reason: 'User not authenticated' };
  }

  const role = getUserRole(user);
  
  // Admins have all permissions
  if (role === 'admin') {
    return { allowed: true };
  }

  const permissions = getRolePermissions(role);
  
  // Check if role has the permission
  if (!permissions.includes(permission)) {
    return { allowed: false, reason: `Role '${role}' does not have permission '${permission}'` };
  }

  // Check resource ownership for edit/delete operations
  if (context) {
    const isOwner = context.createdBy === user.id;
    const isAssigned = context.assignedTo?.includes(user.id);
    
    // For edit/delete operations, check ownership
    // Note: Admin check already happened above, but TypeScript doesn't narrow the type here
    if (
      (permission.includes(':edit') || permission.includes(':delete')) &&
      !isOwner &&
      (role as string) !== 'admin'
    ) {
      // Some roles can edit their own resources
      if (permission.includes(':notes:') && isOwner) {
        return { allowed: true };
      }
      if (permission.includes(':tasks:') && (isOwner || isAssigned)) {
        return { allowed: true };
      }
      
      return { allowed: false, reason: 'User does not own this resource' };
    }
  }

  return { allowed: true };
};

/**
 * Check if user can view CRM module
 */
export const canViewCRM = (user: User | null): boolean => {
  return hasPermission(user, 'crm:view');
};

/**
 * Check if user can create notes
 */
export const canCreateNote = (user: User | null): boolean => {
  return hasPermission(user, 'crm:notes:create');
};

/**
 * Check if user can edit a note
 */
export const canEditNote = (user: User | null, noteCreatedBy: string): boolean => {
  const check = checkPermission(user, 'crm:notes:edit', {
    resourceId: '',
    createdBy: noteCreatedBy,
  });
  return check.allowed;
};

/**
 * Check if user can delete a note
 */
export const canDeleteNote = (user: User | null, noteCreatedBy: string): boolean => {
  const check = checkPermission(user, 'crm:notes:delete', {
    resourceId: '',
    createdBy: noteCreatedBy,
  });
  return check.allowed;
};

/**
 * Check if user can create segments
 */
export const canCreateSegment = (user: User | null): boolean => {
  return hasPermission(user, 'crm:segments:create');
};

/**
 * Check if user can edit segments
 */
export const canEditSegment = (user: User | null): boolean => {
  return hasPermission(user, 'crm:segments:edit');
};

/**
 * Check if user can delete segments
 */
export const canDeleteSegment = (user: User | null): boolean => {
  return hasPermission(user, 'crm:segments:delete');
};

/**
 * Check if user can create tags
 */
export const canCreateTag = (user: User | null): boolean => {
  return hasPermission(user, 'crm:tags:create');
};

/**
 * Check if user can edit tags
 */
export const canEditTag = (user: User | null): boolean => {
  return hasPermission(user, 'crm:tags:edit');
};

/**
 * Check if user can delete tags
 */
export const canDeleteTag = (user: User | null): boolean => {
  return hasPermission(user, 'crm:tags:delete');
};

/**
 * Check if user can create tasks
 */
export const canCreateTask = (user: User | null): boolean => {
  return hasPermission(user, 'crm:tasks:create');
};

/**
 * Check if user can assign tasks
 */
export const canAssignTask = (user: User | null): boolean => {
  return hasPermission(user, 'crm:tasks:assign');
};

/**
 * Check if user can create workflows
 */
export const canCreateWorkflow = (user: User | null): boolean => {
  return hasPermission(user, 'crm:workflows:create');
};

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = (user: User | null): boolean => {
  return hasPermission(user, 'crm:analytics:view');
};

/**
 * Check if user can export data
 */
export const canExportData = (user: User | null): boolean => {
  return hasPermission(user, 'crm:clients:export') || hasPermission(user, 'crm:analytics:export');
};

/**
 * Check if user can import data
 */
export const canImportData = (user: User | null): boolean => {
  return hasPermission(user, 'crm:clients:import');
};

/**
 * Check if user can send communications
 */
export const canSendEmail = (user: User | null): boolean => {
  return hasPermission(user, 'crm:communications:send_email');
};

export const canSendSMS = (user: User | null): boolean => {
  return hasPermission(user, 'crm:communications:send_sms');
};

export const canLogCall = (user: User | null): boolean => {
  return hasPermission(user, 'crm:communications:log_call');
};

