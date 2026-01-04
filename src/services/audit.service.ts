/**
 * Audit Service
 * 
 * Enhanced service for logging audit trail entries for compliance and security tracking.
 * Includes advanced features: severity levels, IP tracking, session tracking, and security event detection.
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuditAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'export' | 'import' | 'login' | 'logout'
  | 'permission_granted' | 'permission_revoked'
  | 'data_access' | 'data_modified' | 'data_deleted'
  | 'bulk_tag_clients' | 'bulk_create_notes' | 'bulk_assign_segment'
  | 'send_email' | 'send_sms' | 'log_call'
  | 'create_note' | 'create_segment' | 'create_tag' | 'update_tag' | 'delete_tag'
  | 'create_task' | 'update_task' | 'delete_task' | 'complete_task' | 'assign_task'
  | 'create_workflow' | 'update_workflow' | 'delete_workflow' | 'enable_workflow' | 'disable_workflow';

export interface AuditLogEntry {
  id?: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  severity: AuditSeverity;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}

export interface SecurityEvent {
  id?: string;
  eventType: 'suspicious_activity' | 'unauthorized_access' | 'data_breach_attempt' | 'rate_limit_exceeded';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: AuditSeverity;
  timestamp: Date;
  details: Record<string, unknown>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
}

class AuditService {
  private readonly auditCollection = 'auditLog';
  private readonly securityCollection = 'securityEvents';
  private sessionId: string | null = null;

  constructor() {
    // Generate session ID for tracking user sessions
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get client IP address (if available)
   */
  private getClientIP(): string | undefined {
    // In a real application, this would come from request headers
    // For now, return undefined (server-side would extract from headers)
    return undefined;
  }

  /**
   * Get user agent (if available)
   */
  private getUserAgent(): string | undefined {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return undefined;
  }

  /**
   * Log an action to the audit trail
   * Enhanced with severity, IP tracking, and session tracking
   */
  async logAction(
    entry: Omit<AuditLogEntry, 'timestamp' | 'sessionId' | 'ipAddress' | 'userAgent' | 'severity' | 'success'> & {
      severity?: AuditSeverity;
      success?: boolean;
    }
  ): Promise<void> {
    try {
      const auditEntry: Omit<AuditLogEntry, 'id'> = {
        ...entry,
        severity: entry.severity || 'medium',
        success: entry.success !== undefined ? entry.success : true,
        timestamp: new Date(),
        sessionId: this.sessionId || undefined,
        ipAddress: this.getClientIP(),
        userAgent: this.getUserAgent(),
      };

      // Filter out undefined values - Firestore doesn't accept them
      const firestoreEntry: Record<string, any> = {
        action: auditEntry.action,
        resource: auditEntry.resource,
        resourceId: auditEntry.resourceId,
        userId: auditEntry.userId,
        severity: auditEntry.severity,
        success: auditEntry.success,
        timestamp: serverTimestamp(),
      };

      // Only add optional fields if they are defined
      if (auditEntry.userEmail) firestoreEntry.userEmail = auditEntry.userEmail;
      if (auditEntry.userName) firestoreEntry.userName = auditEntry.userName;
      if (auditEntry.sessionId) firestoreEntry.sessionId = auditEntry.sessionId;
      if (auditEntry.ipAddress) firestoreEntry.ipAddress = auditEntry.ipAddress;
      if (auditEntry.userAgent) firestoreEntry.userAgent = auditEntry.userAgent;
      if (auditEntry.metadata) firestoreEntry.metadata = auditEntry.metadata;
      if (auditEntry.oldValue) firestoreEntry.oldValue = auditEntry.oldValue;
      if (auditEntry.newValue) firestoreEntry.newValue = auditEntry.newValue;
      if (auditEntry.errorMessage) firestoreEntry.errorMessage = auditEntry.errorMessage;

      await addDoc(collection(db, this.auditCollection), firestoreEntry);

      // Check for suspicious patterns
      await this.checkForSuspiciousActivity(auditEntry);
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging shouldn't break the app
    }
  }

  /**
   * Log data access
   */
  async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction({
      action: 'data_access',
      resource,
      resourceId,
      userId,
      severity: 'low',
      success: true,
      metadata,
    });
  }

  /**
   * Log data modification with before/after values
   */
  async logDataModification(
    userId: string,
    resource: string,
    resourceId: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logAction({
      action: 'data_modified',
      resource,
      resourceId,
      userId,
      severity: 'medium',
      success: true,
      oldValue,
      newValue,
      metadata,
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      await addDoc(collection(db, this.securityCollection), {
        ...event,
        resolved: false,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkForSuspiciousActivity(entry: AuditLogEntry): Promise<void> {
    try {
      // Check for rapid-fire actions (potential abuse)
      const recentActions = await this.getRecentActions(entry.userId, 60); // Last 60 seconds
      
      if (recentActions.length > 20) {
        await this.logSecurityEvent({
          eventType: 'rate_limit_exceeded',
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          severity: 'high',
          details: {
            actionCount: recentActions.length,
            timeWindow: '60 seconds',
            actions: recentActions.map((a) => a.action),
          },
        });
      }

      // Check for unauthorized access attempts
      if (!entry.success && entry.action === 'data_access') {
        await this.logSecurityEvent({
          eventType: 'unauthorized_access',
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          severity: 'high',
          details: {
            resource: entry.resource,
            resourceId: entry.resourceId,
            errorMessage: entry.errorMessage,
          },
        });
      }

      // Check for bulk delete operations
      if (entry.action === 'delete' && entry.severity === 'critical') {
        await this.logSecurityEvent({
          eventType: 'suspicious_activity',
          userId: entry.userId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          severity: 'critical',
          details: {
            resource: entry.resource,
            resourceId: entry.resourceId,
            metadata: entry.metadata,
          },
        });
      }
    } catch (error) {
      console.error('Failed to check for suspicious activity:', error);
    }
  }

  /**
   * Get recent actions for a user
   */
  private async getRecentActions(userId: string, seconds: number): Promise<AuditLogEntry[]> {
    try {
      const cutoffTime = new Date(Date.now() - seconds * 1000);
      const q = query(
        collection(db, this.auditCollection),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(cutoffTime)),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action as AuditAction,
          resource: data.resource as string,
          resourceId: data.resourceId as string,
          userId: data.userId as string,
          userEmail: data.userEmail as string | undefined,
          severity: data.severity as AuditSeverity,
          timestamp: data.timestamp?.toDate() || new Date(),
          ipAddress: data.ipAddress as string | undefined,
          userAgent: data.userAgent as string | undefined,
          sessionId: data.sessionId as string | undefined,
          metadata: data.metadata as Record<string, unknown> | undefined,
          oldValue: data.oldValue as Record<string, unknown> | undefined,
          newValue: data.newValue as Record<string, unknown> | undefined,
          success: data.success as boolean,
          errorMessage: data.errorMessage as string | undefined,
        } as AuditLogEntry;
      });
    } catch (error) {
      console.error('Failed to get recent actions:', error);
      return [];
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: {
    userId?: string;
    resource?: string;
    action?: AuditAction;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      let q = query(collection(db, this.auditCollection), orderBy('timestamp', 'desc'));

      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.resource) {
        q = query(q, where('resource', '==', filters.resource));
      }
      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }
      if (filters.severity) {
        q = query(q, where('severity', '==', filters.severity));
      }
      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      q = query(q, limit(filters.limitCount || 100));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action as AuditAction,
          resource: data.resource as string,
          resourceId: data.resourceId as string,
          userId: data.userId as string,
          userEmail: data.userEmail as string | undefined,
          severity: data.severity as AuditSeverity,
          timestamp: data.timestamp?.toDate() || new Date(),
          ipAddress: data.ipAddress as string | undefined,
          userAgent: data.userAgent as string | undefined,
          sessionId: data.sessionId as string | undefined,
          metadata: data.metadata as Record<string, unknown> | undefined,
          oldValue: data.oldValue as Record<string, unknown> | undefined,
          newValue: data.newValue as Record<string, unknown> | undefined,
          success: data.success as boolean,
          errorMessage: data.errorMessage as string | undefined,
        } as AuditLogEntry;
      });
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }
}

export const auditService = new AuditService();


