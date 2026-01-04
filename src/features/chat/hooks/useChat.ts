/**
 * useChat Hook
 * 
 * Hook for fetching chat data with optional category-based organization.
 * 
 * Features:
 * - Real-time conversation and message updates
 * - Category-based filtering (when feature flag enabled)
 * - Category statistics calculation
 * - Automatic conversation grouping
 * 
 * @param selectedConversationId - ID of currently selected conversation (null if none)
 * @returns Chat data and controls including conversations, messages, users, and category organization
 * 
 * @example
 * ```typescript
 * const {
 *   conversations,
 *   filteredConversations, // Only when CHAT_ORGANIZATION_ENABLED
 *   activeCategoryFilter,
 *   setActiveCategoryFilter,
 *   categoryStats,
 * } = useChat(selectedConversationId);
 * 
 * // Filter by category
 * setActiveCategoryFilter('admin-sitter');
 * ```
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { userService } from '@/services/user.service';
import type { Conversation, Message, User } from '@/types';
import type { ConversationCategory } from '../types/conversation.types';
import { CHAT_ORGANIZATION_ENABLED } from '../utils/chatFeatureFlags';
import { groupConversationsByCategory, calculateCategoryStats } from '../utils/conversationGrouping';
import { filterByCategory } from '../utils/conversationFilters';

export const useChat = (selectedConversationId: string | null) => {
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Category filtering state (feature-flagged)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ConversationCategory | 'all'>('all');

  // Fetch conversations with real-time listener
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  
  useEffect(() => {
    // Initial fetch
    setConversationsLoading(true);
    chatService.getAllConversations()
      .then((initialConversations) => {
        setConversations(initialConversations);
        setConversationsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching conversations:', error);
        setConversationsLoading(false);
      });
    
    // Set up real-time listener
    const unsubscribe = chatService.subscribeToConversations(
      (updatedConversations) => {
        setConversations(updatedConversations);
        setConversationsLoading(false);
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const refetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const updatedConversations = await chatService.getAllConversations();
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Error refetching conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  // Fetch messages for selected conversation with real-time listener
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }
    
    // Initial fetch
    setMessagesLoading(true);
    chatService.getMessages(selectedConversationId)
      .then((initialMessages) => {
        setMessages(initialMessages);
        setMessagesLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setMessagesLoading(false);
      });
    
    // Set up real-time listener
    const unsubscribe = chatService.subscribeToMessages(
      selectedConversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setMessagesLoading(false);
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, [selectedConversationId]);
  
  const refetchMessages = async () => {
    if (!selectedConversationId) return;
    setMessagesLoading(true);
    try {
      const updatedMessages = await chatService.getMessages(selectedConversationId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error refetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch users for participant info
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers({}),
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Category-based organization (feature-flagged)
  const categorizedConversations = useMemo(() => {
    if (!CHAT_ORGANIZATION_ENABLED || !users || users.length === 0) {
      return {
        'admin-sitter': [],
        'admin-owner': [],
        'sitter-owner': [],
        'unknown': [],
      };
    }
    return groupConversationsByCategory(conversations, users);
  }, [conversations, users]);

  const categoryStats = useMemo(() => {
    if (!CHAT_ORGANIZATION_ENABLED || !users || users.length === 0) {
      return {
        'admin-sitter': { total: 0, unread: 0, active: 0 },
        'admin-owner': { total: 0, unread: 0, active: 0 },
        'sitter-owner': { total: 0, unread: 0, active: 0 },
        'unknown': { total: 0, unread: 0, active: 0 },
      };
    }
    return calculateCategoryStats(conversations, users);
  }, [conversations, users]);

  const filteredConversations = useMemo(() => {
    if (!CHAT_ORGANIZATION_ENABLED || activeCategoryFilter === 'all' || !users || users.length === 0) {
      return conversations;
    }
    return filterByCategory(conversations, activeCategoryFilter, users);
  }, [conversations, activeCategoryFilter, users]);

  // Category counts for filter tabs
  const categoryCounts = useMemo(() => {
    return {
      'admin-sitter': categoryStats['admin-sitter'].total,
      'admin-owner': categoryStats['admin-owner'].total,
      'sitter-owner': categoryStats['sitter-owner'].total,
      'unknown': categoryStats['unknown'].total,
    };
  }, [categoryStats]);

  return {
    conversations,
    messages,
    users,
    newMessage,
    searchTerm,
    messagesEndRef,
    conversationsLoading,
    messagesLoading,
    setNewMessage,
    setSearchTerm,
    refetchConversations,
    refetchMessages,
    // Category organization features (always returned, but only populated when feature-flagged)
    activeCategoryFilter: CHAT_ORGANIZATION_ENABLED ? activeCategoryFilter : 'all',
    setActiveCategoryFilter: CHAT_ORGANIZATION_ENABLED ? setActiveCategoryFilter : (() => {}),
    categorizedConversations: CHAT_ORGANIZATION_ENABLED ? categorizedConversations : {
      'admin-sitter': [],
      'admin-owner': [],
      'sitter-owner': [],
      'unknown': [],
    },
    categoryStats: CHAT_ORGANIZATION_ENABLED ? categoryStats : {
      'admin-sitter': { total: 0, unread: 0, active: 0 },
      'admin-owner': { total: 0, unread: 0, active: 0 },
      'sitter-owner': { total: 0, unread: 0, active: 0 },
      'unknown': { total: 0, unread: 0, active: 0 },
    },
    categoryCounts: CHAT_ORGANIZATION_ENABLED ? categoryCounts : {
      'admin-sitter': 0,
      'admin-owner': 0,
      'sitter-owner': 0,
      'unknown': 0,
    },
    filteredConversations: CHAT_ORGANIZATION_ENABLED ? filteredConversations : conversations,
  };
};

