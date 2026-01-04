/**
 * AI Assignment Feature Types
 * 
 * Type definitions for AI-powered sitter assignment.
 * Extracted from AIAssignment.tsx for better organization.
 */

import type { Booking, User } from '@/types';

export interface AISitterRecommendation {
  sitter: User;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface AISitterAssignment {
  bookingId: string;
  booking: Booking;
  recommendations: AISitterRecommendation[];
  currentAssignment?: string;
  status: 'pending' | 'assigned' | 'overridden';
}

export type ConfidenceThreshold = 'high' | 'medium' | 'low';

export interface AIAssignmentStats {
  totalPending: number;
  highConfidence: number;
  autoAssigned: number;
  overridden: number;
}

