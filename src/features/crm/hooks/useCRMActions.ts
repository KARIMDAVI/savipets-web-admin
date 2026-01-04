/**
 * useCRMActions Hook
 * 
 * Hook for handling CRM-related mutations (add note, create segment, etc.).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { crmService } from '@/services/crm.service';
import { auditService } from '@/services/audit.service';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { handleCRMError, CRMError } from '../utils/errorHandler';
import { useAuth } from '@/contexts/AuthContext';
import {
  validateNoteContent,
  sanitizeNoteContent,
  validateSegmentName,
  validateSegmentCriteria,
} from '../utils/crmValidation';
import type {
  ClientNote,
  ClientSegment,
  AddNoteFormValues,
  CreateSegmentFormValues,
} from '../types/crm.types';

interface UseCRMActionsCallbacks {
  onNoteAdded?: (note: ClientNote) => void;
  onSegmentCreated?: (segment: ClientSegment) => void;
}

export const useCRMActions = (callbacks?: UseCRMActionsCallbacks) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const useRealService = useFeatureFlag('CRM_SERVICE_LAYER');

  // Add note mutation with optimistic updates
  const addNoteMutation = useMutation({
    mutationFn: async ({ values, clientId }: { values: AddNoteFormValues; clientId: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Validate note content
      const contentValidation = validateNoteContent(values.content);
      if (!contentValidation.valid) {
        throw new CRMError(
          contentValidation.error || 'Invalid note content',
          'VALIDATION_ERROR',
          contentValidation.error
        );
      }

      // Sanitize content
      const sanitizedContent = sanitizeNoteContent(values.content);

      if (useRealService) {
        const result = await crmService.createNote({
          clientId,
          petId: values.petId,
          petName: values.petId ? undefined : undefined, // Will be resolved from petId in service layer
          content: sanitizedContent,
          type: values.type,
          priority: values.priority,
          createdBy: user.id,
          isResolved: false,
        });
        if (!result) throw new Error('Note creation failed');
        return result;
      } else {
        // Fallback mock for testing when service is disabled
        return {
          id: `note-${Date.now()}`,
          clientId,
          petId: values.petId,
          petName: values.petId ? undefined : undefined, // Mock doesn't resolve pet name
          content: sanitizedContent,
          type: values.type,
          priority: values.priority,
          createdAt: new Date(),
          createdBy: user.id,
          isResolved: false,
        } as ClientNote;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes'] });
      callbacks?.onNoteAdded?.(data);

      // Log audit entry
      if (user) {
        await auditService.logAction({
          action: 'create_note',
          resource: 'crm_note',
          resourceId: data.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientId: data.clientId,
            type: data.type,
            priority: data.priority,
          },
        });
      }

      message.success('Note added successfully');
    },
  });

  // Create segment mutation
  const createSegmentMutation = useMutation({
    mutationFn: async (values: CreateSegmentFormValues) => {
      if (!user) throw new Error('User not authenticated');

      // Validate segment name
      const nameValidation = validateSegmentName(values.name);
      if (!nameValidation.valid) {
        throw new CRMError(
          nameValidation.error || 'Invalid segment name',
          'VALIDATION_ERROR',
          nameValidation.error
        );
      }

      // Validate segment criteria
      const criteriaValidation = validateSegmentCriteria({
        minBookings: values.minBookings,
        minSpent: values.minSpent,
        maxDaysSinceLastBooking: values.maxDaysSinceLastBooking,
        minRating: values.minRating,
        tags: values.tags,
      });
      if (!criteriaValidation.valid) {
        throw new CRMError(
          criteriaValidation.error || 'Invalid segment criteria',
          'VALIDATION_ERROR',
          criteriaValidation.error
        );
      }

      if (useRealService) {
        const result = await crmService.createSegment({
          name: values.name.trim(),
          criteria: {
            minBookings: values.minBookings,
            minSpent: values.minSpent,
            maxDaysSinceLastBooking: values.maxDaysSinceLastBooking,
            minRating: values.minRating,
            tags: values.tags,
          },
        });
        if (!result) throw new Error('Segment creation failed');
        return result;
      } else {
        // Fallback mock
        return {
          id: `segment-${Date.now()}`,
          name: values.name.trim(),
          criteria: {
            minBookings: values.minBookings,
            minSpent: values.minSpent,
            maxDaysSinceLastBooking: values.maxDaysSinceLastBooking,
            minRating: values.minRating,
            tags: values.tags,
          },
          clientCount: 0,
        } as ClientSegment;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-segments'] });
      callbacks?.onSegmentCreated?.(data);

      // Log audit entry
      if (user) {
        await auditService.logAction({
          action: 'create_segment',
          resource: 'crm_segment',
          resourceId: data.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            segmentName: data.name,
            criteria: data.criteria,
          },
        });
      }

      message.success('Segment created successfully');
    },
  });

  return {
    handleAddNote: (values: AddNoteFormValues, clientId: string) =>
      addNoteMutation.mutateAsync({ values, clientId }),
    handleCreateSegment: (values: CreateSegmentFormValues) =>
      createSegmentMutation.mutateAsync(values),
    isAddingNote: addNoteMutation.isPending,
    isCreatingSegment: createSegmentMutation.isPending,
  };
};

