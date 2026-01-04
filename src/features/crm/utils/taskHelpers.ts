/**
 * Task Helper Utilities
 * 
 * Utility functions for task calculations and filtering.
 */

import type { Task, TaskStats, TaskFilters } from '../types/tasks.types';

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }
  return new Date(task.dueDate) < new Date();
};

/**
 * Check if task is due today
 */
export const isTaskDueToday = (task: Task): boolean => {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate.getTime() === today.getTime();
};

/**
 * Check if task is due this week
 */
export const isTaskDueThisWeek = (task: Task): boolean => {
  if (!task.dueDate) return false;
  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  const dueDate = new Date(task.dueDate);
  return dueDate >= today && dueDate <= weekFromNow;
};

/**
 * Get task urgency score (0-100)
 */
export const getTaskUrgencyScore = (task: Task): number => {
  let score = 0;

  // Priority weight
  switch (task.priority) {
    case 'urgent':
      score += 40;
      break;
    case 'high':
      score += 30;
      break;
    case 'medium':
      score += 20;
      break;
    case 'low':
      score += 10;
      break;
  }

  // Due date weight
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      score += 40; // Overdue
    } else if (daysUntilDue === 0) {
      score += 30; // Due today
    } else if (daysUntilDue <= 3) {
      score += 20; // Due in 3 days
    } else if (daysUntilDue <= 7) {
      score += 10; // Due this week
    }
  }

  // Status weight
  if (task.status === 'in_progress') {
    score += 10;
  }

  return Math.min(100, score);
};

/**
 * Filter tasks based on filter criteria
 */
export const filterTasks = (tasks: Task[], filters: TaskFilters): Task[] => {
  return tasks.filter((task) => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(task.type)) return false;
    }

    // Assigned to filter
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      const assignedUserIds = task.assignedTo?.map((a) => a.userId) || [];
      if (!filters.assignedTo.some((userId) => assignedUserIds.includes(userId))) {
        return false;
      }
    }

    // Client filter
    if (filters.clientId && task.clientId !== filters.clientId) {
      return false;
    }

    // Due date range filter
    if (filters.dueDateRange && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (
        dueDate < filters.dueDateRange.start ||
        dueDate > filters.dueDateRange.end
      ) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const taskTags = task.tags || [];
      if (!filters.tags.some((tag) => taskTags.includes(tag))) {
        return false;
      }
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDescription) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Calculate task statistics
 */
export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const stats: TaskStats = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    dueThisWeek: 0,
    highPriority: 0,
    byType: {
      follow_up: 0,
      call: 0,
      email: 0,
      meeting: 0,
      note: 0,
      booking: 0,
      custom: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
  };

  tasks.forEach((task) => {
    // Status counts
    switch (task.status) {
      case 'todo':
        stats.todo++;
        break;
      case 'in_progress':
        stats.inProgress++;
        break;
      case 'completed':
        stats.completed++;
        break;
    }

    // Overdue and due date counts
    if (isTaskOverdue(task)) {
      stats.overdue++;
    }
    if (isTaskDueToday(task)) {
      stats.dueToday++;
    }
    if (isTaskDueThisWeek(task)) {
      stats.dueThisWeek++;
    }

    // Priority counts
    if (task.priority === 'high' || task.priority === 'urgent') {
      stats.highPriority++;
    }
    stats.byPriority[task.priority]++;

    // Type counts
    stats.byType[task.type]++;
  });

  return stats;
};

/**
 * Sort tasks by priority and due date
 */
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  const priorityOrder: Record<Task['priority'], number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by due date (overdue first, then soonest)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Get tasks assigned to user
 */
export const getTasksAssignedToUser = (tasks: Task[], userId: string): Task[] => {
  return tasks.filter((task) =>
    task.assignedTo?.some((assignment) => assignment.userId === userId)
  );
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(isTaskOverdue);
};

/**
 * Get tasks due today
 */
export const getTasksDueToday = (tasks: Task[]): Task[] => {
  return tasks.filter(isTaskDueToday);
};

