/**
 * Audit & Compliance Feature Types
 * 
 * Type definitions for audit logging and compliance management.
 * Extracted from AuditCompliance.tsx for better organization.
 */

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data_access' | 'data_modification' | 'system' | 'security';
  success: boolean;
  errorMessage?: string;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  id: string;
  name: string;
  type: 'gdpr' | 'ccpa' | 'hipaa' | 'sox' | 'pci';
  status: 'compliant' | 'non_compliant' | 'pending' | 'exempt';
  lastAudit: Date;
  nextAudit: Date;
  findings: ComplianceFinding[];
  score: number;
}

/**
 * Compliance finding
 */
export interface ComplianceFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  remediation: string;
  dueDate: Date;
  assignedTo: string;
}

/**
 * Data request (GDPR/CCPA)
 */
export interface DataRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'access' | 'portability' | 'deletion' | 'rectification';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  requestedAt: Date;
  completedAt?: Date;
  reason?: string;
  dataExported?: boolean;
}

/**
 * Data retention policy
 */
export interface DataRetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: number; // days
  autoDelete: boolean;
  legalBasis: string;
  description: string;
}

