/**
 * CRM Service Unit Tests
 * 
 * Tests for CRM service layer methods.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crmService } from '@/services/crm.service';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { mockNotes, mockSegments, mockTags, mockActivities } from '../mocks';
import { createMockNote, createMockSegment, createMockTag } from '../fixtures';

// Mock Firestore
vi.mock('@/config/firebase.config', () => ({
  db: {},
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn((...args) => args),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getCountFromServer: vi.fn(),
    serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
    Timestamp: {
      fromDate: vi.fn((date) => ({ toDate: () => date })),
    },
  };
});

describe('CRMService - Notes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClientNotes', () => {
    it('should fetch notes for a specific client', async () => {
      const clientId = 'client-1';
      const mockSnapshot = {
        docs: [
          {
            id: 'note-1',
            data: () => ({
              clientId: 'client-1',
              content: 'Test note',
              type: 'general',
              priority: 'medium',
              createdAt: { toDate: () => new Date('2024-01-15') },
              createdBy: 'admin-1',
              isResolved: false,
            }),
          },
        ],
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const notes = await crmService.getClientNotes(clientId);

      expect(notes).toHaveLength(1);
      expect(notes[0].clientId).toBe(clientId);
      expect(notes[0].content).toBe('Test note');
    });

    it('should return empty array when no notes found', async () => {
      const mockSnapshot = { docs: [] };
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const notes = await crmService.getClientNotes('client-1');

      expect(notes).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const notes = await crmService.getClientNotes('client-1');

      expect(notes).toEqual([]);
    });
  });

  describe('getAllNotes', () => {
    it('should fetch all notes with limit', async () => {
      const mockSnapshot = {
        docs: mockNotes.map((note) => ({
          id: note.id,
          data: () => ({
            ...note,
            createdAt: { toDate: () => note.createdAt },
          }),
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const notes = await crmService.getAllNotes(10);

      expect(notes.length).toBeLessThanOrEqual(10);
      expect(getDocs).toHaveBeenCalled();
    });

    it('should use cache when available', async () => {
      // First call
      const mockSnapshot = {
        docs: mockNotes.map((note) => ({
          id: note.id,
          data: () => ({
            ...note,
            createdAt: { toDate: () => note.createdAt },
          }),
        })),
      };
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      await crmService.getAllNotes(10);

      // Second call should use cache
      vi.clearAllMocks();
      const cachedNotes = await crmService.getAllNotes(10);

      // Should still return notes (from cache)
      expect(cachedNotes).toBeDefined();
    });
  });

  describe('createNote', () => {
    it('should create a new note', async () => {
      const noteData = {
        clientId: 'client-1',
        content: 'New note',
        type: 'general' as const,
        priority: 'medium' as const,
        createdBy: 'admin-1',
      };

      const mockDocRef = { id: 'new-note-id' };
      const mockDocSnap = {
        exists: () => true,
        id: 'new-note-id',
        data: () => ({
          createdAt: { toDate: () => new Date() },
          isResolved: false,
        }),
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await crmService.createNote(noteData);

      expect(result).toBeDefined();
      expect(result?.clientId).toBe(noteData.clientId);
      expect(result?.content).toBe(noteData.content);
      expect(addDoc).toHaveBeenCalled();
    });

    it('should handle creation failure', async () => {
      const noteData = {
        clientId: 'client-1',
        content: 'New note',
        type: 'general' as const,
        priority: 'medium' as const,
        createdBy: 'admin-1',
      };

      const mockDocRef = { id: 'new-note-id' };
      const mockDocSnap = {
        exists: () => false,
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await crmService.createNote(noteData);

      expect(result).toBeNull();
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', async () => {
      const noteId = 'note-1';
      const updates = { content: 'Updated content' };

      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await crmService.updateNote(noteId, updates);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      const noteId = 'note-1';

      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await crmService.deleteNote(noteId);

      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});

describe('CRMService - Segments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSegments', () => {
    it('should fetch all segments', async () => {
      const mockSnapshot = {
        docs: mockSegments.map((segment) => ({
          id: segment.id,
          data: () => segment,
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const segments = await crmService.getSegments();

      expect(segments).toHaveLength(mockSegments.length);
      expect(segments[0].name).toBe(mockSegments[0].name);
    });

    it('should return cached segments when available', async () => {
      // First call to populate cache
      const mockSnapshot = {
        docs: mockSegments.map((segment) => ({
          id: segment.id,
          data: () => segment,
        })),
      };
      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      await crmService.getSegments();

      // Second call should use cache
      vi.clearAllMocks();
      const cachedSegments = await crmService.getSegments();

      expect(cachedSegments).toBeDefined();
    });
  });

  describe('createSegment', () => {
    it('should create a new segment', async () => {
      const segmentData = {
        name: 'New Segment',
        criteria: { minBookings: 5 },
      };

      const mockDocRef = { id: 'new-segment-id' };
      const mockDocSnap = {
        exists: () => true,
        id: 'new-segment-id',
        data: () => ({
          ...segmentData,
          clientCount: 0,
        }),
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await crmService.createSegment(segmentData);

      expect(result).toBeDefined();
      expect(result?.name).toBe(segmentData.name);
    });
  });
});

describe('CRMService - Tags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTags', () => {
    it('should fetch all tags', async () => {
      const mockSnapshot = {
        docs: mockTags.map((tag) => ({
          id: tag.id,
          data: () => tag,
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const tags = await crmService.getTags();

      expect(tags).toHaveLength(mockTags.length);
      expect(tags[0].name).toBe(mockTags[0].name);
    });
  });

  describe('createTag', () => {
    it('should create a new tag', async () => {
      const tagData = {
        name: 'New Tag',
        color: '#1890ff',
        category: 'custom' as const,
      };

      const mockDocRef = { id: 'new-tag-id' };
      const mockDocSnap = {
        exists: () => true,
        id: 'new-tag-id',
        data: () => tagData,
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await crmService.createTag(tagData);

      expect(result).toBeDefined();
      expect(result?.name).toBe(tagData.name);
    });

    it('should validate tag name', async () => {
      const invalidTagData = {
        name: '',
        color: '#1890ff',
        category: 'custom' as const,
      };

      await expect(crmService.createTag(invalidTagData)).rejects.toThrow();
    });

    it('should validate tag name length', async () => {
      const invalidTagData = {
        name: 'a'.repeat(51), // Too long
        color: '#1890ff',
        category: 'custom' as const,
      };

      await expect(crmService.createTag(invalidTagData)).rejects.toThrow();
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', async () => {
      const tagId = 'tag-1';
      const updates = { name: 'Updated Tag' };

      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await crmService.updateTag(tagId, updates);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      const tagId = 'tag-1';

      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await crmService.deleteTag(tagId);

      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});

describe('CRMService - Activities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClientActivities', () => {
    it('should fetch activities for a client', async () => {
      const clientId = 'client-1';
      const mockSnapshot = {
        docs: mockActivities.map((activity) => ({
          id: activity.id,
          data: () => ({
            ...activity,
            timestamp: { toDate: () => activity.timestamp },
          }),
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const activities = await crmService.getClientActivities(clientId);

      expect(activities).toHaveLength(mockActivities.length);
      expect(activities[0].clientId).toBe(clientId);
    });

    it('should respect limit parameter', async () => {
      const clientId = 'client-1';
      const limitCount = 1;
      const mockSnapshot = {
        docs: mockActivities.slice(0, limitCount).map((activity) => ({
          id: activity.id,
          data: () => ({
            ...activity,
            timestamp: { toDate: () => activity.timestamp },
          }),
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const activities = await crmService.getClientActivities(clientId, limitCount);

      expect(activities.length).toBeLessThanOrEqual(limitCount);
    });
  });

  describe('logActivity', () => {
    it('should log a new activity', async () => {
      const activityData = {
        clientId: 'client-1',
        type: 'note' as const,
        description: 'Test activity',
      };

      const mockDocRef = { id: 'new-activity-id' };
      const mockDocSnap = {
        exists: () => true,
        id: 'new-activity-id',
        data: () => ({
          ...activityData,
          timestamp: { toDate: () => new Date() },
        }),
      };

      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await crmService.logActivity(activityData);

      expect(result).toBeDefined();
      expect(result?.clientId).toBe(activityData.clientId);
      expect(result?.type).toBe(activityData.type);
    });
  });
});











