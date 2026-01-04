/**
 * useCRM Hook
 * 
 * Hook for fetching CRM data (notes, tags, segments, activities).
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { userService } from '@/services/user.service';
import { chatService } from '@/services/chat.service';
import { crmService } from '@/services/crm.service';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { handleCRMError } from '../utils/errorHandler';
import {
  QUERY_KEY_PREFIXES,
  getCacheConfig,
  buildQueryKey,
} from '../utils/cacheConfig';
import type {
  ClientNote,
  ClientTag,
  ClientSegment,
  ClientActivity,
} from '../types/crm.types';

export const useCRM = () => {
  const queryClient = useQueryClient();
  const useRealService = useFeatureFlag('CRM_SERVICE_LAYER');

  // Legacy state for mock data fallback - MUST be declared before useQuery hooks
  const [mockNotes, setMockNotes] = useState<ClientNote[]>([]);
  const [mockTags, setMockTags] = useState<ClientTag[]>([]);
  const [mockSegments, setMockSegments] = useState<ClientSegment[]>([]);

  // Fetch clients (pet owners) with optimized cache config
  const clientsConfig = getCacheConfig('clients');
  const {
    data: clients = [],
    isLoading: clientsLoading,
    refetch: refetchClients,
  } = useQuery({
    queryKey: buildQueryKey(QUERY_KEY_PREFIXES.CRM_CLIENTS),
    queryFn: () => userService.getUsersByRole('petOwner'),
    ...clientsConfig,
  });

  // Fetch bookings for client analysis
  const bookingsConfig = getCacheConfig('clients'); // Use same config as clients
  const { data: bookings = [] } = useQuery({
    queryKey: buildQueryKey(QUERY_KEY_PREFIXES.CRM, 'bookings'),
    queryFn: () => bookingService.getAllBookings({}),
    ...bookingsConfig,
  });

  // Fetch conversations for communication history
  const conversationsConfig = getCacheConfig('activities'); // Use activities config
  const { data: conversations = [] } = useQuery({
    queryKey: buildQueryKey(QUERY_KEY_PREFIXES.CRM, 'conversations'),
    queryFn: () => chatService.getAllConversations(),
    ...conversationsConfig,
  });

  // Notes - conditionally use real service with optimized cache
  const notesConfig = getCacheConfig('notes');
  const {
    data: clientNotes = [],
    isLoading: notesLoading,
    refetch: refetchNotes,
    error: notesError,
  } = useQuery({
    queryKey: buildQueryKey(QUERY_KEY_PREFIXES.CRM_NOTES),
    queryFn: () => crmService.getAllNotes(),
    enabled: useRealService,
    ...notesConfig,
  });

  // Segments - conditionally use real service with optimized cache
  const segmentsConfig = getCacheConfig('segments');
  const {
    data: clientSegments = [],
    isLoading: segmentsLoading,
    refetch: refetchSegments,
    error: segmentsError,
  } = useQuery({
    queryKey: buildQueryKey(QUERY_KEY_PREFIXES.CRM_SEGMENTS),
    queryFn: () => crmService.getSegments(),
    enabled: useRealService,
    ...segmentsConfig,
  });

  // Tags - conditionally use real service with optimized cache
  // Note: Always enable tags query, but use mock data if feature flag is disabled
  const tagsConfig = getCacheConfig('tags');
  const {
    data: clientTags = [],
    isLoading: tagsLoading,
    error: tagsError,
    refetch: refetchTags,
  } = useQuery({
    queryKey: buildQueryKey(QUERY_KEY_PREFIXES.CRM_TAGS),
    queryFn: () => {
      if (useRealService) {
        return crmService.getTags();
      } else {
        // Check cache first, then fallback to mockTags
        const cached = queryClient.getQueryData<ClientTag[]>(buildQueryKey(QUERY_KEY_PREFIXES.CRM_TAGS));
        
        // If cache exists and has data, merge it with mockTags to preserve both
        if (cached && cached.length > 0) {
          // Merge cache with mockTags to ensure we don't lose any tags
          const merged = [...mockTags];
          cached.forEach(cachedTag => {
            if (!merged.find(t => t.id === cachedTag.id)) {
              merged.push(cachedTag);
            }
          });
          return Promise.resolve(merged);
        }
        return Promise.resolve(mockTags);
      }
    },
    enabled: true, // Always enabled - use mock if feature flag is off
    placeholderData: mockTags, // Use placeholderData so cache updates are visible immediately
    ...tagsConfig,
  });

  // Activities - conditionally use real service (disabled for now)
  const {
    data: clientActivities = [],
    isLoading: activitiesLoading,
  } = useQuery({
    queryKey: ['crm-activities'],
    queryFn: () => Promise.resolve([]), // Placeholder - will be implemented when needed
    enabled: false, // Disabled for now, enable when needed
  });

  // Handle errors
  React.useEffect(() => {
    if (notesError) handleCRMError(notesError);
  }, [notesError]);
  React.useEffect(() => {
    if (segmentsError) handleCRMError(segmentsError);
  }, [segmentsError]);
  React.useEffect(() => {
    if (tagsError) handleCRMError(tagsError);
  }, [tagsError]);

  useEffect(() => {
    if (!useRealService) {
      // Only use mock data if service layer is disabled
      // This allows gradual rollout and easy rollback
      // IMPORTANT: Don't overwrite cache if it already has user-created tags
      const existingCache = queryClient.getQueryData<ClientTag[]>(buildQueryKey(QUERY_KEY_PREFIXES.CRM_TAGS));
      if (existingCache && existingCache.length > 0) {
        // Cache already has tags (possibly user-created), don't overwrite
        return; // Don't overwrite existing cache
      }
      const mockNotesData: ClientNote[] = [
        {
          id: 'note1',
          clientId: 'client1',
          content: 'Prefers morning walks for their dog',
          type: 'preference',
          priority: 'medium',
          createdAt: new Date('2024-01-15'),
          createdBy: 'admin',
          isResolved: false,
        },
        {
          id: 'note2',
          clientId: 'client1',
          content: 'Follow up on service satisfaction',
          type: 'follow_up',
          priority: 'high',
          createdAt: new Date('2024-01-18'),
          createdBy: 'admin',
          isResolved: false,
        },
      ];

      const mockTagsData: ClientTag[] = [
        { id: 'tag1', name: 'VIP', color: 'gold', category: 'status' },
        { id: 'tag2', name: 'Morning Walker', color: 'blue', category: 'preference' },
        { id: 'tag3', name: 'High Value', color: 'green', category: 'behavior' },
        { id: 'tag4', name: 'New Client', color: 'orange', category: 'status' },
      ];

      const mockSegmentsData: ClientSegment[] = [
        {
          id: 'segment1',
          name: 'VIP Clients',
          criteria: { minSpent: 1000, minBookings: 10 },
          clientCount: 15,
        },
        {
          id: 'segment2',
          name: 'At Risk',
          criteria: { maxDaysSinceLastBooking: 30 },
          clientCount: 8,
        },
        {
          id: 'segment3',
          name: 'New Clients',
          criteria: { minBookings: 1, maxDaysSinceLastBooking: 7 },
          clientCount: 23,
        },
      ];

      setMockNotes(mockNotesData);
      setMockTags(mockTagsData);
      setMockSegments(mockSegmentsData);
      
      // Initialize cache with mock tags only if cache is empty
      const queryKey = buildQueryKey(QUERY_KEY_PREFIXES.CRM_TAGS);
      const currentCache = queryClient.getQueryData<ClientTag[]>(queryKey);
      if (!currentCache || currentCache.length === 0) {
        queryClient.setQueryData(queryKey, mockTagsData);
      }
    }
  }, [useRealService, queryClient]);

  const isLoading =
    clientsLoading || notesLoading || segmentsLoading || tagsLoading || activitiesLoading;

  return {
    clients,
    bookings,
    conversations,
    clientNotes: (useRealService ? clientNotes : mockNotes) as ClientNote[], // Use real service or mock
    // Always use query data if available, fallback to mockTags only when query hasn't loaded yet
    clientTags: (useRealService ? clientTags : (clientTags.length > 0 ? clientTags : mockTags)) as ClientTag[],
    clientSegments: (useRealService ? clientSegments : mockSegments) as ClientSegment[],
    clientActivities: (useRealService ? clientActivities : []) as ClientActivity[],
    isLoading,
    refetchClients,
    refetchNotes,
    refetchSegments,
    refetchTags,
    // Legacy setters for backward compatibility (only used with mock data)
    setClientNotes: useRealService ? () => {} : setMockNotes,
    setClientTags: useRealService ? () => {} : setMockTags,
    setClientSegments: useRealService ? () => {} : setMockSegments,
    setClientActivities: () => {}, // Not used
  };
};

