/**
 * Workflow Engine
 * 
 * Engine for executing workflow automation rules.
 */

import { workflowService } from '../services/workflow.service';
import type {
  WorkflowRule,
  WorkflowActionConfig,
  WorkflowActionExecution,
} from '../types/workflows.types';
import { handleCRMError } from './errorHandler';
import { executeSendEmail, executeSendSMS } from './workflowActions/communicationActions';
import { executeCreateTask, executeWebhook } from './workflowActions/otherActions';
import {
  executeAssignSegment,
  executeAddTag,
  executeRemoveTag,
  executeCreateNote,
  executeUpdateField,
  executeAssignUser,
} from './workflowActions/crmActions';

/**
 * Execute workflow actions
 */
export async function executeWorkflowActions(
  workflow: WorkflowRule,
  triggerData: Record<string, unknown>
): Promise<WorkflowActionExecution[]> {
  const executions: WorkflowActionExecution[] = [];

  for (const actionConfig of workflow.actions) {
    const execution: WorkflowActionExecution = {
      actionType: actionConfig.type,
      actionConfig,
      status: 'pending',
    };

    try {
      execution.status = 'running';
      execution.executedAt = new Date();
      const startTime = Date.now();

      // Apply delay if configured
      if (actionConfig.delay !== undefined && actionConfig.delay > 0) {
        const delayMs = actionConfig.delay * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // Execute action based on type
      const result = await executeAction(actionConfig, triggerData);
      
      execution.status = 'completed';
      execution.result = result;
      execution.duration = Date.now() - startTime;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.duration = Date.now() - (execution.executedAt?.getTime() || Date.now());
      handleCRMError(error);
    }

    executions.push(execution);
  }

  return executions;
}

/**
 * Execute a single workflow action
 */
async function executeAction(
  actionConfig: WorkflowActionConfig,
  triggerData: Record<string, unknown>
): Promise<unknown> {
  const { type, params } = actionConfig;

  switch (type) {
    case 'send_email':
      return await executeSendEmail(params, triggerData);
    case 'send_sms':
      return await executeSendSMS(params, triggerData);
    case 'create_task':
      return await executeCreateTask(params, triggerData);
    case 'assign_segment':
      return await executeAssignSegment(params, triggerData);
    case 'add_tag':
      return await executeAddTag(params, triggerData);
    case 'remove_tag':
      return await executeRemoveTag(params, triggerData);
    case 'create_note':
      return await executeCreateNote(params, triggerData);
    case 'update_field':
      return await executeUpdateField(params, triggerData);
    case 'assign_user':
      return await executeAssignUser(params, triggerData);
    case 'webhook':
      return await executeWebhook(params, triggerData);
    case 'delay':
      // Delay is handled in executeWorkflowActions
      return Promise.resolve();
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

/**
 * Process workflow trigger
 */
export async function processWorkflowTrigger(
  trigger: WorkflowRule['trigger'],
  triggerData: Record<string, unknown>
): Promise<void> {
  try {
    // Get all workflows for this trigger
    const workflows = await workflowService.getWorkflowsByTrigger(trigger);

    for (const workflow of workflows) {
      // Evaluate conditions
      const conditionsMet = workflow.conditions
        ? workflowService.evaluateConditions(workflow.conditions, triggerData)
        : true;

      if (!conditionsMet) {
        // Log skipped execution
        await workflowService.logExecution({
          workflowId: workflow.id,
          workflowName: workflow.name,
          trigger,
          triggerData,
          conditionsMet: false,
          actionsExecuted: [],
          status: 'skipped',
        });
        continue;
      }

      // Log execution start
      const execution = await workflowService.logExecution({
        workflowId: workflow.id,
        workflowName: workflow.name,
        trigger,
        triggerData,
        conditionsMet: true,
        actionsExecuted: [],
        status: 'running',
      });

      if (!execution) continue;

      try {
        // Execute workflow actions
        const actionsExecuted = await executeWorkflowActions(workflow, triggerData);

        // Update execution with results
        await workflowService.updateExecution(execution.id, {
          actionsExecuted,
          status: 'completed',
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime(),
        });
      } catch (error) {
        // Update execution with error
        await workflowService.updateExecution(execution.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date(),
          duration: Date.now() - execution.startedAt.getTime(),
        });
      }
    }
  } catch (error) {
    handleCRMError(error);
    throw error;
  }
}

