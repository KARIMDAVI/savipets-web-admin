/**
 * Conversation Grouping Utility
 * 
 * Groups conversations by category and calculates statistics per category.
 * Used for organizing and displaying conversations in the admin dashboard.
 */

import type { Conversation, User } from '@/types';
import type { ConversationCategory, ConversationCategoryStats } from '../types/conversation.types';
import { getConversationCategory } from './conversationTypeDetection';
import dayjs from 'dayjs';

/**
 * Group conversations by category
 * 
 * Organizes conversations into categories based on participant roles:
 * - admin-sitter: Admin ↔ Sitter communications
 * - admin-owner: Admin ↔ Owner communications
 * - sitter-owner: Sitter ↔ Owner communications
 * - unknown: Cannot be categorized
 * 
 * @param conversations - Array of conversations to group
 * @param users - Array of all users for role lookup
 * @returns Record mapping each category to its conversations
 * 
 * @example
 * ```typescript
 * const grouped = groupConversationsByCategory(conversations, users);
 * const adminSitterConvs = grouped['admin-sitter'];
 * const adminOwnerConvs = grouped['admin-owner'];
 * ```
 */
export function groupConversationsByCategory(
  conversations: Conversation[],
  users: User[]
): Record<ConversationCategory, Conversation[]> {
  // Initialize result with empty arrays for each category
  const grouped: Record<ConversationCategory, Conversation[]> = {
    'admin-sitter': [],
    'admin-owner': [],
    'sitter-owner': [],
    'unknown': [],
  };

  // Group each conversation by its category
  for (const conversation of conversations) {
    const category = getConversationCategory(conversation, users);
    grouped[category].push(conversation);
  }

  return grouped;
}

/**
 * Calculate stats for each category
 * 
 * Computes statistics for each conversation category:
 * - total: Total number of conversations
 * - unread: Number of conversations with unread messages
 * - active: Number of active conversations (messages in last 24 hours)
 * 
 * @param conversations - Array of conversations to analyze
 * @param users - Array of all users for role lookup
 * @returns Record mapping each category to its stats
 * 
 * @example
 * ```typescript
 * const stats = calculateCategoryStats(conversations, users);
 * console.log(`Admin-Sitter: ${stats['admin-sitter'].total} total, ${stats['admin-sitter'].unread} unread`);
 * ```
 */
export function calculateCategoryStats(
  conversations: Conversation[],
  users: User[]
): Record<ConversationCategory, ConversationCategoryStats> {
  // Initialize stats with zeros for each category
  const stats: Record<ConversationCategory, ConversationCategoryStats> = {
    'admin-sitter': { total: 0, unread: 0, active: 0 },
    'admin-owner': { total: 0, unread: 0, active: 0 },
    'sitter-owner': { total: 0, unread: 0, active: 0 },
    'unknown': { total: 0, unread: 0, active: 0 },
  };

  const now = dayjs();

  // Process each conversation
  for (const conversation of conversations) {
    const category = getConversationCategory(conversation, users);

    // Increment total count
    stats[category].total += 1;

    // Count unread conversations (conversations with unreadCount > 0)
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      stats[category].unread += 1;
    }

    // Count active conversations (last message within 24 hours)
    if (conversation.lastMessage?.timestamp) {
      const lastMessageTime = dayjs(conversation.lastMessage.timestamp);
      const hoursSinceLastMessage = now.diff(lastMessageTime, 'hour');

      if (hoursSinceLastMessage < 24) {
        stats[category].active += 1;
      }
    }
  }

  return stats;
}

