/**
 * Enhanced Chat Feature Types
 * 
 * Type definitions for enhanced chat and moderation.
 * Extracted from EnhancedChat.tsx for better organization.
 */

/**
 * Chat moderation settings
 */
export interface ChatModerationSettings {
  requireApproval: boolean;
  autoApprove: boolean;
  keywordFiltering: boolean;
  bannedWords: string[];
  maxMessageLength: number;
  allowAttachments: boolean;
  maxAttachmentSize: number; // MB
}

