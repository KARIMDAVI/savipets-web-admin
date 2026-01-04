/**
 * Conversation Deduplication Utilities
 * 
 * Smart deduplication that groups conversations by participant pairs
 * and keeps the most recent conversation for each unique pair.
 */

import type { Conversation } from '@/types';

/**
 * Creates a unique key for a conversation based on sorted participant IDs.
 * This ensures conversations with the same participants (in any order) are grouped together.
 */
export function getParticipantPairKey(conversation: Conversation, excludeAdminId?: string | null): string {
  if (!conversation.participants || !Array.isArray(conversation.participants)) {
    // Fallback to conversation ID if no participants
    return conversation.id;
  }
  
  // Normalize participants to string array
  const participantIds = conversation.participants
    .map((p: any) => {
      // Handle both string and { userId: string } formats
      if (typeof p === 'string') {
        return p;
      }
      if (p && typeof p === 'object' && p.userId) {
        return p.userId;
      }
      return null;
    })
    .filter((id): id is string => Boolean(id && typeof id === 'string'))
    .filter((id: string) => {
      // Exclude admin if provided
      if (excludeAdminId && id === excludeAdminId) {
        return false;
      }
      return true;
    });
  
  // If no participants after filtering, use conversation ID
  if (participantIds.length === 0) {
    return conversation.id;
  }
  
  // Sort to ensure same participants in different order create same key
  const sortedIds = [...participantIds].sort();
  return sortedIds.join('|');
}

/**
 * Gets the sort date for a conversation (most recent activity).
 */
export function getConversationSortDate(conversation: Conversation): number {
  const ts =
    (conversation.lastMessage as any)?.timestamp ||
    (conversation as any).lastMessageAt ||
    (conversation as any).updatedAt ||
    (conversation as any).createdAt;
  const d = typeof ts?.toDate === 'function' ? ts.toDate() : ts;
  const asDate = d instanceof Date ? d : (d ? new Date(d) : null);
  return asDate?.getTime?.() || 0;
}

/**
 * Deduplicates conversations by participant pair, keeping the most recent one.
 * 
 * @param conversations - Array of conversations to deduplicate
 * @param excludeAdminId - Optional admin ID to exclude from participant matching
 * @returns Deduplicated array sorted by recency (most recent first)
 */
export function deduplicateByParticipantPair(
  conversations: Conversation[],
  excludeAdminId?: string | null
): Conversation[] {
  if (!conversations || conversations.length === 0) return [];
  
  const byParticipantPair = new Map<string, Conversation>();
  const duplicateKeys = new Set<string>();

  for (const conversation of conversations) {
    const key = getParticipantPairKey(conversation, excludeAdminId) || conversation.id;
    const existing = byParticipantPair.get(key);
    
    if (!existing) {
      byParticipantPair.set(key, conversation);
    } else {
      // Track that we found a duplicate
      duplicateKeys.add(key);
      
      // Keep the most recent conversation for this participant pair
      const currentDate = getConversationSortDate(conversation);
      const existingDate = getConversationSortDate(existing);
      
      if (currentDate > existingDate) {
        byParticipantPair.set(key, conversation);
      }
    }
  }

  // Deduplication complete - results returned without logging

  // Sort result by recency (desc)
  return Array.from(byParticipantPair.values()).sort((a, b) => {
    const dateA = getConversationSortDate(a);
    const dateB = getConversationSortDate(b);
    return dateB - dateA;
  });
}

