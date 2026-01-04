/**
 * useSupportChat Hook
 * 
 * Hook for fetching only Support (admin inquiry) conversations with real-time updates.
 */

import { useEffect, useRef, useState } from 'react';
import { chatService } from '@/services/chat.service';
import type { Conversation } from '@/types';

export const useSupportChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    chatService.getSupportConversations()
      .then((initial) => {
        if (mountedRef.current) {
          setConversations(initial);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching support conversations:', error);
        setLoading(false);
      });

    const unsubscribe = chatService.subscribeToSupportConversations((updated) => {
      if (mountedRef.current) {
        setConversations(updated);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  return {
    conversations,
    loading,
    refetch: async () => {
      setLoading(true);
      try {
        const updated = await chatService.getSupportConversations();
        setConversations(updated);
      } catch (e) {
        console.error('Error refetching support conversations:', e);
      } finally {
        setLoading(false);
      }
    },
  };
};


