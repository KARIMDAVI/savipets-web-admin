/**
 * Enhanced Chat Helper Utilities
 * 
 * Utility functions for chat calculations and formatting.
 */

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

  if (participants.length === 0) return 'Unknown Conversation';
  if (participants.length === 1) return `${participants[0].firstName} ${participants[0].lastName}`;
  return `${participants[0].firstName} & ${participants.length - 1} others`;
};

/**
 * Calculate chat statistics
 */
export const calculateChatStats = (conversations: Conversation[]) => {
  return {
    totalConversations: conversations.length,
    pendingApproval: conversations.filter(c => c.requiresApproval && !c.isActive).length,
    activeConversations: conversations.filter(c => c.isActive).length,
    unreadMessages: conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
  };
};

