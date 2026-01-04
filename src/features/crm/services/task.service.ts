/**
 * Task Service
 * 
 * Service for managing tasks and activities in CRM.
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import type {
  Task,
  TaskFilters,
  TaskComment,
  TaskReminder,
} from '../types/tasks.types';
import { handleCRMError, withErrorHandling } from '../utils/errorHandler';

class TaskService {
  private readonly tasksCollection = 'crm_tasks';
  private readonly commentsCollection = 'crm_task_comments';
  private readonly remindersCollection = 'crm_task_reminders';

  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    return (
      (await withErrorHandling(async () => {
        let q = query(collection(db, this.tasksCollection));

        // Apply filters
        if (filters?.status && filters.status.length > 0) {
          q = query(q, where('status', 'in', filters.status));
        }
        if (filters?.clientId) {
          q = query(q, where('clientId', '==', filters.clientId));
        }
        if (filters?.assignedTo && filters.assignedTo.length > 0) {
          q = query(q, where('assignedTo', 'array-contains-any', filters.assignedTo));
        }

        // Order by due date or created date
        q = query(q, orderBy('dueDate', 'asc'));
        q = query(q, orderBy('createdAt', 'desc'));

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => this.mapTaskDocument(doc));
      })) || []
    );
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    return withErrorHandling(async () => {
      const docSnap = await getDoc(doc(db, this.tasksCollection, taskId));
      if (!docSnap.exists()) return null;
      return this.mapTaskDocument(docSnap);
    });
  }

  /**
   * Get tasks for a specific client
   */
  async getClientTasks(clientId: string): Promise<Task[]> {
    return this.getTasks({ clientId });
  }

  /**
   * Create a new task
   */
  async createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'reminders'>
  ): Promise<Task | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.tasksCollection), {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.status || 'todo',
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return this.mapTaskDocument(docSnap);
    });
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<void> {
    await withErrorHandling(async () => {
      const { id, createdAt, comments, attachments, reminders, ...updateData } = updates;
      
      // Handle status change to completed
      if (updates.status === 'completed' && !updates.completedAt) {
        (updateData as any).completedAt = serverTimestamp();
      }

      await updateDoc(doc(db, this.tasksCollection, taskId), {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    await withErrorHandling(async () => {
      await deleteDoc(doc(db, this.tasksCollection, taskId));
    });
  }

  /**
   * Add comment to task
   */
  async addTaskComment(
    taskId: string,
    comment: Omit<TaskComment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskComment | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(
        collection(db, this.commentsCollection),
        {
          ...comment,
          taskId,
          createdAt: serverTimestamp(),
        }
      );

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...comment,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as TaskComment;
    });
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.commentsCollection),
          where('taskId', '==', taskId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            taskId: data.taskId as string,
            content: data.content as string,
            createdBy: data.createdBy as string,
            createdByName: data.createdByName as string | undefined,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          } as TaskComment;
        });
      })) || []
    );
  }

  /**
   * Assign task to users
   */
  async assignTask(
    taskId: string,
    userIds: string[],
    assignedBy: string
  ): Promise<void> {
    await withErrorHandling(async () => {
      const taskRef = doc(db, this.tasksCollection, taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Task not found');
      }

      const assignments = userIds.map((userId) => ({
        userId,
        assignedAt: serverTimestamp(),
        assignedBy,
      }));

      await updateDoc(taskRef, {
        assignedTo: assignments,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, completionPercentage?: number): Promise<void> {
    await withErrorHandling(async () => {
      const updates: Record<string, unknown> = {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (completionPercentage !== undefined) {
        updates.completionPercentage = completionPercentage;
      }

      await updateDoc(doc(db, this.tasksCollection, taskId), updates);
    });
  }

  /**
   * Map Firestore document to Task type
   */
  private mapTaskDocument(doc: any): Task {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title as string,
      description: data.description as string | undefined,
      type: data.type as Task['type'],
      priority: data.priority as Task['priority'],
      status: data.status as Task['status'],
      clientId: data.clientId as string | undefined,
      relatedEntityId: data.relatedEntityId as string | undefined,
      relatedEntityType: data.relatedEntityType as Task['relatedEntityType'],
      assignedTo: data.assignedTo as Task['assignedTo'],
      createdBy: data.createdBy as string,
      createdByName: data.createdByName as string | undefined,
      dueDate: data.dueDate?.toDate(),
      startDate: data.startDate?.toDate(),
      completedAt: data.completedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
      recurrence: data.recurrence as Task['recurrence'],
      parentTaskId: data.parentTaskId as string | undefined,
      isRecurringInstance: data.isRecurringInstance as boolean | undefined,
      tags: data.tags as string[] | undefined,
      estimatedDuration: data.estimatedDuration as number | undefined,
      actualDuration: data.actualDuration as number | undefined,
      completionPercentage: data.completionPercentage as number | undefined,
      customFields: data.customFields as Record<string, unknown> | undefined,
    } as Task;
  }
}

export const taskService = new TaskService();

