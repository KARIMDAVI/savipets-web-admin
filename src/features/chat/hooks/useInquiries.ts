/**
 * useInquiries Hook
 * 
 * Hook for fetching pending support inquiries.
 */

import { useState, useEffect, useRef } from 'react';
import { chatService } from '@/services/chat.service';

export interface Inquiry {
  id: string;
  fromUserId: string;
  fromUserRole: string;
  toUserId: string;
  subject: string;
  initialMessage: string;
  status: string;
  createdAt: Date | null;
  conversationId?: string;
}

export const useInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    // Initial fetch
    chatService.getPendingInquiries()
      .then((initial) => {
        if (mountedRef.current) {
          setInquiries(initial);
          setLoading(false);
        }
      })
      .catch((error: any) => {
        // Index errors are handled gracefully by the service (returns empty array)
        // Only log non-index errors to avoid noise
        if (error?.code !== 'failed-precondition' && !error?.message?.includes('index')) {
          console.error('[useInquiries] Error fetching inquiries:', error);
        }
        setLoading(false);
      });

    // Set up real-time listener
    const unsubscribe = chatService.subscribeToInquiries((updated) => {
      if (mountedRef.current) {
        setInquiries(updated);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const updated = await chatService.getPendingInquiries();
      setInquiries(updated);
    } catch (e) {
      console.error('Error refetching inquiries:', e);
    } finally {
      setLoading(false);
    }
  };

  return {
    inquiries,
    loading,
    refetch,
  };
};

