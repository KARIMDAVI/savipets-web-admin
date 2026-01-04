/**
 * Firestore Schema Definitions for CRM Module
 * 
 * Type definitions for Firestore collections used by the CRM module.
 * These schemas define the structure of documents stored in Firestore.
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Firestore Collection: crm_notes
 * Document ID: auto-generated
 * 
 * Stores client notes created by admin/manager users.
 */
export interface CRMNoteDocument {
  clientId: string;
  petId?: string; // NEW: Optional pet ID for pet-specific notes
  petName?: string; // NEW: Pet name (denormalized for display)
  content: string; // Sanitized HTML
  type: 'general' | 'preference' | 'issue' | 'follow_up' | 'medical' | 'behavior' | 'diet';
  priority: 'low' | 'medium' | 'high';
  createdBy: string; // User ID
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isResolved: boolean;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  
  // Indexed fields (composite for querying)
  // These are computed fields that combine multiple values for efficient querying
  // Note: Firestore will handle indexing via firestore.indexes.json
  clientId_petId?: string; // NEW: Composite for pet-specific note queries
}

/**
 * Firestore Collection: crm_segments
 * Document ID: auto-generated
 * 
 * Stores client segmentation rules and metadata.
 */
export interface CRMSegmentDocument {
  name: string;
  description?: string;
  criteria: {
    minBookings?: number;
    minSpent?: number;
    maxDaysSinceLastBooking?: number; // FIXED: Consistent naming (not lastBookingDays)
    minRating?: number;
    tags?: string[];
  };
  clientCount: number; // Denormalized, updated via Cloud Function or client-side calculation
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isActive: boolean;
}

/**
 * Firestore Collection: crm_activities
 * Document ID: auto-generated
 * 
 * Stores activity timeline entries for clients.
 * Aggregates activities from bookings, messages, notes, etc.
 */
export interface CRMActivityDocument {
  clientId: string;
  type: 'booking' | 'message' | 'call' | 'email' | 'note' | 'status_change';
  description: string;
  timestamp: Timestamp;
  metadata: {
    bookingId?: string;
    conversationId?: string;
    noteId?: string;
    userId?: string;
    oldValue?: unknown;
    newValue?: unknown;
    [key: string]: unknown; // Flexible for future types
  };
  
  // Indexed fields (composite for querying)
  // Note: Firestore will handle indexing via firestore.indexes.json
}

/**
 * Firestore Collection: crm_tags
 * Document ID: tag name (slugified)
 * 
 * Stores available tags that can be assigned to clients.
 */
export interface CRMTagDocument {
  name: string;
  color: string;
  category: 'preference' | 'behavior' | 'status' | 'custom';
  clientCount: number; // Denormalized count of clients with this tag
  createdBy: string;
  createdAt: Timestamp;
}

/**
 * Firestore Subcollection: crm_client_tags
 * Path: users/{userId}/crm_tags/{tagId}
 * 
 * Stores tag assignments to clients.
 * Using subcollection for better query performance and data organization.
 */
export interface CRMClientTagDocument {
  tagId: string;
  tagName: string; // Denormalized for easy querying
  addedBy: string;
  addedAt: Timestamp;
}

