/**
 * CRM Feature Types
 * 
 * Type definitions for customer relationship management.
 * Extracted from CRM.tsx for better organization.
 */

/**
 * Client note - supports both client-level and pet-specific notes
 */
export interface ClientNote {
  id: string;
  clientId: string;
  petId?: string; // NEW: Optional pet ID for pet-specific notes
  petName?: string; // NEW: Pet name for display (denormalized)
  content: string;
  type: 'general' | 'preference' | 'issue' | 'follow_up' | 'medical' | 'behavior' | 'diet'; // NEW: Added pet-specific types
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  createdBy: string;
  isResolved: boolean;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

/**
 * Client tag
 */
export interface ClientTag {
  id: string;
  name: string;
  color: string;
  category: 'preference' | 'behavior' | 'status' | 'custom';
}

/**
 * Client segment criteria - FIXED: Consistent naming
 */
export interface ClientSegmentCriteria {
  minBookings?: number;
  minSpent?: number;
  maxDaysSinceLastBooking?: number; // FIXED: Changed from lastBookingDays
  minRating?: number;
  tags?: string[];
}

/**
 * Client segment
 */
export interface ClientSegment {
  id: string;
  name: string;
  criteria: ClientSegmentCriteria; // Use the interface
  clientCount: number;
}

/**
 * Activity metadata - FIXED: Proper typing
 */
export interface ClientActivityMetadata {
  bookingId?: string;
  conversationId?: string;
  noteId?: string;
  userId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  [key: string]: unknown; // For extensibility
}

/**
 * Client activity
 */
export interface ClientActivity {
  id: string;
  clientId: string;
  type: 'booking' | 'message' | 'call' | 'email' | 'note' | 'status_change';
  description: string;
  timestamp: Date;
  metadata?: ClientActivityMetadata; // FIXED: Proper type
}

/**
 * Form value types - NEW
 */
export interface AddNoteFormValues {
  type: ClientNote['type'];
  priority: ClientNote['priority'];
  content: string;
  petId?: string; // NEW: Optional pet ID for pet-specific notes
}

export interface CreateSegmentFormValues {
  name: string;
  minBookings?: number;
  minSpent?: number;
  maxDaysSinceLastBooking?: number; // FIXED: Consistent naming
  minRating?: number;
  tags?: string[];
}

