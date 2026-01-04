/**
 * CRM Service
 * 
 * Service layer for CRM operations (notes, segments, activities, tags).
 * Handles all Firestore interactions for the CRM module.
 */

import type {
  ClientNote,
  ClientSegment,
  ClientActivity,
  ClientTag,
} from '@/features/crm/types/crm.types';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/features/crm/types/pagination.types';
import type { User } from '@/types';
import { crmNotesService } from './crm/CRMNotesService';
import { crmSegmentsService } from './crm/CRMSegmentsService';
import { crmActivitiesService } from './crm/CRMActivitiesService';
import { crmTagsService } from './crm/CRMTagsService';
import { crmClientsService } from './crm/CRMClientsService';

/**
 * CRM Service - Facade for all CRM operations
 * Delegates to specialized services for each domain
 */
class CRMService {

  /**
   * Get all notes for a specific client
   */
  async getClientNotes(clientId: string): Promise<ClientNote[]> {
    return crmNotesService.getClientNotes(clientId);
  }

  /**
   * Get all notes (optionally limited)
   */
  async getAllNotes(limitCount?: number): Promise<ClientNote[]> {
    return crmNotesService.getAllNotes(limitCount);
  }

  /**
   * Create a new note
   */
  async createNote(
    noteData: Omit<ClientNote, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolvedBy'>
  ): Promise<ClientNote | null> {
    return crmNotesService.createNote(noteData);
  }

  /**
   * Get a single note by ID
   */
  async getNote(noteId: string): Promise<ClientNote | null> {
    return crmNotesService.getNote(noteId);
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId: string, updates: Partial<ClientNote>): Promise<void> {
    return crmNotesService.updateNote(noteId, updates);
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    return crmNotesService.deleteNote(noteId);
  }

  /**
   * Get all segments
   */
  async getSegments(): Promise<ClientSegment[]> {
    return crmSegmentsService.getSegments();
  }

  /**
   * Create a new segment
   */
  async createSegment(
    segmentData: Omit<ClientSegment, 'id' | 'clientCount'>
  ): Promise<ClientSegment | null> {
    return crmSegmentsService.createSegment(segmentData);
  }

  /**
   * Update an existing segment
   */
  async updateSegment(
    segmentId: string,
    updates: Partial<ClientSegment>
  ): Promise<void> {
    return crmSegmentsService.updateSegment(segmentId, updates);
  }

  /**
   * Delete a segment
   */
  async deleteSegment(segmentId: string): Promise<void> {
    return crmSegmentsService.deleteSegment(segmentId);
  }

  /**
   * Get activities for a specific client
   */
  async getClientActivities(
    clientId: string,
    limitCount?: number
  ): Promise<ClientActivity[]> {
    return crmActivitiesService.getClientActivities(clientId, limitCount);
  }

  /**
   * Log a new activity
   */
  async logActivity(
    activity: Omit<ClientActivity, 'id' | 'timestamp'>
  ): Promise<ClientActivity | null> {
    return crmActivitiesService.logActivity(activity);
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<ClientTag[]> {
    return crmTagsService.getTags();
  }

  /**
   * Create a new tag
   */
  async createTag(tagData: Omit<ClientTag, 'id'>): Promise<ClientTag | null> {
    return crmTagsService.createTag(tagData);
  }

  /**
   * Update a tag
   */
  async updateTag(tagId: string, updates: Partial<ClientTag>): Promise<void> {
    return crmTagsService.updateTag(tagId, updates);
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    return crmTagsService.deleteTag(tagId);
  }

  /**
   * Get clients with pagination and filtering
   */
  async getClientsPaginated(
    params: PaginationParams & {
      searchTerm?: string;
      segmentId?: string;
      tagIds?: string[];
      dateRange?: { start: Date; end: Date; field: 'createdAt' | 'lastBooking' };
      role?: string;
    }
  ): Promise<PaginatedResponse<User>> {
    return crmClientsService.getClientsPaginated(params);
  }

  /**
   * Get notes with pagination
   */
  async getNotesPaginated(
    params: PaginationParams & {
      clientId?: string;
      type?: ClientNote['type'];
      priority?: ClientNote['priority'];
      isResolved?: boolean;
    }
  ): Promise<PaginatedResponse<ClientNote>> {
    return crmNotesService.getNotesPaginated(params);
  }
}

export const crmService = new CRMService();

