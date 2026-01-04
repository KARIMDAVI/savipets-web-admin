/**
 * useTagActions Hook
 * 
 * Hook for managing tag CRUD operations.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { crmService } from '@/services/crm.service';
import { auditService } from '@/services/audit.service';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAuth } from '@/contexts/AuthContext';
import { handleCRMError } from '../utils/errorHandler';
import { rateLimiter } from '../utils/rateLimiter';
import { QUERY_KEY_PREFIXES, buildQueryKey } from '../utils/cacheConfig';
import type { ClientTag } from '../types/crm.types';

export const useTagActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { message } = App.useApp(); // Use App context for better Ant Design integration
  const useRealService = useFeatureFlag('CRM_SERVICE_LAYER');

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (tagData: Omit<ClientTag, 'id'>) => {
      console.log('[useTagActions] createTagMutation called with:', tagData);
      console.log('[useTagActions] user:', user?.id, user?.email);
      console.log('[useTagActions] useRealService:', useRealService);
      
      if (!user) {
        console.error('[useTagActions] User not authenticated');
        throw new Error('User not authenticated');
      }
      
      // Check rate limit
      const rateLimit = rateLimiter.checkCRMActionRateLimit(user.id, 'create_tag');
      console.log('[useTagActions] Rate limit check:', rateLimit);
      if (!rateLimit.allowed) {
        console.warn('[useTagActions] Rate limit exceeded');
        throw new Error(
          `Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`
        );
      }
      
      if (useRealService) {
        try {
          console.log('[useTagActions] Calling crmService.createTag');
          const result = await crmService.createTag(tagData);
          console.log('[useTagActions] crmService.createTag result:', result);
          if (!result) {
            console.error('[useTagActions] Tag creation returned null');
            throw new Error('Tag creation failed - service returned null');
          }
          return result;
        } catch (error) {
          console.error('[useTagActions] Error in crmService.createTag:', error);
          throw error;
        }
      } else {
        // Fallback mock - update cache directly for immediate UI update
        console.log('[useTagActions] Using mock tag creation (feature flag disabled)');
        const mockTag = {
          id: `tag-${Date.now()}`,
          ...tagData,
        } as ClientTag;
        
      // Update query cache directly so UI updates immediately
      // Use the same query key format as useCRM hook
      const queryKey = buildQueryKey(QUERY_KEY_PREFIXES.CRM_TAGS);
      queryClient.setQueryData(queryKey, (old: ClientTag[] = []) => {
        if (old.find(t => t.id === mockTag.id)) {
          return old;
        }
        return [...old, mockTag];
      });
      
      // Also update the simple key format for compatibility
      queryClient.setQueryData(['crm-tags'], (old: ClientTag[] = []) => {
        if (old.find(t => t.id === mockTag.id)) {
          return old;
        }
        return [...old, mockTag];
      });
        
        return mockTag;
      }
    },
    onSuccess: async (data) => {
      console.log('[useTagActions] Tag created successfully:', data);
      
      // Update query cache directly for immediate UI update
      // Use the same query key format as useCRM hook
      const queryKey = buildQueryKey(QUERY_KEY_PREFIXES.CRM_TAGS);
      
      // Get current cache data
      let currentData = queryClient.getQueryData<ClientTag[]>(queryKey) || [];
      
      // In mock mode, if cache is empty or only has the new tag, we need to merge with existing tags from the query
      // The queryFn will return mockTags when cache is empty, so we need to preserve those
      if (!useRealService && currentData.length === 0) {
        // Try to get tags from the query's current data (which might be using placeholderData)
        const queryState = queryClient.getQueryState(queryKey);
        if (queryState?.data && Array.isArray(queryState.data) && queryState.data.length > 0) {
          currentData = queryState.data as ClientTag[];
        }
      }
      
      // Check if tag already exists to avoid duplicates
      if (!currentData.find(t => t.id === data.id)) {
        const updatedData = [...currentData, data];
        
        // Update cache with new tag
        queryClient.setQueryData(queryKey, updatedData);
        
        // Also update the simple key format for compatibility
        queryClient.setQueryData(['crm-tags'], updatedData);
        
        console.log('[useTagActions] Cache updated. New tag count:', currentData.length + 1);
      } else {
        console.log('[useTagActions] Tag already exists in cache, skipping update');
      }
      
      // Don't invalidate immediately - it causes refetch which clears cache
      // Instead, just update the cache and let React Query handle reactivity
      // Only invalidate if we're using real service (needs server refetch)
      if (useRealService) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey }),
          queryClient.invalidateQueries({ queryKey: ['crm-tags'] }),
        ]);
      }
      
      if (user) {
        try {
          await auditService.logAction({
            action: 'create_tag',
            resource: 'crm_tag',
            resourceId: data.id,
            userId: user.id,
            userEmail: user.email,
            metadata: {
              tagName: data.name,
              category: data.category,
            },
          });
        } catch (auditError) {
          // Don't fail tag creation if audit logging fails
          console.warn('[useTagActions] Failed to log audit entry:', auditError);
        }
      }
      message.success('Tag created successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to create tag');
    },
  });

  // Update tag mutation
  const updateTagMutation = useMutation({
    mutationFn: async ({ tagId, updates }: { tagId: string; updates: Partial<ClientTag> }) => {
      if (!user) throw new Error('User not authenticated');
      if (useRealService) {
        await crmService.updateTag(tagId, updates);
      }
      return { tagId, updates };
    },
    onSuccess: async (data) => {
      // Update tag in cache immediately
      queryClient.setQueryData(['crm-tags'], (old: ClientTag[] = []) => 
        old.map(t => t.id === data.tagId ? { ...t, ...data.updates } : t)
      );
      queryClient.setQueryData([QUERY_KEY_PREFIXES.CRM_TAGS], (old: ClientTag[] = []) => 
        old.map(t => t.id === data.tagId ? { ...t, ...data.updates } : t)
      );
      
      await queryClient.invalidateQueries({ queryKey: ['crm-tags'] });
      
      if (user) {
        try {
          await auditService.logAction({
            action: 'update_tag',
            resource: 'crm_tag',
            resourceId: data.tagId,
            userId: user.id,
            userEmail: user.email,
          });
        } catch (auditError) {
          console.warn('[useTagActions] Failed to log audit entry:', auditError);
        }
      }
      message.success('Tag updated successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to update tag');
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      if (!user) throw new Error('User not authenticated');
      if (useRealService) {
        await crmService.deleteTag(tagId);
      }
      return tagId;
    },
    onSuccess: async (tagId) => {
      // Invalidate both query key formats to ensure cache refresh
      queryClient.invalidateQueries({ queryKey: ['crm-tags'] });
      queryClient.invalidateQueries({ queryKey: ['crm', 'tags'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIXES.CRM_TAGS] });
      
      if (user) {
        await auditService.logAction({
          action: 'delete_tag',
          resource: 'crm_tag',
          resourceId: tagId,
          userId: user.id,
          userEmail: user.email,
        });
      }
      message.success('Tag deleted successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to delete tag');
    },
  });

  return {
    createTag: (tagData: Omit<ClientTag, 'id'>) => createTagMutation.mutateAsync(tagData),
    updateTag: (tagId: string, updates: Partial<ClientTag>) =>
      updateTagMutation.mutateAsync({ tagId, updates }),
    deleteTag: (tagId: string) => deleteTagMutation.mutateAsync(tagId),
    isCreating: createTagMutation.isPending,
    isUpdating: updateTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  };
};


