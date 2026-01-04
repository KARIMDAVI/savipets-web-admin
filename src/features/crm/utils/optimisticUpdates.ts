/**
 * Optimistic Updates Utilities
 * 
 * Utilities for implementing optimistic updates with rollback support.
 */

import type { QueryClient } from '@tanstack/react-query';

/**
 * Optimistic update configuration
 */
export interface OptimisticUpdateConfig<TData, TVariables> {
  queryKey: string[];
  updateFn: (old: TData | undefined, variables: TVariables) => TData;
  rollbackFn?: (old: TData | undefined) => TData | undefined;
}

/**
 * Execute optimistic update with automatic rollback on error
 */
export async function executeOptimisticUpdate<TData, TVariables>(
  queryClient: QueryClient,
  config: OptimisticUpdateConfig<TData, TVariables>,
  variables: TVariables,
  mutationFn: (variables: TVariables) => Promise<TData>
): Promise<TData> {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: config.queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<TData>(config.queryKey);

  // Optimistically update cache
  queryClient.setQueryData<TData>(
    config.queryKey,
    (old) => config.updateFn(old, variables)
  );

  try {
    // Execute mutation
    const newData = await mutationFn(variables);
    
    // Update cache with server response
    queryClient.setQueryData<TData>(config.queryKey, newData);
    
    return newData;
  } catch (error) {
    // Rollback on error
    if (config.rollbackFn) {
      queryClient.setQueryData<TData>(
        config.queryKey,
        config.rollbackFn(previousData)
      );
    } else {
      queryClient.setQueryData<TData>(config.queryKey, previousData);
    }
    
    // Re-throw error for error handling
    throw error;
  }
}

/**
 * Optimistic update for list operations (add, update, delete)
 */
export interface ListOptimisticUpdateConfig<TItem, TVariables> {
  queryKey: string[];
  addFn?: (old: TItem[] | undefined, variables: TVariables) => TItem[];
  updateFn?: (old: TItem[] | undefined, variables: TVariables) => TItem[];
  deleteFn?: (old: TItem[] | undefined, variables: TVariables) => TItem[];
  getItemId: (item: TItem) => string | number;
  getVariablesId?: (variables: TVariables) => string | number;
}

/**
 * Execute optimistic list update
 */
export async function executeOptimisticListUpdate<TItem, TVariables>(
  queryClient: QueryClient,
  config: ListOptimisticUpdateConfig<TItem, TVariables>,
  variables: TVariables,
  mutationFn: (variables: TVariables) => Promise<TItem>,
  operation: 'add' | 'update' | 'delete'
): Promise<TItem> {
  await queryClient.cancelQueries({ queryKey: config.queryKey });

  const previousData = queryClient.getQueryData<TItem[]>(config.queryKey);

  // Optimistically update based on operation
  let updateFn: ((old: TItem[] | undefined) => TItem[]) | undefined;
  
  if (operation === 'add' && config.addFn) {
    updateFn = (old) => config.addFn!(old, variables);
  } else if (operation === 'update' && config.updateFn) {
    updateFn = (old) => config.updateFn!(old, variables);
  } else if (operation === 'delete' && config.deleteFn) {
    updateFn = (old) => config.deleteFn!(old, variables);
  }

  if (updateFn) {
    queryClient.setQueryData<TItem[]>(config.queryKey, updateFn);
  }

  try {
    const newData = await mutationFn(variables);
    
    // Update cache with server response
    if (operation === 'add') {
      queryClient.setQueryData<TItem[]>(
        config.queryKey,
        (old) => old ? [...old, newData] : [newData]
      );
    } else if (operation === 'update') {
      queryClient.setQueryData<TItem[]>(
        config.queryKey,
        (old) => old?.map((item) => 
          config.getItemId(item) === config.getVariablesId?.(variables)
            ? newData
            : item
        ) || []
      );
    } else if (operation === 'delete') {
      queryClient.setQueryData<TItem[]>(
        config.queryKey,
        (old) => old?.filter((item) => 
          config.getItemId(item) !== config.getVariablesId?.(variables)
        ) || []
      );
    }
    
    return newData;
  } catch (error) {
    // Rollback on error
    queryClient.setQueryData<TItem[]>(config.queryKey, previousData);
    throw error;
  }
}

/**
 * Prefetch related queries for better UX
 */
export async function prefetchRelatedQueries(
  queryClient: QueryClient,
  queryKeys: string[][],
  queryFns: Array<() => Promise<any>>
): Promise<void> {
  await Promise.all(
    queryKeys.map((key, index) =>
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: queryFns[index],
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    )
  );
}

