/**
 * Conversation Types
 * 
 * Type definitions for chat conversation categorization and organization.
 * These types extend the base Conversation type from @/types to support
 * role-based conversation filtering and organization.
 */

import type { Conversation } from '@/types';
import type { CanonicalConversationType } from '../utils/chatType';

/**
 * Conversation Category
 * 
 * Categorizes conversations based on participant roles:
 * - admin-sitter: Admin ↔ Sitter communications
 * - admin-owner: Admin ↔ Owner/Parent communications  
 * - sitter-owner: Sitter ↔ Owner/Parent communications
 * - unknown: Cannot be categorized (fallback)
 */
export type ConversationCategory = 
  | 'admin-sitter'
  | 'admin-owner'
  | 'sitter-owner'
  | 'unknown';

/**
 * Enhanced Conversation Type
 * 
 * Extends base Conversation with explicit type field for better type safety.
 * The type field is optional to maintain backward compatibility with existing
 * conversations that may not have this field set.
 */
export interface EnhancedConversation extends Conversation {
  type?: CanonicalConversationType;
  category?: ConversationCategory;
}

/**
 * Conversation Category Stats
 * 
 * Statistics for each conversation category:
 * - total: Total number of conversations in this category
 * - unread: Number of conversations with unread messages
 * - active: Number of active conversations (messages in last 24 hours)
 */
export interface ConversationCategoryStats {
  total: number;
  unread: number;
  active: number;
}

