/**
 * Chat Helper Utilities
 * 
 * Utility functions for chat calculations and formatting.
 */

import dayjs from 'dayjs';
import type { Conversation, User } from '@/types';

/**
 * Get participant info
 */
export const getParticipantInfo = (participantId: string, users: User[]): User | undefined => {
  return users.find(user => user.id === participantId);
};

/**
 * Get conversation title
 */
export const getConversationTitle = (conversation: Conversation, users: User[]): string => {
  const participants = conversation.participants
    .map(p => getParticipantInfo(p.userId, users))
    .filter(Boolean) as User[];
  
  if (participants.length === 0) return 'Unknown Participants';
  if (participants.length === 1) return `${participants[0].firstName} ${participants[0].lastName}`;
  if (participants.length === 2) {
    return `${participants[0].firstName} & ${participants[1].firstName}`;
  }
  return `${participants[0].firstName} + ${participants.length - 1} others`;
};

/**
 * Get last message preview
 */
export const getLastMessagePreview = (conversation: Conversation): string => {
  if (!conversation.lastMessage) return 'No messages yet';
  return conversation.lastMessage.content.length > 50
    ? `${conversation.lastMessage.content.substring(0, 50)}...`
    : conversation.lastMessage.content;
};

/**
 * Calculate chat statistics
 */
export const calculateChatStats = (conversations: Conversation[]) => {
  return {
    totalConversations: conversations.length,
    unreadMessages: conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    activeConversations: conversations.filter(c => c.lastMessage && 
      dayjs().diff(dayjs(c.lastMessage.timestamp), 'hour') < 24).length,
  };
};

