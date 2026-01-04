/**
 * Conversation Type Detection Utility
 * 
 * Detects and categorizes conversations based on participant roles.
 * This utility is used to organize conversations into:
 * - Admin ↔ Sitter communications
 * - Admin ↔ Owner/Parent communications
 * - Sitter ↔ Owner/Parent communications
 */

import type { Conversation, User } from '@/types';
import type { ConversationCategory } from '../types/conversation.types';
import {
  ADMIN_INQUIRY_TYPE,
  CLIENT_SITTER_TYPE,
  SITTER_TO_CLIENT_TYPE,
} from './chatType';

/**
 * Get conversation category based on participants' roles
 * 
 * Categorizes conversations by analyzing participant roles:
 * - admin-sitter: Admin ↔ Sitter (type: admin-inquiry)
 * - admin-owner: Admin ↔ Owner (type: admin-inquiry)
 * - sitter-owner: Sitter ↔ Owner (type: client-sitter or sitter-to-client)
 * - unknown: Cannot be categorized (fallback)
 * 
 * @param conversation - Conversation to categorize
 * @param users - Array of all users for role lookup
 * @returns ConversationCategory
 * 
 * @example
 * ```typescript
 * const category = getConversationCategory(conversation, users);
 * if (category === 'admin-sitter') {
 *   // Handle admin-sitter conversation
 * }
 * ```
 * 
 * @throws {Error} Never throws - always returns 'unknown' as safe fallback
 */
export function getConversationCategory(
  conversation: Conversation,
  users: User[]
): ConversationCategory {
  // Early return for empty participants
  if (!conversation.participants || conversation.participants.length === 0) {
    return 'unknown';
  }

  // Early return if no users provided
  if (!users || users.length === 0) {
    return 'unknown';
  }

  // Get conversation type (normalized)
  const conversationType = (conversation as any).type;

  // Early return if type is undefined or invalid
  if (!conversationType) {
    return 'unknown';
  }

  // Map participant IDs to user objects
  const participantUsers = conversation.participants
    .map(p => users.find(u => u.id === p.userId))
    .filter((user): user is User => user !== undefined);

  // If we can't find all participants, return unknown
  if (participantUsers.length !== conversation.participants.length) {
    return 'unknown';
  }

  // Extract roles from participants
  const roles = participantUsers.map(u => u.role);
  const hasAdmin = roles.includes('admin');
  const hasSitter = roles.includes('petSitter');
  const hasOwner = roles.includes('petOwner');

  // Admin-Inquiry type conversations
  if (conversationType === ADMIN_INQUIRY_TYPE) {
    // Must have exactly 2 participants for categorization
    if (participantUsers.length !== 2) {
      return 'unknown';
    }

    // Admin-Sitter: Admin + Sitter (no Owner)
    if (hasAdmin && hasSitter && !hasOwner) {
      return 'admin-sitter';
    }

    // Admin-Owner: Admin + Owner (no Sitter)
    if (hasAdmin && hasOwner && !hasSitter) {
      return 'admin-owner';
    }

    // If admin-inquiry has all three roles or other combinations, return unknown
    return 'unknown';
  }

  // Sitter-Owner conversations (client-sitter or sitter-to-client)
  if (
    conversationType === CLIENT_SITTER_TYPE ||
    conversationType === SITTER_TO_CLIENT_TYPE
  ) {
    // Must have exactly 2 participants
    if (participantUsers.length !== 2) {
      return 'unknown';
    }

    // Sitter-Owner: Sitter + Owner (no Admin)
    if (hasSitter && hasOwner && !hasAdmin) {
      return 'sitter-owner';
    }

    // If sitter-owner type doesn't match expected roles, return unknown
    return 'unknown';
  }

  // Unknown or invalid conversation type
  return 'unknown';
}

