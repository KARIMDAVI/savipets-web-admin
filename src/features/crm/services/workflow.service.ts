/**
 * Workflow Service
 * 
 * Service for managing workflow automation rules and executions.
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
  writeBatch,
} from 'firebase/firestore';
import type {
  WorkflowRule,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowCondition,
} from '../types/workflows.types';
import { handleCRMError, withErrorHandling } from '../utils/errorHandler';

class WorkflowService {
  private readonly workflowsCollection = 'crm_workflows';
  private readonly executionsCollection = 'crm_workflow_executions';
  private readonly templatesCollection = 'crm_workflow_templates';

  /**
   * Get all workflows
   */
  async getWorkflows(enabledOnly: boolean = false): Promise<WorkflowRule[]> {
    return (
      (await withErrorHandling(async () => {
        let q = query(collection(db, this.workflowsCollection), orderBy('priority', 'desc'));

        if (enabledOnly) {
          q = query(q, where('enabled', '==', true));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => this.mapWorkflowDocument(doc));
      })) || []
    );
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(workflowId: string): Promise<WorkflowRule | null> {
    return withErrorHandling(async () => {
      const docSnap = await getDoc(doc(db, this.workflowsCollection, workflowId));
      if (!docSnap.exists()) return null;
      return this.mapWorkflowDocument(docSnap);
    });
  }

  /**
   * Get workflows by trigger
   */
  async getWorkflowsByTrigger(trigger: WorkflowRule['trigger']): Promise<WorkflowRule[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.workflowsCollection),
          where('trigger', '==', trigger),
          where('enabled', '==', true),
          orderBy('priority', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => this.mapWorkflowDocument(doc));
      })) || []
    );
  }

  /**
   * Create workflow
   */
  async createWorkflow(
    workflowData: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowRule | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.workflowsCollection), {
        ...workflowData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return this.mapWorkflowDocument(docSnap);
    });
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    updates: Partial<WorkflowRule>
  ): Promise<void> {
    await withErrorHandling(async () => {
      const { id, createdAt, ...updateData } = updates;
      await updateDoc(doc(db, this.workflowsCollection, workflowId), {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await withErrorHandling(async () => {
      await deleteDoc(doc(db, this.workflowsCollection, workflowId));
    });
  }

  /**
   * Toggle workflow enabled status
   */
  async toggleWorkflow(workflowId: string, enabled: boolean): Promise<void> {
    await withErrorHandling(async () => {
      await updateDoc(doc(db, this.workflowsCollection, workflowId), {
        enabled,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Evaluate workflow conditions
   */
  evaluateConditions(
    conditions: WorkflowCondition[],
    data: Record<string, unknown>
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) => {
      const fieldValue = this.getNestedValue(data, condition.field);
      return this.evaluateCondition(condition, fieldValue);
    });
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: WorkflowCondition,
    fieldValue: unknown
  ): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue || '').includes(String(condition.value || ''));
      case 'not_contains':
        return !String(fieldValue || '').includes(String(condition.value || ''));
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'greater_than_or_equal':
        return Number(fieldValue) >= Number(condition.value);
      case 'less_than_or_equal':
        return Number(fieldValue) <= Number(condition.value);
      case 'is_empty':
        return !fieldValue || String(fieldValue).trim() === '';
      case 'is_not_empty':
        return !!fieldValue && String(fieldValue).trim() !== '';
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
    }, obj as unknown);
  }

  /**
   * Log workflow execution
   */
  async logExecution(execution: Omit<WorkflowExecution, 'id' | 'startedAt' | 'completedAt'>): Promise<WorkflowExecution | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.executionsCollection), {
        ...execution,
        startedAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...execution,
        startedAt: data.startedAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
      } as WorkflowExecution;
    });
  }

  /**
   * Update execution status
   */
  async updateExecution(
    executionId: string,
    updates: Partial<WorkflowExecution>
  ): Promise<void> {
    await withErrorHandling(async () => {
      const { id, startedAt, ...updateData } = updates;
      await updateDoc(doc(db, this.executionsCollection, executionId), {
        ...updateData,
        completedAt: updateData.completedAt ? serverTimestamp() : undefined,
      });
    });
  }

  /**
   * Get workflow executions
   */
  async getExecutions(workflowId?: string, limitCount: number = 100): Promise<WorkflowExecution[]> {
    return (
      (await withErrorHandling(async () => {
        let q = query(
          collection(db, this.executionsCollection),
          orderBy('startedAt', 'desc')
        );

        if (workflowId) {
          q = query(q, where('workflowId', '==', workflowId));
        }

        q = query(q, limit(limitCount));

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            workflowId: data.workflowId as string,
            workflowName: data.workflowName as string,
            trigger: data.trigger as WorkflowExecution['trigger'],
            triggerData: data.triggerData as Record<string, unknown>,
            conditionsMet: data.conditionsMet as boolean,
            actionsExecuted: data.actionsExecuted as WorkflowExecution['actionsExecuted'],
            status: data.status as WorkflowExecution['status'],
            error: data.error as string | undefined,
            startedAt: data.startedAt?.toDate() || new Date(),
            completedAt: data.completedAt?.toDate(),
            duration: data.duration as number | undefined,
          } as WorkflowExecution;
        });
      })) || []
    );
  }

  /**
   * Get workflow templates
   */
  async getTemplates(): Promise<WorkflowTemplate[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.templatesCollection),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name as string,
            description: data.description as string,
            category: data.category as WorkflowTemplate['category'],
            trigger: data.trigger as WorkflowTemplate['trigger'],
            conditions: data.conditions as WorkflowCondition[] | undefined,
            actions: data.actions as WorkflowTemplate['actions'],
            isPublic: data.isPublic as boolean,
            createdBy: data.createdBy as string,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as WorkflowTemplate;
        });
      })) || []
    );
  }

  /**
   * Map Firestore document to WorkflowRule type
   */
  private mapWorkflowDocument(doc: any): WorkflowRule {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name as string,
      description: data.description as string | undefined,
      trigger: data.trigger as WorkflowRule['trigger'],
      triggerConfig: data.triggerConfig as Record<string, unknown> | undefined,
      conditions: data.conditions as WorkflowCondition[] | undefined,
      actions: data.actions as WorkflowRule['actions'],
      enabled: data.enabled as boolean,
      priority: data.priority as number,
      createdBy: data.createdBy as string,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    } as WorkflowRule;
  }
}

export const workflowService = new WorkflowService();

