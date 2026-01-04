/**
 * useCRMPermissions Hook
 * 
 * Hook for checking CRM permissions in components.
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  hasPermission,
  checkPermission,
  canViewCRM,
  canCreateNote,
  canEditNote,
  canDeleteNote,
  canCreateSegment,
  canEditSegment,
  canDeleteSegment,
  canCreateTag,
  canEditTag,
  canDeleteTag,
  canCreateTask,
  canAssignTask,
  canCreateWorkflow,
  canViewAnalytics,
  canExportData,
  canImportData,
  canSendEmail,
  canSendSMS,
  canLogCall,
} from '../utils/crmPermissions';
import type { CRMPermission, ResourceContext } from '../types/permissions.types';

/**
 * Hook for CRM permissions
 */
export const useCRMPermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(
    () => ({
      // General
      canViewCRM: canViewCRM(user),
      
      // Notes
      canCreateNote: canCreateNote(user),
      canEditNote: (noteCreatedBy: string) => canEditNote(user, noteCreatedBy),
      canDeleteNote: (noteCreatedBy: string) => canDeleteNote(user, noteCreatedBy),
      
      // Segments
      canCreateSegment: canCreateSegment(user),
      canEditSegment: canEditSegment(user),
      canDeleteSegment: canDeleteSegment(user),
      
      // Tags
      canCreateTag: canCreateTag(user),
      canEditTag: canEditTag(user),
      canDeleteTag: canDeleteTag(user),
      
      // Tasks
      canCreateTask: canCreateTask(user),
      canAssignTask: canAssignTask(user),
      
      // Workflows
      canCreateWorkflow: canCreateWorkflow(user),
      
      // Analytics
      canViewAnalytics: canViewAnalytics(user),
      
      // Data operations
      canExportData: canExportData(user),
      canImportData: canImportData(user),
      
      // Communications
      canSendEmail: canSendEmail(user),
      canSendSMS: canSendSMS(user),
      canLogCall: canLogCall(user),
      
      // Generic permission check
      hasPermission: (permission: CRMPermission) => hasPermission(user, permission),
      checkPermission: (permission: CRMPermission, context?: ResourceContext) =>
        checkPermission(user, permission, context),
    }),
    [user]
  );

  return permissions;
};

