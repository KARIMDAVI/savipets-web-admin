/**
 * Workforce Feature Types
 * 
 * Type definitions for workforce management (sitters).
 * Extracted from Workforce.tsx for better organization.
 */

/**
 * Sitter availability schedule
 */
export interface SitterAvailability {
  id: string;
  sitterId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxBookings: number;
  serviceTypes: string[];
}

/**
 * Sitter performance metrics
 */
export interface SitterPerformance {
  sitterId: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number; // minutes
  completionRate: number;
  customerSatisfaction: number;
  lastActive: Date;
}

/**
 * Sitter schedule for specific dates
 */
export interface SitterSchedule {
  id: string;
  sitterId: string;
  date: Date;
  shifts: {
    startTime: string;
    endTime: string;
    serviceTypes: string[];
    maxBookings: number;
  }[];
  isActive: boolean;
}

/**
 * Sitter certification
 */
export interface SitterCertification {
  id: string;
  sitterId: string;
  type: 'basic' | 'advanced' | 'specialized' | 'emergency';
  name: string;
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'pending';
  issuingOrganization: string;
}

