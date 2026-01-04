/**
 * useBulkActions Hook
 * 
 * Hook for managing bulk operations on selected clients.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { crmService } from '@/services/crm.service';
import { auditService } from '@/services/audit.service';
import { useAuth } from '@/contexts/AuthContext';
import { handleCRMError } from '../utils/errorHandler';
import type { ClientNote } from '../types/crm.types';

interface BulkTagParams {
  clientIds: string[];
  tagIds: string[];
}

interface BulkNoteParams {
  clientIds: string[];
  content: string;
  type: ClientNote['type'];
  priority: ClientNote['priority'];
}

interface BulkSegmentParams {
  clientIds: string[];
  segmentId: string;
}

/**
 * Hook for bulk operations on clients
 */
export const useBulkActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Bulk tag assignment
  const bulkTagClients = useMutation({
    mutationFn: async ({ clientIds, tagIds }: BulkTagParams) => {
      if (!user) throw new Error('User not authenticated');
      if (clientIds.length === 0) throw new Error('No clients selected');
      if (tagIds.length === 0) throw new Error('No tags selected');

      const batch = writeBatch(db);
      const usersCollection = collection(db, 'users');

      clientIds.forEach((clientId) => {
        const clientRef = doc(usersCollection, clientId);
        // Add tags to client (assuming tags are stored as an array field)
        tagIds.forEach((tagId) => {
          batch.update(clientRef, {
            tags: arrayUnion(tagId),
            lastModified: serverTimestamp(),
            lastModifiedBy: user.id,
          });
        });
      });

      await batch.commit();

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'bulk_tag_clients',
          resource: 'crm_clients',
          resourceId: clientIds.join(','),
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientCount: clientIds.length,
            tagIds,
          },
        });
      }

      return { success: true, count: clientIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
      message.success(`Tags applied to ${data.count} client(s)`);
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to apply tags');
    },
  });

  // Bulk note creation
  const bulkCreateNotes = useMutation({
    mutationFn: async ({ clientIds, content, type, priority }: BulkNoteParams) => {
      if (!user) throw new Error('User not authenticated');
      if (clientIds.length === 0) throw new Error('No clients selected');
      if (!content.trim()) throw new Error('Note content is required');

      const notes = await Promise.all(
        clientIds.map((clientId) =>
          crmService.createNote({
            clientId,
            content,
            type,
            priority,
            createdBy: user.id,
            isResolved: false,
          })
        )
      );

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'bulk_create_notes',
          resource: 'crm_notes',
          resourceId: notes.map((n) => n?.id).filter(Boolean).join(','),
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientCount: clientIds.length,
            noteType: type,
            priority,
          },
        });
      }

      return { success: true, count: notes.filter(Boolean).length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
      message.success(`Notes created for ${data.count} client(s)`);
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to create notes');
    },
  });

  // Bulk segment assignment
  const bulkAssignSegment = useMutation({
    mutationFn: async ({ clientIds, segmentId }: BulkSegmentParams) => {
      if (!user) throw new Error('User not authenticated');
      if (clientIds.length === 0) throw new Error('No clients selected');
      if (!segmentId) throw new Error('Segment ID is required');

      // Note: Segment assignment is typically calculated based on criteria
      // This operation might need to be handled differently depending on your data model
      // For now, we'll store segment assignments in a separate collection or field

      const batch = writeBatch(db);
      const usersCollection = collection(db, 'users');

      clientIds.forEach((clientId) => {
        const clientRef = doc(usersCollection, clientId);
        batch.update(clientRef, {
          assignedSegmentId: segmentId,
          lastModified: serverTimestamp(),
          lastModifiedBy: user.id,
        });
      });

      await batch.commit();

      // Log audit trail
      if (user) {
        await auditService.logAction({
          action: 'bulk_assign_segment',
          resource: 'crm_clients',
          resourceId: clientIds.join(','),
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientCount: clientIds.length,
            segmentId,
          },
        });
      }

      return { success: true, count: clientIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
      message.success(`Segment assigned to ${data.count} client(s)`);
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to assign segment');
    },
  });

  // Bulk remove tags
  const bulkRemoveTags = useMutation({
    mutationFn: async ({ clientIds, tagIds }: BulkTagParams) => {
      if (!user) throw new Error('User not authenticated');
      if (clientIds.length === 0) throw new Error('No clients selected');
      if (tagIds.length === 0) throw new Error('No tags selected');

      const batch = writeBatch(db);
      const usersCollection = collection(db, 'users');

      clientIds.forEach((clientId) => {
        const clientRef = doc(usersCollection, clientId);
        tagIds.forEach((tagId) => {
          batch.update(clientRef, {
            tags: arrayRemove(tagId),
            lastModified: serverTimestamp(),
            lastModifiedBy: user.id,
          });
        });
      });

      await batch.commit();

      return { success: true, count: clientIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-clients'] });
      message.success(`Tags removed from ${data.count} client(s)`);
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to remove tags');
    },
  });

  return {
    bulkTagClients,
    bulkCreateNotes,
    bulkAssignSegment,
    bulkRemoveTags,
    isLoading:
      bulkTagClients.isPending ||
      bulkCreateNotes.isPending ||
      bulkAssignSegment.isPending ||
      bulkRemoveTags.isPending,
  };
};

