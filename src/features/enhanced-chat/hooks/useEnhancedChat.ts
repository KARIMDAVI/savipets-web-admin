/**
 * useEnhancedChat Hook
 * 
 * Hook for fetching and managing enhanced chat data.
 */

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { userService } from '@/services/user.service';
import type { Conversation, Message, User } from '@/types';
import type { ChatModerationSettings } from '../types/enhanced-chat.types';

export const useEnhancedChat = (selectedConversationId: string | null) => {
  const [moderationSettings, setModerationSettings] = useState<ChatModerationSettings>({
    requireApproval: false,
    autoApprove: true,
    keywordFiltering: true,
    bannedWords: ['spam', 'scam', 'fake'],
    maxMessageLength: 1000,
    allowAttachments: true,
    maxAttachmentSize: 10, // MB
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversations
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['enhanced-conversations'],
    queryFn: () => chatService.getAllConversations(),
    refetchInterval: 30000,
  });

  // Fetch messages for selected conversation
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['enhanced-messages', selectedConversationId],
    queryFn: () => chatService.getMessages(selectedConversationId!),
    enabled: !!selectedConversationId,
    refetchInterval: 10000,
  });

  // Fetch users for participant info
  const { data: users = [] } = useQuery({
    queryKey: ['enhanced-users'],
    queryFn: () => userService.getAllUsers({}),
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return {
    conversations,
    messages,
    users,
    moderationSettings,
    conversationsLoading,
    messagesLoading,
    messagesEndRef,
    fileInputRef,
    refetchConversations,
    refetchMessages,
    setModerationSettings,
  };
};

