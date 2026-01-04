import type { Conversation, User } from '@/types';
import type { ConversationCategory } from '../types/conversation.types';
import {
  ADMIN_INQUIRY_TYPE,
  CLIENT_SITTER_TYPE,
  SITTER_TO_CLIENT_TYPE,
} from './chatType';
import { getConversationCategory } from './conversationTypeDetection';

export const isSupportConversation = (conversation: Conversation): boolean => {
  return (
    (conversation as any).type === ADMIN_INQUIRY_TYPE
  );
};

export const isOwnerSitterConversation = (conversation: Conversation): boolean => {
  const type = (conversation as any).type;
  return type === CLIENT_SITTER_TYPE || type === SITTER_TO_CLIENT_TYPE;
};

/**
 * Filter conversations by category
 * 
 * Filters conversations based on their category (admin-sitter, admin-owner, sitter-owner).
 * Returns all conversations if category is 'all'.
 * 
 * @param conversations - Array of conversations to filter
 * @param category - Category to filter by, or 'all' to return all conversations
 * @param users - Array of all users for role lookup
 * @returns Filtered array of conversations
 */
export function filterByCategory(
  conversations: Conversation[],
  category: ConversationCategory | 'all',
  users: User[]
): Conversation[] {
  // Return all conversations if 'all' is selected
  if (category === 'all') {
    return conversations;
  }

  // Filter conversations by category
  return conversations.filter(conversation => {
    const conversationCategory = getConversationCategory(conversation, users);
    return conversationCategory === category;
  });
}

