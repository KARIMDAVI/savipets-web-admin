/**
 * Other Workflow Actions
 * 
 * Actions for creating tasks and executing webhooks.
 */

import { taskService } from '../../services/task.service';
import type { TaskPriority } from '../../types/tasks.types';
import { replaceVariables } from './variableReplacer';

/**
 * Execute create task action
 */
export async function executeCreateTask(
  params: Record<string, unknown>,
  triggerData: Record<string, unknown>
): Promise<unknown> {
  const clientId = params.clientId as string || triggerData.clientId as string;
  const title = params.title as string;
  const description = params.description as string | undefined;
  const priorityString = (params.priority as string) || 'medium';
  const dueDate = params.dueDate as string | undefined;

  if (!clientId || !title) {
    throw new Error('Client ID and task title are required');
  }

  const validPriorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
  const priority: TaskPriority = validPriorities.includes(priorityString as TaskPriority)
    ? (priorityString as TaskPriority)
    : 'medium';

  const processedTitle = replaceVariables(title, triggerData);
  const processedDescription = description ? replaceVariables(description, triggerData) : undefined;

  return await taskService.createTask({
    title: processedTitle,
    description: processedDescription,
    type: 'follow_up',
    priority: priority,
    status: 'todo',
    clientId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    createdBy: 'system',
  });
}

/**
 * Execute webhook action
 */
export async function executeWebhook(
  params: Record<string, unknown>,
  triggerData: Record<string, unknown>
): Promise<unknown> {
  const url = params.url as string;
  const method = (params.method as string) || 'POST';
  const headers = (params.headers as Record<string, string>) || {};
  const body = params.body as Record<string, unknown> | undefined;

  if (!url) {
    throw new Error('Webhook URL is required');
  }

  const processedBody = body ? replaceVariables(JSON.stringify(body), triggerData) : undefined;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: processedBody ? JSON.stringify(JSON.parse(processedBody)) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.statusText}`);
  }

  return await response.json();
}


