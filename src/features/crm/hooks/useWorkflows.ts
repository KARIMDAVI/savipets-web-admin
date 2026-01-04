/**
 * useWorkflows Hook
 * 
 * Hook for managing workflow automation.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { workflowService } from '../services/workflow.service';
import { auditService } from '@/services/audit.service';
import { useAuth } from '@/contexts/AuthContext';
import { handleCRMError } from '../utils/errorHandler';
import type {
  WorkflowRule,
  WorkflowFormValues,
  WorkflowExecution,
} from '../types/workflows.types';

/**
 * Hook for workflow management
 */
export const useWorkflows = (enabledOnly: boolean = false) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch workflows
  const {
    data: workflows = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['crm-workflows', enabledOnly],
    queryFn: () => workflowService.getWorkflows(enabledOnly),
  });

  // Fetch workflow executions
  const {
    data: executions = [],
    isLoading: executionsLoading,
  } = useQuery({
    queryKey: ['crm-workflow-executions'],
    queryFn: () => workflowService.getExecutions(),
  });

  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (workflowData: WorkflowFormValues) => {
      if (!user) throw new Error('User not authenticated');

      const workflow = await workflowService.createWorkflow({
        ...workflowData,
        createdBy: user.id,
      });

      // Log audit trail
      if (user && workflow) {
        await auditService.logAction({
          action: 'create_workflow',
          resource: 'crm_workflow',
          resourceId: workflow.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            name: workflow.name,
            trigger: workflow.trigger,
          },
        });
      }

      return workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-workflows'] });
      message.success('Workflow created successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to create workflow');
    },
  });

  // Update workflow mutation
  const updateWorkflow = useMutation({
    mutationFn: async ({ workflowId, updates }: { workflowId: string; updates: Partial<WorkflowRule> }) => {
      if (!user) throw new Error('User not authenticated');

      await workflowService.updateWorkflow(workflowId, updates);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'update_workflow',
          resource: 'crm_workflow',
          resourceId: workflowId,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            updates: Object.keys(updates),
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-workflows'] });
      message.success('Workflow updated successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to update workflow');
    },
  });

  // Delete workflow mutation
  const deleteWorkflow = useMutation({
    mutationFn: async (workflowId: string) => {
      if (!user) throw new Error('User not authenticated');

      await workflowService.deleteWorkflow(workflowId);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'delete_workflow',
          resource: 'crm_workflow',
          resourceId: workflowId,
          userId: user.id,
          userEmail: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-workflows'] });
      message.success('Workflow deleted successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to delete workflow');
    },
  });

  // Toggle workflow mutation
  const toggleWorkflow = useMutation({
    mutationFn: async ({ workflowId, enabled }: { workflowId: string; enabled: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      await workflowService.toggleWorkflow(workflowId, enabled);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: enabled ? 'enable_workflow' : 'disable_workflow',
          resource: 'crm_workflow',
          resourceId: workflowId,
          userId: user.id,
          userEmail: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-workflows'] });
      message.success('Workflow status updated');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to update workflow status');
    },
  });

  return {
    workflows,
    executions,
    isLoading: isLoading || executionsLoading,
    refetch,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
  };
};

