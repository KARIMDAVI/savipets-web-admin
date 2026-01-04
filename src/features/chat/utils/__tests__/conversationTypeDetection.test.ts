/**
 * Unit Tests: Conversation Type Detection
 * 
 * Tests for getConversationCategory function using TDD approach.
 * Tests cover all conversation categories and edge cases.
 */

import { describe, it, expect } from 'vitest';
import { getConversationCategory } from '../conversationTypeDetection';
import { createMockConversation, createMockUser } from '@/test/utils/chatTestHelpers';
import type { Conversation, User } from '@/types';
import type { ConversationCategory } from '../../types/conversation.types';

describe('getConversationCategory', () => {
  describe('Admin-Sitter Conversations', () => {
    it('should detect admin-sitter conversation with admin-inquiry type', () => {
      const admin = createMockUser('admin');
      const sitter = createMockUser('petSitter');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: sitter.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin, sitter];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('admin-sitter');
    });

    it('should detect admin-sitter even if participants are in different order', () => {
      const admin = createMockUser('admin');
      const sitter = createMockUser('petSitter');
      const conversation = createMockConversation({
        participants: [
          { userId: sitter.id },
          { userId: admin.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin, sitter];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('admin-sitter');
    });
  });

  describe('Admin-Owner Conversations', () => {
    it('should detect admin-owner conversation with admin-inquiry type', () => {
      const admin = createMockUser('admin');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: owner.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('admin-owner');
    });

    it('should detect admin-owner even if participants are in different order', () => {
      const admin = createMockUser('admin');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: owner.id },
          { userId: admin.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('admin-owner');
    });
  });

  describe('Sitter-Owner Conversations', () => {
    it('should detect sitter-owner conversation with client-sitter type', () => {
      const sitter = createMockUser('petSitter');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: sitter.id },
          { userId: owner.id },
        ],
        type: 'client-sitter',
      });
      const users = [sitter, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('sitter-owner');
    });

    it('should detect sitter-owner conversation with sitter-to-client type', () => {
      const sitter = createMockUser('petSitter');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: sitter.id },
          { userId: owner.id },
        ],
        type: 'sitter-to-client',
      });
      const users = [sitter, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('sitter-owner');
    });
  });

  describe('Edge Cases', () => {
    it('should return unknown for conversation with empty participants', () => {
      const conversation = createMockConversation({
        participants: [],
      });
      const users: User[] = [];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });

    it('should return unknown when participants cannot be found in users array', () => {
      const conversation = createMockConversation({
        participants: [
          { userId: 'non-existent-user-1' },
          { userId: 'non-existent-user-2' },
        ],
      });
      const users: User[] = [];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });

    it('should return unknown when conversation type is undefined', () => {
      const admin = createMockUser('admin');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: owner.id },
        ],
        type: undefined,
      });
      const users = [admin, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });

    it('should return unknown for conversation with invalid type', () => {
      const admin = createMockUser('admin');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: owner.id },
        ],
        type: 'invalid-type' as any,
      });
      const users = [admin, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });

    it('should return unknown for admin-inquiry with all three roles present', () => {
      const admin = createMockUser('admin');
      const sitter = createMockUser('petSitter');
      const owner = createMockUser('petOwner');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: sitter.id },
          { userId: owner.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin, sitter, owner];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });

    it('should handle missing user data gracefully', () => {
      const admin = createMockUser('admin');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: 'missing-user-id' },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });

    it('should return unknown for conversation with only one participant', () => {
      const admin = createMockUser('admin');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });
  });

  describe('Type Safety', () => {
    it('should handle conversations with more than 2 participants', () => {
      const admin = createMockUser('admin');
      const sitter1 = createMockUser('petSitter');
      const sitter2 = createMockUser('petSitter');
      const conversation = createMockConversation({
        participants: [
          { userId: admin.id },
          { userId: sitter1.id },
          { userId: sitter2.id },
        ],
        type: 'admin-inquiry',
      });
      const users = [admin, sitter1, sitter2];

      const category = getConversationCategory(conversation, users);
      expect(category).toBe('unknown');
    });
  });
});

