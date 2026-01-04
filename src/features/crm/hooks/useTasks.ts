/**
 * useTasks Hook
 * 
 * Hook for managing tasks and activities.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { taskService } from '../services/task.service';
import { auditService } from '@/services/audit.service';
import { useAuth } from '@/contexts/AuthContext';
import { handleCRMError } from '../utils/errorHandler';
import type {
  Task,
  TaskFilters,
  TaskFormValues,
  TaskCommentFormValues,
} from '../types/tasks.types';

/**
 * Hook for task management
 */
export const useTasks = (filters?: TaskFilters) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['crm-tasks', filters],
    queryFn: () => taskService.getTasks(filters),
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (taskData: TaskFormValues) => {
      if (!user) throw new Error('User not authenticated');

      const task = await taskService.createTask({
        ...taskData,
        createdBy: user.id,
        createdByName: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email || 'Unknown',
        assignedTo: taskData.assignedTo?.map((userId) => ({
          userId,
          assignedAt: new Date(),
          assignedBy: user.id,
        })),
      });

      // Log audit trail
      if (user && task) {
        await auditService.logAction({
          action: 'create_task',
          resource: 'crm_task',
          resourceId: task.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            title: task.title,
            priority: task.priority,
            clientId: task.clientId,
          },
        });
      }

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      message.success('Task created successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to create task');
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      if (!user) throw new Error('User not authenticated');

      await taskService.updateTask(taskId, updates);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'update_task',
          resource: 'crm_task',
          resourceId: taskId,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            updates: Object.keys(updates),
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      message.success('Task updated successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to update task');
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('User not authenticated');

      await taskService.deleteTask(taskId);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'delete_task',
          resource: 'crm_task',
          resourceId: taskId,
          userId: user.id,
          userEmail: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      message.success('Task deleted successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to delete task');
    },
  });

  // Complete task mutation
  const completeTask = useMutation({
    mutationFn: async ({ taskId, completionPercentage }: { taskId: string; completionPercentage?: number }) => {
      if (!user) throw new Error('User not authenticated');

      await taskService.completeTask(taskId, completionPercentage);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'complete_task',
          resource: 'crm_task',
          resourceId: taskId,
          userId: user.id,
          userEmail: user.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      message.success('Task completed');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to complete task');
    },
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async ({ taskId, comment }: { taskId: string; comment: TaskCommentFormValues }) => {
      if (!user) throw new Error('User not authenticated');

      return taskService.addTaskComment(taskId, {
        taskId,
        ...comment,
        createdBy: user.id,
        createdByName: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email || 'Unknown',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      message.success('Comment added');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to add comment');
    },
  });

  // Assign task mutation
  const assignTask = useMutation({
    mutationFn: async ({ taskId, userIds }: { taskId: string; userIds: string[] }) => {
      if (!user) throw new Error('User not authenticated');

      await taskService.assignTask(taskId, userIds, user.id);

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'assign_task',
          resource: 'crm_task',
          resourceId: taskId,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            assignedTo: userIds,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      message.success('Task assigned successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to assign task');
    },
  });

  return {
    tasks,
    isLoading,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    addComment,
    assignTask,
  };
};

