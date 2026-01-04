/**
 * useCRMRealtime Hook
 * 
 * Hook for real-time subscriptions to CRM data using Firestore listeners.
 * Automatically syncs data with React Query cache.
 */

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import type { ClientNote, ClientActivity } from '../types/crm.types';

interface UseCRMRealtimeOptions {
  clientId?: string;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface RealtimeStatus {
  isConnected: boolean;
  error: Error | null;
}

/**
 * Real-time subscription hook for CRM notes
 */
export const useCRMNotesRealtime = (options: UseCRMRealtimeOptions = {}) => {
  const { clientId, enabled = true, onError } = options;
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    error: null,
  });
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let q: Query;

    if (clientId) {
      // Subscribe to notes for a specific client
      q = query(
        collection(db, 'crm_notes'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Subscribe to all notes
      q = query(collection(db, 'crm_notes'), orderBy('createdAt', 'desc'));
    }

    // Set up real-time listener
    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const notes = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId as string,
            petId: data.petId as string | undefined,
            petName: data.petName as string | undefined,
            content: data.content as string,
            type: data.type as ClientNote['type'],
            priority: data.priority as ClientNote['priority'],
            createdAt: data.createdAt?.toDate() || new Date(),
            createdBy: data.createdBy as string,
            updatedAt: data.updatedAt?.toDate(),
            isResolved: data.isResolved || false,
            resolvedAt: data.resolvedAt?.toDate(),
            resolvedBy: data.resolvedBy as string | undefined,
          } as ClientNote;
        });

        // Update React Query cache
        if (clientId) {
          queryClient.setQueryData(['crm-notes', clientId], notes);
        } else {
          queryClient.setQueryData(['crm-notes'], notes);
        }

        setStatus({ isConnected: true, error: null });
      },
      (error) => {
        console.error('CRM Notes realtime subscription error:', error);
        const errorObj = error as Error;
        setStatus({ isConnected: false, error: errorObj });
        if (onError) {
          onError(errorObj);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [clientId, enabled, queryClient, onError]);

  return status;
};

/**
 * Real-time subscription hook for CRM activities
 */
export const useCRMActivitiesRealtime = (options: UseCRMRealtimeOptions = {}) => {
  const { clientId, enabled = true, onError } = options;
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    error: null,
  });
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!enabled || !clientId) {
      return;
    }

    const q = query(
      collection(db, 'crm_activities'),
      where('clientId', '==', clientId),
      orderBy('timestamp', 'desc')
    );

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId as string,
            type: data.type as ClientActivity['type'],
            description: data.description as string,
            timestamp: data.timestamp?.toDate() || new Date(),
            metadata: data.metadata,
          } as ClientActivity;
        });

        queryClient.setQueryData(['crm-activities', clientId], activities);
        setStatus({ isConnected: true, error: null });
      },
      (error) => {
        console.error('CRM Activities realtime subscription error:', error);
        const errorObj = error as Error;
        setStatus({ isConnected: false, error: errorObj });
        if (onError) {
          onError(errorObj);
        }
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [clientId, enabled, queryClient, onError]);

  return status;
};

/**
 * Combined real-time hook for multiple CRM collections
 */
export const useCRMRealtime = (options: UseCRMRealtimeOptions = {}) => {
  const notesStatus = useCRMNotesRealtime(options);
  const activitiesStatus = useCRMActivitiesRealtime(options);

  return {
    notes: notesStatus,
    activities: activitiesStatus,
    isConnected: notesStatus.isConnected && activitiesStatus.isConnected,
    hasError: notesStatus.error !== null || activitiesStatus.error !== null,
  };
};

